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
    required: true,
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
});

productSchema.pre("save", function () {
  const baseSlug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  this.slug = `${baseSlug}-${Date.now()}`;
});

const Product = model("product", productSchema);
export default Product;