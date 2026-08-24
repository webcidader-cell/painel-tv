/* ============================================================
   PAINEL DE ADMINISTRAÇÃO (salva no navegador desta TV)
   ============================================================ */
const btnAdmin = document.getElementById("btnAdmin");
const overlay = document.getElementById("adminOverlay");
const corpo = document.getElementById("adminCorpo");
let abaAtual = "noticias";

setInterval(()=>{
  if(overlay.classList.contains("aberto") && abaAtual === "status") renderAbaStatus();
}, 3000);

btnAdmin.addEventListener("click", ()=>{
  overlay.classList.add("aberto");
  renderAba();
  const badge = document.getElementById("badgeNuvem");
  badge.innerHTML = NUVEM_ATIVA
    ? `<span style="display:inline-flex; align-items:center; gap:.5vh; color:var(--green); font-size:1.4vh; font-family:var(--font-mono);"><i data-lucide="cloud-check" style="width:1.8vh;height:1.8vh;"></i>Sincronizado</span>`
    : `<span style="display:inline-flex; align-items:center; gap:.5vh; color:var(--muted); font-size:1.4vh; font-family:var(--font-mono);"><i data-lucide="cloud-off" style="width:1.8vh;height:1.8vh;"></i>Somente este aparelho</span>`;
  const avisoEl = document.getElementById("avisoArmazenamento");
  avisoEl.innerHTML = ARMAZENAMENTO_DISPONIVEL ? "" : `<div style="background:rgba(255,107,91,0.15); border:1px solid rgba(255,107,91,0.4); color:#ffb3ab; padding:1.4vh 2.4vw; font-size:1.5vh; display:flex; align-items:center; gap:.8vh;"><i data-lucide="triangle-alert" style="width:2vh;height:2vh;flex-shrink:0;"></i>Este navegador não está permitindo salvar dados abrindo o arquivo direto (comum em modo privado/anônimo ou em alguns navegadores ao abrir por duplo clique). O que você cadastrar funciona só durante esta sessão e não fica salvo ao fechar. Solução: rode o arquivo por um servidor local ou abra num TV Box/Chrome normal (não em modo privado).</div>`;
  if(window.lucide) lucide.createIcons();
});
document.getElementById("btnFecharAdmin").addEventListener("click", ()=>{ overlay.classList.remove("aberto"); });
document.querySelectorAll(".admin-aba").forEach(el=>{
  el.addEventListener("click", ()=>{
    document.querySelectorAll(".admin-aba").forEach(a=>a.classList.remove("ativa"));
    el.classList.add("ativa");
    abaAtual = el.dataset.aba;
    renderAba();
  });
});

function renderAba(){
  if(abaAtual==="noticias") renderAbaNoticias();
  else if(abaAtual==="imagens") renderAbaImagens();
  else if(abaAtual==="comerciais") renderAbaComerciais();
  else if(abaAtual==="playlist") renderAbaPlaylist();
  else if(abaAtual==="status") renderAbaStatus();
  else if(abaAtual==="avisos") renderAbaAvisos();
  else if(abaAtual==="config") renderAbaConfig();
  if(window.lucide) lucide.createIcons();
}

function mostrarMensagemFormulario(idContainer, texto, tipo){
  const el = document.getElementById(idContainer);
  if(!el) return;
  const cor = tipo === "sucesso" ? "#4ad991" : "#ff6b5b";
  el.innerHTML = `<div style="color:${cor}; font-size:1.6vh; margin:-1vh 0 1.8vh; display:flex; align-items:center; gap:.6vh;"><i data-lucide="${tipo==='sucesso'?'check-circle-2':'triangle-alert'}" style="width:1.8vh;height:1.8vh;flex-shrink:0;"></i>${texto}</div>`;
  if(window.lucide) lucide.createIcons();
  setTimeout(()=>{ if(el) el.innerHTML=""; }, 4000);
}

