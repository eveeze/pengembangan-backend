import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// import routes
import userRoutes from "./routes/authRoutes.js";
import productTypeRoutes from "./routes/productTypeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import sizeRoutes from "./routes/sizeRoutes.js";
import productSizeRoutes from "./routes/sizeRoutes.js";
import productRoutes from "./routes/sizeRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/size", sizeRoutes);
app.use("/api/product-size", productSizeRoutes)
app.use("/api/product", productRoutes);

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("WELCOME TO APL SHOES SMARTSTOCK");
});

app.listen(PORT, () => {
  console.log(`server sedang berjalan di port ${PORT}`);
});

export default app;
