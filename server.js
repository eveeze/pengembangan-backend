import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// import routes
import userRoutes from "./routes/authRoutes.js";
import productTypeRoutes from "./routes/productTypeRoutes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/product-types", productTypeRoutes);

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("WELCOME TO APL SHOES SMARTSTOCK");
});

app.listen(PORT, () => {
  console.log(`server sedang berjalan di port ${PORT}`);
});

export default app;
