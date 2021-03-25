import express from "express";

import { URL, PORT } from "./config";
import { router } from "./router";

const app = express();

// use router
app.use(router);

app.listen(PORT, () => {
  console.log(`${URL}/userinfo`);
});
