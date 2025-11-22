import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryStrip from "@/components/CategoryStrip";
import ProductGrid from "@/components/ProductGrid";
import { products } from "@/data/mockProducts";

// Get product data organized by category
const mobileProducts = products.filter(p => p.category === "mobiles").slice(0, 10).map(p => ({
  id: p.id,
  image: p.image,
  title: `${p.brand} ${p.name}`,
  price: p.price,
  originalPrice: p.originalPrice,
  rating: p.rating,
  reviews: p.reviews,
  discount: p.discount,
  offers: p.offers,
}));

const watchProducts = products.filter(p => p.category === "watches").map(p => ({
  id: p.id,
  image: p.image,
  title: `${p.brand} ${p.name}`,
  price: p.price,
  originalPrice: p.originalPrice,
  rating: p.rating,
  reviews: p.reviews,
  discount: p.discount,
  offers: p.offers,
}));

const electronicsProducts = products.filter(p => p.category === "electronics").slice(0, 10).map(p => ({
  id: p.id,
  image: p.image,
  title: `${p.brand} ${p.name}`,
  price: p.price,
  originalPrice: p.originalPrice,
  rating: p.rating,
  reviews: p.reviews,
  discount: p.discount,
  offers: p.offers,
}));

// Legacy sample data for backwards compatibility
const featuredProducts = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    title: "Premium Wireless Headphones with Active Noise Cancellation",
    price: 4999,
    originalPrice: 9999,
    rating: 4.5,
    reviews: 12450,
    discount: 50,
    offers: ["Bank Offer: 10% instant discount on SBI Cards"],
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    title: "Classic Analog Watch for Men - Premium Collection",
    price: 2499,
    originalPrice: 5999,
    rating: 4.3,
    reviews: 8920,
    discount: 58,
    offers: ["Special Price: Limited time offer"],
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    title: "Designer Sunglasses UV Protection - Unisex",
    price: 1299,
    originalPrice: 2999,
    rating: 4.6,
    reviews: 5620,
    discount: 57,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop",
    title: "Professional Backpack - Laptop Compatible 15.6 inch",
    price: 1899,
    originalPrice: 3999,
    rating: 4.4,
    reviews: 10230,
    discount: 53,
    offers: ["Free Delivery"],
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop",
    title: "Smart Fitness Band - Heart Rate Monitor",
    price: 2999,
    originalPrice: 6999,
    rating: 4.2,
    reviews: 7850,
    discount: 57,
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
    title: "Casual Sneakers for Men - Comfortable & Stylish",
    price: 1799,
    originalPrice: 3499,
    rating: 4.5,
    reviews: 9340,
    discount: 49,
  },
  {
    id: "7",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop",
    title: "Premium Smart Watch - AMOLED Display",
    price: 8999,
    originalPrice: 14999,
    rating: 4.6,
    reviews: 4520,
    discount: 40,
    offers: ["Exchange Offer: Up to ₹5000 off"],
  },
  {
    id: "8",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
    title: "Wireless Mouse - Ergonomic Design for Office & Gaming",
    price: 799,
    originalPrice: 1999,
    rating: 4.3,
    reviews: 15670,
    discount: 60,
  },
  {
    id: "9",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
    title: "Running Shoes - Lightweight & Breathable",
    price: 2499,
    originalPrice: 4999,
    rating: 4.4,
    reviews: 6780,
    discount: 50,
  },
  {
    id: "10",
    image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400&h=400&fit=crop",
    title: "Leather Wallet for Men - RFID Protection",
    price: 599,
    originalPrice: 1499,
    rating: 4.5,
    reviews: 11230,
    discount: 60,
  },
];

const trendingProducts = [
  {
    id: "11",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    title: "Sports Running Shoes - Premium Quality",
    price: 3499,
    originalPrice: 6999,
    rating: 4.6,
    reviews: 8920,
    discount: 50,
  },
  {
    id: "12",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
    title: "Casual Canvas Shoes for Daily Wear",
    price: 1299,
    originalPrice: 2499,
    rating: 4.3,
    reviews: 5430,
    discount: 48,
  },
  {
    id: "13",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop",
    title: "Luxury Formal Shoes - Genuine Leather",
    price: 4999,
    originalPrice: 9999,
    rating: 4.7,
    reviews: 3210,
    discount: 50,
  },
  {
    id: "14",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
    title: "Athletic Training Shoes - High Performance",
    price: 2999,
    originalPrice: 5999,
    rating: 4.5,
    reviews: 7650,
    discount: 50,
  },
  {
    id: "15",
    image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=400&fit=crop",
    title: "Trendy Sneakers - Limited Edition",
    price: 3999,
    originalPrice: 7999,
    rating: 4.4,
    reviews: 4820,
    discount: 50,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryStrip />
      
      <div className="container mx-auto px-4 py-6">
        <HeroCarousel />
      </div>

      <ProductGrid title="Best Deals on Mobiles" products={mobileProducts} />
      <ProductGrid title="Trending Watches" products={watchProducts} />
      <ProductGrid title="Electronics & Accessories" products={electronicsProducts} />
      
      <footer className="bg-card border-t border-border mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">About Us</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Help</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Payments</a></li>
                <li><a href="#" className="hover:text-primary">Shipping</a></li>
                <li><a href="#" className="hover:text-primary">Returns</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Policy</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Return Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms Of Use</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Social</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Facebook</a></li>
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2024 Easyship. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
