import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", msg: "Rate limiter working" });
});

export default app;
