import { Product } from "@/data/mockProducts";

// Simulated transaction data for Market Basket Analysis
// In production, this would come from real order history
const transactionHistory = [
  // Mobile + Accessories transactions
  ["mob-1", "acc-1", "acc-5", "acc-2"],
  ["mob-1", "acc-5", "acc-3"],
  ["mob-2", "elec-2", "acc-1"],
  ["mob-2", "acc-5", "acc-2", "acc-4"],
  ["mob-3", "acc-5", "acc-1", "acc-3"],
  ["mob-3", "acc-5", "acc-2"],
  ["mob-4", "acc-5", "acc-1", "acc-4"],
  
  // Watch + Accessories transactions
  ["watch-1", "wacc-1", "wacc-2"],
  ["watch-2", "wacc-1", "elec-2"],
  ["watch-2", "wacc-2", "wacc-1"],
  ["watch-3", "wacc-1"],
  ["watch-4", "wacc-1", "wacc-2"],
  ["watch-5", "wacc-2", "wacc-1"],
  
  // Laptop + Accessories transactions
  ["laptop-1", "lacc-2", "lacc-1"],
  ["laptop-1", "lacc-2", "lacc-3"],
  ["laptop-2", "lacc-1", "lacc-2", "lacc-3"],
  ["laptop-2", "lacc-2", "lacc-3"],
  ["laptop-3", "lacc-2", "lacc-3", "lacc-1"],
  
  // Headphones + Mobile transactions
  ["elec-1", "mob-1", "acc-5"],
  ["elec-1", "mob-2", "mob-3"],
  ["elec-2", "mob-2", "watch-2"],
  ["elec-3", "mob-3", "mob-1", "acc-5"],
  
  // Additional realistic patterns
  ["mob-1", "acc-2", "acc-4"],
  ["mob-2", "acc-1", "acc-3", "acc-5"],
  ["laptop-1", "lacc-2"],
  ["watch-1", "wacc-1"],
  ["elec-1", "acc-5"],
];

// Association rules calculated from transaction data
// Format: { antecedent: [consequents with support, confidence, lift] }
interface AssociationRule {
  product: string;
  support: number;
  confidence: number;
  lift: number;
}

// Calculate Market Basket Analysis rules
export const calculateMBAScore = (
  productA: string,
  productB: string
): { support: number; confidence: number; lift: number } => {
  const totalTransactions = transactionHistory.length;
  
  // Count transactions containing each product
  const transWithA = transactionHistory.filter(t => t.includes(productA)).length;
  const transWithB = transactionHistory.filter(t => t.includes(productB)).length;
  const transWithBoth = transactionHistory.filter(
    t => t.includes(productA) && t.includes(productB)
  ).length;
  
  // Calculate metrics
  const support = transWithBoth / totalTransactions;
  const confidence = transWithA > 0 ? transWithBoth / transWithA : 0;
  const supportA = transWithA / totalTransactions;
  const supportB = transWithB / totalTransactions;
  const lift = supportA * supportB > 0 ? support / (supportA * supportB) : 0;
  
  return { support, confidence, lift };
};

// Get all products that frequently appear with the given product
export const getMBARecommendations = (
  productId: string,
  allProducts: Product[]
): Array<{ product: Product; score: number }> => {
  const recommendations: Array<{ product: Product; score: number }> = [];
  
  allProducts.forEach((product) => {
    if (product.id === productId) return;
    
    const { support, confidence, lift } = calculateMBAScore(productId, product.id);
    
    // Only recommend if lift > 1.5 (strong association) and confidence > 0.3
    if (lift > 1.5 && confidence > 0.3 && support > 0.05) {
      const score = lift * confidence * 100; // Combined score
      recommendations.push({ product, score });
    }
  });
  
  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score);
};

// Get smart recommendations based on MBA algorithm first, then category
export const getSmartRecommendations = (
  productId: string,
  category: string,
  allProducts: Product[]
): Product[] => {
  // First, try MBA recommendations
  const mbaRecs = getMBARecommendations(productId, allProducts);
  
  if (mbaRecs.length >= 6) {
    return mbaRecs.slice(0, 6).map((r) => r.product);
  }
  
  // Combine MBA with category-based recommendations
  const mbaProducts = mbaRecs.map((r) => r.product);
  const recommendations: Product[] = [...mbaProducts];

  // Add category-based recommendations to fill the gap
  switch (category) {
    case "mobiles":
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === "electronics" &&
            p.subcategory === "Accessories" &&
            !recommendations.some((r) => r.id === p.id) &&
            p.id !== productId &&
            (p.name.toLowerCase().includes("case") ||
              p.name.toLowerCase().includes("charger") ||
              p.name.toLowerCase().includes("earbuds") ||
              p.name.toLowerCase().includes("power bank") ||
              p.name.toLowerCase().includes("screen"))
        )
      );
      break;

    case "watches":
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === "electronics" &&
            p.subcategory === "Accessories" &&
            !recommendations.some((r) => r.id === p.id) &&
            p.id !== productId &&
            (p.name.toLowerCase().includes("strap") ||
              p.name.toLowerCase().includes("watch") ||
              p.name.toLowerCase().includes("screen protector"))
        )
      );
      break;

    case "laptops":
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === "electronics" &&
            p.subcategory === "Accessories" &&
            !recommendations.some((r) => r.id === p.id) &&
            p.id !== productId &&
            (p.name.toLowerCase().includes("laptop") ||
              p.name.toLowerCase().includes("mouse") ||
              p.name.toLowerCase().includes("cooling") ||
              p.name.toLowerCase().includes("sleeve") ||
              p.name.toLowerCase().includes("bag"))
        )
      );
      break;

    case "electronics":
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === "electronics" &&
            p.id !== productId &&
            !recommendations.some((r) => r.id === p.id) &&
            p.subcategory === "Headphones"
        )
      );
      break;

    default:
      recommendations.push(
        ...allProducts.filter(
          (p) =>
            p.category === category &&
            p.id !== productId &&
            !recommendations.some((r) => r.id === p.id)
        )
      );
  }

  // Remove duplicates and return top 6
  const unique = Array.from(new Set(recommendations.map((p) => p.id))).map(
    (id) => recommendations.find((p) => p.id === id)!
  );

  return unique.slice(0, 6);
};

// Get frequently bought together items using MBA algorithm
export const getFrequentlyBoughtTogether = (
  productId: string,
  allProducts: Product[]
): Product[] => {
  const mbaRecs = getMBARecommendations(productId, allProducts);
  
  // Return top 3 products with highest MBA scores
  return mbaRecs.slice(0, 3).map((r) => r.product);
};
