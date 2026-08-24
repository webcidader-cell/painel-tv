/* ============================================================
   DADOS AO VIVO
   ============================================================ */
const dados = { clima:null, cotacoes:null, jogosDoDia:null, totalJogosDoDia:0, erroClima:false, erroCotacoes:false, erroNoticias:false, erroJogos:false, ultimaAtualizacaoClima:null, ultimaAtualizacaoCotacoes:null, ultimaAtualizacaoNoticias:null, ultimaAtualizacaoJogos:null };

async function buscarClima(){
  try{
    const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(CONFIG.cidade.split(",")[0].trim())}&count=1&language=pt&format=json`).then(r=>r.json());
    if(!geo.results || !geo.results.length) throw new Error("Cidade não encontrada: "+CONFIG.cidade);
    const { latitude, longitude, name } = geo.results[0];
    const previsao = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=America%2FSao_Paulo&forecast_days=7`).then(r=>r.json());

    // monta a lista "por hora" (6 horários, de 3 em 3 horas, a partir de agora)
    const agora = new Date();
    let idxAtual = previsao.hourly.time.findIndex(t => new Date(t) >= agora);
    if(idxAtual < 0) idxAtual = 0;
    const horas = [];
    for(let i=0;i<6;i++){
      const idx = idxAtual + i*3;
      if(idx >= previsao.hourly.time.length) break;
      const dt = new Date(previsao.hourly.time[idx]);
      horas.push({
        label: dt.toLocaleTimeString("pt-BR",{hour:"2-digit", minute:"2-digit"}),
        temp: Math.round(previsao.hourly.temperature_2m[idx]),
        codigo: previsao.hourly.weather_code[idx]
      });
    }

    // monta a lista "semanal" (hoje + próximos dias)
    const dias = [];
    for(let i=0;i<Math.min(6, previsao.daily.time.length);i++){
      const dt = new Date(previsao.daily.time[i] + "T12:00:00");
      let label;
      if(i===0) label = "Hoje";
      else if(i===1) label = "Amanhã";
      else label = dt.toLocaleDateString("pt-BR", {weekday:"short"}).replace(".","");
      dias.push({
        label,
        max: Math.round(previsao.daily.temperature_2m_max[i]),
        min: Math.round(previsao.daily.temperature_2m_min[i]),
        codigo: previsao.daily.weather_code[i]
      });
    }

    dados.clima = { cidade:name, temp:Math.round(previsao.current.temperature_2m), codigo:previsao.current.weather_code, isDay:previsao.current.is_day===1, umidade:previsao.current.relative_humidity_2m, vento:Math.round(previsao.current.wind_speed_10m), max:Math.round(previsao.daily.temperature_2m_max[0]), min:Math.round(previsao.daily.temperature_2m_min[0]), horas, dias };
    dados.erroClima = false;
    dados.ultimaAtualizacaoClima = new Date();
    aplicarCenario(dados.clima.codigo, dados.clima.isDay);
  }catch(e){ console.error("Erro ao buscar clima:", e); dados.erroClima = true; }
}
async function buscarCotacoes(){
  try{
    const r = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL").then(r=>r.json());
    dados.cotacoes = [
      { sigla:"USD", label:"Dólar americano", icone:"dollar-sign", info:r.USDBRL },
      { sigla:"EUR", label:"Euro", icone:"euro", info:r.EURBRL },
      { sigla:"BTC", label:"Bitcoin", icone:"coins", info:r.BTCBRL }
    ];
    dados.erroCotacoes = false;
    dados.ultimaAtualizacaoCotacoes = new Date();
  }catch(e){ console.error("Erro ao buscar cotações:", e); dados.erroCotacoes = true; }
}

/* ---------- Jogos do dia (todos os campeonatos, via API-Football) ---------- */
const LIMITE_JOGOS_EXIBIDOS = 30; // evita uma lista infinita em dias com muitos jogos no mundo todo
async function buscarJogosDoDia(){
  const chaveApi = (CONFIG.apiFutebolKey || "").trim();
  if(!chaveApi){ dados.jogosDoDia = null; dados.erroJogos = false; return; } // sem chave configurada: painel mostra aviso amigável, não erro
  try{
    const hoje = dataHojeStr();
    const r = await fetch(`https://v3.football.api-sports.io/fixtures?date=${hoje}&timezone=America%2FSao_Paulo`, {
      headers: { "x-apisports-key": chaveApi }
    }).then(r=>r.json());
    const todos = (r.response || []).map(j => ({
      casa: j.teams.home.name,
      fora: j.teams.away.name,
      escudoCasa: j.teams.home.logo,
      escudoFora: j.teams.away.logo,
      golsCasa: j.goals.home,
      golsFora: j.goals.away,
      status: j.fixture.status.short, // NS=não começou, 1H/2H/HT=em andamento, FT=encerrado
      horario: new Date(j.fixture.date).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),
      liga: j.league?.name || "",
      pais: j.league?.country || ""
    }));
    // prioriza jogos ao vivo primeiro, depois os que ainda vão começar, depois os encerrados
    const pesoStatus = s => ["1H","2H","HT","ET","BT"].includes(s) ? 0 : (s==="NS" ? 1 : 2);
    todos.sort((a,b)=> pesoStatus(a.status) - pesoStatus(b.status));
    dados.jogosDoDia = todos.slice(0, LIMITE_JOGOS_EXIBIDOS);
    dados.totalJogosDoDia = todos.length;
    dados.erroJogos = false;
    dados.ultimaAtualizacaoJogos = new Date();
  }catch(e){ console.error("Erro ao buscar jogos do dia:", e); dados.erroJogos = true; }
}
const VELOCIDADE_TICKER_PX_POR_SEGUNDO = 60; // menor = mais devagar, maior = mais rápido
function ajustarVelocidadeTicker(){
  const track = document.getElementById("tickerTrack");
  requestAnimationFrame(()=>{
    const largura = track.scrollWidth || 4000;
    const duracao = Math.max(largura / VELOCIDADE_TICKER_PX_POR_SEGUNDO, 20);
    track.style.animation = "none";
    void track.offsetWidth;
    track.style.animation = `scroll-left ${duracao}s linear infinite`;
  });
}

async function buscarNoticias(){
  try{
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(CONFIG.feedNoticias)}`;
    const r = await fetch(url).then(r=>r.json());
    if(r.status!=="ok" || !r.items || !r.items.length) throw new Error("Feed indisponível");
    const titulos = r.items.slice(0,12).map(i=>i.title);
    const track = document.getElementById("tickerTrack");
    track.innerHTML="";
    [...titulos,...titulos].forEach(t=>{ const span=document.createElement("span"); span.textContent="● "+t; track.appendChild(span); });
    dados.erroNoticias = false;
    dados.ultimaAtualizacaoNoticias = new Date();
    ajustarVelocidadeTicker();
  }catch(e){ console.error("Erro ao buscar notícias:", e); dados.erroNoticias = true;
    const track = document.getElementById("tickerTrack");
    if(track.textContent.includes("Carregando")){ track.innerHTML = `<span><i data-lucide="wifi-off" style="width:1.8vh;height:1.8vh;vertical-align:-3px;"></i> Sem conexão com a internet para buscar notícias — verifique a rede da TV.</span>`; if(window.lucide) lucide.createIcons(); }
  }
}
