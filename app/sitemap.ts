import type { MetadataRoute } from "next";
import { prisma } from "@/lib/database";
import { WHERE_POST_PUBLICO } from "@/lib/modo-site";
import { getSiteUrl } from "@/lib/site-url";

const ROTAS_ESTATICAS = ["/", "/blog", "/ferramentas", "/sobre", "/contato"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const estaticas: MetadataRoute.Sitemap = ROTAS_ESTATICAS.map((rota) => ({
    url: `${siteUrl}${rota}`,
    lastModified: new Date(),
  }));

  try {
    // Só JORNADA é indexado (ver robots noindex em blog/[slug] e
    // produtos/[slug] — LISTA/PRODUTO/fichas de produto são conteúdo
    // automático sem texto editorial): o sitemap não deve listar URLs que a
    // própria página marca como noindex.
    const posts = await prisma.post.findMany({
      where: WHERE_POST_PUBLICO,
      select: { slug: true, atualizadoEm: true, publicadoEm: true },
    });

    const doPosts: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.atualizadoEm ?? post.publicadoEm ?? new Date(),
    }));

    return [...estaticas, ...doPosts];
  } catch {
    // Sitemap quebrado é pior que sitemap só com rotas institucionais.
    return estaticas;
  }
}
