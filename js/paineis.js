/* ============================================================
   TELAS CENTRAIS
   ============================================================ */
function montarPainelClima(){
  if(dados.erroClima) return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="wifi-off"></i>Previsão do tempo</div><div class="aviso-titulo" style="font-size:4.5vh;">Não foi possível carregar o clima</div><div class="aviso-texto">Verifique a internet da TV ou o nome da cidade em Configurações (atual: "${escapeHtml(CONFIG.cidade)}").</div></div>`;
  if(!dados.clima) return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="cloud"></i>Previsão do tempo</div><div class="aviso-titulo">Carregando dados do clima...</div></div>`;
  const c = dados.clima;
  const linhasHora = (c.horas||[]).map(h=>`
    <div class="clima-linha">
      <div class="clima-linha-label">${h.label}</div>
      <div class="clima-linha-icon"><i data-lucide="${nomeIconeClima(h.codigo, true)}"></i></div>
      <div class="clima-linha-direita">
        <div class="clima-linha-temp">${h.temp}°C</div>
        <div class="clima-linha-desc">${descricaoClima(h.codigo)}</div>
      </div>
    </div>`).join("");
  const linhasDia = (c.dias||[]).map(d=>`
    <div class="clima-linha">
      <div class="clima-linha-label">${escapeHtml(d.label)}</div>
      <div class="clima-linha-icon"><i data-lucide="${nomeIconeClima(d.codigo, true)}"></i></div>
      <div class="clima-linha-direita">
        <div class="clima-linha-temp">${d.max}°/${d.min}°</div>
        <div class="clima-linha-desc">${descricaoClima(d.codigo)}</div>
      </div>
    </div>`).join("");
  return `<div class="panel">
    <div class="panel-clima-3col">
      <div class="clima-coluna">
        <div class="clima-coluna-titulo">Previsão por hora</div>
        <div class="clima-coluna-lista">${linhasHora || '<div class="texto-vazio" style="text-align:center;">Sem dados</div>'}</div>
      </div>
      <div class="clima-centro">
        <div class="clima-centro-cidade">${escapeHtml(c.cidade)}</div>
        <div class="clima-centro-icon"><i data-lucide="${nomeIconeClima(c.codigo,c.isDay)}"></i></div>
        <div class="clima-centro-temp">${c.temp}°</div>
        <div class="clima-centro-desc">${descricaoClima(c.codigo)}</div>
      </div>
      <div class="clima-coluna">
        <div class="clima-coluna-titulo">Previsão semanal</div>
        <div class="clima-coluna-lista">${linhasDia || '<div class="texto-vazio" style="text-align:center;">Sem dados</div>'}</div>
      </div>
    </div>
  </div>`;
}
function montarPainelCotacoes(){
  if(dados.erroCotacoes) return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="wifi-off"></i>Cotações</div><div class="aviso-titulo" style="font-size:4.5vh;">Não foi possível carregar as cotações</div><div class="aviso-texto">Verifique a conexão de internet da TV e tente novamente em alguns minutos.</div></div>`;
  if(!dados.cotacoes) return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="landmark"></i>Cotações</div><div class="aviso-titulo">Carregando cotações...</div></div>`;
  const linhas = dados.cotacoes.map(item=>{
    const variacao = parseFloat(item.info.pctChange); const subiu = variacao>=0;
    const valor = parseFloat(item.info.bid).toLocaleString("pt-BR",{minimumFractionDigits:item.sigla==="BTC"?0:2,maximumFractionDigits:item.sigla==="BTC"?0:2});
    return `<div class="cotacao-row">
      <div class="cotacao-nome"><div class="icon-badge"><i data-lucide="${item.icone}"></i></div><div><div class="cotacao-sigla">${item.sigla}</div><div class="cotacao-label">${item.label}</div></div></div>
      <div style="display:flex;align-items:center;"><span class="cotacao-valor">R$ ${valor}</span><span class="cotacao-var ${subiu?"var-up":"var-down"}"><i data-lucide="${subiu?"trending-up":"trending-down"}"></i>${Math.abs(variacao).toFixed(2)}%</span></div>
    </div>`;
  }).join("");
  return `<div class="panel panel-cotacoes"><div class="eyebrow"><i data-lucide="landmark"></i>Cotações do mercado</div>${linhas}</div>`;
}
function montarPainelAviso(aviso){
  return `<div class="panel panel-aviso">
    <div class="icon-badge aviso-icon"><i data-lucide="megaphone"></i></div>
    <div class="eyebrow">Aviso</div>
    <div class="aviso-titulo">${escapeHtml(truncar(aviso.titulo, 80))}</div>
    <div class="aviso-texto">${escapeHtml(truncar(aviso.texto, 400))}</div>
  </div>`;
}
function montarPainelNoticiaManual(n){
  return `<div class="panel"><div class="panel-midia">
    ${n.imagemUrl ? `<img src="${escapeAttr(n.imagemUrl)}" onerror="this.style.display='none'">` : ""}
    <div class="veu"></div>
    <div class="conteudo">
      <div class="eyebrow"><i data-lucide="newspaper"></i>Notícia</div>
      <div class="midia-titulo">${escapeHtml(truncar(n.titulo, 80))}</div>
      ${n.resumo ? `<div class="midia-resumo">${escapeHtml(truncar(n.resumo, 400))}</div>` : ""}
    </div>
  </div></div>`;
}
function iniciais(nome){
  const partes = String(nome||"").trim().split(/\s+/);
  return (partes[0]?.[0]||"") + (partes[1]?.[0]||"");
}
function rotuloStatusJogo(status){
  const mapa = { NS:"Não começou", "1H":"1º tempo", HT:"Intervalo", "2H":"2º tempo", ET:"Prorrogação", FT:"Encerrado", AET:"Encerrado (prorrogação)", PEN:"Pênaltis", PST:"Adiado", CANC:"Cancelado" };
  return mapa[status] || status;
}
const JOGOS_POR_PAGINA = 5;
function montarPainelJogosDoDia(pagina){
  if(!(CONFIG.apiFutebolKey||"").trim()){
    if(pagina === 2) return null;
    return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="calendar-days"></i>Futebol</div><div class="aviso-titulo" style="font-size:4.5vh;">Jogos do dia não configurado</div><div class="aviso-texto">Cadastre uma chave gratuita da API-Football em Configurações para ativar essa tela.</div></div>`;
  }
  if(dados.erroJogos){
    if(pagina === 2) return null;
    return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="wifi-off"></i>Futebol</div><div class="aviso-titulo" style="font-size:4.5vh;">Não foi possível carregar os jogos</div><div class="aviso-texto">Verifique a internet da TV ou se a chave da API-Football ainda é válida.</div></div>`;
  }
  if(dados.jogosDoDia === null){
    if(pagina === 2) return null;
    return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="calendar-days"></i>Futebol</div><div class="aviso-titulo">Carregando jogos do dia...</div></div>`;
  }
  if(!dados.jogosDoDia.length){
    if(pagina === 2) return null;
    return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="calendar-days"></i>Futebol</div><div class="aviso-titulo" style="font-size:4.5vh;">Sem jogos hoje</div><div class="aviso-texto">Não há partidas encontradas para hoje.</div></div>`;
  }
  const inicio = (pagina - 1) * JOGOS_POR_PAGINA;
  const jogosDaPagina = dados.jogosDoDia.slice(inicio, inicio + JOGOS_POR_PAGINA);
  if(!jogosDaPagina.length) return null; // não tem jogo suficiente pra essa página — ela simplesmente não entra na rotação

  const linhas = jogosDaPagina.map(j=>{
    const emAndamento = ["1H","2H","HT","ET"].includes(j.status);
    const encerrado = ["FT","AET","PEN"].includes(j.status);
    const placar = (encerrado || emAndamento) ? `${j.golsCasa ?? 0} — ${j.golsFora ?? 0}` : "×";
    const corStatus = emAndamento ? "var(--green)" : (encerrado ? "var(--muted)" : "var(--gold)");
    return `<div class="jogo-linha">
      <div class="jogo-liga">${escapeHtml(truncar(j.liga + (j.pais ? " · "+j.pais : ""), 34))}</div>
      <div class="jogo-partida">
        <div class="jogo-time">
          ${j.escudoCasa ? `<img class="jogo-escudo" src="${escapeAttr(j.escudoCasa)}" onerror="this.style.visibility='hidden'">` : ""}
          <span class="jogo-time-nome">${escapeHtml(truncar(j.casa, 20))}</span>
        </div>
        <div class="jogo-placar" style="color:${corStatus};">${escapeHtml(placar)}</div>
        <div class="jogo-time jogo-time-direita">
          <span class="jogo-time-nome">${escapeHtml(truncar(j.fora, 20))}</span>
          ${j.escudoFora ? `<img class="jogo-escudo" src="${escapeAttr(j.escudoFora)}" onerror="this.style.visibility='hidden'">` : ""}
        </div>
        <div class="jogo-status" style="color:${corStatus};">${emAndamento ? "● AO VIVO" : (encerrado ? "Encerrado" : j.horario)}</div>
      </div>
    </div>`;
  }).join("");
  const totalPaginas = Math.ceil(Math.min(dados.jogosDoDia.length, JOGOS_POR_PAGINA*2) / JOGOS_POR_PAGINA);
  const restantes = (dados.totalJogosDoDia||0) - Math.min(dados.jogosDoDia.length, JOGOS_POR_PAGINA*2);
  const partesRodape = [];
  if(totalPaginas > 1) partesRodape.push(`Página ${pagina} de ${totalPaginas}`);
  if(restantes > 0) partesRodape.push(`+ ${restantes} outro${restantes>1?"s":""} jogo${restantes>1?"s":""} hoje`);
  const rodape = partesRodape.length ? `<div class="jogos-rodape">${partesRodape.join(" · ")}</div>` : "";
  return `<div class="panel"><div class="panel-tabela">
    <div class="tabela-titulo"><i data-lucide="calendar-days"></i>Jogos do dia</div>
    <div class="tabela-wrap" style="padding:1vh 0;">
      <div class="jogos-lista">${linhas}</div>
      ${rodape}
    </div>
  </div></div>`;
}
function tagMidia(url, tipoMidia){
  const src = escapeAttr(url);
  if(tipoMidia === "video"){
    return `<video src="${src}" autoplay muted loop playsinline onerror="this.style.opacity='0.15'"></video>`;
  }
  return `<img src="${src}" onerror="this.style.opacity='0.15'">`;
}
function montarPainelImagem(im){
  return `<div class="panel"><div class="panel-midia legenda-simples">
    ${tagMidia(im.url, im.tipoMidia)}
    <div class="veu"></div>
    ${im.legenda ? `<div class="conteudo" style="padding:3.2vh;"><div style="font-size:2.2vh;font-weight:500;">${escapeHtml(im.legenda)}</div></div>` : ""}
  </div></div>`;
}

