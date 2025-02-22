import { config } from "./config";
import express from "express";
import cors from "cors";
import path from "path";
import feedbackRoutes from "./api/feedbackRoutes";
import helmet from "helmet";
import compression from "compression";

const app = express();
const PORT = config.port;

const corsOptions = {
  origin: ["http://localhost:3000", "https://your-production-domain.com"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));

// Increase JSON payload limit to 1mb to resolve HTTP 413 errors.
app.use(
  express.json({
    limit: "1mb",
  })
);
app.use(express.urlencoded({ extended: true }));

// Serve static files from the ../public directory relative to the compiled code.
const publicPath = path.join(__dirname, "../public");
app.use(
  express.static(publicPath, {
    maxAge: "1d",
    etag: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

app.use("/api/feedback", feedbackRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Serve index.html for the root path
app.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Global error handler.
app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler.
app.use((_req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist",
    timestamp: new Date().toISOString(),
  });
});

// Only start the server if this file is run directly (e.g. locally).
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`
      🚀 Server running
      - Port: ${PORT}
      - Environment: ${process.env.NODE_ENV || "development"}
      - Timestamp: ${new Date().toISOString()}
    `);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully");
    server.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });
  });
}

export default app;