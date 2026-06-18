import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

await mongoose.connect(process.env.MONGODB_URI);
const Product = mongoose.model("product", new mongoose.Schema({}, { strict: false }));

const products = await Product.find({});
console.log(`Found ${products.length} products. Updating createdAt dates...`);

const now = new Date();
for (let i = 0; i < products.length; i++) {
  const p = products[i];
  // Set half the products to be "new" (e.g. 2 days ago) and half to be "old" (e.g. 10 days ago)
  const daysAgo = i % 2 === 0 ? 2 : 10;
  const createdAtDate = new Date();
  createdAtDate.setDate(now.getDate() - daysAgo);
  
  await Product.updateOne(
    { _id: p._id },
    { $set: { createdAt: createdAtDate, updatedAt: createdAtDate } }
  );
  console.log(`Updated "${p.name}" with createdAt: ${createdAtDate.toISOString()} (${daysAgo} days ago)`);
}

console.log("Product dates updated successfully.");
await mongoose.disconnect();
