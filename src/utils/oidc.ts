import { Client, ClientMetadata, Issuer } from "openid-client";

export const getIssuer = async (URL: string): Promise<Issuer<Client>> => {
  try {
    return await Issuer.discover(URL);
  } catch (e) {
    throw e;
  }
};

export const getOIDCClient = (
  issuer: Issuer<Client>,
  metadata: ClientMetadata
): Client => new issuer.Client(metadata);
