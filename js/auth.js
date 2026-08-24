/* ============================================================
   SINCRONIZAÇÃO ENTRE APARELHOS (Firebase) — multi-cliente
   Preencha os dados abaixo com os do SEU projeto Firebase.
   Cada cliente faz login com e-mail/senha próprios (criados por
   você no Firebase → Authentication), e os dados de cada um ficam
   isolados automaticamente, sem precisar de nada na URL.
   ============================================================ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBxFYFUZelHtoOFiWKqRyXw8ttM5w1wuCM",
  databaseURL: "https://tv-in-door-default-rtdb.firebaseio.com", // ex: "https://SEU-PROJETO-default-rtdb.firebaseio.com"
  projectId: "tv-in-door"
};

// Se true, exige login de e-mail/senha antes de mostrar qualquer coisa (multi-cliente).
// Se false, funciona como antes: sem login, um único painel compartilhado.
const EXIGIR_LOGIN = true;

let NUVEM_ATIVA = false;
let dbRef = null;
let firebaseIniciado = false;
try{
  if(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.databaseURL && window.firebase){
    firebase.initializeApp(FIREBASE_CONFIG);
    firebaseIniciado = true;
  }
}catch(e){ console.error("Firebase não pôde ser iniciado:", e); }

function mensagemErroLogin(codigo){
  const mapa = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
    "auth/network-request-failed": "Sem conexão com a internet."
  };
  return mapa[codigo] || "Não foi possível entrar. Verifique e-mail e senha.";
}

function iniciarComAutenticacao(){
  if(!firebaseIniciado){
    document.getElementById("loginErro").textContent = "O Firebase não está configurado neste arquivo.";
    return;
  }
  try{
    firebase.database().ref(".info/connected").on("value", snap=>{ FIREBASE_CONECTADO = snap.val() === true; });
  }catch(e){ console.error("Não foi possível monitorar a conexão com o Firebase:", e); }
  firebase.auth().onAuthStateChanged(user=>{
    if(user){
      dbRef = firebase.database().ref("paineis/" + user.uid);
      NUVEM_ATIVA = true;
      UID_ATUAL = user.uid;
      // zera qualquer dado em memória de uma sessão/cliente anterior neste mesmo navegador
      CONFIG = { ...CONFIG_PADRAO };
      AVISOS = []; NOTICIAS_MANUAIS = []; IMAGENS = []; CAMPANHAS = []; PLAYLIST = {};
      [CHAVES.config, CHAVES.avisos, CHAVES.noticias, CHAVES.imagens, CHAVES.campanhas, CHAVES.playlist].forEach(k=>{ try{ localStorage.removeItem(k); }catch{} });
      document.getElementById("nomePainel").textContent = CONFIG.nomePainel;
      document.getElementById("telaLogin").classList.add("escondida");
      document.getElementById("tvApp").style.display = "";
      document.getElementById("btnAdmin").style.display = "";
      document.getElementById("loginRodape").textContent = "Conectado como " + (user.email||"");
      iniciarApp();
    } else {
      pararEscutaDaNuvem();
      UID_ATUAL = null;
      document.getElementById("telaLogin").classList.remove("escondida");
      document.getElementById("tvApp").style.display = "none";
      document.getElementById("btnAdmin").style.display = "none";
      document.getElementById("adminOverlay").classList.remove("aberto");
    }
  });

  document.getElementById("btnLoginEntrar").addEventListener("click", fazerLogin);
  document.getElementById("loginSenha").addEventListener("keydown", e=>{ if(e.key==="Enter") fazerLogin(); });
  document.getElementById("loginEmail").addEventListener("keydown", e=>{ if(e.key==="Enter") fazerLogin(); });

  function fazerLogin(){
    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value;
    const erroEl = document.getElementById("loginErro");
    erroEl.textContent = "";
    if(!email || !senha){ erroEl.textContent = "Preencha e-mail e senha."; return; }
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(()=>{
      return firebase.auth().signInWithEmailAndPassword(email, senha);
    }).catch(e=>{ erroEl.textContent = mensagemErroLogin(e.code); });
  }
}

document.getElementById("btnLogout")?.addEventListener("click", ()=>{
  if(firebaseIniciado) firebase.auth().signOut();
});
