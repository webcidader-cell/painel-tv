let indicePainel = 0;
let ultimoPainelAtivo = null; // rastreia o que está REALMENTE visível, pra não contar exibição em toda re-renderização
let timeoutConfirmarExibicao = null;

/* ============================================================
   PLAYLIST — controle de quais telas entram na rotação, em
   que ordem, e por quanto tempo cada uma fica visível.
   ============================================================ */
function chavePlaylist(tipo, id){ return tipo + (id ? ":" + id : ""); }
function configPlaylist(chave){
  return PLAYLIST[chave] || { ativo: true, ordem: 9999, duracao: null };
}
// Garante que todo item novo (aviso/notícia/imagem/comercial recém-criado) já
// nasça com uma entrada na playlist — ativo, no final da fila.
function garantirEntradaPlaylist(chave){
  if(PLAYLIST[chave]) return false;
  const maiorOrdem = Object.values(PLAYLIST).reduce((max,e)=>Math.max(max, e.ordem||0), -1);
  PLAYLIST[chave] = { ativo: true, ordem: maiorOrdem + 1, duracao: null };
  return true;
}

function listaBaseDePaineis(){
  const lista = [ {tipo:"clima", html:montarPainelClima()}, {tipo:"cotacoes", html:montarPainelCotacoes()} ];
  if(TABELA.length) lista.push({tipo:"tabela", html:montarPainelTabela()});
  AVISOS.forEach(a=>lista.push({tipo:"aviso", id:a.id, html:montarPainelAviso(a)}));
  NOTICIAS_MANUAIS.forEach(n=>lista.push({tipo:"noticiaManual", id:n.id, html:montarPainelNoticiaManual(n)}));
  IMAGENS.forEach(im=>lista.push({tipo:"imagem", id:im.id, html:montarPainelImagem(im)}));
  campanhasAtivasAgora().forEach(c=>lista.push({tipo:"campanha", id:c.id, html:montarPainelCampanha(c)}));
  return lista;
}
function listaDePaineis(){
  const base = listaBaseDePaineis();
  // Preenche em memória (pra renderizar certo na hora), mas NÃO salva na nuvem daqui —
  // salvar aqui poderia sobrescrever uma ordem já customizada, caso essa função rode
  // antes da primeira resposta real da sincronização em nuvem chegar (corrida de dados
  // no carregamento da página). O registro definitivo/salvo acontece quando o admin
  // abre a aba Playlist (renderAbaPlaylist), que é uma ação deliberada do usuário.
  base.forEach(item=>{ garantirEntradaPlaylist(chavePlaylist(item.tipo, item.id)); });

  return base
    .map(item=>{
      const chave = chavePlaylist(item.tipo, item.id);
      const cfg = configPlaylist(chave);
      return { ...item, chave, ativo: cfg.ativo !== false, ordem: cfg.ordem ?? 9999, duracaoSegundos: cfg.duracao || null };
    })
    .filter(item=>item.ativo)
    .sort((a,b)=>a.ordem - b.ordem);
}

function renderizarPainelAtual(){
  const lista = listaDePaineis();
  if(!lista.length){
    document.getElementById("stage").innerHTML = `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="list-x"></i>Playlist</div><div class="aviso-titulo" style="font-size:4.5vh;">Nenhuma tela ativa</div><div class="aviso-texto">Vá em Playlist, no painel de administração, e ative pelo menos uma tela.</div></div>`;
    if(window.lucide) lucide.createIcons();
    return;
  }
  if(indicePainel >= lista.length) indicePainel = 0;
  const atual = lista[indicePainel];
  document.getElementById("stage").innerHTML = atual ? atual.html : "";
  const p = document.querySelector(".stage .panel");
  if(p) p.classList.add("active");

  // Só conta uma exibição comercial como "válida" depois de ficar visível por um tempo mínimo.
  // Isso evita contar de novo quando o Firebase manda uma atualização qualquer (ex: mudou um
  // aviso em outro aparelho) e a tela é re-renderizada, mas a campanha continua sendo a mesma.
  const chaveAtual = atual ? (atual.tipo + ":" + (atual.id||"")) : null;
  if(chaveAtual !== ultimoPainelAtivo){
    if(timeoutConfirmarExibicao) clearTimeout(timeoutConfirmarExibicao);
    ultimoPainelAtivo = chaveAtual;
    if(atual && atual.tipo === "campanha"){
      const idParaContar = atual.id;
      const duracaoDesteItemSeg = atual.duracaoSegundos || CONFIG.tempoRotacaoSegundos || 12;
      const tempoMinimoMs = Math.max(duracaoDesteItemSeg * 0.8, 3) * 1000;
      timeoutConfirmarExibicao = setTimeout(()=>{
        if(ultimoPainelAtivo === chaveAtual) registrarExibicaoCampanha(idParaContar);
      }, tempoMinimoMs);
    }
  }
  if(window.lucide) lucide.createIcons();
}

function duracaoAtualSegundos(){
  const lista = listaDePaineis();
  const atual = lista[indicePainel];
  return (atual && atual.duracaoSegundos) || CONFIG.tempoRotacaoSegundos || 12;
}

function avancarPainel(){
  const stageEl = document.getElementById("stage");
  stageEl.style.opacity = "0";
  setTimeout(()=>{
    const lista = listaDePaineis();
    indicePainel = (indicePainel+1) % Math.max(lista.length,1);
    renderizarPainelAtual();
    stageEl.style.opacity = "1";
    iniciarBarraProgresso();
    agendarProximoAvanco();
  }, 500);
}
function iniciarBarraProgresso(){
  const fill = document.getElementById("progressFill");
  const segundos = duracaoAtualSegundos();
  fill.style.transition="none"; fill.style.width="0%"; void fill.offsetWidth;
  fill.style.transition=`width ${segundos}s linear`; fill.style.width="100%";
}
function atualizarBadge(){
  const partes=[];
  if(dados.ultimaAtualizacaoClima) partes.push("clima "+dados.ultimaAtualizacaoClima.toLocaleTimeString("pt-BR"));
  if(dados.ultimaAtualizacaoCotacoes) partes.push("cotações "+dados.ultimaAtualizacaoCotacoes.toLocaleTimeString("pt-BR"));
  document.getElementById("updatedBadge").textContent = partes.length ? "Atualizado — "+partes.join(" · ") : "";
}

let timeoutProximoAvanco = null;
function agendarProximoAvanco(){
  if(timeoutProximoAvanco) clearTimeout(timeoutProximoAvanco);
  const segundos = duracaoAtualSegundos();
  timeoutProximoAvanco = setTimeout(avancarPainel, segundos * 1000);
}
function reiniciarRotacao(){
  if(timeoutProximoAvanco) clearTimeout(timeoutProximoAvanco);
  indicePainel = 0;
  renderizarPainelAtual();
  iniciarBarraProgresso();
  agendarProximoAvanco();
}
let timerDebounceRotacao = null;
function reiniciarRotacaoComDebounce(){
  // agrupa várias atualizações da nuvem que cheguem quase juntas (ex: você editou 2-3
  // coisas em sequência) numa única reinicialização da rotação, em vez de reiniciar a
  // cada mudança individual.
  clearTimeout(timerDebounceRotacao);
  timerDebounceRotacao = setTimeout(reiniciarRotacao, 500);
}
