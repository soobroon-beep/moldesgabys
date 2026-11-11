/* Asesor visual: búsqueda local, etiquetas CLIP abiertas y tarjetas interactivas. */
(()=>{'use strict';
const all=Array.isArray(window.GABYS_CATALOGO)?window.GABYS_CATALOGO:[];
const tags=window.GABYS_ETIQUETAS||{};
const $=q=>document.querySelector(q);
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const categories=[
['muñeco de nieve','muneco de nieve','munecos de nieve','snowman','snowmen','hombre de nieve'],
['reno','reno','renos','renito','renita','reindeer','ciervo'],
['santa claus','santa','papa noel','santa claus','san nicolas'],
['duende','duende','duendes','elfo','elfos'],
['grinch','grinch'],['pingüino','pinguino','pinguinos'],
['galleta de jengibre','galleta','galletas','jengibre'],
['cascanueces','cascanueces','soldadito'],['angel','angel','angelitos'],
['catrina','catrina','catrinas','catrin'],['bruja','bruja','brujas','brujita'],
['calavera','calavera','calaveras','esqueleto'],['fantasma','fantasma','fantasmas'],
['calabaza','calabaza','calabazas'],['murciélago','murcielago','murcielagos'],
['vampiro','vampiro','dracula'],['frankenstein','frankenstein','franky','frankie'],
['árbol de navidad','arbol de navidad','arboles de navidad','pino navideno'],
['corona','corona','coronas','guirnalda'],['cocina','cocina','chef','cocinero'],
['juego de baño','juego de bano','bano','sanitario'],['cortinero','cortinero','cortineros'],
['cojín','cojin','cojines','almohada'],['trineo','trineo'],['oso','oso','osos','osito']
];
const stop=new Set('quiero querria queria busco busca necesito ver mostrar muestrame dame tienes tienen algun alguna algunos algunas figura figuras modelo modelos molde moldes fotos foto que sean con en de del para por favor donde estan hay los las unas unos uno una un me el la y o todos todas disenos diseños navidad halloween'.split(' '));
function text(msg,role='bot'){let e=document.createElement('div');e.className='message '+role;e.textContent=msg;$('#assistant-messages').append(e);$('#assistant-messages').scrollTop=$('#assistant-messages').scrollHeight;return e;}
function image(p){return 'images/'+encodeURIComponent(p.codigo)+'.webp'}
function photo(img,p){let tries=0;const urls=[image(p),'https://drive.google.com/thumbnail?id='+encodeURIComponent(p.id)+'&sz=w500','https://lh3.googleusercontent.com/d/'+encodeURIComponent(p.id)+'=w500'];img.addEventListener('error',()=>{if(++tries<urls.length)img.src=urls[tries]});img.src=urls[0];}
function openProduct(p){
 const b=[...document.querySelectorAll('#collections .collection')].find(b=>b.textContent.includes(p.seccion==='navidad'?'Navidad':'Halloween'));
 if(b)b.click();
 const search=$('#search');search.value=p.codigo;search.dispatchEvent(new Event('input',{bubbles:true}));
 const card=$('#product-grid .product-card');if(card)card.querySelector('.product-content button')?.click();
}
function showGallery(items,subject){
 let section=$('#descriptivos');
 if(!section){section=document.createElement('section');section.id='descriptivos';section.className='ai-gallery shell';$('#catalogo').before(section)}
 section.replaceChildren();
 const head=document.createElement('div');head.className='ai-gallery-head';
 const heading=document.createElement('h2');heading.textContent='Modelos de «'+subject+'»';
 const close=document.createElement('button');close.textContent='Cerrar resultados ×';close.addEventListener('click',()=>section.remove());
 head.append(heading,close);section.append(head);
 const guide=document.createElement('p');guide.textContent='Resultados sugeridos. Abre una fotografía para ver su número y añadirla a tu selección.';section.append(guide);
 const grid=document.createElement('div');grid.className='ai-gallery-grid';section.append(grid);
 for(const p of items){let b=document.createElement('button');b.className='ai-gallery-card';b.type='button';let img=document.createElement('img');img.loading='lazy';img.alt=p.nombre;photo(img,p);let t=document.createElement('span');t.textContent=(p.seccion==='navidad'?'🎄 Navidad ':'🎃 Halloween ')+(p.numero===null?'S/N':'#'+p.numero)+(p.codigo.match(/-[A-Z]$/)?' · '+p.codigo:'');b.append(img,t);b.addEventListener('click',()=>openProduct(p));grid.append(b)}
 section.scrollIntoView({behavior:'smooth',block:'start'});
}
function results(items,subject,visual){
 const body=$('#assistant-messages');const box=document.createElement('div');box.className='message bot ai-found';
 const intro=document.createElement('div');intro.className='ai-found-title';intro.textContent=(visual?'Coincidencias visuales sugeridas: ':'Encontré ')+items.length+' modelo(s) para «'+subject+'». Pulsa un número o foto para abrirlo.';box.append(intro);
 const numbers=document.createElement('p');numbers.className='ai-number-list';numbers.textContent=items.map(p=>(p.seccion==='navidad'?'NAV':'HAL')+' '+(p.numero??'S/N')+(p.codigo.match(/-[A-Z]$/)?' ('+p.codigo+')':'')).join(' · ');box.append(numbers);
 const grid=document.createElement('div');grid.className='ai-chat-cards';box.append(grid);
 let shown=0;
 function appendNext(){let end=Math.min(shown+18,items.length);for(let i=shown;i<end;i++){let p=items[i],b=document.createElement('button');b.type='button';b.className='ai-chat-card';let img=document.createElement('img');img.loading='lazy';img.alt=p.nombre;photo(img,p);let label=document.createElement('span');label.textContent=(p.seccion==='navidad'?'🎄 ':'🎃 ')+(p.numero??'S/N');b.append(img,label);b.addEventListener('click',()=>openProduct(p));grid.append(b)}shown=end}
 appendNext();
 if(shown<items.length){let more=document.createElement('button');more.type='button';more.className='ai-more';more.textContent='Mostrar más fotografías ↓';more.addEventListener('click',()=>{appendNext();if(shown===items.length)more.remove()});box.append(more)}
 let btn=document.createElement('button');btn.className='ai-open-gallery';btn.type='button';btn.textContent='Ver los '+items.length+' modelos en la página ↗';btn.addEventListener('click',()=>{showGallery(items,subject);$('#assistant-panel').hidden=true;$('#assistant-launcher').hidden=false});box.append(btn);
 body.append(box);body.scrollTop=body.scrollHeight;
}
function search(q){
 let clean=norm(q),byCode=clean.match(/\b(hal|nav)-(\d{1,5})(?:-([a-z]))?\b/);
 if(byCode){let full=byCode[1].toUpperCase()+'-'+byCode[2].padStart(3,'0')+(byCode[3]?'-'+byCode[3].toUpperCase():'');return {label:full,hits:all.filter(p=>p.codigo===full),exact:true}}
 let byNum=clean.match(/(?:numero|modelo|#|foto)\s*[:#-]?\s*(\d{1,5})\b/)||(/^\d{1,5}$/.test(clean)?[clean,clean]:null);
 if(byNum)return {label:'número '+byNum[1],hits:all.filter(p=>p.numero===Number(byNum[1])),exact:true};
 let requested=categories.filter(row=>row.slice(1).some(s=>clean.includes(s)));
 let terms=clean.split(/\s+/).filter(w=>w.length>2&&!stop.has(w));
 let hits=all.filter(p=>{
  let item=norm([p.nombre,p.archivo,p.busqueda,(tags[p.codigo]||[]).join(' ')].join(' '));
  return requested.length?requested.every(group=>item.includes(norm(group[0]))||group.slice(1).some(w=>item.includes(w))):terms.length?terms.every(w=>item.includes(w)):false;
 });
 hits.sort((a,b)=>a.seccion.localeCompare(b.seccion)||(a.numero??99999)-(b.numero??99999)||a.codigo.localeCompare(b.codigo));
 return {label:requested.length?requested.map(x=>x[0]).join(' y '):terms.join(' '),hits,visual:requested.length>0};
}
function handle(query){
 let q=String(query||'').trim();if(!q)return;$('#assistant-question').value='';text(q,'user');const found=search(q);
 const help=norm(q);
 const guidance=/como comprar|como pago|quiero pagar|mercado pago|tarjeta|comprobante|envio|enviar|descarga|patron pdf|whatsapp/.test(help);
 if(found.hits.length&&!guidance){results(found.hits,found.label,found.visual);if(found.visual&&Object.keys(tags).length===0)text('Estas coincidencias proceden de nombres de archivos. La identificación de figuras dentro de las fotos todavía se está procesando.');return}
 if(guidance){text(/whatsapp/.test(help)?'Puedes escribirnos al WhatsApp 272 130 08 18, al final de esta página.': 'Elige uno o varios moldes, agrega al carrito y envía la selección por WhatsApp. Mercado Pago y las descargas automáticas todavía no están habilitados.');return}
 if(found.exact){text('No encontré ese número. Prueba un número que aparezca en el muestrario.');return}
 if(found.visual&&Object.keys(tags).length===0){text('Todavía se está preparando el reconocimiento visual de las fotos numeradas. No puedo asegurar cuáles son todos los «'+found.label+'» hasta terminar ese índice. Puedes buscar por número mientras tanto.');return}
 text('No encontré coincidencias seguras para «'+(found.label||q)+'». Prueba con otra descripción, por ejemplo «muñecos de nieve», «renos», «brujitas» o escribe un número.');
}
const form=$('#assistant-form');
if(form)form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();handle($('#assistant-question').value)},true);
const suggestions=$('#assistant-suggestions');
if(suggestions){suggestions.innerHTML='<button type="button">⛄ Muñecos de nieve</button><button type="button">🦌 Renos</button><button type="button">🎄 Papá Noel</button><button type="button">Buscar n.º 253</button>';suggestions.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopImmediatePropagation();handle(b.textContent.replace('Buscar n.º','modelo'))},true)}
})();