function renderAbaNoticias(){
  corpo.innerHTML = `
    <h3>Nova notícia</h3>
    <label class="campo"><span>Título</span><input id="fNoticiaTitulo" maxlength="80" placeholder="Ex: Prefeitura inicia obras de pavimentação"></label>
    <label class="campo"><span>Resumo (opcional)</span><textarea id="fNoticiaResumo" maxlength="400" placeholder="Um parágrafo curto sobre a notícia"></textarea></label>
    <label class="campo"><span>URL da imagem (opcional)</span><input id="fNoticiaImagem" placeholder="https://..."></label>
    <button class="btn-primario" id="fNoticiaAdd"><i data-lucide="plus"></i>Adicionar notícia</button>
    <div id="fNoticiaMsg"></div>
    <div class="lista-titulo">Notícias cadastradas (${NOTICIAS_MANUAIS.length})</div>
    <div id="fNoticiaLista"></div>
  `;
  if(window.lucide) lucide.createIcons();
  document.getElementById("fNoticiaAdd").addEventListener("click", ()=>{
    const titulo = document.getElementById("fNoticiaTitulo").value.trim();
    if(!titulo){ mostrarMensagemFormulario("fNoticiaMsg", "Preencha o título da notícia.", "erro"); return; }
    const resumo = document.getElementById("fNoticiaResumo").value.trim();
    const imagemUrl = document.getElementById("fNoticiaImagem").value.trim();
    if(!urlValida(imagemUrl)){ mostrarMensagemFormulario("fNoticiaMsg", "A URL da imagem parece inválida. Cole um link completo (começando com https://).", "erro"); return; }
    NOTICIAS_MANUAIS.push({ id:gerarId(), titulo, resumo, imagemUrl });
    salvarDados(CHAVES.noticias, NOTICIAS_MANUAIS);
    reiniciarRotacao();
    renderAbaNoticias();
  });
  const listaEl = document.getElementById("fNoticiaLista");
  if(!NOTICIAS_MANUAIS.length){ listaEl.innerHTML = `<p class="texto-vazio">Nenhuma notícia manual cadastrada. O ticker do rodapé continua puxando manchetes automaticamente do feed configurado.</p>`; return; }
  listaEl.innerHTML = NOTICIAS_MANUAIS.map(n=>`
    <div class="item-cadastrado">
      ${n.imagemUrl ? `<img src="${escapeAttr(n.imagemUrl)}" onerror="this.style.visibility='hidden'">` : ""}
      <div class="item-texto"><div class="t">${escapeHtml(n.titulo)}</div><div class="s">${escapeHtml(n.resumo||"")}</div></div>
      <div class="item-excluir" data-id="${n.id}"><i data-lucide="trash-2"></i></div>
    </div>`).join("");
  listaEl.querySelectorAll(".item-excluir").forEach(b=>b.addEventListener("click", ()=>{
    NOTICIAS_MANUAIS = NOTICIAS_MANUAIS.filter(n=>n.id!==b.dataset.id);
    salvarDados(CHAVES.noticias, NOTICIAS_MANUAIS);
    reiniciarRotacao();
    renderAbaNoticias();
  }));
  if(window.lucide) lucide.createIcons();
}

