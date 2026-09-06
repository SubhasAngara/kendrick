document.documentElement.classList.add('js');
const menuToggle=document.querySelector('.menu-toggle');
const mobileNav=document.querySelector('#mobile-nav');
function closeMenu(){menuToggle?.setAttribute('aria-expanded','false');menuToggle?.setAttribute('aria-label','Open menu');if(mobileNav)mobileNav.hidden=true;}
menuToggle?.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')==='true';menuToggle.setAttribute('aria-expanded',String(!open));menuToggle.setAttribute('aria-label',open?'Open menu':'Close menu');mobileNav.hidden=open;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuToggle?.getAttribute('aria-expanded')==='true'){closeMenu();menuToggle.focus();}});
window.matchMedia('(min-width:901px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
document.querySelectorAll('.inner-page main>section,.inner-page main>article,.inner-page main>div').forEach(element=>element.classList.add('reveal'));
const reveals=[...document.querySelectorAll('.reveal')];
if(reveals.length){
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reducedMotion||!('IntersectionObserver'in window))reveals.forEach(element=>element.classList.add('is-visible'));
 else{
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{rootMargin:'0px 0px -8% 0px',threshold:.12});
  reveals.forEach(element=>observer.observe(element));
 }
}
const walkPhone=document.querySelector('#walk-phone');
if(walkPhone){
 const main=walkPhone.querySelector('[data-phone-main]');
 const firstState=main.innerHTML;
 const title=document.querySelector('#walk-title');
 const description=document.querySelector('#walk-description');
 const controls=[...document.querySelectorAll('[data-step]')];
 const replay=document.querySelector('#replay-walk');
 const icon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3V9Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" stroke-width="1.5"/></svg>';
 const states=[
 {title:'Start with<br>what you have.',description:'Tap Listen and take your time. The intended app will capture your words, with typing available whenever you prefer.',html:firstState},
 {title:'A clearer sentence.<br>Still your thought.',description:'See a suggested sentence alongside your words. Change anything that doesn’t say what you mean before you move on.',html:'<span class="phone-kicker">DOES THIS SAY WHAT YOU MEAN?</span><h3>“A coffee with<br>oat milk and<br>no sugar, please.”</h3><div class="phone-note">Your draft. Your final say.</div><div class="phone-edit">Make a change <span>↗</span></div><span class="phone-action">'+icon+' Speak this</span><span class="phone-copy">Copy as text</span>'},
 {title:'Ready when<br>you are.',description:'Choose to speak the sentence aloud or copy it as text. The app should only share a message after you decide it is ready.',html:'<span class="phone-kicker">YOU CHOOSE WHAT GETS SAID</span><h3>A coffee with<br>oat milk and<br>no sugar, please.</h3><div class="phone-note">The sentence you reviewed.</div><div class="phone-edit">Ready to share <span>↗</span></div><span class="phone-action">'+icon+' Speak this</span><span class="phone-copy">Or copy as text</span>'}
 ];
 let timers=[];let running=false;
 function stop(){timers.forEach(clearTimeout);timers=[];running=false;replay.lastChild.textContent=' Play the walkthrough';main.querySelector('.wave')?.classList.remove('animated');}
 function select(i){title.innerHTML=states[i].title;description.textContent=states[i].description;main.innerHTML=states[i].html;controls.forEach((button,j)=>button.setAttribute('aria-pressed',String(i===j)));}
 controls.forEach((button,i)=>button.addEventListener('click',()=>{stop();select(i);}));
 replay.addEventListener('click',()=>{if(running){stop();return;}stop();running=true;select(0);replay.lastChild.textContent=' Pause walkthrough';if(!matchMedia('(prefers-reduced-motion: reduce)').matches)main.querySelector('.wave')?.classList.add('animated');timers=[setTimeout(()=>select(1),3500),setTimeout(()=>select(2),7500),setTimeout(stop,11500)];});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
}
