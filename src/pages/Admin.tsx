import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminStats } from '@/hooks/useAdminStats';
import { StatsCards } from '@/components/admin/StatsCards';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { UsersTable } from '@/components/admin/UsersTable';
import { BidsTable } from '@/components/admin/BidsTable';
import { ProductThresholdsTable } from '@/components/admin/ProductThresholdsTable';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    stats,
    profiles,
    orders,
    bids,
    thresholds,
    spending,
    coupons,
    isLoading,
    refetchAll,
  } = useAdminStats();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </div>
          <Button onClick={refetchAll} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <StatsCards stats={stats} isLoading={isLoading} />
        </section>

        {/* Data Tables */}
        <section>
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="users">Users ({profiles.length})</TabsTrigger>
              <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
              <TabsTrigger value="thresholds">Thresholds ({thresholds.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <OrdersTable orders={orders} />
            </TabsContent>

            <TabsContent value="users" className="mt-4">
              <UsersTable profiles={profiles} spending={spending} coupons={coupons} />
            </TabsContent>

            <TabsContent value="bids" className="mt-4">
              <BidsTable bids={bids} />
            </TabsContent>

            <TabsContent value="thresholds" className="mt-4">
              <ProductThresholdsTable thresholds={thresholds} />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
};

export default Admin;
