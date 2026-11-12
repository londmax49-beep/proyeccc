 
/*
  EDU NOVA - Juegos Interactivos
  6 juegos: 3 de Lengua, 3 de Mate
  Guarda puntos en localStorage y en el servidor Flask vía API
*/

let puntos = parseInt(localStorage.getItem('edu_puntos') || '0');
let nivel = 1;

function actualizarPuntos(){
  const el = document.getElementById('puntos');
  if(el) el.innerText = puntos;
  localStorage.setItem('edu_puntos', puntos);
  // Enviar al servidor Flask
  fetch('/api/guardar_puntos', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({puntos: puntos})
  }).then(r=>r.json()).then(d=>console.log('Puntos guardados servidor', d)).catch(()=>{});
  const nivelEl = document.getElementById('nivel');
  if(nivelEl) nivelEl.innerText = Math.floor(puntos/50)+1;
}

// ===== JUEGO 1 LENGUA: ORDENA LA ORACIÓN =====
const oraciones = [
  "La niña inteligente corre rápido en el parque",
  "El mar azul brilla intensamente bajo el sol",
  "Nosotros estudiamos mucho para ganar el concurso",
  "Veracruz es hermoso con su cultura y tradición",
  "Los libros abren puertas a mundos infinitos"
];
let actual = 0;
let fraseArmada = [];

function cargarOracion(){
  const cont = document.getElementById('palabras');
  const resp = document.getElementById('respuesta');
  if(!cont) return;
  const palabras = oraciones[actual].split(' ').sort(()=>0.5-Math.random());
  cont.innerHTML = palabras.map(p=>`<button class="btn btn-white" style="margin:4px; font-size:14px" onclick="agregarPalabra('${p}')">${p}</button>`).join('');
  resp.innerText = '';
  fraseArmada = [];
  document.getElementById('progresoOracion').innerText = `${actual+1}/${oraciones.length}`;
}
function agregarPalabra(p){ fraseArmada.push(p); document.getElementById('respuesta').innerText = fraseArmada.join(' '); }
function verificarOracion(){
  if(fraseArmada.join(' ') === oraciones[actual]){
    puntos += 20; actualizarPuntos();
    alert(`¡Correcto! +20 pts. "${oraciones[actual]}" está perfecta.`);
    actual = (actual + 1) % oraciones.length;
    cargarOracion();
  } else {
    alert('Casi. Pista: La oración empieza con mayúscula y termina con la última palabra que ves desordenada.');
    fraseArmada = []; document.getElementById('respuesta').innerText = '';
  }
}
function borrarOracion(){ fraseArmada=[]; document.getElementById('respuesta').innerText=''; }

// ===== JUEGO 2 MATE: CARRERA MATEMÁTICA =====
let tiempo, n1, n2, operacion, intervalo, jugando=false;
function iniciarCarrera(){
  if(jugando) return;
  jugando=true; document.getElementById('juegoMate').style.display='block';
  tiempo=30; document.getElementById('tiempo').innerText=tiempo;
  nuevaCuenta();
  intervalo=setInterval(()=>{
    tiempo--; document.getElementById('tiempo').innerText=tiempo;
    if(tiempo<=0){ clearInterval(intervalo); jugando=false; document.getElementById('juegoMate').style.display='none'; alert(`¡Tiempo! Llevas ${puntos} puntos`); }
  },1000);
}
function nuevaCuenta(){
  n1=Math.floor(Math.random()*12)+1; n2=Math.floor(Math.random()*12)+1;
  const ops=['+','-','*']; operacion=ops[Math.floor(Math.random()*3)];
  if(operacion==='-' && n1<n2){ [n1,n2]=[n2,n1]; }
  document.getElementById('cuenta').innerText=`${n1} ${operacion} ${n2} = ?`;
}
function responderMate(){
  const r=parseInt(document.getElementById('respMate').value);
  const correcto=eval(`${n1}${operacion}${n2}`);
  if(r===correcto){ puntos+=10; actualizarPuntos(); nuevaCuenta(); document.getElementById('respMate').value=''; document.getElementById('respMate').focus(); }
  else{ alert('Incorrecto, intenta otra vez'); }
}

// ===== JUEGO 3 LENGUA: FIGURAS LITERARIAS =====
const figuras = [
  {texto:"Tus ojos son dos luceros", respuesta:"metafora", explicacion:"Compara ojos con luceros sin usar 'como'"},
  {texto:"Te lo dije un millón de veces", respuesta:"hiperbole", explicacion:"Exagera la cantidad"},
  {texto:"El viento susurraba triste", respuesta:"personificacion", explicacion:"Da cualidad humana al viento"}
];
let figuraActual=0;
function cargarFigura(){ const f=figuras[figuraActual]; document.getElementById('textoFigura').innerText=`"${f.texto}"`; }
function responderFigura(tipo){
  const f=figuras[figuraActual];
  if(tipo===f.respuesta){ puntos+=15; actualizarPuntos(); alert(`¡Correcto! ${f.explicacion} +15 pts`); figuraActual=(figuraActual+1)%figuras.length; cargarFigura(); }
  else{ alert(`No, pista: ${f.explicacion}`); }
}

// ===== JUEGO 4 MATE: ADIVINA EL NÚMERO =====
const numeroSecreto = 7;
let intentos=0;
function adivinarNumero(){
  const g=parseInt(document.getElementById('adivina').value);
  intentos++;
  if(g===numeroSecreto){ puntos+=30; actualizarPuntos(); alert(`¡GENIO! Era ${numeroSecreto} en ${intentos} intentos. +30 pts`); intentos=0; document.getElementById('adivina').value=''; }
  else if(g<numeroSecreto){ alert('Más arriba ⬆️'); }
  else{ alert('Más abajo ⬇️'); }
}

// ===== JUEGO 5 LENGUA: SINÓNIMOS RÁPIDOS =====
function sinonimo(op){
  if(op==='feliz'){ puntos+=10; actualizarPuntos(); alert('¡Contento = feliz! +10'); }
  else{ alert('Intenta otra vez'); }
}

// ===== JUEGO 6 MATE: FRACCIONES VISUALES =====
function fraccion(op){
  if(op==='3/4'){ puntos+=15; actualizarPuntos(); alert('¡3/4 es mayor que 2/4! +15'); }
  else{ alert('Recuerda: mismo denominador, mayor numerador = mayor fracción'); }
}

// Inicializar
document.addEventListener('DOMContentLoaded', ()=>{
  actualizarPuntos();
  if(document.getElementById('palabras')) cargarOracion();
  if(document.getElementById('textoFigura')) cargarFigura();
});