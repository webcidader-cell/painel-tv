/* ============================================================
   CENÁRIO DE CÉU
   ============================================================ */
const CEUS = {
  claroDia:{top:"#1a6fb0",bottom:"#8ec9f0"}, claroNoite:{top:"#050a18",bottom:"#122042"},
  nublado:{top:"#5b6b82",bottom:"#93a2b8"}, nubladoNoite:{top:"#0c1220",bottom:"#242f45"},
  chuvaDia:{top:"#3a4658",bottom:"#6c7789"}, chuvaNoite:{top:"#050810",bottom:"#1a2130"},
  tempestade:{top:"#0e0f16",bottom:"#242231"}, nevoa:{top:"#8b95a3",bottom:"#c7ced9"}
};
(function gerarEstrelas(){ const c=document.getElementById("elStars"); for(let i=0;i<50;i++){ const s=document.createElement("div"); s.className="star"; s.style.top=Math.random()*70+"vh"; s.style.left=Math.random()*100+"vw"; s.style.animationDelay=(Math.random()*3)+"s"; c.appendChild(s); } })();
(function gerarChuva(){ const c=document.getElementById("elRain"); for(let i=0;i<70;i++){ const d=document.createElement("div"); d.className="drop"; d.style.left=Math.random()*100+"vw"; d.style.animationDuration=(0.5+Math.random()*0.5)+"s"; d.style.animationDelay=(Math.random()*2)+"s"; c.appendChild(d); } })();

let raioIntervalo = null;
function aplicarCenario(codigo, isDay){
  const raiz = document.documentElement.style;
  const grupo = obterGrupo(codigo);
  let paleta;
  ["elSun","elMoon","elStars","elClouds","elVeil","elFog","elRain"].forEach(id=>document.getElementById(id).classList.remove("on"));
  if(raioIntervalo){ clearInterval(raioIntervalo); raioIntervalo=null; }

  if(grupo==="claro"){ paleta = isDay?CEUS.claroDia:CEUS.claroNoite; document.getElementById(isDay?"elSun":"elMoon").classList.add("on"); if(!isDay) document.getElementById("elStars").classList.add("on"); }
  else if(grupo==="parcial"){ paleta = isDay?CEUS.claroDia:CEUS.claroNoite; document.getElementById(isDay?"elSun":"elMoon").classList.add("on"); if(!isDay) document.getElementById("elStars").classList.add("on"); document.getElementById("elClouds").classList.add("on"); }
  else if(grupo==="nublado"){ paleta = isDay?CEUS.nublado:CEUS.nubladoNoite; document.getElementById("elClouds").classList.add("on"); document.getElementById("elVeil").classList.add("on"); }
  else if(grupo==="nevoa"){ paleta = CEUS.nevoa; document.getElementById("elFog").classList.add("on"); }
  else if(grupo==="chuva"){ paleta = isDay?CEUS.chuvaDia:CEUS.chuvaNoite; document.getElementById("elClouds").classList.add("on"); document.getElementById("elVeil").classList.add("on"); document.getElementById("elRain").classList.add("on"); }
  else if(grupo==="tempestade"){ paleta = CEUS.tempestade; document.getElementById("elClouds").classList.add("on"); document.getElementById("elVeil").classList.add("on"); document.getElementById("elRain").classList.add("on");
    const flash=document.getElementById("elLightning"); raioIntervalo=setInterval(()=>{ flash.classList.remove("flash"); void flash.offsetWidth; flash.classList.add("flash"); }, 6000+Math.random()*6000); }
  else{ paleta = isDay?CEUS.claroDia:CEUS.claroNoite; }
  raiz.setProperty("--sky-top", paleta.top); raiz.setProperty("--sky-bottom", paleta.bottom);
}
function obterGrupo(codigo){
  if(codigo===0) return "claro";
  if([1,2].includes(codigo)) return "parcial";
  if(codigo===3) return "nublado";
  if([45,48].includes(codigo)) return "nevoa";
  if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(codigo)) return "chuva";
  if([71,73,75,77,85,86].includes(codigo)) return "chuva";
  if([95,96,99].includes(codigo)) return "tempestade";
  return "nublado";
}
function nomeIconeClima(codigo,isDay){
  if(codigo===0) return isDay?"sun":"moon";
  if([1,2].includes(codigo)) return isDay?"cloud-sun":"cloud-moon";
  if(codigo===3) return "cloud";
  if([45,48].includes(codigo)) return "cloud-fog";
  if([51,53,55,56,57].includes(codigo)) return "cloud-drizzle";
  if([61,63,65,66,67,80,81,82].includes(codigo)) return "cloud-rain";
  if([71,73,75,77,85,86].includes(codigo)) return "cloud-snow";
  if([95,96,99].includes(codigo)) return "cloud-lightning";
  return "cloud";
}
function descricaoClima(codigo){
  const mapa={0:"Céu limpo",1:"Poucas nuvens",2:"Parcialmente nublado",3:"Nublado",45:"Neblina",48:"Neblina com geada",51:"Garoa fraca",53:"Garoa",55:"Garoa forte",56:"Garoa congelante",57:"Garoa congelante forte",61:"Chuva fraca",63:"Chuva",65:"Chuva forte",66:"Chuva congelante",67:"Chuva congelante forte",71:"Neve fraca",73:"Neve",75:"Neve forte",77:"Grãos de neve",80:"Pancadas fracas",81:"Pancadas de chuva",82:"Pancadas fortes",85:"Pancadas de neve fracas",86:"Pancadas de neve fortes",95:"Trovoada",96:"Trovoada com granizo",99:"Trovoada forte com granizo"};
  return mapa[codigo] || "Condição indisponível";
}
