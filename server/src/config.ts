import dotenv from "dotenv";
dotenv.config();

export const PORT = parseInt(process.env.PORT || "4000", 10);
export const HOSTNAME = process.env.HOSTNAME || "localhost";
export const ISSUER = process.env.ISSUER || "https://example.com";
export const SECRETKEY = process.env.SECRETKEY || "sssshhhiiiii";
export const PROD = process.env.NODE_ENV === "production";
export const CALLBACKURL =
  process.env.CALLBACKURL || "http://localhost:3000/callback";
