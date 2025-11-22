import ProductCard from "./ProductCard";

interface Product {
  id: string;
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  discount?: number;
  offers?: string[];
}

interface ProductGridProps {
  title: string;
  products: Product[];
}

const ProductGrid = ({ title, products }: ProductGridProps) => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
