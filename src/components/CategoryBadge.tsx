import { Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categories } from "@/data/mockProducts";

interface CategoryBadgeProps {
  categoryId: string;
  className?: string;
}

const CategoryBadge = ({ categoryId, className = "" }: CategoryBadgeProps) => {
  const navigate = useNavigate();
  const categoryName = categories[categoryId as keyof typeof categories]?.name || categoryId;

  return (
    <button
      onClick={() => navigate(`/category/${categoryId}`)}
      className={`inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors ${className}`}
    >
      <Tag className="w-3 h-3" />
      {categoryName}
    </button>
  );
};

export default CategoryBadge;
