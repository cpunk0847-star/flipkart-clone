import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useBudget } from "@/contexts/BudgetContext";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const MiniCart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount, loading } = useCart();
  const { isWithinBudget, isActive: budgetActive } = useBudget();

  const subtotal = getCartTotal();
  const itemCount = getCartCount();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {!loading && itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount} items)</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-4">Add items to get started</p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const outsideBudget = budgetActive && !isWithinBudget(item.price);
                  
                  return (
                    <div
                      key={item.id}
                      className={`flex gap-4 p-3 rounded-lg border ${
                        outsideBudget ? "border-destructive/30 bg-destructive/5" : "border-border"
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                        onClick={() => navigate(`/product/${item.id}`)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-medium text-sm line-clamp-2 mb-1 cursor-pointer hover:text-primary"
                          onClick={() => navigate(`/product/${item.id}`)}
                        >
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">{item.brand}</p>
                        
                        {outsideBudget && (
                          <div className="flex items-center gap-1 text-xs text-destructive mb-2">
                            <AlertCircle className="w-3 h-3" />
                            <span>Outside your active budget</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">₹{item.price.toLocaleString()}</span>
                            {item.discount > 0 && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/cart")}
                >
                  View Cart
                </Button>
                <Button
                  className="flex-1 btn-primary"
                  onClick={() => navigate("/checkout")}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MiniCart;
