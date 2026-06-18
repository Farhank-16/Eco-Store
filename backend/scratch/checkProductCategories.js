import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

await mongoose.connect(process.env.MONGODB_URI);
const Product = mongoose.model("product", new mongoose.Schema({}, { strict: false }));
const Category = mongoose.model("category", new mongoose.Schema({}, { strict: false }));

const products = await Product.find({});
console.log(`Found ${products.length} products:`);
for (const p of products) {
  const cat = await Category.findById(p.category);
  console.log(`- Product: "${p.name}", Category ID: ${p.category}, Category Name: ${cat ? cat.name : "None"}`);
}

await mongoose.disconnect();
