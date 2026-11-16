// Router organiza endpoints HTTP de notificação de pagamento.
import { Router } from "express";
// Controllers fazem parsing/resposta e encaminham operações aos services de notificação.
import * as controller from "../controllers/notificacaoPagamentoController";
// Autenticação identifica usuário e autorização restringe cada operação por perfil.
import { autenticar, autorizar } from "../middlewares/auth";
// Perfis centraliza os nomes usados nas regras de acesso.
import { PERFIS } from "../domain/perfis";

// Instância montada por app.ts no prefixo /notificacoes.
const router = Router();

// Todas as operações abaixo exigem token válido antes do controller.
router.use(autenticar);

// Cliente solicita pagamento (cria notificação)
// Cria solicitação de pagamento para os perfis que podem iniciar atendimento.
router.post(
  "/",
  autorizar(PERFIS.CLIENTE, PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.criar,
);

// Garçom lista notificações pendentes
// Lista solicitações pendentes para equipe de atendimento e gestão.
router.get(
  "/pendentes",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.listarPendentes,
);

// Contador de não lidas para o sino
// Alimenta o contador de notificações ainda não lidas no cliente.
router.get(
  "/contar-nao-lidas",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.contarNaoLidas,
);

// Garçom marca como atendida (levou a maquininha)
// Registra que a equipe atendeu a solicitação e levou o meio de pagamento.
router.patch(
  "/:id/atender",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.marcarComoAtendida,
);

// Marca como lida (remove do sino/contador)
// Marca a notificação como lida para removê-la do contador.
router.patch(
  "/:id/lida",
  autorizar(PERFIS.GARCOM, PERFIS.GERENTE, PERFIS.ADMINISTRADOR),
  controller.marcarComoLida,
);

// Exporta o router para composição na aplicação Express.
export default router;
