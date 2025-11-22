import { Product } from "@/data/mockProducts";

// Category-based recommendation rules
export const categoryRecommendations: Record<string, string[]> = {
  // Mobile accessories
  "mob-1": ["acc-5", "acc-1", "acc-2", "acc-3", "acc-4"],
  "mob-2": ["elec-2", "acc-1", "acc-2", "acc-3", "acc-4"],
  "mob-3": ["acc-5", "acc-1", "acc-2", "acc-3", "acc-4"],
  "mob-4": ["acc-5", "acc-1", "acc-2", "acc-3", "acc-4"],
  
  // Watch accessories
  "watch-1": ["wacc-1", "wacc-2"],
  "watch-2": ["wacc-1", "wacc-2"],
  "watch-3": ["wacc-1", "wacc-2"],
  "watch-4": ["wacc-1", "wacc-2"],
  "watch-5": ["wacc-1", "wacc-2"],
  
  // Laptop accessories
  "laptop-1": ["lacc-1", "lacc-2", "lacc-3"],
  "laptop-2": ["lacc-1", "lacc-2", "lacc-3"],
  "laptop-3": ["lacc-1", "lacc-2", "lacc-3"],
  
  // Headphone accessories (with mobiles)
  "elec-1": ["mob-1", "mob-2", "mob-3"],
  "elec-2": ["mob-2", "watch-2"],
  "elec-3": ["mob-3", "mob-1"],
};

// Get smart recommendations based on product category
export const getSmartRecommendations = (
  productId: string,
  category: string,
  allProducts: Product[]
): Product[] => {
  // First, check if we have predefined recommendations
  const predefinedIds = categoryRecommendations[productId];
  if (predefinedIds) {
    const recommended = allProducts.filter((p) => predefinedIds.includes(p.id));
    if (recommended.length > 0) {
      return recommended.slice(0, 6);
    }
  }

  // Category-based fallback recommendations
  const recommendations: Product[] = [];

  switch (category) {
    case "mobiles":
      // Recommend mobile accessories
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === "electronics" &&
            p.subcategory === "Accessories" &&
            (p.name.toLowerCase().includes("case") ||
              p.name.toLowerCase().includes("charger") ||
              p.name.toLowerCase().includes("earbuds") ||
              p.name.toLowerCase().includes("power bank") ||
              p.name.toLowerCase().includes("screen"))
        )
      );
      break;

    case "watches":
      // Recommend watch accessories
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === "electronics" &&
            p.subcategory === "Accessories" &&
            (p.name.toLowerCase().includes("strap") ||
              p.name.toLowerCase().includes("watch") ||
              p.name.toLowerCase().includes("screen protector"))
        )
      );
      break;

    case "laptops":
      // Recommend laptop accessories
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === "electronics" &&
            p.subcategory === "Accessories" &&
            (p.name.toLowerCase().includes("laptop") ||
              p.name.toLowerCase().includes("mouse") ||
              p.name.toLowerCase().includes("cooling") ||
              p.name.toLowerCase().includes("sleeve") ||
              p.name.toLowerCase().includes("bag"))
        )
      );
      break;

    case "electronics":
      // For headphones/electronics, recommend similar or complementary items
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === "electronics" &&
            p.id !== productId &&
            p.subcategory === "Headphones"
        )
      );
      break;

    default:
      // Generic recommendations from same category
      recommendations.push(
        ...allProducts.filter(
          (p) => p.category === category && p.id !== productId
        )
      );
  }

  // Remove duplicates and return top 6
  const unique = Array.from(new Set(recommendations.map((p) => p.id))).map(
    (id) => recommendations.find((p) => p.id === id)!
  );

  return unique.slice(0, 6);
};

// Get frequently bought together items (market basket analysis simulation)
export const getFrequentlyBoughtTogether = (
  productId: string,
  allProducts: Product[]
): Product[] => {
  const predefinedIds = categoryRecommendations[productId];
  if (predefinedIds) {
    return allProducts.filter((p) => predefinedIds.includes(p.id)).slice(0, 3);
  }
  return [];
};
