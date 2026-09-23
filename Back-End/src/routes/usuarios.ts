const { Router } = require("express");
const controller = require("../controllers/usuarioController");

const router = Router();

router.get("/", controller.retrieveAll);
router.get("/:id", controller.retrieveOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
