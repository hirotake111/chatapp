import dotenv from "dotenv";
import { ClientMetadata } from "openid-client";
dotenv.config();

export const PORT = parseInt(process.env.PORT || "3000", 10);
export const HOSTNAME = process.env.HOSTNAME || "localhost";
export const ISSUER = process.env.ISSUER || "https://example.com";
export const SECRETKEY = process.env.SECRETKEY || "sssshhhiiiii";
export const PROD = process.env.NODE_ENV === "production";
export const CALLBACKURL =
  process.env.CALLBACKURL || "http://localhost:3000/callback";
export const FRONTENDURL = process.env.FRONTENDURL || "http://localhost:3000";
export const OAUTH_CLIENTMETADATA: ClientMetadata = {
  client_id: process.env.OAUTH_CLIENTID || "myid",
  client_secret: process.env.OAUTH_CLIENTSECRET || "mypass",
  redirect_uris: [CALLBACKURL],
  response_types: ["code"],
};
