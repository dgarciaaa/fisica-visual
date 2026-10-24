'use strict';
const params=new URLSearchParams(location.search);
const item=window.PHYSICS_CATALOG.items.find(i=>i.id===params.get('sim'));
const backParams=new URLSearchParams();for(const key of ['area','q'])if(params.get(key))backParams.set(key,params.get(key));
document.querySelector('#back').href='./'+(backParams.size?'?'+backParams:'')+'#catalogo';
if(!item){document.querySelector('#viewer-message').hidden=false;}else{
 document.title=item.title+' · Física visual';document.querySelector('#lab-title').textContent=item.title;
 document.querySelector('#viewer-actions').hidden=false;document.querySelector('#direct').href=item.path;
 const frame=document.createElement('iframe');frame.className='viewer-frame';frame.title=item.title;frame.allowFullscreen=true;frame.src=item.path;
 document.querySelector('#loader').hidden=false;
 frame.addEventListener('load',()=>{document.querySelector('#loader').hidden=true;});document.body.append(frame);
 const fullscreen=document.querySelector('#fullscreen');
 if(!document.fullscreenEnabled)fullscreen.hidden=true;
 fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await frame.requestFullscreen();}catch{window.open(item.path,'_blank','noopener');}});
}
