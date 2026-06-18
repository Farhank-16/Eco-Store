import express from 'express';
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/authRoutes.js";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";

const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  })
);


app.use(express.json());
app.use(cookieParser());

//health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running properly",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});


app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/auth", userRoutes);
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);
app.use("/coupon", couponRoutes);
app.use("/collection", collectionRoutes);

export default app;