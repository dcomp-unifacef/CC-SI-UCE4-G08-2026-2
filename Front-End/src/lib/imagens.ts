import imgCachorro from "../components/imgs/360_F_611014237_Cnc2qrcgkqwgRGZqfy5Wi9bQ1cmcFJ5z-removebg-preview.png";
import imgBatata from "../components/imgs/images-removebg-preview.png";
import imgHamburguer from "../components/imgs/istockphoto-486120619-612x612-removebg-preview.png";
import imgBebida from "../components/imgs/istockphoto-840902892-612x612-removebg-preview.png";

/**
 * Mapeia o nome do produto para a imagem personalizada (PNG com fundo transparente)
 * da pasta src/components/imgs/. Quando não houver correspondência, retorna a
 * imagem informada no banco (produto.imagem) ou uma string vazia.
 */
const IMAGENS_LOCAIS: Record<string, string> = {
  "cachorro-quente": imgCachorro,
  "x-salada": imgHamburguer,
  "x-bacon": imgHamburguer,
  "batata frita": imgBatata,
  "refrigerante lata": imgBebida,
  "suco natural": imgBebida,
  pudim: imgBatata,
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
