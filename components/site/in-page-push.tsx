import Script from "next/script";

/**
 * Monetag In-Page Push (zona 11883515). A própria tag posiciona o aviso na
 * tela, então basta carregá-la uma vez nas páginas públicas.
 */
export function InPagePush() {
  return (
    <Script
      id="monetag-in-page-push"
      src="https://nap5k.com/tag.min.js"
      data-zone="11883515"
      strategy="afterInteractive"
    />
  );
}
