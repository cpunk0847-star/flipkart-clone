import { Heart, User, Search, MapPin, Menu, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MiniCart from "./MiniCart";
import BudgetControl from "./BudgetControl";
import VisualSearchButton from "./VisualSearchButton";
import easyshipLogo from "@/assets/easyship-logo.jpg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
            className="cursor-pointer flex items-center"
          >
            <img 
              src={easyshipLogo} 
              alt="Easyship" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl hidden md:flex gap-2">
            <form onSubmit={handleSearch} className="flex-1">
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
            <VisualSearchButton />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <BudgetControl />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex items-center gap-2"
                  >
                    <UserCircle className="w-5 h-5" />
                    <span className="max-w-24 truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden md:flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/wishlist")}
              className="relative hidden md:flex"
            >
              <Heart className="w-5 h-5" />
            </Button>

            <MiniCart />
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
