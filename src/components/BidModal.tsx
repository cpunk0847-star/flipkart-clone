import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useBidding } from "@/hooks/useBidding";
import { Loader2, Lock, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

interface BidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    category: string;
    image: string;
  };
  onBidAccepted?: (bidPrice: number) => void;
}

export default function BidModal({ open, onOpenChange, product, onBidAccepted }: BidModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { biddingData, canUserBid, placeBid, getBidAttempts } = useBidding();
  
  const [bidPrice, setBidPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lastRejection, setLastRejection] = useState<{
    suggestedIncreases?: number[];
    attemptsRemaining?: number;
  } | null>(null);

  const MAX_ATTEMPTS = 3;

  // Fetch attempt count when modal opens
  useEffect(() => {
    if (open && user) {
      getBidAttempts(product.id).then(setAttempts);
    }
  }, [open, user, product.id, getBidAttempts]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setBidPrice("");
      setLastRejection(null);
    }
  }, [open]);

  const handleLoginRedirect = () => {
    // Store current URL to redirect back after login
    sessionStorage.setItem("bidRedirect", window.location.pathname);
    navigate("/login");
  };

  const handleBidSubmit = async () => {
    const bidAmount = parseFloat(bidPrice);
    
    if (!bidAmount || bidAmount <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    if (bidAmount >= product.price) {
      toast.info("Your bid is higher than the current price. Just buy it!");
      return;
    }

    setIsSubmitting(true);
    setLastRejection(null);

    try {
      const response = await placeBid(
        product.id,
        bidAmount,
        product.category,
        product.price,
        product.originalPrice,
        true
      );

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.accepted) {
        toast.success(response.message || "Bid accepted!");
        onBidAccepted?.(bidAmount);
        onOpenChange(false);
      } else {
        toast.error(response.message || "Bid rejected");
        setLastRejection({
          suggestedIncreases: response.suggestedIncreases,
          attemptsRemaining: response.attemptsRemaining,
        });
        setAttempts(response.attemptsUsed || attempts + 1);
      }
    } catch (error) {
      toast.error("Failed to place bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickIncrease = (amount: number) => {
    const currentBid = parseFloat(bidPrice) || product.price * 0.8;
    setBidPrice(String(Math.round(currentBid + amount)));
  };

  const { canBid, reason } = canUserBid();
  const { freeBidsRemaining, totalSpent, spendLevel } = biddingData;
  const spendProgress = Math.min((totalSpent / 3000) * 100, 100);

  // Not logged in view
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Login Required
            </DialogTitle>
            <DialogDescription>
              Sign in to access Reverse Bidding and name your own price!
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex gap-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>New users get <strong>1 FREE bid coupon</strong>!</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Unlock unlimited bidding by spending ₹3,000+</span>
              </div>
            </div>

            <Button 
              className="w-full btn-primary" 
              size="lg"
              onClick={handleLoginRedirect}
            >
              Login to Place Bid
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Locked view (no access)
  if (!canBid && reason === "spend_required") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              Reverse Bidding Locked
            </DialogTitle>
            <DialogDescription>
              Unlock by spending ₹3,000 on Easyship
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your spending</span>
                <span className="font-semibold">₹{totalSpent.toLocaleString()} / ₹3,000</span>
              </div>
              <Progress value={spendProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Spend ₹{(3000 - totalSpent).toLocaleString()} more to unlock Reverse Bidding
              </p>
            </div>

            {freeBidsRemaining > 0 && (
              <div className="bg-accent/10 border border-accent/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">You have {freeBidsRemaining} free bid coupon!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Use it to try Reverse Bidding once for free.
                </p>
                <Button 
                  className="mt-3 w-full" 
                  variant="outline"
                  onClick={() => {
                    // Allow bidding with free coupon
                  }}
                >
                  Use Free Bid Coupon
                </Button>
              </div>
            )}

            <div className="pt-2">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main bidding view
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎯 Place Your Bid
            {spendLevel >= 2 && (
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                VIP Member
              </Badge>
            )}
            {spendLevel === 1 && (
              <Badge variant="secondary" className="ml-2">
                Level 1
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Name your price for <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Product info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>List Price:</span>
              <span className="line-through text-muted-foreground">₹{product.originalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Current Offer Price:</span>
              <span className="font-semibold">₹{product.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-discount-green">
              <span>Free Bid Coupons:</span>
              <span className="font-semibold">{freeBidsRemaining} available</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Bid Attempts:</span>
              <span className="font-semibold">{attempts} / {MAX_ATTEMPTS}</span>
            </div>
          </div>

          {/* Attempt warning */}
          {attempts >= MAX_ATTEMPTS && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>Maximum attempts reached for this product</span>
            </div>
          )}

          {/* Last rejection info */}
          {lastRejection && lastRejection.attemptsRemaining !== undefined && lastRejection.attemptsRemaining > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg space-y-2">
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Your bid was too low. Try increasing your offer!
              </p>
              <div className="flex gap-2">
                {lastRejection.suggestedIncreases?.map((amount) => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickIncrease(amount)}
                    className="text-xs"
                  >
                    +₹{amount}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastRejection.attemptsRemaining} attempt{lastRejection.attemptsRemaining !== 1 ? 's' : ''} remaining
              </p>
            </div>
          )}

          {/* Bid input */}
          <div className="space-y-2">
            <Label htmlFor="bidPrice">Your Bid Price (₹)</Label>
            <Input
              id="bidPrice"
              type="number"
              placeholder="Enter your price"
              value={bidPrice}
              onChange={(e) => setBidPrice(e.target.value)}
              min="1"
              max={product.price - 1}
              disabled={attempts >= MAX_ATTEMPTS}
            />
            <p className="text-xs text-muted-foreground">
              💡 Our algorithm evaluates bids based on multiple factors
            </p>
          </div>

          {/* Quick bid suggestions */}
          {!lastRejection && (
            <div className="flex gap-2">
              {[0.75, 0.80, 0.85, 0.90].map((multiplier) => {
                const suggestedPrice = Math.round(product.price * multiplier);
                return (
                  <Button
                    key={multiplier}
                    size="sm"
                    variant="outline"
                    onClick={() => setBidPrice(String(suggestedPrice))}
                    className="flex-1 text-xs"
                    disabled={attempts >= MAX_ATTEMPTS}
                  >
                    ₹{suggestedPrice.toLocaleString()}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 btn-primary"
              onClick={handleBidSubmit}
              disabled={isSubmitting || attempts >= MAX_ATTEMPTS || !bidPrice}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Place Bid"
              )}
            </Button>
          </div>

          {/* Loyalty tier info */}
          {spendLevel < 2 && (
            <div className="text-xs text-muted-foreground text-center pt-2">
              {spendLevel === 0 ? (
                <span>Spend ₹{(3000 - totalSpent).toLocaleString()} more to unlock better bid acceptance rates</span>
              ) : (
                <span>Spend ₹{(5000 - totalSpent).toLocaleString()} more to reach VIP status with best rates</span>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
