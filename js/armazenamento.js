/* ============================================================
   CONFIGURAÇÃO PADRÃO (usada só na primeira execução)
   ============================================================ */
const CONFIG_PADRAO = {
  nomePainel: "Painel Informativo",
  cidade: "Lícinio de Almeida, BA",
  feedNoticias: "https://g1.globo.com/rss/g1/",
  tempoRotacaoSegundos: 12
};

/* ============================================================
   ARMAZENAMENTO LOCAL (fica salvo no navegador desta TV)
   ============================================================ */
const CHAVES = { config:"painelTV:config", avisos:"painelTV:avisos", noticias:"painelTV:noticias", imagens:"painelTV:imagens", campanhas:"painelTV:campanhas", tabela:"painelTV:tabela", playlist:"painelTV:playlist" };
function lerLocal(chave, padrao){
  try{ const chaveFinal = UID_ATUAL ? chave+":"+UID_ATUAL : chave; const v = localStorage.getItem(chaveFinal); return v ? JSON.parse(v) : padrao; }catch{ return padrao; }
}
function gravarLocal(chave, valor){
  try{ const chaveFinal = UID_ATUAL ? chave+":"+UID_ATUAL : chave; localStorage.setItem(chaveFinal, JSON.stringify(valor)); }catch(e){ console.error("Falha ao salvar", chave, e); }
}
// nome curto (ex: "avisos") usado como caminho no Firebase, dentro de CHAVES.xxx que já usamos localmente
function nomeCurto(chaveCompleta){ return chaveCompleta.split(":")[1]; }
function salvarDados(chaveCompleta, valor){
  gravarLocal(chaveCompleta, valor); // sempre guarda uma cópia local também, por segurança
  if(NUVEM_ATIVA && dbRef){
    dbRef.child(nomeCurto(chaveCompleta)).set(valor).catch(e=>console.error("Falha ao sincronizar na nuvem:", e));
  }
}
function gerarId(){
  if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}
function urlValida(url){
  if(!url) return true; // campo vazio é tratado separadamente (obrigatório ou não)
  try{ const u = new URL(url); return u.protocol === "http:" || u.protocol === "https:"; }catch{ return false; }
}

let ARMAZENAMENTO_DISPONIVEL = true;
let UID_ATUAL = null; // preenchido no login — isola o cache local por cliente
try{
  localStorage.setItem("painelTV:teste", "1");
  localStorage.removeItem("painelTV:teste");
}catch(e){ ARMAZENAMENTO_DISPONIVEL = false; console.error("localStorage indisponível neste navegador/origem:", e); }

let CONFIG = { ...CONFIG_PADRAO, ...lerLocal(CHAVES.config, {}) };
let AVISOS = lerLocal(CHAVES.avisos, [
  { id: gerarId(), titulo:"Bem-vindo(a)!", texto:"Este painel exibe notícias, previsão do tempo e cotações atualizadas automaticamente." }
]);
let NOTICIAS_MANUAIS = lerLocal(CHAVES.noticias, []);
let IMAGENS = lerLocal(CHAVES.imagens, []);
let CAMPANHAS = lerLocal(CHAVES.campanhas, []);
let TABELA = lerLocal(CHAVES.tabela, []);
let PLAYLIST = lerLocal(CHAVES.playlist, {}); // { "tipo:id": {ativo, ordem, duracao} }

document.getElementById("nomePainel").textContent = CONFIG.nomePainel;
