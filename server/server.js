const express = require("express");
const path = require("path");
const routes = require("./routes/routes");
const cors = require("cors");
const dotenv = require("dotenv");
const https = require("https");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');

dotenv.config();

const app = express();

//cors
app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], 
      connectSrc: ["'self'", "https://ethrhub.xyz:5000"], 
      scriptSrc: ["'self'", "https://trusted-scripts.com"], 
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
    },
  })
);

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

app.use(limiter);


// Middleware
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
app.use(morgan('combined'));
// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", routes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../client/dist");
  console.log(`Serving static files from: ${staticPath}`);
  
  // Serve all static files (including `index.html` and `assets/`)
  app.use(express.static(staticPath));

  // Serve `index.html` for all unmatched routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// Define port
const PORT = process.env.PORT || 5000;

// If in production, serve over HTTPS
if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode");
  try {
    const sslOptions = {
      key: fs.readFileSync("/etc/letsencrypt/live/ethrhub.xyz/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/ethrhub.xyz/cert.pem"),
    };

    // Create HTTPS server
    https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`Server running over HTTPS on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error loading SSL certificates: ", err);
    process.exit(1); // Exit the process on SSL certificate error
  }
} else {
  // In development, fallback to HTTP
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
