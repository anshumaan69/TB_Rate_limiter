import express from "express";
import adminRoutes from "./routes/adminRoutes.js";
import checkRoutes from "./routes/checkRoutes.js";

const app = express();
app.use(express.json());

// Mount API routes
app.use("/admin/client", adminRoutes);
app.use("/check", checkRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", msg: "Rate limiter working" });
});

export default app;
