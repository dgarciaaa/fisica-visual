'use strict';
const catalog = window.PHYSICS_CATALOG;
const symbols = {'mecanica-clasica':'↗','ondas-y-acustica':'∿','termodinamica':'°','mecanica-cuantica':'ψ','mecanica-estadistica':'Σ'};
const areaNames = Object.fromEntries(catalog.areas.map(a=>[a.id,a.name]));
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const params = new URLSearchParams(location.search);
let area = catalog.areas.some(a=>a.id===params.get('area')) ? params.get('area') : 'all';
let query = params.get('q') || '';
let limit = 12;
const search = document.querySelector('#search');
search.value = query;
const filters = document.querySelector('#filters');
for (const a of [{id:'all',name:'Todas',count:catalog.items.length},...catalog.areas]) {
 const button=document.createElement('button');button.className='filter';button.dataset.area=a.id;button.append(document.createTextNode(a.name));
 const count=document.createElement('span');count.textContent=a.count;button.append(count);
 button.addEventListener('click',()=>{area=a.id;limit=12;render();});filters.append(button);
}
function updateUrl(){const p=new URLSearchParams();if(area!=='all')p.set('area',area);if(query)p.set('q',query);history.replaceState(null,'',location.pathname+(p.size?'?'+p:'')+location.hash);}
function render(){
 document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.area===area)));
 const words=normalize(query.trim()).split(/\s+/).filter(Boolean);
 const results=catalog.items.filter(i=>(area==='all'||i.area===area)&&words.every(w=>normalize(i.title+' '+i.description+' '+areaNames[i.area]+' '+i.id).includes(w)));
 const grid=document.querySelector('#catalog-grid');grid.replaceChildren();
 for(const item of results.slice(0,limit)){
  const link=document.createElement('a');link.className='catalog-card';
  const p=new URLSearchParams({sim:item.id});if(area!=='all')p.set('area',area);if(query)p.set('q',query);
  link.href='laboratorio.html?'+p;
  const top=document.createElement('div');top.className='card-top';
  const symbol=document.createElement('span');symbol.className='area-symbol '+item.area;symbol.textContent=symbols[item.area];symbol.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.className='area-label';label.textContent=areaNames[item.area];
  const arrow=document.createElement('span');arrow.className='card-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');top.append(symbol,label,arrow);
  const title=document.createElement('h3');title.textContent=item.title;
  const desc=document.createElement('p');desc.textContent=item.description || 'Abre el laboratorio y explora sus variables.';
  link.append(top,title,desc);grid.append(link);
 }
 document.querySelector('#result-count').textContent=results.length+' visualizacion'+(results.length===1?' disponible':'es disponibles');
 document.querySelector('#empty').hidden=results.length>0;
 document.querySelector('#load-more').hidden=limit>=results.length;
 document.querySelector('#page-count').textContent=results.length?'Mostrando '+Math.min(limit,results.length)+' de '+results.length:'';
 updateUrl();
}
search.addEventListener('input',()=>{query=search.value;limit=12;render();});
document.querySelector('#clear-search').addEventListener('click',()=>{query='';area='all';limit=12;search.value='';render();search.focus();});
document.querySelector('#load-more').addEventListener('click',()=>{const previous=limit;limit+=12;render();document.querySelectorAll('.catalog-card')[previous]?.focus({preventScroll:true});});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){event.preventDefault();search.focus();}});
document.querySelector('[data-total]').textContent=catalog.items.length;
render();
// A lightweight wave surface: no external libraries or network requests.
const canvas=document.querySelector('#wave'),ctx=canvas.getContext('2d');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduceMotion.matches, time=0, last=0, frameId=null, visible=true;
const motionButton=document.querySelector('#motion-toggle');
const amplitude=document.querySelector('#amplitude');
function setMotionLabel(){motionButton.textContent=paused?'▶':'Ⅱ';motionButton.setAttribute('aria-label',paused?'Reanudar animación':'Pausar animación');motionButton.setAttribute('aria-pressed',String(paused));}
function draw(){
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const amp=Number(amplitude.value)/100;
 ctx.save();ctx.translate(w*.49,h*.55);
 for(let row=0;row<27;row++){
  const z=row/26,depth=z-.5;ctx.beginPath();
  for(let n=0;n<=100;n++){
   const t=n/100,x=(t-.5)*w*.78;
   const envelope=Math.sin(t*Math.PI);
   const wave=Math.sin(t*Math.PI*3.5-time+depth*3)*amp*h*.27*envelope;
   const px=x+depth*w*.23,py=depth*h*.30+wave-x*.10;
   n?ctx.lineTo(px,py):ctx.moveTo(px,py);
  }
  ctx.strokeStyle=`rgba(${75+row*2},${103+row},${44+row},${.28+z*.40})`;ctx.lineWidth=.85;ctx.stroke();
 }
 ctx.restore();
}
function tick(now){frameId=null;if(paused||!visible||document.hidden)return;time+=Math.min((now-last)/1000,.04)*.9;last=now;draw();frameId=requestAnimationFrame(tick);}
function schedule(){if(frameId!==null){cancelAnimationFrame(frameId);frameId=null;}if(!paused&&visible&&!document.hidden){last=performance.now();frameId=requestAnimationFrame(tick);}}
motionButton.addEventListener('click',()=>{paused=!paused;setMotionLabel();schedule();});
amplitude.addEventListener('input',()=>{document.querySelector('#amplitude-value').textContent=amplitude.value+'%';draw();});
reduceMotion.addEventListener('change',event=>{paused=event.matches;setMotionLabel();schedule();});
new ResizeObserver(draw).observe(canvas);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();}).observe(canvas);
document.addEventListener('visibilitychange',schedule);
setMotionLabel();draw();schedule();
