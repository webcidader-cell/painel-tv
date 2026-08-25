/* ============================================================
   SERVICE WORKER — permite o painel continuar funcionando
   mesmo sem internet nenhuma, depois do primeiro carregamento.

   O que ele guarda em cache: só os arquivos do PRÓPRIO app
   (index.html, css, js). Dados dinâmicos (clima, cotações,
   avisos, notícias, jogos) NÃO passam por aqui — esses já têm
   seu próprio mecanismo de cache local (localStorage), tratado
   direto pelo app. Este arquivo só garante que o app consiga
   ABRIR sem internet.
   ============================================================ */

const CACHE_VERSAO = "v1";
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
  const url = new URL(evento.request.url);

  // Só intercepta pedidos do PRÓPRIO site. Tudo que for de fora (Firebase, API de clima,
  // cotações, futebol, notícias, vídeos/imagens hospedados em outro lugar) passa direto
  // pra rede, sem cache — porque isso precisa ser sempre atualizado quando há internet.
  if (url.origin !== self.location.origin) return;
  if (evento.request.method !== "GET") return;

  evento.respondWith(
    caches.match(evento.request).then((respostaEmCache) => {
      const buscaNaRede = fetch(evento.request)
        .then((respostaDaRede) => {
          if (respostaDaRede && respostaDaRede.status === 200) {
            const copia = respostaDaRede.clone();
            caches.open(CACHE_NOME).then((cache) => cache.put(evento.request, copia));
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
