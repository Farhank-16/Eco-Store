import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/categoryModel.js";
import Product from "./models/productModel.js";

dotenv.config();

const productsData = [
  // Hoodies
  {
    name: "Midnight Obsidian Stealth Hoodie",
    originalPrice: 4200,
    discountedPrice: 3500,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"],
    description: "Ultra-heavyweight 450 GSM organic loopback cotton hoodie. Double-lined hood with zero drawcords for a clean, structural street look. Pre-shrunk and garment dyed for an authentic lived-in feel.",
    collectionType: "midnight",
    gender: "unisex"
  },
  {
    name: "Cyberpunk Neon Oversized Hoodie",
    originalPrice: 4800,
    discountedPrice: 0,
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop"],
    description: "Futuristic oversized fit hoodie featuring reflective cyber-grid prints on sleeves and back. Thick ribbed cuffs and hem. Engineered drop shoulder profile.",
    collectionType: "urban",
    gender: "unisex"
  },
  // Cargo
  {
    name: "Urban Renegade Jogger Cargo",
    originalPrice: 3800,
    discountedPrice: 3200,
    images: ["https://images.unsplash.com/photo-1517462964-21fdcec3f25b?q=80&w=800&auto=format&fit=crop"],
    description: "Relaxed fit tactical cargo trousers constructed from heavy duty cotton ripstop. Features double-entry cargo pockets, custom logo web strapping, and adjustable toggle ankles.",
    collectionType: "urban",
    gender: "men"
  },
  {
    name: "Tactical Multi-Pocket Cargo Pants",
    originalPrice: 4500,
    discountedPrice: 0,
    images: ["https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=800&auto=format&fit=crop"],
    description: "Advanced utility cargo pants with 8 modular pockets. Built from reinforced poly-cotton blend water-resistant fabric. Relaxed taper profile.",
    collectionType: "midnight",
    gender: "unisex"
  },
  // Tees
  {
    name: "Acid Wash Heavyweight Tee",
    originalPrice: 2200,
    discountedPrice: 1800,
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop"],
    description: "Premium 280 GSM luxury cotton tee with individual hand-finished acid washing. Thick mock-neck ribbing and wide boxy fit.",
    collectionType: "future",
    gender: "unisex"
  },
  {
    name: "Future Retro Distressed Tee",
    originalPrice: 2400,
    discountedPrice: 0,
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop"],
    description: "Vintage distressed streetwear tee with cracked screen-print retro graphics. Drop shoulder fit with distressed micro-abrasions at neck and hem.",
    collectionType: "future",
    gender: "unisex"
  },
  {
    name: "Rebel Graffiti Women Cropped Tee",
    originalPrice: 1950,
    discountedPrice: 1500,
    images: ["https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop"],
    description: "Chic cropped boxy tee in dynamic street graffiti style. Soft combed cotton build with raw-cut distressed edge detail.",
    collectionType: "limited",
    gender: "women"
  },
  // Accessories
  {
    name: "Asymmetric Utility Tech Vest",
    originalPrice: 3500,
    discountedPrice: 2900,
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop"],
    description: "Modular chest vest with water-repellent zippers, metallic clip fasteners, and heavy adjustable web straps. Perfect layering accessory for modern cyberpunk aesthetic.",
    collectionType: "midnight",
    gender: "unisex"
  },
  {
    name: "Industrial Metal Buckle Belt",
    originalPrice: 1800,
    discountedPrice: 0,
    images: ["https://images.unsplash.com/photo-1624224971170-2f84fed5eb5e?q=80&w=800&auto=format&fit=crop"],
    description: "Heavy nylon webbing belt fitted with a quick-release aluminum cobra buckle. Features contrasting neon safety stitching and engraved brand markings.",
    collectionType: "urban",
    gender: "unisex"
  },
  // Shoes
  {
    name: "Rebel Combat Platform Boots",
    originalPrice: 8500,
    discountedPrice: 6900,
    images: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop"],
    description: "Full-grain tactical leather combat boots with thick platform lug soles. Side zip entry with industrial metal eyelets and reinforced steel toe cap.",
    collectionType: "limited",
    gender: "unisex"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Retrieve categories
    const categories = await Category.find();
    console.log(`Found ${categories.length} categories`);

    const findCategoryByTerm = (term) => {
      const cat = categories.find(c => c.name.toLowerCase().includes(term.toLowerCase()));
      if (!cat) {
        console.error(`Warning: Category matching '${term}' not found. Seeding may fail/mismatch.`);
        return null;
      }
      return cat._id;
    };

    // Clean current products
    console.log("Deleting old products...");
    await Product.deleteMany({});
    console.log("Deleted old products.");

    // Map and assign categories dynamically, and save one-by-one to trigger pre-save slug hooks
    let count = 0;
    for (const p of productsData) {
      let catTerm = "";
      if (p.name.toLowerCase().includes("hoodie")) {
        catTerm = "hoodies";
      } else if (p.name.toLowerCase().includes("cargo") || p.name.toLowerCase().includes("pants")) {
        catTerm = "cargo";
      } else if (p.name.toLowerCase().includes("tee")) {
        catTerm = "tees";
      } else if (p.name.toLowerCase().includes("vest") || p.name.toLowerCase().includes("belt")) {
        catTerm = "accessories";
      } else if (p.name.toLowerCase().includes("boots")) {
        catTerm = "shoes";
      } else {
        catTerm = "accessories"; // fallback
      }

      const categoryId = findCategoryByTerm(catTerm);
      const newProduct = new Product({
        ...p,
        category: categoryId
      });
      await newProduct.save();
      count++;
    }

    console.log(`Successfully seeded ${count} products!`);

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed();
