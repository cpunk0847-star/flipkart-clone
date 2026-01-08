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
import { Search, CheckCircle, XCircle, Clock, Ticket } from 'lucide-react';
import type { UserBid } from '@/hooks/useAdminStats';

interface BidsTableProps {
  bids: UserBid[];
}

export const BidsTable = ({ bids }: BidsTableProps) => {
  const [search, setSearch] = useState('');

  const filteredBids = bids.filter(
    (bid) =>
      bid.product_id.toLowerCase().includes(search.toLowerCase()) ||
      bid.status.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-green-500/10 text-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-500 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bids..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Bid Amount</TableHead>
              <TableHead>Attempt #</TableHead>
              <TableHead>Free Coupon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No bids found
                </TableCell>
              </TableRow>
            ) : (
              filteredBids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-mono text-sm">{bid.product_id}</TableCell>
                  <TableCell className="font-semibold">₹{Number(bid.bid_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">#{bid.attempt_number}</Badge>
                  </TableCell>
                  <TableCell>
                    {bid.used_free_coupon ? (
                      <Badge className="bg-purple-500/10 text-purple-500 flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        Used
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(bid.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(bid.created_at).toLocaleDateString()}
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
