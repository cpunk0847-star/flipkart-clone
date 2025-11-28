import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/mockProducts";
import { useBudget } from "@/contexts/BudgetContext";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DetectedObject {
  label: string;
  confidence: number;
  category: string;
  description: string;
}

interface VisualFeatures {
  style: string;
  pattern: string;
  material: string;
}

interface AnalysisData {
  detectedObjects: DetectedObject[];
  dominantColors: string[];
  visualFeatures: VisualFeatures;
  searchQueries: string[];
  complementaryCategories: string[];
  scene: string;
}

interface SearchResults {
  token: string;
  analysis: AnalysisData;
  appliedFilters: {
    budget: { min: number | null; max: number | null } | null;
  };
}

const VisualSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isWithinBudget } = useBudget();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchImage, setSearchImage] = useState<string | null>(null);

  useEffect(() => {
    const image = sessionStorage.getItem('visualSearchImage');
    setSearchImage(image);

    // Check if we're still uploading
    if (location.state?.uploading) {
      // Listen for completion
      const handleComplete = (event: CustomEvent<SearchResults>) => {
        setResults(event.detail);
        setLoading(false);
      };

      window.addEventListener('visualSearchComplete', handleComplete as EventListener);

      return () => {
        window.removeEventListener('visualSearchComplete', handleComplete as EventListener);
      };
    } else {
      // Load from sessionStorage
      const cachedResults = sessionStorage.getItem('visualSearchResults');
      if (cachedResults) {
        setResults(JSON.parse(cachedResults));
      }
      setLoading(false);
    }
  }, [location.state]);

  // Get matching products based on analysis
  const getMatchingProducts = (queries: string[], categories: string[]) => {
    return products.filter(product => {
      // Budget filter
      if (!isWithinBudget(product.price)) return false;

      // Category match
      const categoryMatch = categories.some(cat => 
        product.category.toLowerCase().includes(cat.toLowerCase())
      );

      // Query match
      const queryMatch = queries.some(query => {
        const q = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(q) ||
          product.brand?.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q)
        );
      });

      return categoryMatch || queryMatch;
    });
  };

  // Group products by category for complementary display
  const groupByCategory = (prods: typeof products) => {
    const grouped = new Map<string, typeof products>();
    prods.forEach(prod => {
      const existing = grouped.get(prod.category) || [];
      grouped.set(prod.category, [...existing, prod]);
    });
    return grouped;
  };

  if (!searchImage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>No search image found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !results) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-2xl font-bold">Analyzing your image...</h2>
            <p className="text-muted-foreground">Finding the perfect matches</p>
          </div>
        </div>
      </div>
    );
  }

  const { analysis } = results;
  const matchingProducts = getMatchingProducts(
    analysis.searchQueries,
    [
      ...analysis.detectedObjects.map(obj => obj.category),
      ...analysis.complementaryCategories
    ]
  );
  const groupedProducts = groupByCategory(matchingProducts);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Uploaded Image */}
            <div className="w-full md:w-48 h-48 flex-shrink-0">
              <img
                src={searchImage}
                alt="Search"
                className="w-full h-full object-cover rounded-lg border-2 border-primary"
              />
            </div>

            {/* Analysis Summary */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h1 className="text-2xl font-bold">Visual Search Results</h1>
              </div>

              {/* Detected Objects */}
              {analysis.detectedObjects.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Detected Items:</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.detectedObjects.map((obj, idx) => (
                      <Badge key={idx} variant="secondary">
                        {obj.label} ({Math.round(obj.confidence * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Features */}
              {analysis.visualFeatures && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Visual Features:</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.visualFeatures.style && (
                      <Badge variant="outline">{analysis.visualFeatures.style}</Badge>
                    )}
                    {analysis.visualFeatures.pattern && (
                      <Badge variant="outline">{analysis.visualFeatures.pattern}</Badge>
                    )}
                    {analysis.visualFeatures.material && (
                      <Badge variant="outline">{analysis.visualFeatures.material}</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Color Palette */}
              {analysis.dominantColors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Dominant Colors:</h3>
                  <div className="flex gap-2">
                    {analysis.dominantColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results by Category */}
        {matchingProducts.length > 0 ? (
          <div className="space-y-12">
            {Array.from(groupedProducts.entries()).map(([category, prods]) => (
              <section key={category}>
                <h2 className="text-2xl font-bold mb-6 capitalize">
                  {category} 
                  <span className="text-muted-foreground text-lg ml-2">
                    ({prods.length} items)
                  </span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {prods.slice(0, 10).map((product) => (
                    <ProductCard 
                      key={product.id}
                      id={product.id}
                      image={product.image}
                      title={product.name}
                      brand={product.brand}
                      category={product.category}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      rating={product.rating}
                      reviews={product.reviews}
                      discount={product.discount}
                      offers={product.offers}
                      inStock={product.inStock}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">No matching products found</h2>
            <p className="text-muted-foreground mb-6">
              Try uploading a different image or adjusting your budget filter
            </p>
            <Button onClick={() => navigate('/')}>
              Browse All Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualSearchResults;
