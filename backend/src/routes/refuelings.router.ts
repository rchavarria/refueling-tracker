import { Router } from "express";
import {
  deleteRefueling,
  getRefueling,
  listRefuelings,
  updateRefueling,
} from "../controllers/refuelings.controller.js";

const router = Router();

router.get("/", listRefuelings);
router.get("/:id", getRefueling);
router.put("/:id", updateRefueling);
router.delete("/:id", deleteRefueling);

export default router;
