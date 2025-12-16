const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Health check (VERY IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.status(200).send("StayMatrix API running 🚀");
});

// 🚨 IMPORTANT: Railway PORT ONLY
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
