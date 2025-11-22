import { Product } from "@/data/mockProducts";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FrequentlyBoughtProps {
  mainProduct: Product;
  recommendations: Product[];
}

const FrequentlyBought = ({ mainProduct, recommendations }: FrequentlyBoughtProps) => {
  const navigate = useNavigate();

  if (recommendations.length === 0) return null;

  const totalPrice = mainProduct.price + recommendations.reduce((sum, p) => sum + p.price, 0);
  const totalOriginalPrice =
    mainProduct.originalPrice + recommendations.reduce((sum, p) => sum + p.originalPrice, 0);
  const totalSavings = totalOriginalPrice - totalPrice;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-6">Frequently Bought Together</h2>

      {/* Products Grid */}
      <div className="flex flex-wrap items-start gap-4 mb-6">
        {/* Main Product */}
        <div className="flex-1 min-w-[200px] max-w-[250px]">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
            <img
              src={mainProduct.image}
              alt={mainProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1">
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

        {/* Plus icons and recommended products */}
        {recommendations.map((product, index) => (
          <div key={product.id} className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-[200px] max-w-[250px]">
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3 group-hover:shadow-md transition-shadow">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1">
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
        ))}
      </div>

      {/* Total Price and CTA */}
      <div className="border-t border-border pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm text-muted-foreground">Total Price:</span>
              <span className="text-2xl font-bold">₹{totalPrice.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{totalOriginalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-discount-green font-semibold">
              Save ₹{totalSavings.toLocaleString()} with this combo
            </p>
          </div>
          
          <Button size="lg" className="btn-accent whitespace-nowrap">
            Add All to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FrequentlyBought;
