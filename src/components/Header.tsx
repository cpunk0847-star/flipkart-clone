import { ShoppingCart, Heart, User, Search, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card shadow-md">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Deliver to Mumbai 400001</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button className="hover:underline">Become a Seller</button>
            <button className="hover:underline">Customer Support</button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile menu */}
          <button className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <div 
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center gap-2"
          >
            <h1 className="text-2xl font-bold text-primary">Easyship</h1>
            <span className="text-xs text-accent font-semibold italic">Express</span>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 h-11 bg-background border-none shadow-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="hidden md:flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              <span>Login</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/wishlist")}
              className="relative"
            >
              <Heart className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cart")}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                3
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 bg-background"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </header>
  );
};

export default Header;