function renderAbaImagens(){
  corpo.innerHTML = `
    <h3>Nova imagem ou vídeo</h3>
    <p class="texto-vazio" style="margin-bottom:1.8vh;">Cole o link de uma imagem ou vídeo já hospedado na internet (Google Drive público, Imgur, YouTube não funciona — precisa ser um link direto de arquivo .mp4). Não é possível enviar um arquivo direto por aqui.</p>
    <label class="campo"><span>Tipo</span>
      <div class="dias-semana-seletor" id="fImagemTipo">
        <label class="dia-chip"><input type="radio" name="fImagemTipoRadio" value="imagem" checked><span>🖼️ Imagem</span></label>
        <label class="dia-chip"><input type="radio" name="fImagemTipoRadio" value="video"><span>🎬 Vídeo</span></label>
      </div>
    </label>
    <label class="campo"><span>URL</span><input id="fImagemUrl" placeholder="https://..."></label>
    <label class="campo"><span>Legenda (opcional)</span><input id="fImagemLegenda" maxlength="120" placeholder="Ex: Feira livre todo sábado, das 6h às 12h"></label>
    <button class="btn-primario" id="fImagemAdd"><i data-lucide="plus"></i>Adicionar</button>
    <div id="fImagemMsg"></div>
    <div class="lista-titulo">Cadastrados (${IMAGENS.length})</div>
    <div id="fImagemLista"></div>
  `;
  if(window.lucide) lucide.createIcons();
  document.getElementById("fImagemAdd").addEventListener("click", ()=>{
    const url = document.getElementById("fImagemUrl").value.trim();
    if(!url){ mostrarMensagemFormulario("fImagemMsg", "Cole a URL antes de adicionar.", "erro"); return; }
    if(!urlValida(url)){ mostrarMensagemFormulario("fImagemMsg", "Essa URL parece inválida. Cole um link completo (começando com https://).", "erro"); return; }
    const legenda = document.getElementById("fImagemLegenda").value.trim();
    const tipoMidia = document.querySelector('input[name="fImagemTipoRadio"]:checked').value;
    IMAGENS.push({ id:gerarId(), url, legenda, tipoMidia });
    salvarDados(CHAVES.imagens, IMAGENS);
    reiniciarRotacao();
    renderAbaImagens();
  });
  const listaEl = document.getElementById("fImagemLista");
  if(!IMAGENS.length){ listaEl.innerHTML = `<p class="texto-vazio">Nada cadastrado ainda.</p>`; return; }
  listaEl.innerHTML = IMAGENS.map(im=>`
    <div class="item-cadastrado">
      ${im.tipoMidia === "video"
        ? `<div class="icon-badge" style="width:6vh;height:6vh;flex-shrink:0;"><i data-lucide="film"></i></div>`
        : `<img src="${escapeAttr(im.url)}" onerror="this.style.visibility='hidden'">`}
      <div class="item-texto"><div class="t">${im.tipoMidia === "video" ? "🎬 " : ""}${escapeHtml(im.legenda || "(sem legenda)")}</div></div>
      <div class="item-excluir" data-id="${im.id}"><i data-lucide="trash-2"></i></div>
    </div>`).join("");
  listaEl.querySelectorAll(".item-excluir").forEach(b=>b.addEventListener("click", ()=>{
    IMAGENS = IMAGENS.filter(im=>im.id!==b.dataset.id);
    salvarDados(CHAVES.imagens, IMAGENS);
    reiniciarRotacao();
    renderAbaImagens();
  }));
  if(window.lucide) lucide.createIcons();
}

