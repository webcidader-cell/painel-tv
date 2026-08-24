let indicePainel = 0;
let ultimoPainelAtivo = null; // rastreia o que está REALMENTE visível, pra não contar exibição em toda re-renderização
let timeoutConfirmarExibicao = null;
function listaDePaineis(){
  const lista = [ {tipo:"clima", html:montarPainelClima()}, {tipo:"cotacoes", html:montarPainelCotacoes()} ];
  if(TABELA.length) lista.push({tipo:"tabela", html:montarPainelTabela()});
  AVISOS.forEach(a=>lista.push({tipo:"aviso", html:montarPainelAviso(a)}));
  NOTICIAS_MANUAIS.forEach(n=>lista.push({tipo:"noticiaManual", html:montarPainelNoticiaManual(n)}));
  IMAGENS.forEach(im=>lista.push({tipo:"imagem", html:montarPainelImagem(im)}));
  campanhasAtivasAgora().forEach(c=>lista.push({tipo:"campanha", id:c.id, html:montarPainelCampanha(c)}));
  return lista;
}
function renderizarPainelAtual(){
  const lista = listaDePaineis();
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
      const tempoMinimoMs = Math.max((CONFIG.tempoRotacaoSegundos||12) * 0.8, 3) * 1000;
      timeoutConfirmarExibicao = setTimeout(()=>{
        if(ultimoPainelAtivo === chaveAtual) registrarExibicaoCampanha(idParaContar);
      }, tempoMinimoMs);
    }
  }
  if(window.lucide) lucide.createIcons();
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
  }, 500);
}
function iniciarBarraProgresso(){
  const fill = document.getElementById("progressFill");
  fill.style.transition="none"; fill.style.width="0%"; void fill.offsetWidth;
  fill.style.transition=`width ${CONFIG.tempoRotacaoSegundos}s linear`; fill.style.width="100%";
}
function atualizarBadge(){
  const partes=[];
  if(dados.ultimaAtualizacaoClima) partes.push("clima "+dados.ultimaAtualizacaoClima.toLocaleTimeString("pt-BR"));
  if(dados.ultimaAtualizacaoCotacoes) partes.push("cotações "+dados.ultimaAtualizacaoCotacoes.toLocaleTimeString("pt-BR"));
  document.getElementById("updatedBadge").textContent = partes.length ? "Atualizado — "+partes.join(" · ") : "";
}

let intervaloRotacao = null;
function reiniciarRotacao(){
  if(intervaloRotacao) clearInterval(intervaloRotacao);
  indicePainel = 0;
  renderizarPainelAtual();
  iniciarBarraProgresso();
  intervaloRotacao = setInterval(avancarPainel, CONFIG.tempoRotacaoSegundos*1000);
}
let timerDebounceRotacao = null;
function reiniciarRotacaoComDebounce(){
  // agrupa várias atualizações da nuvem que cheguem quase juntas (ex: você editou 2-3
  // coisas em sequência) numa única reinicialização da rotação, em vez de reiniciar a
  // cada mudança individual.
  clearTimeout(timerDebounceRotacao);
  timerDebounceRotacao = setTimeout(reiniciarRotacao, 500);
}
