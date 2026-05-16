require("dotenv").config();

const REQUIRED = [
  "DATABASE_URL",
  "DIRECT_URL",
  "JWT_SECRET",
  "OPENAI_API_KEY",
  "FRONTEND_URL",
];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  FRONTEND_URL: process.env.FRONTEND_URL,
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
};

module.exports = env;
