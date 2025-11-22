import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Tag } from "lucide-react";
import { products, categories } from "@/data/mockProducts";

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get("q") || "";
  
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState("relevance");

  // Search and filter products
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];

    const query = searchQuery.toLowerCase();
    return products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(query);
      const brandMatch = p.brand.toLowerCase().includes(query);
      const categoryMatch = p.category.toLowerCase().includes(query);
      return nameMatch || brandMatch || categoryMatch;
    });
  }, [searchQuery]);

  // Detect dominant category
  const detectedCategory = useMemo(() => {
    if (searchResults.length === 0) return null;
    
    const categoryCounts: Record<string, number> = {};
    searchResults.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const dominantCategory = Object.entries(categoryCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return dominantCategory
      ? {
          id: dominantCategory[0],
          name: categories[dominantCategory[0] as keyof typeof categories]?.name,
          count: dominantCategory[1],
        }
      : null;
  }, [searchResults]);

  // Get unique brands and categories from search results
  const availableBrands = Array.from(new Set(searchResults.map((p) => p.brand))).sort();
  const availableCategories = Array.from(
    new Set(searchResults.map((p) => p.category))
  ).map((catId) => ({
    id: catId,
    name: categories[catId as keyof typeof categories]?.name || catId,
  }));

  // Filter and sort
  const filteredProducts = useMemo(() => {
    let filtered = searchResults.filter((p) => {
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const categoryMatch =
        selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const ratingMatch = selectedRating === 0 || p.rating >= selectedRating;
      return priceMatch && brandMatch && categoryMatch && ratingMatch;
    });

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      case "discount":
        filtered.sort((a, b) => b.discount - a.discount);
        break;
    }

    return filtered;
  }, [searchResults, priceRange, selectedBrands, selectedCategories, selectedRating, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 200000]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedRating(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/")}>
              Home
            </span>
            <span>/</span>
            <span className="text-foreground font-medium">Search Results</span>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Search results for "{searchQuery}"
              </h1>
              
              {/* Detected Category Tag */}
              {detectedCategory && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    Showing results in{" "}
                    <button
                      onClick={() => navigate(`/category/${detectedCategory.id}`)}
                      className="font-semibold text-primary hover:underline"
                    >
                      {detectedCategory.name}
                    </button>
                    {" "}({detectedCategory.count} items)
                  </span>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {searchResults.length} results
          </p>
        </div>

        {searchResults.length === 0 ? (
          <div className="text-center py-16">
            <X className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try searching with different keywords
            </p>
            <Button onClick={() => navigate("/")}>Browse Categories</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <aside className={`lg:col-span-1 ${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  {(selectedBrands.length > 0 ||
                    selectedCategories.length > 0 ||
                    selectedRating > 0 ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 200000) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-primary"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Categories */}
                {availableCategories.length > 1 && (
                  <div className="mb-6 pb-6 border-b border-border">
                    <h3 className="font-semibold mb-4">Category</h3>
                    <div className="space-y-3">
                      {availableCategories.map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`cat-${cat.id}`}
                            checked={selectedCategories.includes(cat.id)}
                            onCheckedChange={() => toggleCategory(cat.id)}
                          />
                          <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                            {cat.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-6 pb-6 border-b border-border">
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={200000}
                    step={1000}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6 pb-6 border-b border-border">
                  <h3 className="font-semibold mb-4">Brand</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availableBrands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Customer Ratings</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={selectedRating === rating}
                          onCheckedChange={() =>
                            setSelectedRating(selectedRating === rating ? 0 : rating)
                          }
                        />
                        <Label
                          htmlFor={`rating-${rating}`}
                          className="text-sm cursor-pointer flex items-center gap-1"
                        >
                          <span>{rating}★</span>
                          <span className="text-muted-foreground">& above</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Sort Options */}
              <div className="bg-card rounded-lg border border-border p-4 mb-6 flex items-center justify-between">
                <span className="text-sm font-medium">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="popular">Popularity</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <X className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products match your filters</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button onClick={clearFilters}>Clear All Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
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
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
