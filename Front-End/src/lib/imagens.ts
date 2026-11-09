import imgHotDog from "../components/imgs/HotDog.png";
import imgLanche from "../components/imgs/Lanche.png";
import imgBatata from "../components/imgs/batatafrita.png";
import imgRefri from "../components/imgs/RefriLata.png";
import imgSuco from "../components/imgs/Suco.png";
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

export function resolverImagem(
  nomeProduto: string,
  imagemBanco?: string | null,
): string {
  const chave = nomeProduto.trim().toLowerCase();
  if (chave in IMAGENS_LOCAIS) {
    return IMAGENS_LOCAIS[chave];
  }
  return imagemBanco ?? "";
}
