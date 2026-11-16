// Resolução local de imagens de produtos, complementando os dados recebidos pela API.
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import imgHotDog from "../components/imgs/HotDog.png";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import imgLanche from "../components/imgs/Lanche.png";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import imgBatata from "../components/imgs/batatafrita.png";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import imgRefri from "../components/imgs/RefriLata.png";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import imgSuco from "../components/imgs/Suco.png";
// Importa um componente reutilizável da interface; os símbolos trazidos são utilizados pelo módulo descrito no cabeçalho.
import imgPudim from "../components/imgs/Pudim.png";

/**
 * Mapeia o nome do produto para a imagem personalizada (PNG com fundo transparente)
 * da pasta src/components/imgs/. Quando não houver correspondência, retorna a
 * imagem informada no banco (produto.imagem) ou uma string vazia.
 */
const IMAGENS_LOCAIS: Record<string, string> = {
  "cachorro-quente": imgHotDog,
  "x-salada": imgLanche,
  "x-bacon": imgLanche,
  "batata frita": imgBatata,
  "refrigerante lata": imgRefri,
  "suco natural": imgSuco,
  pudim: imgPudim,
};

// Declara função resolverImagem, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
export function resolverImagem(
  nomeProduto: string,
  imagemBanco?: string | null,
): string {
  // Declara valor chave, que implementa ou representa uma parte deste módulo e é consumida pelo fluxo da interface/API descrito acima.
  const chave = nomeProduto.trim().toLowerCase();
  // Verifica a condição do fluxo para decidir se os dados e a navegação devem seguir por este ramo.
  if (chave in IMAGENS_LOCAIS) {
    // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
    return IMAGENS_LOCAIS[chave];
  }
  // Retorna o resultado/renderização desta etapa ao componente ou chamador que coordena o fluxo.
  return imagemBanco ?? "";
}
