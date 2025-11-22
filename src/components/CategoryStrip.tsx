import { Smartphone, Shirt, Home, Watch, Laptop, Headphones, Footprints, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  { id: "mobiles", name: "Mobiles", icon: Smartphone },
  { id: "watches", name: "Watches", icon: Watch },
  { id: "laptops", name: "Laptops", icon: Laptop },
  { id: "electronics", name: "Electronics", icon: Headphones },
  { id: "fashion", name: "Fashion", icon: Shirt },
  { id: "shoes", name: "Shoes", icon: Footprints },
  { id: "home", name: "Home", icon: Home },
  { id: "accessories", name: "More", icon: ShoppingBag },
];

const CategoryStrip = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border-y border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/category/${category.id}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium text-center">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryStrip;
