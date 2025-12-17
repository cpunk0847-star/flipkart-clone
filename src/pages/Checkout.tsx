import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Loader2,
  CheckCircle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState<string>("addr-1");
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Sample addresses
  const [addresses] = useState<Address[]>([
    {
      id: "addr-1",
      name: user?.email?.split("@")[0] || "John Doe",
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
      name: user?.email?.split("@")[0] || "John Doe",
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

  useEffect(() => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
    }
  }, [user, navigate]);

  const applyCoupon = () => {
    if (couponCode.trim()) {
      setAppliedCoupon(couponCode);
      toast.success("Coupon applied successfully!");
    }
  };

  // Price calculations
  const subtotal = getCartTotal();
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

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ES-${timestamp}-${random}`;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please login to place order");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddress);
    if (!selectedAddr) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const newOrderNumber = generateOrderNumber();
      const customerName = selectedAddr.name;
      const customerEmail = user.email!;

      const orderItems = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        brand: item.brand,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
      }));

      const deliveryAddress = {
        name: selectedAddr.name,
        phone: selectedAddr.phone,
        address: selectedAddr.address,
        locality: selectedAddr.locality,
        city: selectedAddr.city,
        state: selectedAddr.state,
        pincode: selectedAddr.pincode,
      };

      // Save order to database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: newOrderNumber,
          customer_name: customerName,
          customer_email: customerEmail,
          delivery_address: deliveryAddress,
          items: orderItems,
          subtotal: subtotal,
          discount: savings + couponDiscount,
          delivery_charge: deliveryCharge,
          tax: tax,
          total_amount: total,
          payment_method: paymentMethod,
          estimated_delivery_date: expectedDelivery.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error("Failed to create order");
      }

      console.log("Order created:", orderData);

      // Send order confirmation email
      const emailPayload = {
        orderId: orderData.id,
        orderNumber: newOrderNumber,
        customerName,
        customerEmail,
        items: orderItems,
        subtotal,
        discount: savings + couponDiscount,
        deliveryCharge,
        tax,
        totalAmount: total,
        paymentMethod,
        deliveryAddress,
        estimatedDeliveryDate: expectedDelivery.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };

      const { error: emailError } = await supabase.functions.invoke("send-order-email", {
        body: emailPayload,
      });

      if (emailError) {
        console.error("Email sending error:", emailError);
        toast.warning("Order placed but email notification failed. Check your orders for details.");
      }

      // Clear cart after successful order
      await clearCart();

      setOrderNumber(newOrderNumber);
      setOrderSuccess(true);
      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Order placement error:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Order Success Screen
  if (orderSuccess && orderNumber) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. Your order has been confirmed.
            </p>

            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Order Number</p>
              <p className="text-2xl font-bold text-primary mb-4">{orderNumber}</p>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground bg-accent/10 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-sm">Check your email for order details</span>
              </div>
            </div>

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

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                Continue Shopping
              </Button>
              <Button className="flex-1" onClick={() => navigate("/")}>
                Track Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={() => navigate("/")}>Continue Shopping</Button>
          </div>
        ) : (
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
                        <p className="text-xs text-muted-foreground mb-2">{item.category}</p>

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
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="px-2 text-sm font-semibold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => removeFromCart(item.id)}
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
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
