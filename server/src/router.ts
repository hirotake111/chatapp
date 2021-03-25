import { Router } from "express";
import { getRoot, getUserinfo } from "./controller";

export const router = Router();

router.get("/", getRoot);

router.get("/userinfo", getUserinfo);
