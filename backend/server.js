import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Route imports
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import authRouter from "./routes/authRoutes.js"; // OTP-based auth

// App config
const app = express();
const port = process.env.PORT || 4000;

// Connect to DB & Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - Content-Type: ${req.get("Content-Type")}`
  );
  next();
});

// API Endpoints
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/auth", authRouter); // For login and OTP verification

// Root test endpoint
app.get("/", (req, res) => {
  res.send("API Working");
});

// Start server
app.listen(port, () =>
  console.log(`🚀 Server started on PORT: ${port}`)
);
