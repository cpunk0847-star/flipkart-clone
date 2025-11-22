import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");

  // Sample cart data
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
      title: "Premium Wireless Headphones",
      price: 4999,
      originalPrice: 9999,
      quantity: 1,
      seller: "TechStore Official",
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
      title: "Classic Analog Watch",
      price: 2499,
      originalPrice: 5999,
      quantity: 2,
      seller: "WatchWorld",
    },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartItems.length} items)</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Seller: {item.seller}
                      </p>
                      
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl font-bold">₹{item.price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{item.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-discount-green font-semibold">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border border-border rounded-lg">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 border border-border sticky top-24">
                <h2 className="text-xl font-bold mb-6">Price Details</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Price ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₹{(subtotal + savings).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-discount-green">
                    <span>Discount</span>
                    <span>-₹{savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className={deliveryCharge === 0 ? "text-discount-green" : ""}>
                      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-sm text-discount-green font-semibold">
                    You will save ₹{savings.toLocaleString()} on this order
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline">
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full btn-accent"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
