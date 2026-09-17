import type { NextConfig } from "next";

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_HFj6NlAykKG9@ep-wild-sun-b5lsyx53-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
        ? process.env.DATABASE_URL.trim()
        : DEFAULT_DATABASE_URL,
    AUTH_SECRET:
      process.env.AUTH_SECRET && process.env.AUTH_SECRET.trim() !== ""
        ? process.env.AUTH_SECRET.trim()
        : "socialflow_super_secret_jwt_key_32_chars_min_length_2026",
    ENCRYPTION_KEY:
      process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.trim() !== ""
        ? process.env.ENCRYPTION_KEY.trim()
        : "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== ""
        ? process.env.NEXT_PUBLIC_APP_URL.trim()
        : "https://socialflow-zeta-one.vercel.app",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "itxsurajofficial@gmail.com",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Password123!",
    ADMIN_NAME: process.env.ADMIN_NAME || "Suraj Vishwakarma",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "dme6gzoic",
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "989274399297756",
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "nKcYlw-kQH6IC1-ZGatGzAGaKSM",
    CLOUDINARY_URL:
      process.env.CLOUDINARY_URL ||
      "cloudinary://989274399297756:nKcYlw-kQH6IC1-ZGatGzAGaKSM@dme6gzoic",
    PINTEREST_APP_ID: process.env.PINTEREST_APP_ID || "",
    PINTEREST_APP_SECRET: process.env.PINTEREST_APP_SECRET || "",
  },
};

export default nextConfig;

