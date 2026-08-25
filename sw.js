/* ============================================================
   SERVICE WORKER — permite o painel continuar funcionando
   mesmo sem internet nenhuma, depois do primeiro carregamento.

   O que ele guarda em cache:
   1) Os arquivos do PRÓPRIO app (index.html, css, js) — sempre.
   2) IMAGENS E VÍDEOS usados no painel (banners, fotos, logo),
      mesmo estando hospedados em outro site (ex: GitHub Pages
      de mídia) — guardados assim que forem exibidos pela
      primeira vez com internet.

   O que NÃO passa por aqui (fica sempre igual, direto da rede):
   Firebase, API de clima/cotações/futebol, feed de notícias —
   esses precisam sempre da informação mais recente, e já têm
   seu próprio tratamento de erro/cache no app (localStorage).
   ============================================================ */

const CACHE_VERSAO = "v2";
const CACHE_NOME = "painel-tv-shell-" + CACHE_VERSAO;

const ARQUIVOS_DO_APP = [
  "./",
  "./index.html",
  "./css/estilo.css",
  "./js/saude.js",
  "./js/auth.js",
  "./js/armazenamento.js",
  "./js/sincronizacao.js",
  "./js/relogio.js",
  "./js/clima.js",
  "./js/dados-externos.js",
  "./js/paineis.js",
  "./js/rotacao.js",
  "./js/app.js",
  "./js/admin.js"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_DO_APP))
  );
  self.skipWaiting(); // ativa a versão nova assim que possível, sem esperar todas as abas fecharem
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((nome) => nome !== CACHE_NOME).map((nome) => caches.delete(nome)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  if (requisicao.method !== "GET") return;

  const ehArquivoDoApp = new URL(requisicao.url).origin === self.location.origin;
  const ehImagemOuVideo = requisicao.destination === "image" || requisicao.destination === "video";

  // Só mexemos em dois casos: arquivos do próprio app (qualquer um), OU imagens/vídeos
  // de QUALQUER origem (banners, fotos, logo hospedados em outro site). Todo o resto —
  // chamadas de API, Firebase, JSON, RSS — passa direto pra rede, sem cache daqui.
  if (!ehArquivoDoApp && !ehImagemOuVideo) return;

  evento.respondWith(
    caches.match(requisicao).then((respostaEmCache) => {
      const buscaNaRede = fetch(requisicao)
        .then((respostaDaRede) => {
          // imagens/vídeos de outra origem chegam como resposta "opaca" (sem conseguir ler
          // o status) — isso é normal e esperado, guardamos assim mesmo.
          if (respostaDaRede && (respostaDaRede.status === 200 || respostaDaRede.type === "opaque")) {
            const copia = respostaDaRede.clone();
            caches.open(CACHE_NOME).then((cache) => cache.put(requisicao, copia));
          }
          return respostaDaRede;
        })
        .catch(() => respostaEmCache); // sem internet: usa o que já tinha guardado

      // Responde na hora com o que já está em cache (rápido, funciona offline),
      // e atualiza o cache em segundo plano sempre que há internet disponível.
      return respostaEmCache || buscaNaRede;
    })
  );
});
