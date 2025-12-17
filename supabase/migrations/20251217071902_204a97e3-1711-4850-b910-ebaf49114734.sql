-- Update the default free bids from 1 to 3 for new users
ALTER TABLE public.bid_coupons ALTER COLUMN free_bids_remaining SET DEFAULT 3;

-- Update existing users who still have their initial 1 free bid to 3
UPDATE public.bid_coupons 
SET free_bids_remaining = 3 
WHERE free_bids_remaining = 1 AND total_free_bids_used = 0;

-- Update the trigger function to grant 3 free bids instead of 1
CREATE OR REPLACE FUNCTION public.handle_new_user_bidding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_spending (user_id, total_spent, spend_level)
  VALUES (NEW.id, 0, 0);
  
  INSERT INTO public.bid_coupons (user_id, free_bids_remaining)
  VALUES (NEW.id, 3);
  
  RETURN NEW;
END;
$function$;