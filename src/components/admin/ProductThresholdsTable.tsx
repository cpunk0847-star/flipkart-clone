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
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ProductThreshold } from '@/hooks/useAdminStats';

interface ProductThresholdsTableProps {
  thresholds: ProductThreshold[];
}

export const ProductThresholdsTable = ({ thresholds }: ProductThresholdsTableProps) => {
  const [search, setSearch] = useState('');

  const filteredThresholds = thresholds.filter((t) =>
    t.product_id.toLowerCase().includes(search.toLowerCase())
  );

  const getDemandBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <Badge className="bg-red-500/10 text-red-500 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            High
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-blue-500/10 text-blue-500 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Low
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/10 text-gray-500 flex items-center gap-1">
            <Minus className="h-3 w-3" />
            Medium
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
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
              <TableHead>Seller Cost</TableHead>
              <TableHead>Base Threshold</TableHead>
              <TableHead>Min Safe</TableHead>
              <TableHead>Demand</TableHead>
              <TableHead>Clearance</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredThresholds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No product thresholds found
                </TableCell>
              </TableRow>
            ) : (
              filteredThresholds.map((threshold) => (
                <TableRow key={threshold.id}>
                  <TableCell className="font-mono text-sm">{threshold.product_id}</TableCell>
                  <TableCell className="font-semibold">₹{Number(threshold.seller_cost).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(threshold.base_threshold).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(threshold.min_safe_threshold).toLocaleString()}</TableCell>
                  <TableCell>{getDemandBadge(threshold.demand_level)}</TableCell>
                  <TableCell>
                    {threshold.is_clearance ? (
                      <Badge className="bg-orange-500/10 text-orange-500">
                        ₹{threshold.clearance_threshold?.toLocaleString() || 'N/A'}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(threshold.updated_at).toLocaleDateString()}
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
