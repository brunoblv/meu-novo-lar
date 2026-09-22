/**
 * Modo "só blog": o site público mostra apenas posts editoriais sem produto.
 * Catálogo, ofertas, vitrine, ferramentas, grupo e /go ficam ocultos (404) —
 * nada é apagado; o admin e os jobs seguem funcionando.
 *
 * Para reabrir o site completo: `SITE_SOMENTE_BLOG=false` no ambiente.
 */
export const SITE_SOMENTE_BLOG = process.env.SITE_SOMENTE_BLOG !== "false";

/** Rotas públicas escondidas (404) enquanto o modo só-blog estiver ligado. */
export const PREFIXOS_OCULTOS = ["/produtos", "/ofertas", "/vitrine", "/grupo", "/go"];

export function rotaOculta(pathname: string): boolean {
  return PREFIXOS_OCULTOS.some((prefixo) => pathname === prefixo || pathname.startsWith(`${prefixo}/`));
}

/**
 * Filtro Prisma dos posts visíveis ao público: publicados, editoriais, sem
 * produto vinculado e sem shortcode de produto/CTA de afiliado no corpo.
 */
export const WHERE_POST_PUBLICO = {
  status: "PUBLICADO" as const,
  tipo: "JORNADA" as const,
  produtos: { none: {} },
  AND: [{ corpo: { not: { contains: "[produto:" } } }, { corpo: { not: { contains: "[cta:" } } }],
};
