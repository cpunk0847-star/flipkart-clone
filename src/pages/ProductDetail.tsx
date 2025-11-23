import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart, Zap, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getProductById, products } from "@/data/mockProducts";
import { getSmartRecommendations, getFrequentlyBoughtTogether } from "@/lib/recommendations";
import FrequentlyBought from "@/components/FrequentlyBought";
import ProductCard from "@/components/ProductCard";
import CategoryBadge from "@/components/CategoryBadge";
import { useCart } from "@/contexts/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidPrice, setBidPrice] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  const eligibleForBidding = product.price >= 1000;
  const freeBidCoupons = 2;

  // Get smart recommendations
  const frequentlyBought = getFrequentlyBoughtTogether(product.id, products) || [];
  const youMayLike = getSmartRecommendations(product.id, product.category, products) || [];

  const handleBidSubmit = async () => {
    if (!bidPrice || parseFloat(bidPrice) <= 0) {
      toast.error("Please enter a valid bid amount");
      return;
    }

    // Simulate API call
    const isAccepted = Math.random() > 0.5;
    
    if (isAccepted) {
      toast.success("🎉 Bid Accepted! Your personalized price is ₹" + bidPrice);
      setBidModalOpen(false);
    } else {
      toast.error("Bid not accepted. Try a slightly higher amount");
    }
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
                  onClick={() => {
                    addToCart(product);
                    toast.success(`Added ${product.name} to cart!`);
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
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
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                  onClick={() => setBidModalOpen(true)}
                >
                  🎯 Bid Your Price - {freeBidCoupons} Free Bids Available
                </Button>
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
      <Dialog open={bidModalOpen} onOpenChange={setBidModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Place Your Bid</DialogTitle>
            <DialogDescription>
              Name your price for <strong>{product.name}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>List Price:</span>
                <span className="line-through">₹{product.originalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Current Offer Price:</span>
                <span className="font-semibold">₹{product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-discount-green">
                <span>Free Bid Coupons:</span>
                <span className="font-semibold">{freeBidCoupons} available</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bidPrice">Your Bid Price (₹)</Label>
              <Input
                id="bidPrice"
                type="number"
                placeholder="Enter your price"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                💡 Our algorithm will accept or reject based on hidden thresholds
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setBidModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 btn-primary"
                onClick={handleBidSubmit}
              >
                Place Bid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
