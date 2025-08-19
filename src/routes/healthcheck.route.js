import { Router } from "express";
//If you are seggregetting the things then this syntax is required 


import { healthcheck } from "../controllers/healthcheck.controller.js";

const router = Router();

router.route("/").get(healthcheck);

export default router

