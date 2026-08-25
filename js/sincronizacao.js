/* ============================================================
   ESCUTA EM TEMPO REAL DA NUVEM (quando o Firebase está configurado)
   Qualquer alteração feita em outro aparelho chega aqui sozinha.
   ============================================================ */
let listenersAtivos = [];
function pararEscutaDaNuvem(){
  listenersAtivos.forEach(ref=>{ try{ ref.off(); }catch{} });
  listenersAtivos = [];
}
function ativarEscutaDaNuvem(){
  if(!NUVEM_ATIVA || !dbRef) return;
  pararEscutaDaNuvem(); // garante que não fica ouvinte duplicado de uma sessão anterior
  function registrar(caminho, callback){
    const ref = dbRef.child(caminho);
    ref.on("value", callback);
    listenersAtivos.push(ref);
  }
  registrar("config", snap=>{
    const v = snap.val() || {};
    const chaveApiFutebolAntes = CONFIG.apiFutebolKey;
    const precisaBuscarJogos = dados.jogosDoDia === null || chaveApiFutebolAntes !== (v.apiFutebolKey || "");
    CONFIG = { ...CONFIG_PADRAO, ...v };
    gravarLocal(CHAVES.config, CONFIG);
    document.getElementById("nomePainel").textContent = CONFIG.nomePainel;
    atualizarLogoTopbar();
    if(precisaBuscarJogos){
      // a config real da nuvem (com a chave da API-Football) pode chegar DEPOIS da primeira
      // tentativa de buscar os jogos no carregamento da página — sem isso, o painel ficava
      // "carregando" pra sempre até alguém salvar Configurações manualmente.
      buscarJogosDoDia().then(()=> reiniciarRotacaoComDebounce());
    } else {
      reiniciarRotacaoComDebounce();
    }
  });
  registrar("avisos", snap=>{
    AVISOS = snap.val() || [];
    gravarLocal(CHAVES.avisos, AVISOS);
    reiniciarRotacaoComDebounce();
    if(overlay.classList.contains("aberto") && abaAtual==="avisos") renderAbaAvisos();
  });
  registrar("noticias", snap=>{
    NOTICIAS_MANUAIS = snap.val() || [];
    gravarLocal(CHAVES.noticias, NOTICIAS_MANUAIS);
    reiniciarRotacaoComDebounce();
    if(overlay.classList.contains("aberto") && abaAtual==="noticias") renderAbaNoticias();
  });
  registrar("imagens", snap=>{
    IMAGENS = snap.val() || [];
    gravarLocal(CHAVES.imagens, IMAGENS);
    reiniciarRotacaoComDebounce();
    if(overlay.classList.contains("aberto") && abaAtual==="imagens") renderAbaImagens();
  });
  registrar("campanhas", snap=>{
    const v = snap.val();
    CAMPANHAS = v ? Object.keys(v).map(k=>({ ...v[k], id:k })) : [];
    gravarLocal(CHAVES.campanhas, CAMPANHAS);
    reiniciarRotacaoComDebounce();
    if(overlay.classList.contains("aberto") && abaAtual==="comerciais") renderAbaComerciais();
  });
  registrar("playlist", snap=>{
    PLAYLIST = snap.val() || {};
    gravarLocal(CHAVES.playlist, PLAYLIST);
    reiniciarRotacaoComDebounce();
    if(overlay.classList.contains("aberto") && abaAtual==="playlist") renderAbaPlaylist();
  });
}
