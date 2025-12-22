import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface BidRequest {
  productId: string;
  bidAmount: number;
  productCategory: string;
  productPrice: number;
  productOriginalPrice: number;
  useFreeCopon: boolean;
}

interface ThresholdData {
  sellerCost: number;
  baseThreshold: number;
  minSafeThreshold: number;
  demandLevel: "high" | "medium" | "low";
  isClearance: boolean;
  clearanceThreshold?: number;
}

// Calculate threshold based on product price (simulated seller cost is ~60% of original price)
function calculateThresholdData(productPrice: number, productOriginalPrice: number): ThresholdData {
  const sellerCost = Math.round(productOriginalPrice * 0.55);
  const baseThreshold = Math.round(productPrice * 0.90); // 90% of sale price
  const minSafeThreshold = Math.round(sellerCost * 1.08); // 8% minimum margin
  
  // Simulate demand level based on price tier
  const demandLevel: "high" | "medium" | "low" = 
    productPrice > 5000 ? "high" : 
    productPrice > 2000 ? "medium" : "low";
  
  return {
    sellerCost,
    baseThreshold,
    minSafeThreshold,
    demandLevel,
    isClearance: false,
  };
}

// Adjust threshold based on user spend level
function adjustThresholdForLoyalty(
  baseThreshold: number,
  minSafeThreshold: number,
  spendLevel: number,
  totalSpent: number
): number {
  let adjustedThreshold = baseThreshold;
  
  if (spendLevel >= 2 || totalSpent >= 5000) {
    // Level 2: Best threshold (up to 12% reduction)
    adjustedThreshold = Math.round(baseThreshold * 0.88);
  } else if (spendLevel >= 1 || totalSpent >= 4000) {
    // Between Level 1 and 2: 8% reduction
    adjustedThreshold = Math.round(baseThreshold * 0.92);
  } else if (totalSpent >= 3000) {
    // Level 1: 4% reduction
    adjustedThreshold = Math.round(baseThreshold * 0.96);
  }
  
  // Never go below minimum safe threshold
  return Math.max(adjustedThreshold, minSafeThreshold);
}

