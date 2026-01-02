const ac = require("@antiadmin/anticaptchaofficial");
const crypto = require("crypto");

// --- 1. GLOBAL CONFIG (Runs once on Cold Start) ---

// Constants
const MAX_EXECUTION_TIME_MS = 9000; // 9s (Safe buffer for Vercel Hobby 10s limit)
const DECOY_HEADER_NAME = "x-ga-measurement-id";

// Environment check (Fail fast if config is missing)
const API_KEY = process.env.ANTICAPTCHA_KEY;
const SERVER_SECRET = process.env.PROXY_SECRET;

if (!API_KEY) {
  console.error("CRITICAL: ANTICAPTCHA_KEY is not set.");
}

// Optimization: Set key once per container lifecycle
if (API_KEY) ac.setAPIKey(API_KEY);

/**
 * Helper: Constant-time string comparison to prevent timing attacks.
 * Returns true if strings match, false otherwise.
 */
function safeCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual requires buffers of equal length
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Helper: Strips "data:image/xyz;base64," prefix if present.
 */
function cleanBase64(input) {
  if (input.includes(",")) {
    return input.split(",")[1];
  }
  return input;
}

// --- 2. REQUEST HANDLER ---

module.exports = async (req, res) => {
  // A. CORS CONFIGURATION
  const origin = req.headers.origin || "*";

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    `Content-Type, ${DECOY_HEADER_NAME}` // Allow our decoy header
  );

  // B. PRE-FLIGHT CHECK (Return early)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // C. SECURITY: DECOY HEADER CHECK
  // If PROXY_SECRET is set, we strictly enforce it.
  if (SERVER_SECRET) {
    const clientToken = req.headers[DECOY_HEADER_NAME];

    // Use constant-time comparison
    if (!safeCompare(clientToken, SERVER_SECRET)) {
      // Return 404 to avoid leaking that this is a secured endpoint
      return res.status(404).json({
        success: false,
        error: "Resource not found",
      });
    }
  }

  // D. INPUT VALIDATION
  if (!API_KEY) {
    return res
      .status(500)
      .json({ success: false, error: "Server configuration error" });
  }

  if (
    !req.body ||
    !req.body.imageBase64 ||
    typeof req.body.imageBase64 !== "string"
  ) {
    return res.status(400).json({
      success: false,
      error: "Missing or invalid 'imageBase64' string",
    });
  }

  // Sanitize input (remove data URI prefix if present)
  const finalImageString = cleanBase64(req.body.imageBase64);

  // E. EXECUTION WITH TIMEOUT
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("TIMEOUT_LIMIT_REACHED")),
        MAX_EXECUTION_TIME_MS
      )
    );

    // We attach a .catch to the solver so if it finishes AFTER we timed out,
    // it doesn't crash the process with UnhandledRejection
    const solverPromise = ac.solveImage(finalImageString, true).catch((err) => {
      // If we already timed out, this error is irrelevant, but we log it for debug
      if (err.message !== "TIMEOUT_LIMIT_REACHED") {
        // specific logic to ignore cancellation errors could go here
      }
      throw err;
    });

    const text = await Promise.race([solverPromise, timeoutPromise]);

    return res.status(200).json({ success: true, solution: text });
  } catch (error) {
    // 1. Handle Timeout
    if (error.message === "TIMEOUT_LIMIT_REACHED") {
      console.warn("Request timed out waiting for CAPTCHA provider.");
      return res.status(504).json({
        success: false,
        error: "Provider timed out. Please try again.",
      });
    }

    // 2. Handle Library/Logic Errors
    console.error("Solver Execution Error:", error);

    // Security: Don't send raw error.message to client unless it's a known safe error
    return res.status(500).json({
      success: false,
      error: "Failed to solve CAPTCHA.",
    });
  }
};
