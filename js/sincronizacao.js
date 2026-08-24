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
    CONFIG = { ...CONFIG_PADRAO, ...v };
    gravarLocal(CHAVES.config, CONFIG);
    document.getElementById("nomePainel").textContent = CONFIG.nomePainel;
    reiniciarRotacaoComDebounce();
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
  registrar("tabela", snap=>{
    TABELA = snap.val() || [];
    gravarLocal(CHAVES.tabela, TABELA);
    reiniciarRotacaoComDebounce();
    if(overlay.classList.contains("aberto") && abaAtual==="tabela") renderAbaTabela();
  });
}
