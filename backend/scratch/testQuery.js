import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

await mongoose.connect(process.env.MONGODB_URI);
import Product from "../models/productModel.js";

const categoriesParam = "6a3276d8731c4e99c70b6981";
const catList = categoriesParam.split(",").filter(Boolean);

const filterConditions = [];
if (catList.length > 0) {
  filterConditions.push({ category: { $in: catList } });
}

const finalQuery = filterConditions.length > 0 ? { $and: filterConditions } : {};
console.log("finalQuery:", JSON.stringify(finalQuery, null, 2));

const products = await Product.find(finalQuery).populate("category");
console.log(`Query returned ${products.length} products.`);
for (const p of products) {
  console.log(`- ${p.name} (Category: ${p.category ? p.category.name : "None"})`);
}

await mongoose.disconnect();
