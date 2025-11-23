import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/data/mockProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  addMultipleToCart: (products: Product[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate a persistent guest ID
const getGuestId = () => {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load cart from database
  const loadCart = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .or(user ? `user_id.eq.${user.id}` : `guest_id.eq.${getGuestId()}`);

      if (error) throw error;

      if (data) {
        const items: CartItem[] = data.map((item) => ({
          id: item.product_id,
          name: item.product_name,
          image: item.product_image,
          brand: item.product_brand,
          category: item.product_category,
          price: Number(item.price),
          originalPrice: Number(item.original_price),
          rating: 4.5,
          reviews: 0,
          discount: Math.round(
            ((Number(item.original_price) - Number(item.price)) / Number(item.original_price)) * 100
          ),
          inStock: true,
          seller: item.product_brand,
          quantity: item.quantity,
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Merge guest cart with user cart on login
  const mergeGuestCart = async () => {
    if (!user || syncing) return;
    
    try {
      setSyncing(true);
      const guestId = getGuestId();

      // Get guest cart items
      const { data: guestItems, error: guestError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("guest_id", guestId);

      if (guestError) throw guestError;

      if (guestItems && guestItems.length > 0) {
        // Update guest items to belong to the user
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ user_id: user.id, guest_id: null })
          .eq("guest_id", guestId);

        if (updateError) throw updateError;

        toast.success(`Merged ${guestItems.length} items from your cart!`);
        await loadCart();
      }
    } catch (error) {
      console.error("Error merging cart:", error);
    } finally {
      setSyncing(false);
    }
  };

  // Load cart on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [user]);

  // Merge guest cart when user logs in
  useEffect(() => {
    if (user && !loading) {
      mergeGuestCart();
    }
  }, [user, loading]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const existingItem = cartItems.find((item) => item.id === product.id);

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        await updateQuantity(product.id, newQuantity);
      } else {
        // Insert new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user?.id || null,
          guest_id: user ? null : getGuestId(),
          product_id: product.id,
          product_name: product.name,
          product_image: product.image,
          product_brand: product.brand,
          product_category: product.category,
          price: product.price,
          original_price: product.originalPrice,
          quantity,
        });

        if (error) throw error;

        setCartItems((items) => [...items, { ...product, quantity }]);
        toast.success(`${product.name} added to cart!`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const addMultipleToCart = async (products: Product[]) => {
    try {
      for (const product of products) {
        await addToCart(product, 1);
      }
    } catch (error) {
      console.error("Error adding multiple items:", error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("product_id", productId)
        .or(user ? `user_id.eq.${user.id}` : `guest_id.eq.${getGuestId()}`);

      if (error) throw error;

      setCartItems((items) => items.filter((item) => item.id !== productId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item");
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("product_id", productId)
        .or(user ? `user_id.eq.${user.id}` : `guest_id.eq.${getGuestId()}`);

      if (error) throw error;

      setCartItems((items) =>
        items.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const clearCart = async () => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .or(user ? `user_id.eq.${user.id}` : `guest_id.eq.${getGuestId()}`);

      if (error) throw error;

      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
