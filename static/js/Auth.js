
/*
  EDU NOVA - Sistema de Autenticación
  Maneja login, registro, sesión y protección de páginas
  Trabaja junto con Flask (sesión servidor) + localStorage (cliente)
*/

console.log("auth.js cargado");

// Guarda el usuario actual en localStorage para que JS lo pueda leer
function guardarSesionLocal(usuario, escuela){
  try{
    localStorage.setItem('edu_session', usuario);
    localStorage.setItem('edu_escuela', escuela || '');
    if(!localStorage.getItem('edu_puntos')){
      localStorage.setItem('edu_puntos','0');
    }
    if(!localStorage.getItem('edu_users')){
      localStorage.setItem('edu_users', JSON.stringify({}));
    }
    let users = JSON.parse(localStorage.getItem('edu_users'));
    if(!users[usuario]){
      users[usuario] = {escuela: escuela, puntos: 0, progreso:0, fecha: new Date().toLocaleDateString()};
      localStorage.setItem('edu_users', JSON.stringify(users));
    }
    console.log("Sesión guardada:", usuario);
  }catch(e){
    console.error("Error guardando sesión", e);
  }
}

// Verifica si hay sesión, si no, redirige al login
function checkAuth(){
  const sesion = localStorage.getItem('edu_session');
  const path = window.location.pathname;
  // Si estás en login y ya tienes sesión, no hacer nada
  if(path === '/' || path === '/index') return sesion;
  if(!sesion){
    console.warn("No hay sesión, redirigiendo a /");
    // No redirigimos brusco si Flask ya lo hace, solo aviso
    // window.location.href = '/';
    return null;
  }
  return sesion;
}

// Muestra el nombre del usuario en todos los .userName
function mostrarUsuario(){
  const sesion = localStorage.getItem('edu_session') || document.body.dataset.user || 'Usuario';
  const escuela = localStorage.getItem('edu_escuela') || '';
  document.querySelectorAll('.userName').forEach(el=>{
    el.innerText = sesion;
  });
  document.querySelectorAll('.userEsc').forEach(el=>{
    el.innerText = escuela;
  });
  document.querySelectorAll('[data-user]').forEach(el=>{
    if(!el.dataset.user) el.dataset.user = sesion;
  });
}

// Logout completo: borra local y servidor
function logoutCompleto(){
  try{
    const usuario = localStorage.getItem('edu_session');
    console.log("Logout de", usuario);
    localStorage.removeItem('edu_session');
    // No borramos puntos para que quede historial, solo sesión
    // localStorage.removeItem('edu_puntos');
  }catch(e){}
  // Redirige a la ruta Flask que borra sesión servidor
  window.location.href = '/logout';
}

// Validación de formulario antes de enviar
function validarForm(){
  const user = document.getElementById('user');
  const pass = document.getElementById('pass');
  if(!user || !pass) return true;
  if(user.value.trim().length < 3){
    alert('Usuario muy corto, mínimo 3 letras. Ej: ana23');
    user.focus();
    return false;
  }
  if(pass.value.trim().length < 3){
    alert('Contraseña muy corta, mínimo 3 caracteres');
    pass.focus();
    return false;
  }
  guardarSesionLocal(user.value.trim(), document.getElementById('escuela')?.value || '');
  return true;
}

// Auto-ejecutar en cada página
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('authForm');
  if(form){
    form.addEventListener('submit', (e)=>{
      if(!validarForm()){
        e.preventDefault();
      }
    });
  }
  // Mostrar usuario si existe
  if(localStorage.getItem('edu_session')){
    mostrarUsuario();
  }
});

// Función para borrar todo (solo para pruebas del concurso)
function borrarTodo(){
  if(confirm('¿Borrar todos los datos locales? Solo para pruebas')){
    localStorage.clear();
    alert('Borrado. Recarga la página');
    location.reload();
  }
}