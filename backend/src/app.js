const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const notesRoutes = require("./routes/notes.routes");
const aiRoutes = require("./routes/ai.routes");
const progressRoutes = require("./routes/progress.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/progress", progressRoutes);

app.use((_req, res) => res.status(404).json({ success: false, error: "Not found" }));
app.use(errorHandler);

module.exports = app;