// Adjust for demand
function adjustThresholdForDemand(
  threshold: number,
  minSafeThreshold: number,
  demandLevel: "high" | "medium" | "low"
): number {
  let adjustedThreshold = threshold;
  
  switch (demandLevel) {
    case "high":
      // High demand: no reduction
      break;
    case "medium":
      // Medium demand: small reduction (3%)
      adjustedThreshold = Math.round(threshold * 0.97);
      break;
    case "low":
      // Low demand: larger reduction (7%)
      adjustedThreshold = Math.round(threshold * 0.93);
      break;
  }
  
  return Math.max(adjustedThreshold, minSafeThreshold);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Please login to place a bid" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Please login to place a bid" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: BidRequest = await req.json();
    const { productId, bidAmount, productCategory, productPrice, productOriginalPrice, useFreeCopon } = body;

    console.log(`[BID] User ${user.id} bidding ₹${bidAmount} on product ${productId} (category: ${productCategory})`);

    // Check category eligibility
    const categoryLower = productCategory.toLowerCase();
    if (FIXED_PRICE_CATEGORIES.includes(categoryLower)) {
      return new Response(
        JSON.stringify({ 
          error: "This product category does not support bidding",
          eligible: false 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check price eligibility (>= ₹1000)
    if (productPrice < 1000) {
      return new Response(
        JSON.stringify({ 
          error: "Bidding is only available for products priced ₹1,000 or above",
          eligible: false 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user spending data
    let { data: spendingData } = await supabaseAdmin
      .from("user_spending")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Initialize if not exists
    if (!spendingData) {
      const { data: newSpending } = await supabaseAdmin
        .from("user_spending")
        .insert({ user_id: user.id, total_spent: 0, spend_level: 0 })
        .select()
        .single();
      spendingData = newSpending;
    }

    // Get user's bid coupons
    let { data: couponData } = await supabaseAdmin
      .from("bid_coupons")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Initialize if not exists (5 free bids for new users)
    if (!couponData) {
      const { data: newCoupon } = await supabaseAdmin
        .from("bid_coupons")
        .insert({ user_id: user.id, free_bids_remaining: 5 })
        .select()
        .single();
      couponData = newCoupon;
    }

    const totalSpent = spendingData?.total_spent || 0;
    const spendLevel = spendingData?.spend_level || 0;
    const freeBidsRemaining = couponData?.free_bids_remaining || 0;

    // Check if user can bid (either has free coupon or has spend level >= 1)
    const hasFreeCopon = freeBidsRemaining > 0;
    const hasSpendAccess = spendLevel >= 1 || totalSpent >= 3000;
    
    if (!hasFreeCopon && !hasSpendAccess) {
      return new Response(
        JSON.stringify({ 
          error: "You need to spend at least ₹3,000 on Easyship to unlock Reverse Bidding, or use your free bid coupon",
          eligible: false,
          freeBidsRemaining,
          totalSpent,
          spendRequired: 3000 - totalSpent,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Count previous bid attempts for this product
    const { count: attemptCount } = await supabaseAdmin
      .from("user_bids")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("product_id", productId);

    const attempts = attemptCount || 0;
    const MAX_ATTEMPTS = 3;

    if (attempts >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ 
          error: "Maximum bid attempts (3) reached for this product",
          eligible: false,
          attemptsUsed: attempts,
          maxAttempts: MAX_ATTEMPTS,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or calculate threshold data
    let { data: thresholdData } = await supabaseAdmin
      .from("product_thresholds")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

    const threshold = thresholdData 
      ? {
          sellerCost: thresholdData.seller_cost,
          baseThreshold: thresholdData.base_threshold,
          minSafeThreshold: thresholdData.min_safe_threshold,
          demandLevel: thresholdData.demand_level as "high" | "medium" | "low",
          isClearance: thresholdData.is_clearance,
          clearanceThreshold: thresholdData.clearance_threshold,
        }
      : calculateThresholdData(productPrice, productOriginalPrice);

    // Store threshold if not exists
    if (!thresholdData) {
      await supabaseAdmin.from("product_thresholds").insert({
        product_id: productId,
        seller_cost: threshold.sellerCost,
        base_threshold: threshold.baseThreshold,
        min_safe_threshold: threshold.minSafeThreshold,
        demand_level: threshold.demandLevel,
        is_clearance: false,
      });
    }

    // Calculate final threshold with adjustments
    let finalThreshold = adjustThresholdForLoyalty(
      threshold.baseThreshold,
      threshold.minSafeThreshold,
      spendLevel,
      totalSpent
    );
    
    finalThreshold = adjustThresholdForDemand(
      finalThreshold,
      threshold.minSafeThreshold,
      threshold.demandLevel
    );

    // Clearance logic: Level 1 users can see clearance prices
    if (threshold.isClearance && threshold.clearanceThreshold && spendLevel === 1) {
      finalThreshold = Math.max(threshold.clearanceThreshold, threshold.minSafeThreshold);
    }

    console.log(`[BID] Final threshold: ₹${finalThreshold}, Bid: ₹${bidAmount}`);

    // Evaluate bid
    const isAccepted = bidAmount >= finalThreshold;
    const shouldUseFreeCopon = useFreeCopon && hasFreeCopon && !hasSpendAccess;

    // Record the bid attempt
    await supabaseAdmin.from("user_bids").insert({
      user_id: user.id,
      product_id: productId,
      bid_amount: bidAmount,
      status: isAccepted ? "accepted" : "rejected",
      attempt_number: attempts + 1,
      used_free_coupon: shouldUseFreeCopon,
    });

    // If using free coupon, decrement it
    if (shouldUseFreeCopon) {
      await supabaseAdmin
        .from("bid_coupons")
        .update({ 
          free_bids_remaining: freeBidsRemaining - 1,
          total_free_bids_used: (couponData?.total_free_bids_used || 0) + 1,
        })
        .eq("user_id", user.id);
    }

    if (isAccepted) {
      console.log(`[BID] ✅ Bid ACCEPTED for user ${user.id}`);
      return new Response(
        JSON.stringify({
          success: true,
          accepted: true,
          bidPrice: bidAmount,
          message: `🎉 Congratulations! Your bid of ₹${bidAmount.toLocaleString()} has been accepted!`,
          attemptsUsed: attempts + 1,
          maxAttempts: MAX_ATTEMPTS,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.log(`[BID] ❌ Bid REJECTED for user ${user.id}`);
      
      // Calculate suggested increase
      const suggestedIncrease = Math.ceil((finalThreshold - bidAmount) / 50) * 50;
      
      return new Response(
        JSON.stringify({
          success: true,
          accepted: false,
          bidPrice: bidAmount,
          message: "Your bid is too low. Try a slightly higher amount.",
          suggestedIncreases: [50, 100, 200],
          attemptsRemaining: MAX_ATTEMPTS - attempts - 1,
          attemptsUsed: attempts + 1,
          maxAttempts: MAX_ATTEMPTS,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[BID] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
