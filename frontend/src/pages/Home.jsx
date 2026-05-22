import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useSearchStore } from "../store/useSearchStore";
import toast from "react-hot-toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { searchQuery } = useSearchStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "import.meta.env.VITE_BASE_URL/product/get",
        );
        setProducts(res.data.products);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAction = (e, product) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
    } else {
      addToCart(product);
      toast.success("Added to cart!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category?.name &&
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Trending Now
        </h1>
        <p className="text-slate-500 mt-2">
          Discover our latest collection of premium products
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-lg">
            No products found {searchQuery ? `matching "${searchQuery}"` : ""}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <Link
              to={`/product/${product.slug || product._id}`}
              key={product._id}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_rgb(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-slate-100"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wider">
                  {product.category?.name || "Uncategorized"}
                </div>
                <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    {product.discountedPrice &&
                    product.discountedPrice < product.originalPrice ? (
                      <>
                        <span className="text-lg font-bold text-slate-900">
                          ₹{product.discountedPrice}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-slate-900">
                        ₹{product.originalPrice || "0.00"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAction(e, product)}
                    className="w-10 h-10 rounded-full bg-slate-50 text-slate-700 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