function rotuloDiasSemana(dias){
  if(!Array.isArray(dias) || dias.length===0) return "Todos os dias";
  const nomes = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  return dias.slice().sort((a,b)=>a-b).map(d=>nomes[d]).join(", ");
}
function renderAbaComerciais(){
  const nomesDias = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  corpo.innerHTML = `
    <h3>Nova campanha comercial</h3>
    <p class="texto-vazio" style="margin-bottom:1.8vh;">O banner só aparece na tela dentro do período, dos dias da semana e do horário cadastrados — funciona como uma programação automática de anúncios, igual sistemas de TV Indoor profissionais.</p>
    <label class="campo"><span>Nome do anunciante</span><input id="fCampCliente" maxlength="60" placeholder="Ex: Supermercado Central"></label>
    <label class="campo"><span>Tipo de mídia do banner</span>
      <div class="dias-semana-seletor" id="fCampTipo">
        <label class="dia-chip"><input type="radio" name="fCampTipoRadio" value="imagem" checked><span>🖼️ Imagem</span></label>
        <label class="dia-chip"><input type="radio" name="fCampTipoRadio" value="video"><span>🎬 Vídeo</span></label>
      </div>
    </label>
    <label class="campo"><span>URL do banner (imagem ou vídeo .mp4)</span><input id="fCampImagem" placeholder="https://..."></label>
    <div style="display:flex; gap:1.6vh;">
      <label class="campo" style="flex:1;"><span>Início da campanha</span><input id="fCampDataInicio" type="date"></label>
      <label class="campo" style="flex:1;"><span>Fim da campanha</span><input id="fCampDataFim" type="date"></label>
    </div>
    <div style="display:flex; gap:1.6vh;">
      <label class="campo" style="flex:1;"><span>Horário inicial (opcional)</span><input id="fCampHoraInicio" type="time"></label>
      <label class="campo" style="flex:1;"><span>Horário final (opcional)</span><input id="fCampHoraFim" type="time"></label>
    </div>
    <label class="campo">
      <span>Dias da semana (deixe todos desmarcados = todos os dias)</span>
      <div class="dias-semana-seletor" id="fCampDias">
        ${nomesDias.map((n,i)=>`<label class="dia-chip"><input type="checkbox" value="${i}"><span>${n}</span></label>`).join("")}
      </div>
    </label>
    <button class="btn-primario" id="fCampAdd"><i data-lucide="plus"></i>Adicionar campanha</button>
    <div id="fCampMsg"></div>
    <div class="lista-titulo">Campanhas cadastradas (${CAMPANHAS.length})</div>
    <div id="fCampLista"></div>
  `;
  if(window.lucide) lucide.createIcons();
  document.getElementById("fCampAdd").addEventListener("click", ()=>{
    const cliente = document.getElementById("fCampCliente").value.trim();
    const imagemUrl = document.getElementById("fCampImagem").value.trim();
    if(!cliente){ mostrarMensagemFormulario("fCampMsg", "Preencha o nome do anunciante.", "erro"); return; }
    if(!imagemUrl){ mostrarMensagemFormulario("fCampMsg", "Cole a URL do banner (imagem) antes de adicionar.", "erro"); return; }
    if(!urlValida(imagemUrl)){ mostrarMensagemFormulario("fCampMsg", "Essa URL do banner parece inválida. Cole um link completo (começando com https://).", "erro"); return; }
    const dataInicio = document.getElementById("fCampDataInicio").value || dataHojeStr();
    const dataFim = document.getElementById("fCampDataFim").value || "";
    const horaInicio = document.getElementById("fCampHoraInicio").value || "";
    const horaFim = document.getElementById("fCampHoraFim").value || "";
    const diasSemana = [...document.querySelectorAll('#fCampDias input:checked')].map(el=>Number(el.value));
    const tipoMidia = document.querySelector('input[name="fCampTipoRadio"]:checked').value;
    const novaCampanha = { id:gerarId(), cliente, imagemUrl, tipoMidia, dataInicio, dataFim, horaInicio, horaFim, diasSemana, exibicoes:0 };
    CAMPANHAS.push(novaCampanha);
    salvarCampanha(novaCampanha);
    reiniciarRotacao();
    renderAbaComerciais();
  });
  const listaEl = document.getElementById("fCampLista");
  if(!CAMPANHAS.length){ listaEl.innerHTML = `<p class="texto-vazio">Nenhuma campanha cadastrada ainda.</p>`; return; }
  listaEl.innerHTML = CAMPANHAS.map(c=>{
    const ativa = campanhaEstaAtiva(c);
    const periodo = `${c.dataInicio||"?"} até ${c.dataFim||"sem data final"}` + (c.horaInicio && c.horaFim ? ` · ${c.horaInicio}–${c.horaFim}` : "");
    return `<div class="item-cadastrado">
      ${c.tipoMidia === "video"
        ? `<div class="icon-badge" style="width:6vh;height:6vh;flex-shrink:0;"><i data-lucide="film"></i></div>`
        : `<img src="${escapeAttr(c.imagemUrl)}" onerror="this.style.visibility='hidden'">`}
      <div class="item-texto">
        <div class="t">${c.tipoMidia === "video" ? "🎬 " : ""}${escapeHtml(c.cliente)} ${ativa ? '<span style="color:var(--green);font-size:1.4vh;">● no ar agora</span>' : '<span style="color:var(--muted);font-size:1.4vh;">● fora do período</span>'}</div>
        <div class="s">${escapeHtml(periodo)} · ${escapeHtml(rotuloDiasSemana(c.diasSemana))} · exibido ${c.exibicoes||0}x</div>
      </div>
      <div class="item-excluir" data-id="${c.id}"><i data-lucide="trash-2"></i></div>
    </div>`;
  }).join("");
  listaEl.querySelectorAll(".item-excluir").forEach(b=>b.addEventListener("click", ()=>{
    CAMPANHAS = CAMPANHAS.filter(c=>c.id!==b.dataset.id);
    excluirCampanhaCloud(b.dataset.id);
    reiniciarRotacao();
    renderAbaComerciais();
  }));
  if(window.lucide) lucide.createIcons();
}

function itensPlaylistDisponiveis(){
  const itens = [
    {tipo:"clima", id:null, label:"Previsão do tempo", icone:"cloud"},
    {tipo:"cotacoes", id:null, label:"Cotações do mercado", icone:"landmark"}
  ];
  if((CONFIG.apiFutebolKey||"").trim()) itens.push({tipo:"jogosDoDia", id:null, label:"Jogos do dia (Brasileirão)", icone:"calendar-days"});
  AVISOS.forEach(a=>itens.push({tipo:"aviso", id:a.id, label:"Aviso: "+(a.titulo||"(sem título)"), icone:"megaphone"}));
  NOTICIAS_MANUAIS.forEach(n=>itens.push({tipo:"noticiaManual", id:n.id, label:"Notícia: "+(n.titulo||"(sem título)"), icone:"newspaper"}));
  IMAGENS.forEach(im=>itens.push({tipo:"imagem", id:im.id, label:"Imagem: "+(im.legenda||"(sem legenda)"), icone:"image"}));
  campanhasAtivasAgora().forEach(c=>itens.push({tipo:"campanha", id:c.id, label:"Comercial: "+(c.cliente||"(sem nome)"), icone:"badge-dollar-sign"}));
  return itens;
}

