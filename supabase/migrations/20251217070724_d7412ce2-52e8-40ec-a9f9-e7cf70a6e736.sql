
-- User spending tracking table
CREATE TABLE public.user_spending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  spend_level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product thresholds table (hidden from users)
CREATE TABLE public.product_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  seller_cost NUMERIC NOT NULL,
  base_threshold NUMERIC NOT NULL,
  min_safe_threshold NUMERIC NOT NULL,
  demand_level TEXT NOT NULL DEFAULT 'medium' CHECK (demand_level IN ('high', 'medium', 'low')),
  is_clearance BOOLEAN NOT NULL DEFAULT false,
  clearance_threshold NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User bids table
CREATE TABLE public.user_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  bid_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  used_free_coupon BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bid coupons table
CREATE TABLE public.bid_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  free_bids_remaining INTEGER NOT NULL DEFAULT 1,
  total_free_bids_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_coupons ENABLE ROW LEVEL SECURITY;

-- User spending policies
CREATE POLICY "Users can view own spending" ON public.user_spending
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spending" ON public.user_spending
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spending" ON public.user_spending
  FOR UPDATE USING (auth.uid() = user_id);

-- Product thresholds - read-only for authenticated users (edge function handles writes)
CREATE POLICY "Authenticated users can view thresholds" ON public.product_thresholds
  FOR SELECT TO authenticated USING (true);

-- User bids policies
CREATE POLICY "Users can view own bids" ON public.user_bids
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bids" ON public.user_bids
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bids" ON public.user_bids
  FOR UPDATE USING (auth.uid() = user_id);

-- Bid coupons policies
CREATE POLICY "Users can view own coupons" ON public.bid_coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupons" ON public.bid_coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons" ON public.bid_coupons
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to initialize user bidding data on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_bidding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_spending (user_id, total_spent, spend_level)
  VALUES (NEW.id, 0, 0);
  
  INSERT INTO public.bid_coupons (user_id, free_bids_remaining)
  VALUES (NEW.id, 1);
  
  RETURN NEW;
END;
$$;

-- Trigger to initialize bidding data for new users
CREATE TRIGGER on_auth_user_created_bidding
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_bidding();

-- Function to update spend level based on total spent
CREATE OR REPLACE FUNCTION public.update_spend_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.spend_level := CASE
    WHEN NEW.total_spent >= 5000 THEN 2
    WHEN NEW.total_spent >= 3000 THEN 1
    ELSE 0
  END;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Trigger to auto-update spend level
CREATE TRIGGER update_user_spend_level
  BEFORE UPDATE ON public.user_spending
  FOR EACH ROW EXECUTE FUNCTION public.update_spend_level();

-- Updated at trigger for product_thresholds
CREATE TRIGGER update_product_thresholds_updated_at
  BEFORE UPDATE ON public.product_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Updated at trigger for bid_coupons
CREATE TRIGGER update_bid_coupons_updated_at
  BEFORE UPDATE ON public.bid_coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster bid lookups
CREATE INDEX idx_user_bids_user_product ON public.user_bids(user_id, product_id);
CREATE INDEX idx_product_thresholds_product_id ON public.product_thresholds(product_id);
