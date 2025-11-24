import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DollarSign, X } from "lucide-react";
import { useBudget, budgetPresets } from "@/contexts/BudgetContext";
import { toast } from "sonner";

const BudgetControl = () => {
  const { budget, setBudget, clearBudget, isActive } = useBudget();
  const [open, setOpen] = useState(false);
  const [minInput, setMinInput] = useState(budget.min?.toString() || "");
  const [maxInput, setMaxInput] = useState(budget.max?.toString() || "");

  const handleApply = () => {
    const min = minInput ? parseInt(minInput) : null;
    const max = maxInput ? parseInt(maxInput) : null;

    if (max === null) {
      toast.error("Please set a maximum budget");
      return;
    }

    if (min !== null && max !== null && min > max) {
      toast.error("Minimum budget cannot be greater than maximum");
      return;
    }

    setBudget({ min, max });
    setOpen(false);
    toast.success(`Budget filter applied: ₹${min || 0} - ₹${max.toLocaleString()}`);
  };

  const handlePreset = (preset: typeof budgetPresets[0]) => {
    setMinInput(preset.min.toString());
    setMaxInput(preset.max?.toString() || "");
    setBudget({ min: preset.min, max: preset.max });
    setOpen(false);
    toast.success(`Budget filter applied: ${preset.label}`);
  };

  const handleClear = () => {
    clearBudget();
    setMinInput("");
    setMaxInput("");
    toast.success("Budget filter cleared");
  };

  return (
    <>
      {isActive && (
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
          <DollarSign className="w-4 h-4" />
          <span>
            Budget: ₹{budget.min || 0} - {budget.max ? `₹${budget.max.toLocaleString()}` : "∞"}
          </span>
          <button onClick={handleClear} className="hover:bg-primary/20 rounded-full p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Budget Control
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Budget Control Mode</SheetTitle>
            <SheetDescription>
              Set your budget range to filter products. Only items within your budget will be shown.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Quick Presets */}
            <div>
              <h3 className="font-semibold mb-3">Quick Presets</h3>
              <div className="grid grid-cols-1 gap-2">
                {budgetPresets.map((preset, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handlePreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="space-y-4">
              <h3 className="font-semibold">Custom Budget Range</h3>
              
              <div className="space-y-2">
                <Label htmlFor="minBudget">Minimum Budget (Optional)</Label>
                <Input
                  id="minBudget"
                  type="number"
                  placeholder="e.g., 0"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBudget">Maximum Budget *</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  placeholder="e.g., 50000"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  min="0"
                  required
                />
                <p className="text-xs text-muted-foreground">* Required</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {isActive && (
                <Button variant="outline" onClick={handleClear} className="flex-1">
                  Clear Filter
                </Button>
              )}
              <Button onClick={handleApply} className="flex-1 btn-primary">
                Apply Budget
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BudgetControl;
