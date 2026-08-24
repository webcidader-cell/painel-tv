/* ============================================================
   SAÚDE DO SISTEMA — tratamento global de erros
   Fica logo no início do script pra capturar até erros de
   inicialização. Guarda os últimos erros e o status de conexão
   pra aparecer na aba "Status" do painel de administração.
   ============================================================ */
let ERROS_RECENTES = [];
let INTERNET_ONLINE = navigator.onLine;
let FIREBASE_CONECTADO = null; // null = não sabemos ainda (Firebase não configurado ou não checou)

function registrarErroGlobal(mensagem, detalhe){
  ERROS_RECENTES.unshift({ mensagem: String(mensagem).slice(0,200), detalhe: detalhe?String(detalhe).slice(0,300):"", quando: new Date() });
  ERROS_RECENTES = ERROS_RECENTES.slice(0, 8);
}
window.addEventListener("error", (e)=>{
  registrarErroGlobal(e.message || "Erro desconhecido", e.filename ? (e.filename.split("/").pop()+":"+e.lineno) : "");
});
window.addEventListener("unhandledrejection", (e)=>{
  const motivo = e.reason && e.reason.message ? e.reason.message : String(e.reason);
  registrarErroGlobal("Promessa rejeitada: " + motivo);
});
window.addEventListener("online", ()=>{ INTERNET_ONLINE = true; });
window.addEventListener("offline", ()=>{ INTERNET_ONLINE = false; });

function tempoRelativo(data){
  if(!data) return "nunca";
  const seg = Math.floor((Date.now() - new Date(data).getTime())/1000);
  if(seg < 60) return "agora mesmo";
  if(seg < 3600) return Math.floor(seg/60) + " min atrás";
  if(seg < 86400) return Math.floor(seg/3600) + "h atrás";
  return Math.floor(seg/86400) + " dias atrás";
}