function renderAbaPlaylist(){
  const itens = itensPlaylistDisponiveis();
  let precisouSalvar = false;
  itens.forEach(it=>{ if(garantirEntradaPlaylist(chavePlaylist(it.tipo, it.id))) precisouSalvar = true; });
  if(precisouSalvar) salvarDados(CHAVES.playlist, PLAYLIST);

  const ordenados = itens
    .map(it=>({ ...it, chave: chavePlaylist(it.tipo, it.id), cfg: configPlaylist(chavePlaylist(it.tipo, it.id)) }))
    .sort((a,b)=>(a.cfg.ordem??9999) - (b.cfg.ordem??9999));

  corpo.innerHTML = `
    <h3>Ordem de exibição</h3>
    <p class="texto-vazio" style="margin-bottom:1.8vh;">Use as setas para reordenar, o interruptor para tirar/colocar algo na rotação sem apagar o conteúdo, e o campo numérico pra dar um tempo diferente do padrão (em segundos) só pra aquele item.</p>
    <div id="listaPlaylist"></div>
  `;

  const listaEl = document.getElementById("listaPlaylist");
  if(!ordenados.length){
    listaEl.innerHTML = `<p class="texto-vazio">Nada disponível ainda — cadastre avisos, notícias, imagens ou comerciais nas outras abas.</p>`;
  } else {
    listaEl.innerHTML = ordenados.map((it,i)=>`
      <div class="item-cadastrado">
        <div class="icon-badge" style="width:4.4vh;height:4.4vh;flex-shrink:0;"><i data-lucide="${it.icone}"></i></div>
        <div class="item-texto"><div class="t">${escapeHtml(it.label)}</div><div class="s">${it.cfg.duracao ? it.cfg.duracao+"s (personalizado)" : "Padrão ("+(CONFIG.tempoRotacaoSegundos||12)+"s)"}</div></div>
        <div style="display:flex; align-items:center; gap:1vh; flex-shrink:0;">
          <button class="btn-seta" data-acao="subir" data-chave="${it.chave}" ${i===0?"disabled":""} title="Mover para cima"><i data-lucide="chevron-up"></i></button>
          <button class="btn-seta" data-acao="descer" data-chave="${it.chave}" ${i===ordenados.length-1?"disabled":""} title="Mover para baixo"><i data-lucide="chevron-down"></i></button>
          <input type="number" class="input-duracao" data-chave="${it.chave}" min="3" max="120" placeholder="${CONFIG.tempoRotacaoSegundos||12}" value="${it.cfg.duracao||""}" title="Duração personalizada em segundos">
          <label class="switch-ativo" title="Ativar/desativar na rotação">
            <input type="checkbox" data-chave="${it.chave}" ${it.cfg.ativo!==false?"checked":""}>
            <span></span>
          </label>
        </div>
      </div>`).join("");

    listaEl.querySelectorAll('input[type="checkbox"]').forEach(chk=>chk.addEventListener("change", ()=>{
      const chave = chk.dataset.chave;
      PLAYLIST[chave] = { ...configPlaylist(chave), ativo: chk.checked };
      salvarDados(CHAVES.playlist, PLAYLIST);
      reiniciarRotacao();
    }));

    listaEl.querySelectorAll(".input-duracao").forEach(inp=>inp.addEventListener("change", ()=>{
      const chave = inp.dataset.chave;
      const valor = inp.value.trim() ? Math.max(3, Math.min(120, Number(inp.value))) : null;
      PLAYLIST[chave] = { ...configPlaylist(chave), duracao: valor };
      salvarDados(CHAVES.playlist, PLAYLIST);
      reiniciarRotacao();
      renderAbaPlaylist();
    }));

    listaEl.querySelectorAll(".btn-seta").forEach(btn=>btn.addEventListener("click", ()=>{
      const chave = btn.dataset.chave;
      const acao = btn.dataset.acao;
      const posAtual = ordenados.findIndex(o=>o.chave===chave);
      const posAlvo = acao === "subir" ? posAtual - 1 : posAtual + 1;
      if(posAlvo < 0 || posAlvo >= ordenados.length) return;
      // troca a ordem entre o item movido e o vizinho, depois reindexa tudo de 0 a N-1
      const nova = [...ordenados];
      [nova[posAtual], nova[posAlvo]] = [nova[posAlvo], nova[posAtual]];
      nova.forEach((it, idx)=>{ PLAYLIST[it.chave] = { ...configPlaylist(it.chave), ordem: idx }; });
      salvarDados(CHAVES.playlist, PLAYLIST);
      reiniciarRotacao();
      renderAbaPlaylist();
    }));
  }
  if(window.lucide) lucide.createIcons();
}

