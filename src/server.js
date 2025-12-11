import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // app will run on port 4000 if PORT is not defined in environment variables.

///this part for midlleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//for API routes

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes); // ADD THIS!
app.use("/api/registration", registrationRoutes); // FIXED!
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/categories", categoryRoutes); // user management routes


//health check route 
app.get("/health", (req, res) => {
  res.json({status : "ok", message: "Iraklas made server is fine."});

});

// 404 

app.use((req, res, next) => {
  res.status(404).json({message: "Route Kaput"})
});

app.use(errorHandler);

// and listen on port 

app.listen(PORT, () => {
  console.log("Online event registartion API working");
  console.log(`http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
});
