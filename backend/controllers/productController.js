import { Types } from "mongoose";
import Product from "../models/productModel.js";

export const getProducts = async (req, res) => {
  try {
    const allProducts = await Product.find().populate("category", "name slug");
    res.status(200).json({ products: allProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const product = await Product.findOne(query).populate("category", "name slug");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {

    const productData = {
      ...req.body,

      image: req.file?.path,
    };

    const newProduct = new Product(productData);

    await newProduct.save();

    res.status(201).json({
      message: "Product Saved",
      product: newProduct,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
export const updateProduct = async (req, res) => {
  try {


    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    Object.assign(product, req.body);

    await product.save();

    res.status(200).json({
      message: "Product updated",
      product,
    });

  } catch (error) {


    res.status(400).json({
      success: false,
      message: error.errors?.discountedPrice?.message || error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted", product: deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};