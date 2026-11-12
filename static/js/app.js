
/*
  EDU NOVA - Lógica general compartida
  Progreso, animaciones, helpers
*/

console.log("app.js cargado");

// Guardar progreso de materias vistas
function guardarProgresoMateria(materia){
  const usuario = localStorage.getItem('edu_session');
  if(!usuario) return;
  try{
    let users = JSON.parse(localStorage.getItem('edu_users') || '{}');
    if(!users[usuario]) users[usuario] = {materias: []};
    if(!users[usuario].materias) users[usuario].materias = [];
    if(!users[usuario].materias.includes(materia)){
      users[usuario].materias.push(materia);
      localStorage.setItem('edu_users', JSON.stringify(users));
      console.log("Materia vista:", materia);
    }
  }catch(e){}
}

// Guardar puntos con animación
function guardarProgreso(puntosNuevos){
  const usuario = localStorage.getItem('edu_session');
  if(!usuario) return;
  try{
    let users = JSON.parse(localStorage.getItem('edu_users') || '{}');
    if(!users[usuario]) users[usuario] = {progreso:0};
    if(users[usuario].progreso < puntosNuevos){
      users[usuario].progreso = puntosNuevos;
      localStorage.setItem('edu_users', JSON.stringify(users));
      // Animación de puntos
      const puntosEl = document.getElementById('puntos');
      if(puntosEl){
        puntosEl.style.transform = 'scale(1.3)';
        puntosEl.style.transition = 'transform .2s';
        setTimeout(()=> puntosEl.style.transform='scale(1)', 200);
      }
    }
  }catch(e){}
}

// Barra de progreso
function actualizarBarraProgreso(porcentaje){
  const barra = document.getElementById('barraProgreso');
  if(barra){
    barra.style.width = porcentaje + '%';
    barra.innerText = porcentaje + '%';
  }
}

// Mensaje toast (notificación bonita)
function toast(msg){
  let t = document.createElement('div');
  t.innerText = msg;
  t.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:black; color:white; padding:12px 18px; border-radius:100px; border:3px solid black; box-shadow:6px 6px 0 black; z-index:9999; font-weight:800';
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 3000);
}

// Efecto confetti simple para diploma
function confetti(){
  for(let i=0;i<30;i++){
    let c=document.createElement('div');
    c.style.cssText=`position:fixed; left:${Math.random()*100}vw; top:-10px; width:10px; height:10px; background:${['#d6ff57','#8a5cff','#ff6b2c','#4af2ff'][Math.floor(Math.random()*4)]}; border:2px solid black; z-index:9999; animation:caida 1.5s linear`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),1500);
  }
  const style=document.createElement('style');
  style.innerHTML='@keyframes caida{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(100vh) rotate(720deg)}}';
  document.head.appendChild(style);
}

// Calculadora rápida para mate
function calcRapida(expr){
  try{
    return eval(expr);
  }catch(e){
    return 'Error';
  }
}

// Inicializar tooltips y ayudas
document.addEventListener('DOMContentLoaded', ()=>{
  console.log("App iniciada para", localStorage.getItem('edu_session'));
  // Marcar materia vista automáticamente según URL
  const path = window.location.pathname;
  if(path.includes('lengua')) guardarProgresoMateria('lengua');
  if(path.includes('matematicas')) guardarProgresoMateria('mate');
  if(path.includes('videos')) guardarProgresoMateria('videos');
  if(path.includes('juegos')) guardarProgresoMateria('juegos');
});