/* ---------- Comerciais / banners de anunciantes ---------- */
function dataHojeStr(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function horaAgoraStr(){ const d=new Date(); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); }
function campanhaEstaAtiva(c){
  const hoje = dataHojeStr();
  if(c.dataInicio && hoje < c.dataInicio) return false;
  if(c.dataFim && hoje > c.dataFim) return false;
  // dias da semana: array de números 0(domingo) a 6(sábado). Vazio/ausente = todos os dias.
  if(Array.isArray(c.diasSemana) && c.diasSemana.length > 0){
    const diaHoje = new Date().getDay();
    if(!c.diasSemana.includes(diaHoje)) return false;
  }
  if(c.horaInicio && c.horaFim){
    const agora = horaAgoraStr();
    if(c.horaInicio <= c.horaFim){
      if(agora < c.horaInicio || agora > c.horaFim) return false;
    } else { // janela que atravessa a meia-noite (ex: 22:00 às 06:00)
      if(agora < c.horaInicio && agora > c.horaFim) return false;
    }
  }
  return true;
}
function campanhasAtivasAgora(){ return CAMPANHAS.filter(campanhaEstaAtiva); }
function montarPainelCampanha(c){
  return `<div class="panel"><div class="panel-midia legenda-simples">
    <div class="badge-anuncio"><i data-lucide="badge-dollar-sign"></i>Publicidade</div>
    ${tagMidia(c.imagemUrl, c.tipoMidia)}
    <div class="veu"></div>
    <div class="conteudo" style="padding:3.2vh;">
      <div class="tag-cliente">Anunciante</div>
      <div style="font-family:var(--font-display);font-weight:700;font-size:2.6vh;">${escapeHtml(truncar(c.cliente, 60))}</div>
    </div>
  </div></div>`;
}
function registrarExibicaoCampanha(id){
  const c = CAMPANHAS.find(x=>x.id===id);
  if(!c) return;
  if(NUVEM_ATIVA && dbRef){
    // incremento atômico no servidor: seguro mesmo com várias TVs exibindo ao mesmo tempo.
    // Não atualizamos c.exibicoes localmente aqui — o valor correto sempre vem de volta
    // pelo listener da nuvem, evitando qualquer contagem duplicada.
    dbRef.child("campanhas").child(id).child("exibicoes").transaction(atual => (atual||0) + 1)
      .catch(e=>console.error("Falha ao registrar exibição da campanha:", e));
  } else {
    c.exibicoes = (c.exibicoes||0) + 1;
    gravarLocal(CHAVES.campanhas, CAMPANHAS);
  }
}
function salvarCampanha(campanha){
  if(NUVEM_ATIVA && dbRef){
    // grava só essa campanha (não a lista inteira) — evita que duas pessoas administrando ao mesmo tempo se sobrescrevam
    dbRef.child("campanhas").child(campanha.id).set(campanha).catch(e=>console.error("Falha ao salvar campanha:", e));
  }
  gravarLocal(CHAVES.campanhas, CAMPANHAS);
}
function excluirCampanhaCloud(id){
  if(NUVEM_ATIVA && dbRef){
    dbRef.child("campanhas").child(id).remove().catch(e=>console.error("Falha ao excluir campanha:", e));
  }
  gravarLocal(CHAVES.campanhas, CAMPANHAS);
}
function escapeHtml(str){ const d=document.createElement("div"); d.textContent = str==null?"":String(str); return d.innerHTML; }
function escapeAttr(str){ return String(str==null?"":str).replace(/"/g,"&quot;"); }
function truncar(str, max){
  const s = String(str==null?"":str);
  return s.length > max ? s.slice(0, max-1) + "…" : s;
}
