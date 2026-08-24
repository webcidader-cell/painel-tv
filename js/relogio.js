/* ============================================================
   RELÓGIO
   ============================================================ */
function atualizarRelogio(){
  const agora = new Date();
  document.getElementById("relogio").textContent = agora.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  document.querySelector("#dataAtual span").textContent = agora.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
}
atualizarRelogio(); setInterval(atualizarRelogio, 1000);
