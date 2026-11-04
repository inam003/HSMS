import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import residentRoutes from "./routes/residentRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import guardRoutes from "./routes/guardRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import patrolRoutes from "./routes/patrolRoutes.js";
import amenityRoutes from "./routes/amenityRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN?.split(",").map((origin) => origin.trim()) || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Health checks do not require a database connection.
app.get(["/api", "/api/health"], (req, res) => res.json({ message: "HSMS API is running..." }));

// Wait for MongoDB before handling API requests, including on a cold start.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({ message: "Database connection unavailable" });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/guards", guardRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/patrol", patrolRoutes);
app.use("/api/amenities", amenityRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "HSMS API is running..." }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch(() => {
    console.error("Unable to connect to MongoDB. Check MONGO_URI and database access.");
    process.exitCode = 1;
  });
}

export default app;
