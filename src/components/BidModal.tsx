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
import { 
  Loader2, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Info,
  CreditCard,
  Ticket
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [showCardAnimation, setShowCardAnimation] = useState(false);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);

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

  // Show welcome toast for users with free bid cards
  useEffect(() => {
    if (open && user && !hasShownWelcomeToast && biddingData.freeBidsRemaining > 0) {
      const hasSeenWelcome = localStorage.getItem(`bidWelcome_${user.id}`);
      if (!hasSeenWelcome) {
        toast.success("🎉 You have free Bid Cards!", {
          description: `Use your ${biddingData.freeBidsRemaining} Bid Cards to try Reverse Bidding and name your price!`,
          duration: 5000,
        });
        localStorage.setItem(`bidWelcome_${user.id}`, "true");
        setHasShownWelcomeToast(true);
      }
    }
  }, [open, user, biddingData.freeBidsRemaining, hasShownWelcomeToast]);

  const handleLoginRedirect = () => {
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

    // Check if user has bid cards
    if (biddingData.freeBidsRemaining <= 0 && biddingData.spendLevel < 1 && biddingData.totalSpent < 3000) {
      toast.error("No Bid Cards remaining. Buy more to continue bidding!");
      return;
    }

    setIsSubmitting(true);
    setLastRejection(null);

    // Trigger card consumption animation
    setShowCardAnimation(true);
    setTimeout(() => setShowCardAnimation(false), 1000);

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
  const hasNoBidCards = freeBidsRemaining <= 0 && spendLevel < 1 && totalSpent < 3000;

  // Bid Cards Display Component
  const BidCardsDisplay = () => (
    <div className={`relative transition-all duration-300 ${showCardAnimation ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
        <div className="relative">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Ticket className="w-6 h-6 text-primary-foreground" />
          </div>
          {showCardAnimation && (
            <div className="absolute inset-0 rounded-lg bg-primary/50 animate-ping" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Bid Cards</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">
                    <strong>How Reverse Bidding Works:</strong><br/>
                    1. Enter your desired price below the listed price<br/>
                    2. Our AI evaluates your bid instantly<br/>
                    3. If accepted, you get the product at your price!<br/>
                    4. Each bid uses 1 Bid Card (max 3 attempts per product)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-7 rounded-sm border-2 transition-all duration-300 ${
                    i < freeBidsRemaining
                      ? 'bg-gradient-to-b from-primary to-accent border-primary/50 shadow-sm'
                      : 'bg-muted/30 border-muted-foreground/20'
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm font-bold ${freeBidsRemaining > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              {freeBidsRemaining} left
            </span>
          </div>
        </div>
      </div>
    </div>
  );

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

            <div className="space-y-3">
              <div className="bg-gradient-to-r from-accent/20 to-primary/20 p-4 rounded-xl border border-accent/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">New users get <strong className="text-accent">5 FREE Bid Cards</strong>!</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Try Reverse Bidding and name your price</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Unlock unlimited bidding by spending ₹3,000+</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleLoginRedirect}
            >
              Login to Get Free Bid Cards
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No bid cards view
  if (hasNoBidCards) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-muted-foreground" />
              No Bid Cards Remaining
            </DialogTitle>
            <DialogDescription>
              You've used all your free Bid Cards
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <BidCardsDisplay />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your spending</span>
                <span className="font-semibold">₹{totalSpent.toLocaleString()} / ₹3,000</span>
              </div>
              <Progress value={spendProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Spend ₹{(3000 - totalSpent).toLocaleString()} more to unlock unlimited bidding
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity" 
                size="lg"
                onClick={() => toast.info("Bid Card purchase coming soon!", { description: "This feature is under development." })}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Buy More Bid Cards
              </Button>
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
            <BidCardsDisplay />

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
              <div className="text-center text-sm text-primary font-medium">
                ✨ You can still use your {freeBidsRemaining} free Bid Card{freeBidsRemaining > 1 ? 's' : ''}!
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
          {/* Bid Cards Display */}
          <BidCardsDisplay />

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
              className="flex-1"
              onClick={handleBidSubmit}
              disabled={isSubmitting || attempts >= MAX_ATTEMPTS || !bidPrice}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  Place Bid
                </>
              )}
            </Button>
          </div>

          {/* Buy more bid cards CTA */}
          {freeBidsRemaining <= 2 && spendLevel < 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => toast.info("Bid Card purchase coming soon!", { description: "This feature is under development." })}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              Running low? Buy more Bid Cards
            </Button>
          )}

          {/* Loyalty tier info */}
          {spendLevel < 2 && (
            <div className="text-xs text-muted-foreground text-center pt-2">
              {spendLevel === 0 ? (
                <span>Spend ₹{(3000 - totalSpent).toLocaleString()} more to unlock unlimited bidding</span>
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