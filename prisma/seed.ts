// Carrega as credenciais e configurações declaradas no arquivo .env.
import "dotenv/config";
// Adaptador PostgreSQL usado pelo Prisma Client para abrir conexões com o banco.
import { PrismaPg } from "@prisma/adapter-pg";
// Cliente tipado que oferece acesso aos modelos de prisma/schema.prisma.
import { PrismaClient } from "@prisma/client";
// Função de hash usada para nunca persistir senhas de seed em texto puro.
import { hash } from "bcryptjs";

// Obtém a URL configurada pelo ambiente para conectar ao banco de dados.
const connectionString = process.env.DATABASE_URL;

// Interrompe o seed com erro explícito quando falta a configuração obrigatória.
if (!connectionString) {
  throw new Error("A variável DATABASE_URL não foi definida.");
}

// Inicializa o cliente Prisma com o adaptador de PostgreSQL e a URL validada.
const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

// Procura o perfil pelo nome e cria-o apenas quando ainda não existe.
async function garantirTipoUsuario(nome: string) {
  const existente = await prisma.tipoUsuario.findFirst({ where: { nome } });

  if (existente) {
    return existente;
  }

  return prisma.tipoUsuario.create({ data: { nome } });
}

// Cria ou atualiza um usuário pelo login para que execuções repetidas sejam seguras.
async function garantirUsuario(
  loginUsuario: string,
  nome: string,
  senha: string,
  idTipoUsuario: number,
) {
  return prisma.usuario.upsert({
    where: { loginUsuario },
    update: {
      nome,
      idTipoUsuario,
      statusUsuario: true,
    },
    create: {
      nome,
      loginUsuario,
      senha: await hash(senha, 8),
      statusUsuario: true,
      idTipoUsuario,
    },
  });
}

// Mantém os produtos de exemplo atualizados sem duplicá-los pelo nome.
async function garantirProduto(
  nome: string,
  preco: number,
  descricao: string,
  disponivel = true,
  imagem = "",
) {
  const existente = await prisma.produto.findFirst({ where: { nome } });

  if (existente) {
    return prisma.produto.update({
      where: { idProduto: existente.idProduto },
      data: { preco, descricao, disponivel, imagem },
    });
  }

  return prisma.produto.create({
    data: { nome, preco, descricao, disponivel, imagem },
  });
}

// Coordena a carga inicial de perfis, contas de acesso e produtos do catálogo.
async function main() {
  // Garante os quatro perfis que a aplicação usa para separar as telas e permissões.
  const tipoAdministrador = await garantirTipoUsuario("Administrador");
  const tipoGarcom = await garantirTipoUsuario("Garçom");
  const tipoCozinheiro = await garantirTipoUsuario("Cozinheiro");
  const tipoCliente = await garantirTipoUsuario("Cliente");

  // Cria ou atualiza contas de demonstração usando variáveis ou valores padrão.
  const admin = await garantirUsuario(
    process.env.SEED_ADMIN_LOGIN ?? "admin",
    process.env.SEED_ADMIN_NOME ?? "Administrador",
    process.env.SEED_ADMIN_SENHA ?? "admin123",
    tipoAdministrador.idTipoUsuario,
  );

  const cliente = await garantirUsuario(
    process.env.SEED_CLIENTE_LOGIN ?? "cliente",
    process.env.SEED_CLIENTE_NOME ?? "Cliente Exemplo",
    process.env.SEED_CLIENTE_SENHA ?? "cliente123",
    tipoCliente.idTipoUsuario,
  );

  const garcom = await garantirUsuario(
    process.env.SEED_GARCOM_LOGIN ?? "garcom",
    process.env.SEED_GARCOM_NOME ?? "Garçom Exemplo",
    process.env.SEED_GARCOM_SENHA ?? "garcom123",
    tipoGarcom.idTipoUsuario,
  );

  const cozinheiro = await garantirUsuario(
    process.env.SEED_COZINHEIRO_LOGIN ?? "cozinheiro",
    process.env.SEED_COZINHEIRO_NOME ?? "Cozinheiro Exemplo",
    process.env.SEED_COZINHEIRO_SENHA ?? "cozinheiro123",
    tipoCozinheiro.idTipoUsuario,
  );

  // Catálogo de demonstração consumido pela API de produtos e pela interface.
  const produtos = [
    {
      nome: "Cachorro-quente",
      preco: 12.5,
      descricao: "Pão, salsicha e molho especial",
      imagem: "/img/HotDog.png",
    },
    {
      nome: "X-Salada",
      preco: 18.9,
      descricao: "Pão, hambúrguer, queijo, alface e tomate",
      imagem: "/img/Lanche.png",
    },
    {
      nome: "Batata frita",
      preco: 9.9,
      descricao: "Porção individual de batata frita",
      imagem: "/img/batatafrita.png",
    },
    {
      nome: "Refrigerante lata",
      preco: 6,
      descricao: "Lata de 350 ml",
      imagem: "/img/RefriLata.png",
    },
    {
      nome: "X-Bacon",
      preco: 24.9,
      descricao: "Hambúrguer, queijo, bacon crocante, alface e tomate",
      imagem: "/img/Lanche.png",
    },
    {
      nome: "Suco natural",
      preco: 6.5,
      descricao: "Suco natural de laranja, 300 ml",
      imagem: "/img/Suco.png",
    },
    {
      nome: "Pudim",
      preco: 6.9,
      descricao: "Pudim de leite condensado com calda de caramelo",
      imagem: "/img/Pudim.png",
    },
  ];

  // Persiste cada produto por meio da função idempotente acima.
  for (const produto of produtos) {
    await garantirProduto(
      produto.nome,
      produto.preco,
      produto.descricao,
      true,
      produto.imagem,
    );
  }

  // Exibe os logins criados para facilitar a conferência da carga inicial.
  console.log(
    `Seed concluído. Admin: ${admin.loginUsuario}, cliente: ${cliente.loginUsuario}, garçom: ${garcom.loginUsuario}, cozinheiro: ${cozinheiro.loginUsuario}.`,
  );
}

// Executa a carga, registra falhas e sempre encerra a conexão com o banco.
main()
  .catch((error) => {
    // Mostra a causa da falha e sinaliza ao processo que a execução não foi bem-sucedida.
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Libera o pool de conexões independentemente do resultado do seed.
    await prisma.$disconnect();
  });