function linhaStatus(rotulo, ok, detalhe){
  const cor = ok===null ? "var(--muted)" : (ok ? "var(--green)" : "var(--coral)");
  const bola = ok===null ? "circle-dashed" : (ok ? "circle-check" : "circle-x");
  return `<div class="item-cadastrado" style="align-items:center;">
    <div class="icon-badge" style="width:4vh;height:4vh;background:transparent;border:none;"><i data-lucide="${bola}" style="width:2.4vh;height:2.4vh;color:${cor};"></i></div>
    <div class="item-texto"><div class="t">${rotulo}</div><div class="s">${escapeHtml(detalhe)}</div></div>
  </div>`;
}
function renderAbaStatus(){
  const linhas = [
    linhaStatus("Internet do aparelho", INTERNET_ONLINE, INTERNET_ONLINE ? "Conectado" : "Sem conexão"),
    linhaStatus("Sincronização (Firebase)", NUVEM_ATIVA ? FIREBASE_CONECTADO : null, !NUVEM_ATIVA ? "Não configurado neste arquivo" : (FIREBASE_CONECTADO===null ? "Verificando..." : (FIREBASE_CONECTADO ? "Conectado" : "Sem conexão com o servidor"))),
    linhaStatus("Previsão do tempo", !dados.erroClima && !!dados.clima, dados.erroClima ? "Falhou na última tentativa" : "Atualizado " + tempoRelativo(dados.ultimaAtualizacaoClima)),
    linhaStatus("Cotações", !dados.erroCotacoes && !!dados.cotacoes, dados.erroCotacoes ? "Falhou na última tentativa" : "Atualizado " + tempoRelativo(dados.ultimaAtualizacaoCotacoes)),
    linhaStatus("Ticker de notícias", !dados.erroNoticias, dados.erroNoticias ? "Falhou na última tentativa" : "Atualizado " + tempoRelativo(dados.ultimaAtualizacaoNoticias)),
  ].join("");

  const listaErros = ERROS_RECENTES.length
    ? ERROS_RECENTES.map(e=>`<div class="item-cadastrado"><div class="item-texto"><div class="t" style="color:var(--coral);">${escapeHtml(e.mensagem)}</div><div class="s">${escapeHtml(e.detalhe)} · ${e.quando.toLocaleTimeString("pt-BR")}</div></div></div>`).join("")
    : `<p class="texto-vazio">Nenhum erro registrado nesta sessão. 🎉</p>`;

  corpo.innerHTML = `
    <h3>Status do sistema</h3>
    ${linhas}
    <div class="lista-titulo">Erros recentes desta sessão</div>
    ${listaErros}
    <p class="texto-vazio" style="margin-top:2vh;">Essa tela ajuda a diagnosticar problemas remotamente — se um cliente disser que "o painel parou", olhe aqui antes de precisar ir até a TV.</p>
  `;
  if(window.lucide) lucide.createIcons();
}

