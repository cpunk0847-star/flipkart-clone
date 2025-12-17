import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart, Zap, MapPin, Lock } from "lucide-react";
import { toast } from "sonner";
import { getProductById, products } from "@/data/mockProducts";
import { getSmartRecommendations, getFrequentlyBoughtTogether } from "@/lib/recommendations";
import FrequentlyBought from "@/components/FrequentlyBought";
import ProductCard from "@/components/ProductCard";
import CategoryBadge from "@/components/CategoryBadge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBidding } from "@/hooks/useBidding";
import BidModal from "@/components/BidModal";

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isProductEligible, biddingData } = useBidding();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Check for bid redirect after login
  useEffect(() => {
    const bidRedirect = sessionStorage.getItem("bidRedirect");
    if (bidRedirect && user && location.pathname === bidRedirect) {
      sessionStorage.removeItem("bidRedirect");
      // Automatically open bid modal after login redirect
      setTimeout(() => setBidModalOpen(true), 500);
    }
  }, [user, location.pathname]);

  // Get product from mock data
  const productData = getProductById(id || "");
  
  // Fallback if product not found
  const product = productData || {
    id: id || "1",
    name: "Premium Wireless Headphones with Active Noise Cancellation",
    brand: "Sony",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80",
    ],
    price: 4999,
    originalPrice: 9999,
    rating: 4.5,
    reviews: 12450,
    discount: 50,
    inStock: true,
    seller: "TechStore Official",
    offers: [
      "Bank Offer: 10% instant discount on SBI Credit Cards",
      "No Cost EMI available on orders above ₹3000",
      "Free Delivery on orders above ₹500",
    ],
    highlights: [
      "Active Noise Cancellation",
      "40 Hours Battery Life",
      "Premium Sound Quality",
      "Wireless & Bluetooth 5.0",
      "Comfortable Over-Ear Design",
    ],
    description: "Experience premium audio quality with these wireless headphones featuring active noise cancellation, long battery life, and superior comfort for extended listening sessions.",
  };

  // Check bidding eligibility
  const eligibleForBidding = isProductEligible(product.category, product.price);
  const { freeBidsRemaining, spendLevel, isLoading: biddingLoading } = biddingData;
  
  // Determine button text based on user status
  const getBidButtonText = () => {
    if (!user) {
      return "🎯 Bid Your Price - Login Required";
    }
    if (freeBidsRemaining > 0) {
      return `🎯 Bid Your Price - ${freeBidsRemaining} Free Bid${freeBidsRemaining > 1 ? 's' : ''} Available`;
    }
    if (spendLevel >= 1) {
      return "🎯 Bid Your Price";
    }
    return "🎯 Bid Your Price - Unlock with ₹3K Spend";
  };

  // Get smart recommendations
  const frequentlyBought = getFrequentlyBoughtTogether(product.id, products) || [];
  const youMayLike = getSmartRecommendations(product.id, product.category, products) || [];

  const handleBidAccepted = (bidPrice: number) => {
    toast.success(`🎉 Bid accepted at ₹${bidPrice.toLocaleString()}! Proceeding to checkout...`);
    // TODO: Navigate to checkout with bid price
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
              <img
                src={product.images ? product.images[selectedImage] : product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(product.images || [product.image]).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={img}
                    alt={`View ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <CategoryBadge categoryId={product.category} />
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm">Brand: <span className="font-semibold text-primary">{product.brand}</span></span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-discount-green text-white px-3 py-1 rounded">
                  <span className="font-semibold">{product.rating}</span>
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <span className="text-muted-foreground">
                  {product.reviews.toLocaleString()} Reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold">₹{product.price.toLocaleString()}</span>
                <span className="text-xl text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="text-xl font-semibold text-discount-green">
                  {product.discount}% off
                </span>
              </div>

              {/* Offers */}
              {product.offers && product.offers.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold">Available Offers</h3>
                  {product.offers.map((offer, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-discount-green font-semibold mt-0.5">•</span>
                      <span>{offer}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery */}
              <div className="flex items-center gap-2 mb-6 p-4 bg-muted rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Deliver to</p>
                  <p className="font-semibold">Mumbai 400001 - Tomorrow</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  disabled={!product.inStock}
                  onClick={async () => {
                    await addToCart(product);
                    console.log("[Analytics] add_to_cart", { product_id: product.id, product_name: product.name, price: product.price });
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button
                  size="lg"
                  className="flex-1 btn-primary font-semibold"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
              </div>

              {/* Reverse Bidding */}
              {eligibleForBidding && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold relative"
                  onClick={() => setBidModalOpen(true)}
                  disabled={biddingLoading}
                >
                  {!user && <Lock className="w-4 h-4 mr-2" />}
                  {getBidButtonText()}
                </Button>
              )}

              {/* Show why bidding is not available */}
              {!eligibleForBidding && product.price >= 1000 && (
                <div className="text-sm text-muted-foreground text-center p-3 bg-muted rounded-lg">
                  💡 Reverse Bidding is not available for {product.category} products
                </div>
              )}

              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart
                  className={`w-5 h-5 mr-2 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isWishlisted ? "Added to Wishlist" : "Add to Wishlist"}
              </Button>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Product Highlights</h3>
                <ul className="space-y-2">
                  {product.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-3">Product Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Frequently Bought Together */}
        {frequentlyBought && frequentlyBought.length > 0 && (
          <div className="mt-12">
            <FrequentlyBought mainProduct={product} recommendations={frequentlyBought} />
          </div>
        )}

        {/* You May Also Like */}
        {youMayLike && youMayLike.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {youMayLike.map((rec) => (
                <ProductCard
                  key={rec.id}
                  id={rec.id}
                  image={rec.image}
                  title={rec.name}
                  brand={rec.brand}
                  category={rec.category}
                  price={rec.price}
                  originalPrice={rec.originalPrice}
                  rating={rec.rating}
                  reviews={rec.reviews}
                  discount={rec.discount}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bid Modal */}
      <BidModal
        open={bidModalOpen}
        onOpenChange={setBidModalOpen}
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
          image: product.image,
        }}
        onBidAccepted={handleBidAccepted}
      />
    </div>
  );
};

export default ProductDetail;
