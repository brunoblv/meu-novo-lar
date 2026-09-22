import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/database";
import { WHERE_POST_PUBLICO } from "@/lib/modo-site";
import { Button } from "@/components/ui/button";
import { CAPA_EDITORIAL, resolverCapa } from "@/lib/conteudo/capa";
import { FERRAMENTAS } from "@/lib/ferramentas";

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: WHERE_POST_PUBLICO,
    include: { capa: true },
    orderBy: { publicadoEm: "desc" },
    take: 3,
  });

  return (
    <>
      {/* Hero */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-5 py-14 sm:px-10 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div>
          <div className="text-xs font-bold tracking-[0.14em] text-primary">IDEIAS PARA O SEU LAR</div>
          <h1 className="mt-4 max-w-md font-heading text-4xl leading-[1.15] font-semibold text-foreground sm:text-5xl">
            Deixe sua casa mais prática, bonita e funcional.
          </h1>
          <div className="mt-4 max-w-md space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">
              Inspiração, dicas e ferramentas úteis para o dia a dia da sua casa.
            </p>
            <p>
              O Meu Novo Lar é uma publicação especializada em casa e lar, criada para ajudar você a encontrar
              boas ideias e tornar cada ambiente mais bonito, funcional e prático.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" render={<Link href="/blog" />} className="px-6">
              Explorar conteúdos
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/ferramentas" />} className="px-6">
              Ver ferramentas
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl">
          <Image
            src={CAPA_EDITORIAL.src}
            alt={CAPA_EDITORIAL.alt}
            width={1024}
            height={682}
            priority
            className="h-auto w-full object-cover"
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-10">
        <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-[26px]">
          Sobre o Meu Novo Lar
        </h2>
        <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
          <p>
            O Meu Novo Lar é uma publicação para quem está construindo, reformando, organizando ou simplesmente
            querendo deixar a casa mais bonita, funcional e agradável.
          </p>
          <p>
            Aqui você encontra ideias e conteúdos sobre organização, cozinha, banheiro, lavanderia, limpeza,
            decoração, iluminação, móveis, ferramentas, jardim e eletrodomésticos — sempre pensando em situações
            reais do dia a dia.
          </p>
          <p>
            No nosso{" "}
            <Link href="/blog" className="font-medium text-foreground underline">
              blog
            </Link>
            , publicamos guias, ideias e conteúdos práticos para ajudar em decisões que fazem parte da rotina de
            uma casa: como aproveitar melhor uma cozinha pequena, escolher uma iluminação adequada, organizar um
            ambiente ou planejar uma reforma.
          </p>
          <p>
            Também criamos ferramentas gratuitas para ajudar em tarefas práticas, como calcular a quantidade de
            tinta ou piso necessária para um ambiente.
          </p>
          <p>
            Conheça mais sobre o projeto na página{" "}
            <Link href="/sobre" className="font-medium text-foreground underline">
              Sobre
            </Link>
            . Para dúvidas, sugestões ou contato comercial, acesse nossa{" "}
            <Link href="/contato" className="font-medium text-foreground underline">
              página de contato
            </Link>
            .
          </p>
          <p>
            Nossa{" "}
            <Link href="/privacy-policy" className="font-medium text-foreground underline">
              política de privacidade
            </Link>{" "}
            explica como utilizamos cookies e outras tecnologias no site.
          </p>
        </div>
      </div>

      {/* Conteúdos recentes */}
      {posts.length > 0 && (
        <div className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-10">
          <div className="mb-2 text-[11px] font-bold tracking-[0.12em] text-muted-foreground">CONTEÚDOS RECENTES</div>
          <h2 className="mb-7 font-heading text-2xl font-semibold text-foreground sm:text-[26px]">Ideias para o seu lar</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {posts.map((post, indice) => {
              const capa = resolverCapa(post.capa, indice === 0);
              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                <div className="mb-3.5 flex h-44 items-center justify-center overflow-hidden rounded-lg bg-[repeating-linear-gradient(45deg,var(--sand),var(--sand)_8px,var(--background)_8px,var(--background)_16px)]">
                  {capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capa.src} alt={capa.alt} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-mono text-[11px] text-muted-foreground">imagem</span>
                  )}
                </div>
                <h3 className="mt-1.5 font-heading text-[17px] font-semibold text-foreground group-hover:underline">
                  {post.titulo}
                </h3>
                {post.resumo && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{post.resumo}</p>}
                <span className="mt-2 block text-xs font-medium text-muted-foreground">{readingTime(post.corpo)} min de leitura</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Ferramentas */}
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-10">
        <div className="mb-2 text-[11px] font-bold tracking-[0.12em] text-muted-foreground">FERRAMENTAS</div>
        <h2 className="mb-7 font-heading text-2xl font-semibold text-foreground sm:text-[26px]">Ferramentas para facilitar sua vida</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FERRAMENTAS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="block rounded-xl border border-border p-5">
              <div className="mb-3.5 flex size-10 items-center justify-center rounded-lg bg-secondary">
                <span className="size-3.5 rounded-[3px] bg-sage" />
              </div>
              <div className="mb-1.5 text-sm font-semibold text-foreground">{tool.title}</div>
              <div className="mb-3.5 text-[13px] leading-relaxed text-muted-foreground">{tool.description}</div>
              <span className="text-xs font-semibold text-primary">Usar ferramenta →</span>
            </Link>
          ))}
        </div>
      </div>

    </>
  );
}
