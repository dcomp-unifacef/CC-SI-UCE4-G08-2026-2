// Router de usuários, incluindo o ponto de entrada público para autenticação.
import { Router } from "express";
// Controller fornece operações CRUD de usuário.
import * as controller from "../controllers/usuarioController";
// Login é separado do CRUD para permanecer acessível antes de autenticar.
import * as authController from "../controllers/authController";
// Middleware protege as operações seguintes e aplica controle por perfil.
import { autenticar, autorizar } from "../middlewares/auth";
// Perfis reutiliza nomes definidos no domínio para a política das rotas.
import { PERFIS } from "../domain/perfis";

// Router registrado em app.ts sob /usuarios.
const router = Router();

// Rota pública que valida credenciais e retorna JWT.
router.post("/login", authController.login);

// A partir daqui, operações exigem token verificado.
router.use(autenticar);

// Consultas podem ser realizadas por equipe de atendimento e gerência.
router.get("/", autorizar(PERFIS.GARCOM, PERFIS.GERENTE), controller.retrieveAll);
router.get("/:id", autorizar(PERFIS.GARCOM, PERFIS.GERENTE), controller.retrieveOne);
// Cadastro, edição e desativação administrativa ficam restritos ao gerente.
router.post("/", autorizar(PERFIS.GERENTE), controller.create);
router.put("/:id", autorizar(PERFIS.GERENTE), controller.update);
router.delete("/:id", autorizar(PERFIS.GERENTE), controller.remove);

// Exporta as rotas para o app.
export default router;
