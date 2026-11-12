import { Router } from "express";
import * as controller from "../controllers/notificacaoPagamentoController";
import { autenticar, autorizar } from "../middlewares/auth";
import { PERFIS } from "../domain/perfis";

const router = Router();

router.use(autenticar);

// Cliente solicita pagamento (cria notificação)
router.post(
  "/",
  autorizar(PERFIS.CLIENTE, PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.criar,
);

// Garçom lista notificações pendentes
router.get(
  "/pendentes",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.listarPendentes,
);

// Contador de não lidas para o sino
router.get(
  "/contar-nao-lidas",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.contarNaoLidas,
);

// Garçom marca como atendida (levou a maquininha)
router.patch(
  "/:id/atender",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.marcarComoAtendida,
);

// Marca como lida (remove do sino/contador)
router.patch(
  "/:id/lida",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.marcarComoLida,
);

export default router;
