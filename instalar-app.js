/* Instalación de Moldes Gaby´s: Android, iPhone y computadora. */
(()=>{
'use strict';
const button=document.getElementById('gabys-install-button');
const help=document.getElementById('gabys-install-help');
const panel=document.getElementById('gabys-install-card');
if(!button||!help||!panel)return;
let deferred=null;
const standalone=()=>{
 return window.matchMedia('(display-mode: standalone)').matches ||
   window.navigator.standalone===true;
};
function describe(message){
  help.textContent=message;
  help.hidden=false;
}
function update(){
 if(standalone()){
   button.textContent='Ya instalada';
   button.disabled=true;
   describe('La aplicación ya está instalada en este dispositivo.');
 }else{
   button.disabled=false;
 }
}
if('serviceWorker' in navigator && window.isSecureContext){
 window.addEventListener('load',()=>{
   navigator.serviceWorker.register('./sw.js?v=1',{scope:'./'})
     .catch(err=>console.warn('Registro de aplicación:',err));
 });
}
window.addEventListener('beforeinstallprompt',e=>{
 e.preventDefault();
 deferred=e;
 button.disabled=false;
 button.textContent='Instalar';
});
window.addEventListener('appinstalled',()=>{
 deferred=null;update();
});
button.addEventListener('click',async()=>{
 if(standalone()){update();return;}
 if(deferred){
   const prompt=deferred;deferred=null;
   try{
     await prompt.prompt();
     const choice=await prompt.userChoice;
     if(choice.outcome==='accepted'){
       describe('Instalación solicitada. Busca Moldes Gaby´s en tu pantalla de inicio.');
     }else{
       describe('También puedes instalar desde el menú de tu navegador.');
     }
   }catch{
     describe('Abre el menú del navegador y elige «Instalar aplicación».');
   }
   return;
 }
 const ua=navigator.userAgent||'';
 if(/iPhone|iPad|iPod/i.test(ua)){
  describe('En Safari, toca Compartir (cuadro con flecha) y elige «Agregar a pantalla de inicio».');
 }else if(/Android/i.test(ua)){
  describe('En Chrome, toca el menú ⋮ y selecciona «Instalar aplicación» o «Añadir a pantalla de inicio».');
 }else{
  describe('En Chrome o Edge, abre el menú ⋮ y elige «Instalar Moldes Gaby´s».');
 }
});
update();
})();