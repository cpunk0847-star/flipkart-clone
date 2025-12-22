-- Update default free bids from 3 to 5 for new users
ALTER TABLE public.bid_coupons ALTER COLUMN free_bids_remaining SET DEFAULT 5;

-- Update the trigger function to give 5 free bids
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
  VALUES (NEW.id, 5);
  
  RETURN NEW;
END;
$function$;