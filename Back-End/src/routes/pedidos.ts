import { Router } from "express";
import * as controller from "../controllers/pedidoController";
import {
  authenticate,
  authorizeAdmin,
  authorizeStaff,
} from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, controller.retrieveAll);
router.get("/:id", authenticate, controller.retrieveOne);
router.post("/", authenticate, controller.create);
router.put("/:id", authenticate, authorizeStaff, controller.update);
router.delete("/:id", authenticate, authorizeAdmin, controller.remove);

router.post("/:id/itens", authenticate, controller.addItem);
router.put("/:id/itens/:idItem", authenticate, controller.updateItem);
router.delete("/:id/itens/:idItem", authenticate, controller.removeItem);

export default router;