function renderAbaAvisos(){
  corpo.innerHTML = `
    <h3>Novo aviso</h3>
    <label class="campo"><span>Título</span><input id="fAvisoTitulo" maxlength="80" placeholder="Ex: Horário de atendimento"></label>
    <label class="campo"><span>Texto</span><textarea id="fAvisoTexto" maxlength="400" placeholder="Segunda a sexta, das 8h às 18h."></textarea></label>
    <button class="btn-primario" id="fAvisoAdd"><i data-lucide="plus"></i>Adicionar aviso</button>
    <div id="fAvisoMsg"></div>
    <div class="lista-titulo">Avisos cadastrados (${AVISOS.length})</div>
    <div id="fAvisoLista"></div>
  `;
  if(window.lucide) lucide.createIcons();
  document.getElementById("fAvisoAdd").addEventListener("click", ()=>{
    const titulo = document.getElementById("fAvisoTitulo").value.trim();
    if(!titulo){ mostrarMensagemFormulario("fAvisoMsg", "Preencha o título do aviso.", "erro"); return; }
    const texto = document.getElementById("fAvisoTexto").value.trim();
    AVISOS.push({ id:gerarId(), titulo, texto });
    salvarDados(CHAVES.avisos, AVISOS);
    reiniciarRotacao();
    renderAbaAvisos();
  });
  const listaEl = document.getElementById("fAvisoLista");
  if(!AVISOS.length){ listaEl.innerHTML = `<p class="texto-vazio">Nenhum aviso cadastrado ainda.</p>`; return; }
  listaEl.innerHTML = AVISOS.map(a=>`
    <div class="item-cadastrado">
      <div class="item-texto"><div class="t">${escapeHtml(a.titulo)}</div><div class="s">${escapeHtml(a.texto)}</div></div>
      <div class="item-excluir" data-id="${a.id}"><i data-lucide="trash-2"></i></div>
    </div>`).join("");
  listaEl.querySelectorAll(".item-excluir").forEach(b=>b.addEventListener("click", ()=>{
    AVISOS = AVISOS.filter(a=>a.id!==b.dataset.id);
    salvarDados(CHAVES.avisos, AVISOS);
    reiniciarRotacao();
    renderAbaAvisos();
  }));
  if(window.lucide) lucide.createIcons();
}

function renderAbaConfig(){
  corpo.innerHTML = `
    <h3>Configurações gerais</h3>
    <label class="campo"><span>Nome do painel</span><input id="fCfgNome" maxlength="40" value="${escapeAttr(CONFIG.nomePainel)}"></label>
    <label class="campo"><span>Cidade (previsão do tempo)</span><input id="fCfgCidade" value="${escapeAttr(CONFIG.cidade)}" placeholder="Ex: Lícinio de Almeida, BA"></label>
    <label class="campo"><span>Feed RSS de notícias</span><input id="fCfgFeed" value="${escapeAttr(CONFIG.feedNoticias)}"></label>
    <label class="campo"><span>Tempo de cada tela (segundos)</span><input id="fCfgTempo" type="number" min="5" max="60" value="${CONFIG.tempoRotacaoSegundos}"></label>
    <label class="campo">
      <span>Chave da API-Football (opcional, ativa a tela "Jogos do dia")</span>
      <input id="fCfgApiFutebol" value="${escapeAttr(CONFIG.apiFutebolKey||"")}" placeholder="Cole aqui a chave gratuita da api-football.com">
    </label>
    <p class="texto-vazio" style="margin-top:-1vh;">Crie uma chave grátis em <a href="https://dashboard.api-football.com/register" target="_blank" style="color:var(--gold);">dashboard.api-football.com</a> (sem cartão). O plano gratuito permite ~100 consultas por dia — o painel já atualiza num intervalo seguro pra não estourar.</p>
    <button class="btn-primario" id="fCfgSalvar"><i data-lucide="save"></i>Salvar configurações</button>
  `;
  if(window.lucide) lucide.createIcons();
  document.getElementById("fCfgSalvar").addEventListener("click", async ()=>{
    CONFIG.nomePainel = document.getElementById("fCfgNome").value.trim() || CONFIG_PADRAO.nomePainel;
    CONFIG.cidade = document.getElementById("fCfgCidade").value.trim() || CONFIG_PADRAO.cidade;
    CONFIG.feedNoticias = document.getElementById("fCfgFeed").value.trim() || CONFIG_PADRAO.feedNoticias;
    CONFIG.tempoRotacaoSegundos = Number(document.getElementById("fCfgTempo").value) || 12;
    CONFIG.apiFutebolKey = document.getElementById("fCfgApiFutebol").value.trim();
    salvarDados(CHAVES.config, CONFIG);
    document.getElementById("nomePainel").textContent = CONFIG.nomePainel;
    await Promise.all([ buscarClima(), buscarNoticias(), buscarJogosDoDia() ]);
    reiniciarRotacao();
    atualizarBadge();
  });
}
