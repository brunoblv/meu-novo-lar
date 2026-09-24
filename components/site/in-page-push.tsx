/**
 * Monetag In-Page Push (zona 11883515). O snippet vai inline no HTML servido
 * (não via `next/script`, que injeta só no cliente) porque o verificador da
 * Monetag lê o HTML bruto da página atrás dele. A própria tag posiciona o
 * aviso na tela.
 */
const SNIPPET =
  "(function(s){s.dataset.zone='11883515',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";

export function InPagePush() {
  return <script dangerouslySetInnerHTML={{ __html: SNIPPET }} />;
}
