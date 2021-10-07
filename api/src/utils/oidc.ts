import { Client, ClientMetadata, Issuer } from "openid-client";
import { ConfigType } from "../server/config";

export const getIssuer = async (issuerUrl: string): Promise<Issuer<Client>> => {
  try {
    console.log(`discovering issuer ${issuerUrl}`);
    const client = await Issuer.discover(issuerUrl);
    console.log("successfully got Issuer");
    return client;
  } catch (e) {
    throw e;
  }
};

export const getOIDCClient = (
  issuer: Issuer<Client>,
  metadata: ClientMetadata
): Client => new issuer.Client(metadata);
