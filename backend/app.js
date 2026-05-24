import express from 'express';
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/authRoutes.js";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();  
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
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


export default app;