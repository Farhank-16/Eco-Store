import { Types } from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

export const getProducts = async (req, res) => {
  try {
    const filterConditions = [];

    // Search query
    if (req.query.search) {
      filterConditions.push({ name: { $regex: req.query.search, $options: "i" } });
    }

    // Categories filter
    const categoriesParam = req.query.categories || req.query.category;
    if (categoriesParam) {
      const catList = categoriesParam.split(",").filter(Boolean);
      if (catList.length > 0) {
        const objectIds = [];
        const namesOrSlugs = [];
        catList.forEach(item => {
          if (Types.ObjectId.isValid(item)) {
            objectIds.push(item);
          } else {
            namesOrSlugs.push(item);
          }
        });

        if (namesOrSlugs.length > 0) {
          const matchedCats = await Category.find({
            $or: [
              { name: { $in: namesOrSlugs.map(n => new RegExp(`^${n}$`, "i")) } },
              { slug: { $in: namesOrSlugs.map(s => s.toLowerCase()) } }
            ]
          });
          matchedCats.forEach(c => objectIds.push(c._id));
        }

        if (objectIds.length > 0) {
          filterConditions.push({ category: { $in: objectIds } });
        } else {
          filterConditions.push({ category: new Types.ObjectId() });
        }
      }
    }

    // Collection filter
    const collectionParam = req.query.collectionType || req.query.collection;
    if (collectionParam) {
      filterConditions.push({ collectionType: collectionParam });
    }

    // Gender filter
    if (req.query.gender) {
      filterConditions.push({ gender: req.query.gender });
    }

    // New products filter (created in the last week)
    if (req.query.filter === "new" || req.query.newOnly === "true") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filterConditions.push({ createdAt: { $gte: oneWeekAgo } });
    }

    // Materials filter
    if (req.query.materials) {
      const matList = req.query.materials.split(",").filter(Boolean);
      if (matList.length > 0) {
        filterConditions.push({ material: { $in: matList } });
      }
    }

    // Eco-Rating filter
    if (req.query.ecoRating) {
      filterConditions.push({ ecoRating: { $gte: parseFloat(req.query.ecoRating) } });
    }

    // Price Range filter
    if (req.query.minPrice || req.query.maxPrice) {
      const min = parseFloat(req.query.minPrice || 0);
      const max = parseFloat(req.query.maxPrice || 9999999);

      filterConditions.push({
        $or: [
          {
            discountedPrice: { $gt: 0, $gte: min, $lte: max }
          },
          {
            $or: [{ discountedPrice: 0 }, { discountedPrice: { $exists: false } }],
            originalPrice: { $gte: min, $lte: max }
          }
        ]
      });
    }

    const finalQuery = filterConditions.length > 0 ? { $and: filterConditions } : {};

    // Sorting options
    let sortOption = { createdAt: -1 }; // default newest
    if (req.query.sort) {
      if (req.query.sort === "newest") {
        sortOption = { createdAt: -1 };
      } else if (req.query.sort === "price-asc") {
        sortOption = { originalPrice: 1 };
      } else if (req.query.sort === "price-desc") {
        sortOption = { originalPrice: -1 };
      } else if (req.query.sort === "rating-desc") {
        sortOption = { ecoRating: -1 };
      }
    }

    const allProducts = await Product.find(finalQuery).sort(sortOption).populate("category", "name slug");
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
    const images = req.files ? req.files.map((file) => file.path) : [];

    let specifications = [];
    if (req.body.specifications) {
      try {
        specifications = JSON.parse(req.body.specifications);
      } catch (e) {
        specifications = Array.isArray(req.body.specifications) ? req.body.specifications : [];
      }
    }

    const productData = {
      ...req.body,
      images,
      specifications,
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

    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
      }
    }

    const newImages = req.files ? req.files.map((file) => file.path) : [];

    // Only update images if existingImages was specified or new files were uploaded
    if (req.body.existingImages !== undefined || newImages.length > 0) {
      product.images = [...existingImages, ...newImages];
    }

    // Exclude existingImages from Object.assign to avoid overwriting it
    const { existingImages: _, ...updateData } = req.body;
    
    if (updateData.specifications) {
      try {
        updateData.specifications = JSON.parse(updateData.specifications);
      } catch (e) {
        updateData.specifications = Array.isArray(updateData.specifications) ? updateData.specifications : [];
      }
    }

    Object.assign(product, updateData);

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