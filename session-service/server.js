const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const sessionRoutes = require("./routes/sessionRoutes");
const connectionRoutes = require("./routes/connectionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/sessions", sessionRoutes);
app.use("/connections", connectionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Session Service is running" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Session Service running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });