import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Wallet,
  Building,
  Smartphone,
  Shield,
  Calendar,
  Minus,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  type: "home" | "work";
  isDefault: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<string>("addr-1");
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Sample cart data
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
      name: "Premium Wireless Headphones",
      brand: "Sony",
      variant: "Black, 256GB",
      price: 4999,
      originalPrice: 9999,
      quantity: 1,
      seller: "TechStore Official",
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
      name: "Classic Analog Watch",
      brand: "Titan",
      variant: "Silver",
      price: 2499,
      originalPrice: 5999,
      quantity: 2,
      seller: "WatchWorld",
    },
  ]);

  // Sample addresses
  const [addresses] = useState<Address[]>([
    {
      id: "addr-1",
      name: "John Doe",
      phone: "9876543210",
      pincode: "400001",
      address: "123, Marine Drive",
      locality: "Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      type: "home",
      isDefault: true,
    },
    {
      id: "addr-2",
      name: "John Doe",
      phone: "9876543210",
      pincode: "400051",
      address: "456, BKC Office Complex",
      locality: "Bandra Kurla Complex",
      city: "Mumbai",
      state: "Maharashtra",
      type: "work",
      isDefault: false,
    },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      setAppliedCoupon(couponCode);
      toast.success("Coupon applied successfully!");
    }
  };

  // Price calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice - item.price) * item.quantity,
    0
  );
  const couponDiscount = appliedCoupon ? 500 : 0;
  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal - couponDiscount + deliveryCharge + tax;

  const expectedDelivery = new Date();
  expectedDelivery.setDate(expectedDelivery.getDate() + 3);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    toast.success("Order placed successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Checkout Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>

              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Label htmlFor={addr.id} className="text-base font-semibold cursor-pointer">
                              {addr.name}
                            </Label>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded uppercase">
                              {addr.type}
                            </span>
                            {addr.isDefault && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{addr.phone}</p>
                          <p className="text-sm">
                            {addr.address}, {addr.locality}
                          </p>
                          <p className="text-sm">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Order Items */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-6">Order Summary ({cartItems.length} items)</h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mb-1">{item.brand}</p>
                      <p className="text-xs text-muted-foreground mb-2">{item.variant}</p>

                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">₹{item.price.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{item.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-discount-green font-semibold">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}
                          % off
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 border border-border rounded-lg">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="px-2 text-sm font-semibold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-6">Payment Method</h2>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4 hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="upi" id="upi" />
                      <Smartphone className="w-5 h-5 text-primary" />
                      <Label htmlFor="upi" className="flex-1 cursor-pointer font-medium">
                        UPI (PhonePe, Google Pay, Paytm)
                      </Label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="w-5 h-5 text-primary" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer font-medium">
                        Credit / Debit Card
                      </Label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Building className="w-5 h-5 text-primary" />
                      <Label htmlFor="netbanking" className="flex-1 cursor-pointer font-medium">
                        Net Banking
                      </Label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Wallet className="w-5 h-5 text-primary" />
                      <Label htmlFor="wallet" className="flex-1 cursor-pointer font-medium">
                        Wallets (Paytm, Amazon Pay)
                      </Label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <span className="text-lg">💵</span>
                      <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium">
                        Cash on Delivery
                      </Label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="emi" id="emi" />
                      <Calendar className="w-5 h-5 text-primary" />
                      <Label htmlFor="emi" className="flex-1 cursor-pointer font-medium">
                        EMI (Easy Installments)
                      </Label>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Price Details</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Price ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{(subtotal + savings).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-discount-green">
                  <span>Product Discount</span>
                  <span>-₹{savings.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-discount-green">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Delivery Charges</span>
                  <span className={deliveryCharge === 0 ? "text-discount-green" : ""}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <div className="text-sm text-discount-green font-semibold pt-2">
                  You will save ₹{(savings + couponDiscount).toLocaleString()} on this order
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                <Label className="mb-2 block text-sm font-semibold">Apply Coupon</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={!!appliedCoupon}
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Expected Delivery</span>
                </div>
                <p className="text-sm">
                  {expectedDelivery.toLocaleDateString("en-IN", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
              </div>

              {/* Place Order Button */}
              <Button
                size="lg"
                className="w-full btn-accent text-lg font-semibold"
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
