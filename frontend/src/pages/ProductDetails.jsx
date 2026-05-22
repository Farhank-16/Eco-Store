import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingBag,
  ShoppingCart,
  Loader2,
  Star,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `import.meta.env.VITE_BASE_URL/product/get/${slug}`,
        );
        setProduct(res.data.product);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAction = () => {
    if (!user) {
      navigate("/login");
    } else {
      addToCart(product);
      toast.success("Added to cart!");
      navigate("/cart");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-indigo-600 font-medium hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-8 transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Store
      </button>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-12">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-2">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wider uppercase">
              {product.category?.name || "General"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-amber-400">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current text-slate-200" />
            </div>
            <span className="text-sm text-slate-500">(128 reviews)</span>
          </div>

          <div className="mb-8">
            {product.discountedPrice &&
            product.discountedPrice < product.originalPrice ? (
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₹{product.discountedPrice}
                </span>
                <span className="text-xl text-slate-400 line-through mb-1">
                  ₹{product.originalPrice}
                </span>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg mb-1">
                  Save ₹{product.originalPrice - product.discountedPrice}
                </span>
              </div>
            ) : (
              <span className="text-4xl font-extrabold text-slate-900">
                ₹{product.originalPrice || "0.00"}
              </span>
            )}
            <p className="text-sm text-slate-500 mt-2">
              Taxes included. Free shipping on orders over ₹500.
            </p>
          </div>

          <div className="prose prose-slate mb-10">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Description
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {product.description ||
                "No description available for this product."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-slate-100 pt-8">
            <button
              onClick={handleAction}
              className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleAction}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-semibold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Buy Now
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 text-slate-600">
              <Truck className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-medium">1 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
