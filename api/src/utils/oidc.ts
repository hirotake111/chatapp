import { Client, ClientMetadata, Issuer } from "openid-client";
import { ConfigType } from "../server/config";

export const getIssuer = async (issuerUrl: string): Promise<Issuer<Client>> => {
  try {
    return await Issuer.discover(issuerUrl);
  } catch (e) {
    throw e;
  }
};

export const getOIDCClient = (
  issuer: Issuer<Client>,
  metadata: ClientMetadata
): Client => new issuer.Client(metadata);
