import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);
const Product = mongoose.model("product", new mongoose.Schema({}, { strict: false }));
const products = await Product.find({}).limit(3);
console.log(JSON.stringify(products, null, 2));
await mongoose.disconnect();
