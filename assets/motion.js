(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let lenis=null;
 if(!reduced.matches&&matchMedia('(pointer:fine)').matches&&window.Lenis){
  lenis=new window.Lenis({duration:1.05,smoothWheel:true,syncTouch:false});
  const raf=time=>{if(lenis){lenis.raf(time);requestAnimationFrame(raf);}};requestAnimationFrame(raf);
  new MutationObserver(()=>{if(lenis)document.body.style.overflow==='hidden'?lenis.stop():lenis.start();}).observe(document.body,{attributes:true,attributeFilter:['style']});
 }
 document.addEventListener('click',event=>{
  const a=event.target.closest('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const url=new URL(a.href,location.href);
  if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
  let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{return;}
  const target=document.getElementById(id);if(!target)return;
  event.preventDefault();
  // Menu links can reach this handler before the overflow observer restarts Lenis.
  if(lenis){if(document.body.style.overflow!=='hidden')lenis.start();lenis.scrollTo(target,{offset:-(document.querySelector('.site-header')?.getBoundingClientRect().height||84)});}else target.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
  history.pushState(null,'',url.hash);
  if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 });
 const header=document.querySelector('.site-header');
 const menu=document.querySelector('#menuOverlay');
 const topButton=document.querySelector('#scrollTopBtn');
 let scheduled=false;
 function updateChrome(){
  scheduled=false;
  const probe=(header?.getBoundingClientRect().height||84)+2;
  const light=[...document.querySelectorAll('.light-stage')].some(el=>{const r=el.getBoundingClientRect();return r.top<=probe&&r.bottom>probe;});
  document.body.classList.toggle('on-light',light&&!menu?.classList.contains('open'));
  header?.classList.toggle('is-scrolled',scrollY>20);
  topButton?.classList.toggle('show',scrollY>600);
 }
 function scheduleChrome(){if(!scheduled){scheduled=true;requestAnimationFrame(updateChrome);}}
 addEventListener('scroll',scheduleChrome,{passive:true});addEventListener('resize',scheduleChrome);
 if(menu)new MutationObserver(scheduleChrome).observe(menu,{attributes:true,attributeFilter:['class']});
 updateChrome();
 topButton?.addEventListener('click',()=>lenis?lenis.scrollTo(0):scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));
 const art=[...document.querySelectorAll('.svg-logo-item')];
 function draw(el){
  const paths=[...el.querySelectorAll('path')];
  if(reduced.matches){paths.forEach(p=>{p.style.strokeDashoffset='0';});return;}
  paths.forEach(p=>{p.style.transition='none';const length=p.getTotalLength();p.style.strokeDasharray=length;p.style.strokeDashoffset=String(length);});
  requestAnimationFrame(()=>requestAnimationFrame(()=>paths.forEach(p=>{p.style.transition='';p.style.strokeDashoffset='0';})));
 }
 document.querySelector('[data-redraw]')?.addEventListener('click',()=>art.forEach(draw));
 if(!reduced.matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');observer.unobserve(e.target);}}),{threshold:.08});
  document.querySelectorAll('.project-card,.pricing-card,.section-heading,.about-layout,.service-task,.service-blueprint,.single-comment-box').forEach(el=>{el.classList.add('motion-reveal');observer.observe(el);});
  document.documentElement.classList.add('motion-ready');
  const artworkObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){draw(e.target);artworkObserver.unobserve(e.target);}}),{threshold:.3});art.forEach(el=>artworkObserver.observe(el));
 }
 reduced.addEventListener('change',event=>{
  if(event.matches){lenis?.destroy();lenis=null;document.documentElement.classList.remove('motion-ready');art.forEach(draw);}
 });
})();
