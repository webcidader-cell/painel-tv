/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
async function iniciar(){
  if(window.lucide) lucide.createIcons();
  aplicarCenario(1, true);
  await Promise.all([ buscarClima(), buscarCotacoes(), buscarNoticias(), buscarJogosDoDia() ]);
  reiniciarRotacao();
  atualizarBadge();
  if(window.lucide) lucide.createIcons();

  setInterval(async ()=>{ await buscarClima(); renderizarPainelAtual(); atualizarBadge(); }, CONFIG.atualizarClimaMinutos ? CONFIG.atualizarClimaMinutos*60*1000 : 15*60*1000);
  setInterval(async ()=>{ await buscarCotacoes(); renderizarPainelAtual(); atualizarBadge(); }, 5*60*1000);
  setInterval(buscarNoticias, 10*60*1000);
  setInterval(async ()=>{ await buscarJogosDoDia(); renderizarPainelAtual(); }, 20*60*1000); // 20 min: seguro dentro do limite de ~100 consultas/dia do plano grátis
}
function iniciarApp(){
  iniciar();
  ativarEscutaDaNuvem();
}

if(window.lucide) lucide.createIcons(); // garante que os ícones da tela de login apareçam mesmo antes do login

if(EXIGIR_LOGIN){
  iniciarComAutenticacao();
} else {
  // modo antigo: sem login, painel único compartilhado
  document.getElementById("telaLogin").classList.add("escondida");
  document.getElementById("tvApp").style.display = "";
  if(firebaseIniciado){ dbRef = firebase.database().ref("painelTV"); NUVEM_ATIVA = true; }
  iniciarApp();
}
