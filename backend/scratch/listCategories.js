import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

await mongoose.connect(process.env.MONGODB_URI);
const Category = mongoose.model("category", new mongoose.Schema({}, { strict: false }));

const categories = await Category.find({});
console.log(`Found ${categories.length} categories:`);
for (const c of categories) {
  console.log(`- ID: ${c._id}, Name: "${c.name}", Slug: "${c.slug}"`);
}

await mongoose.disconnect();
