import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import type { Profile, UserSpending, BidCoupon } from '@/hooks/useAdminStats';

interface UsersTableProps {
  profiles: Profile[];
  spending: UserSpending[];
  coupons: BidCoupon[];
}

export const UsersTable = ({ profiles, spending, coupons }: UsersTableProps) => {
  const [search, setSearch] = useState('');

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.email?.toLowerCase().includes(search.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getSpendLevel = (userId: string) => {
    const userSpending = spending.find((s) => s.user_id === userId);
    return userSpending?.spend_level || 0;
  };

  const getTotalSpent = (userId: string) => {
    const userSpending = spending.find((s) => s.user_id === userId);
    return userSpending?.total_spent || 0;
  };

  const getFreeBids = (userId: string) => {
    const userCoupon = coupons.find((c) => c.user_id === userId);
    return userCoupon?.free_bids_remaining || 0;
  };

  const getSpendLevelBadge = (level: number) => {
    switch (level) {
      case 2:
        return <Badge className="bg-yellow-500/10 text-yellow-500">Gold</Badge>;
      case 1:
        return <Badge className="bg-gray-400/10 text-gray-400">Silver</Badge>;
      default:
        return <Badge className="bg-orange-500/10 text-orange-500">Bronze</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Spend Level</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Free Bids Left</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name || 'N/A'}</TableCell>
                  <TableCell className="text-muted-foreground">{profile.email || 'N/A'}</TableCell>
                  <TableCell>{getSpendLevelBadge(getSpendLevel(profile.id))}</TableCell>
                  <TableCell className="font-semibold">
                    ₹{getTotalSpent(profile.id).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getFreeBids(profile.id)} remaining</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
