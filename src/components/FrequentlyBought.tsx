import { Product } from "@/data/mockProducts";
import { Star, Plus, ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useState } from "react";

interface FrequentlyBoughtProps {
  mainProduct: Product;
  recommendations: Product[];
}

const FrequentlyBought = ({ mainProduct, recommendations }: FrequentlyBoughtProps) => {
  const navigate = useNavigate();
  const { addMultipleToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [loading, setLoading] = useState(false);

  if (recommendations.length === 0) return null;

  const totalPrice = mainProduct.price + recommendations.reduce((sum, p) => sum + p.price, 0);
  const totalOriginalPrice =
    mainProduct.originalPrice + recommendations.reduce((sum, p) => sum + p.originalPrice, 0);
  const totalSavings = totalOriginalPrice - totalPrice;

  const handleAddAllToCart = async () => {
    setLoading(true);
    try {
      // Add main product + all recommendations
      await addMultipleToCart([mainProduct, ...recommendations]);
      setAddedToCart(true);
      
      toast.success(
        `Added ${1 + recommendations.length} items to cart! Saved ₹${totalSavings.toLocaleString()}`,
        {
          duration: 3000,
        }
      );
      
      // Reset button after 2 seconds
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      toast.error("Failed to add items to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-sm">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Frequently Bought Together</h2>

      {/* Products Grid - Responsive */}
      <div className="flex flex-col md:flex-row md:flex-wrap items-start gap-3 md:gap-4 mb-4 md:mb-6">
        {/* Main Product */}
        <div className="w-full md:flex-1 md:min-w-[180px] md:max-w-[220px]">
          <div className="flex md:flex-col gap-3 md:gap-0">
            <div className="w-24 h-24 md:w-full md:aspect-square rounded-lg overflow-hidden bg-muted md:mb-3 flex-shrink-0">
              <img
                src={mainProduct.image}
                alt={mainProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium line-clamp-2">{mainProduct.name}</p>
              <p className="text-xs text-muted-foreground">{mainProduct.brand}</p>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">₹{mainProduct.price.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{mainProduct.originalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plus icons and recommended products */}
        {recommendations.map((product) => (
          <div key={product.id} className="w-full md:flex md:items-center md:gap-3">
            <div className="hidden md:flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="w-full md:flex-1 md:min-w-[180px] md:max-w-[220px]">
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer group"
              >
                <div className="flex md:flex-col gap-3 md:gap-0">
                  <div className="w-24 h-24 md:w-full md:aspect-square rounded-lg overflow-hidden bg-muted md:mb-3 flex-shrink-0 group-hover:shadow-md transition-shadow">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex items-center gap-0.5 bg-discount-green text-white px-1.5 py-0.5 rounded text-xs">
                        <span className="font-semibold">{product.rating}</span>
                        <Star className="w-2.5 h-2.5 fill-white" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviews.toLocaleString()})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">₹{product.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Price and CTA */}
      <div className="border-t border-border pt-4 md:pt-6 mt-4 md:mt-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Total Price:</span>
              <span className="text-xl md:text-2xl font-bold">₹{totalPrice.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{totalOriginalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-discount-green font-semibold">
              Save ₹{totalSavings.toLocaleString()} with this combo
            </p>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleAddAllToCart}
            disabled={addedToCart || loading}
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-semibold disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Adding...
              </>
            ) : addedToCart ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add All to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyBought;
