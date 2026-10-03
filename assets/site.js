(() => {
 'use strict';
 const burger=document.querySelector('#burgerBtn');
 const menu=document.querySelector('#menuOverlay');
 const main=document.querySelector('main');
 const footer=document.querySelector('.site-footer');
 const topButton=document.querySelector('#scrollTopBtn');
 function setMenu(open,restore=false){
  if(!burger||!menu)return;
  menu.classList.toggle('open',open);menu.inert=!open;
  burger.classList.toggle('open',open);burger.setAttribute('aria-expanded',String(open));
  burger.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  if(main)main.inert=open;if(footer)footer.inert=open;if(topButton)topButton.inert=open;
  document.body.style.overflow=open?'hidden':'';
  if(open)menu.querySelector('a')?.focus();else if(restore)burger.focus();
 }
 burger?.addEventListener('click',()=>setMenu(burger.getAttribute('aria-expanded')!=='true',true));
 menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
 document.addEventListener('keydown',event=>{
  if(burger?.getAttribute('aria-expanded')!=='true')return;
  if(event.key==='Escape'){setMenu(false,true);return;}
  if(event.key==='Tab'){
   const items=[burger,...menu.querySelectorAll('a')];
   const first=items[0],last=items.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 matchMedia('(min-width:1051px)').addEventListener('change',e=>{
  if(!e.matches)return;
  const active=document.activeElement;
  const restore=active===burger||menu?.contains(active);
  const href=active?.closest('a')?.getAttribute('href');
  setMenu(false);
  if(restore){
   const destination=[...document.querySelectorAll('.header-nav a')].find(link=>link.getAttribute('href')===href)||document.querySelector('.brand-text-logo');
   destination?.focus({preventScroll:true});
  }
 });
 const tabs=[...document.querySelectorAll('[data-stage]')];
 function selectStage(tab){
  tabs.forEach(item=>{
   const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;
   const panel=document.getElementById(item.getAttribute('aria-controls'));
   if(panel){panel.hidden=!active;panel.classList.toggle('stage-enter',active);}
  });
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectStage(tab));
  tab.addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
   const next=e.key==='Home'?tabs[0]:e.key==='End'?tabs.at(-1):tabs[(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];
   next.focus();selectStage(next);
  });
 });
})();
