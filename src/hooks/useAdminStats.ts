import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalBids: number;
  acceptedBids: number;
  rejectedBids: number;
  activeCartItems: number;
  totalProducts: number;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  items: unknown;
}

export interface UserBid {
  id: string;
  user_id: string;
  product_id: string;
  bid_amount: number;
  status: string;
  attempt_number: number;
  used_free_coupon: boolean;
  created_at: string;
}

export interface ProductThreshold {
  id: string;
  product_id: string;
  seller_cost: number;
  base_threshold: number;
  min_safe_threshold: number;
  is_clearance: boolean;
  clearance_threshold: number | null;
  demand_level: string;
  created_at: string;
  updated_at: string;
}

export interface UserSpending {
  id: string;
  user_id: string;
  total_spent: number;
  spend_level: number;
}

export interface BidCoupon {
  id: string;
  user_id: string;
  free_bids_remaining: number;
  total_free_bids_used: number;
}

export const useAdminStats = () => {
  const profilesQuery = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const ordersQuery = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const bidsQuery = useQuery({
    queryKey: ['admin-bids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bids')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserBid[];
    },
  });

  const thresholdsQuery = useQuery({
    queryKey: ['admin-thresholds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_thresholds')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProductThreshold[];
    },
  });

  const cartItemsQuery = useQuery({
    queryKey: ['admin-cart-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const spendingQuery = useQuery({
    queryKey: ['admin-spending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_spending')
        .select('*');
      if (error) throw error;
      return data as UserSpending[];
    },
  });

  const couponsQuery = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bid_coupons')
        .select('*');
      if (error) throw error;
      return data as BidCoupon[];
    },
  });

  const stats: AdminStats = {
    totalUsers: profilesQuery.data?.length || 0,
    totalOrders: ordersQuery.data?.length || 0,
    totalRevenue: ordersQuery.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
    totalBids: bidsQuery.data?.length || 0,
    acceptedBids: bidsQuery.data?.filter(b => b.status === 'accepted').length || 0,
    rejectedBids: bidsQuery.data?.filter(b => b.status === 'rejected').length || 0,
    activeCartItems: cartItemsQuery.data?.length || 0,
    totalProducts: thresholdsQuery.data?.length || 0,
  };

  const isLoading = profilesQuery.isLoading || ordersQuery.isLoading || bidsQuery.isLoading || thresholdsQuery.isLoading;

  const refetchAll = () => {
    profilesQuery.refetch();
    ordersQuery.refetch();
    bidsQuery.refetch();
    thresholdsQuery.refetch();
    cartItemsQuery.refetch();
    spendingQuery.refetch();
    couponsQuery.refetch();
  };

  return {
    stats,
    profiles: profilesQuery.data || [],
    orders: ordersQuery.data || [],
    bids: bidsQuery.data || [],
    thresholds: thresholdsQuery.data || [],
    cartItems: cartItemsQuery.data || [],
    spending: spendingQuery.data || [],
    coupons: couponsQuery.data || [],
    isLoading,
    refetchAll,
  };
};
