import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Categories eligible for reverse bidding
const BIDDING_ELIGIBLE_CATEGORIES = [
  "fashion",
  "shoes",
  "watches",
  "accessories",
  "bags",
  "gym",
  "stationery",
  "lifestyle",
];

// Fixed-price categories NOT eligible for bidding
const FIXED_PRICE_CATEGORIES = ["mobiles", "laptops", "electronics"];

interface BidResponse {
  success?: boolean;
  accepted?: boolean;
  bidPrice?: number;
  message?: string;
  error?: string;
  eligible?: boolean;
  freeBidsRemaining?: number;
  totalSpent?: number;
  spendRequired?: number;
  attemptsUsed?: number;
  maxAttempts?: number;
  attemptsRemaining?: number;
  suggestedIncreases?: number[];
}

interface UserBiddingData {
  freeBidsRemaining: number;
  totalSpent: number;
  spendLevel: number;
  isLoading: boolean;
}

export function useBidding() {
  const { user, session } = useAuth();
  const [biddingData, setBiddingData] = useState<UserBiddingData>({
    freeBidsRemaining: 0,
    totalSpent: 0,
    spendLevel: 0,
    isLoading: true,
  });

  // Fetch user's bidding data
  const fetchBiddingData = useCallback(async () => {
    if (!user) {
      setBiddingData({
        freeBidsRemaining: 1, // Show as if new user has free bid
        totalSpent: 0,
        spendLevel: 0,
        isLoading: false,
      });
      return;
    }

    try {
      // Fetch spending data
      const { data: spendingData } = await supabase
        .from("user_spending")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch coupon data
      const { data: couponData } = await supabase
        .from("bid_coupons")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setBiddingData({
        freeBidsRemaining: couponData?.free_bids_remaining ?? 1,
        totalSpent: spendingData?.total_spent ?? 0,
        spendLevel: spendingData?.spend_level ?? 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching bidding data:", error);
      setBiddingData(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchBiddingData();
  }, [fetchBiddingData]);

  // Check if a product is eligible for bidding
  const isProductEligible = useCallback((category: string, price: number): boolean => {
    const categoryLower = category.toLowerCase();
    
    // Not eligible if fixed-price category
    if (FIXED_PRICE_CATEGORIES.includes(categoryLower)) {
      return false;
    }
    
    // Not eligible if price < ₹1000
    if (price < 1000) {
      return false;
    }
    
    // Eligible if in bidding categories or is fashion subcategory
    return BIDDING_ELIGIBLE_CATEGORIES.some(cat => 
      categoryLower.includes(cat) || categoryLower === cat
    ) || categoryLower.includes("men") || categoryLower.includes("women") || 
       categoryLower.includes("footwear") || categoryLower.includes("clothing");
  }, []);

  // Check if user can place a bid
  const canUserBid = useCallback((): { canBid: boolean; reason?: string } => {
    if (!user) {
      return { canBid: false, reason: "login_required" };
    }

    const { freeBidsRemaining, totalSpent, spendLevel } = biddingData;
    
    // Has free bid coupon
    if (freeBidsRemaining > 0) {
      return { canBid: true };
    }
    
    // Has spend level access
    if (spendLevel >= 1 || totalSpent >= 3000) {
      return { canBid: true };
    }
    
    return { 
      canBid: false, 
      reason: "spend_required",
    };
  }, [user, biddingData]);

  // Get bid attempts for a product
  const getBidAttempts = useCallback(async (productId: string): Promise<number> => {
    if (!user) return 0;
    
    const { count } = await supabase
      .from("user_bids")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("product_id", productId);
    
    return count || 0;
  }, [user]);

  // Place a bid
  const placeBid = useCallback(async (
    productId: string,
    bidAmount: number,
    productCategory: string,
    productPrice: number,
    productOriginalPrice: number,
    useFreeCopon: boolean = true
  ): Promise<BidResponse> => {
    if (!session?.access_token) {
      return { error: "Please login to place a bid", eligible: false };
    }

    try {
      const { data, error } = await supabase.functions.invoke("evaluate-bid", {
        body: {
          productId,
          bidAmount,
          productCategory,
          productPrice,
          productOriginalPrice,
          useFreeCopon,
        },
      });

      if (error) {
        console.error("Bid error:", error);
        return { error: error.message || "Failed to place bid" };
      }

      // Refresh bidding data after placing bid
      await fetchBiddingData();

      return data as BidResponse;
    } catch (error) {
      console.error("Bid error:", error);
      return { error: "Failed to place bid. Please try again." };
    }
  }, [session, fetchBiddingData]);

  return {
    biddingData,
    isProductEligible,
    canUserBid,
    getBidAttempts,
    placeBid,
    refreshBiddingData: fetchBiddingData,
  };
}
