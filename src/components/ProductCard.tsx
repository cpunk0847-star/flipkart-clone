import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CategoryBadge from "./CategoryBadge";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  brand?: string;
  category?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: number;
  offers?: string[];
  inStock?: boolean;
}

const ProductCard = ({
  id,
  image,
  title,
  brand,
  category,
  price,
  originalPrice,
  rating,
  reviews,
  discount,
  offers,
  inStock = true,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingToCart(true);
    
    try {
      await addToCart({
        id,
        name: title,
        brand: brand || "",
        category: category || "",
        image,
        price,
        originalPrice: originalPrice || price,
        rating,
        reviews,
        discount: discount || 0,
        inStock,
        seller: brand || "Official Store",
      });
      
      console.log("[Analytics] add_to_cart", { product_id: id, product_name: title, price });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${id}`)}
      className="product-card p-4 cursor-pointer relative group"
    >
      {/* Wishlist button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 p-2 bg-card rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Heart
          className={`w-5 h-5 ${
            isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Product image */}
      <div className="aspect-square mb-3 overflow-hidden rounded-sm bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product info */}
      <div className="space-y-2">
        {/* Category Badge */}
        {category && (
          <CategoryBadge categoryId={category} />
        )}
        
        <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
          {title}
        </h3>
        {brand && (
          <p className="text-xs text-muted-foreground font-medium">{brand}</p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-discount-green text-white px-2 py-0.5 rounded text-xs font-semibold">
            <span>{rating}</span>
            <Star className="w-3 h-3 fill-white" />
          </div>
          <span className="text-xs text-muted-foreground">
            ({reviews.toLocaleString()})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="price-tag">₹{price.toLocaleString()}</span>
          {originalPrice && (
            <>
              <span className="price-original">₹{originalPrice.toLocaleString()}</span>
              {discount && (
                <span className="discount-badge">{discount}% off</span>
              )}
            </>
          )}
        </div>

        {/* Offers */}
        {offers && offers.length > 0 && (
          <p className="text-xs text-discount-green font-semibold">
            {offers[0]}
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          className="flex-1 btn-primary gap-2"
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
        >
          {!inStock ? (
            "Out of Stock"
          ) : addingToCart ? (
            "Adding..."
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
