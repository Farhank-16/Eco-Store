import { Schema, model, Types } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 10,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: [1, "Price must be at least 1"],
    max: [300000, "Price cannot exceed 300000"],
  },
  discountedPrice: {
    type: Number,
    default: 0,
    min: [0, "Discounted price must be at least 0"],
    max: [300000, "Discounted price cannot exceed 300000"],
    validate: {
      validator: function (v) {
        return v <= this.originalPrice;
      },
      message: "Discounted price cannot exceed original price",
    },
  },
  image: {
    type: String,
  },
  images: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
  },
  category: {
    type: Types.ObjectId,
    ref: "category",
    required: true,
  },
  collectionType: {
    type: String,
    default: "none",
  },
  gender: {
    type: String,
    enum: ["unisex", "men", "women"],
    default: "unisex",
  },
  rebelProfile: {
    type: String,
    default: "",
  },
  specifications: {
    type: [{
      title: { type: String, required: true },
      value: { type: String, required: true }
    }],
    default: [],
  },
  stock: {
    type: Number,
    default: 10,
    min: [0, "Stock cannot be negative"],
  },
}, { timestamps: true });

productSchema.pre("save", function (next) {
  const baseSlug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  this.slug = `${baseSlug}-${Date.now()}`;

  if (this.images && this.images.length > 0) {
    this.image = this.images[0];
  } else if (this.image) {
    this.images = [this.image];
  } else {
    return next(new Error("At least one product image is required"));
  }

  
});

const Product = model("product", productSchema);
export default Product;