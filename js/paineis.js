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
function montarPainelTabela(){
  if(!TABELA.length) return `<div class="panel panel-aviso"><div class="eyebrow"><i data-lucide="trophy"></i>Brasileirão</div><div class="aviso-titulo" style="font-size:4.5vh;">Tabela ainda não cadastrada</div><div class="aviso-texto">Cadastre os times na aba "Tabela" do painel de administração.</div></div>`;
  const ordenada = [...TABELA].sort((a,b)=> (b.pontos||0) - (a.pontos||0));
  const total = ordenada.length;
  const linhas = ordenada.map((t,i)=>{
    const pos = i+1;
    const zona = pos<=6 ? "zona-libertadores" : (pos > total-4 ? "zona-rebaixamento" : "");
    const escudo = t.escudoUrl
      ? `<img class="col-escudo" src="${escapeAttr(t.escudoUrl)}" onerror="this.outerHTML='<div class=col-escudo-fallback>${escapeHtml(iniciais(t.nome))}</div>'">`
      : `<div class="col-escudo-fallback">${escapeHtml(iniciais(t.nome))}</div>`;
    const forma = String(t.forma||"").split(",").map(r=>r.trim().toUpperCase()).filter(Boolean).slice(-5)
      .map(r=> `<div class="bola-forma ${r==='V'?'bola-v':r==='E'?'bola-e':'bola-d'}"></div>`).join("");
    const saldo = (t.golsPro||0) - (t.golsContra||0);
    return `<div class="tabela-linha ${zona}">
      <div class="col-pos">${pos}</div>
      <div class="col-time">${escudo}<span class="col-time-nome">${escapeHtml(truncar(t.nome, 40))}</span></div>
      <div class="col-pontos">${t.pontos||0}</div>
      <div class="col-stat">${t.jogos||0}</div>
      <div class="col-stat">${t.vitorias||0}</div>
      <div class="col-stat">${t.empates||0}</div>
      <div class="col-stat">${t.derrotas||0}</div>
      <div class="col-stat">${saldo>0?'+':''}${saldo}</div>
      <div class="col-forma">${forma}</div>
    </div>`;
  }).join("");
  return `<div class="panel"><div class="panel-tabela">
    <div class="tabela-titulo"><i data-lucide="trophy"></i>Classificação — Brasileirão</div>
    <div class="tabela-wrap">
      <div class="tabela-cab">
        <div class="col-pos">#</div>
        <div class="col-time">Time</div>
        <div class="col-pontos">Pts</div>
        <div class="col-stat">J</div>
        <div class="col-stat">V</div>
        <div class="col-stat">E</div>
        <div class="col-stat">D</div>
        <div class="col-stat">SG</div>
        <div class="col-forma">Últimos 5</div>
      </div>
      <div class="tabela-linhas">${linhas}</div>
    </div>
  </div></div>`;
}
function montarPainelImagem(im){
  return `<div class="panel"><div class="panel-midia legenda-simples">
    <img src="${escapeAttr(im.url)}" onerror="this.style.opacity='0.15'">
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
    <img src="${escapeAttr(c.imagemUrl)}" onerror="this.style.opacity='0.15'">
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
