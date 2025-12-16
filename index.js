const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// 🔗 CONNECT ROUTES
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// TEST
app.get("/", (req, res) => {
  res.send("StayMatrix API running 🚀");
});

app.listen(process.env.PORT || 4210, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 4210}`);
});
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

