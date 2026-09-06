import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const out = resolve('public');
const origin = 'https://kendrick-communication.rnd4-anj.chatgpt.site';
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>';
const play = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 10 7-10 7V5Z" stroke="currentColor" stroke-width="1.5"/></svg>';
const mic = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8" stroke="currentColor" stroke-width="1.5"/></svg>';
const sound = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3V9Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" stroke="currentColor" stroke-width="1.5"/></svg>';
const check = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="1.5"/></svg>';
// Section headings stand on their own; repeated uppercase kickers made the site
// feel templated and added little useful context.
const line = () => '';
const link = (href, label, cls='button') => `<a class="${cls}" href="${href}">${label}${arrow}</a>`;
const wave = (cls='') => `<div class="wave ${cls}" aria-hidden="true">${[8,15,27,17,35,52,34,20,40,64,45,24,34,58,38,19,33,47,28,12,23,35,19,9].map((h,i)=>`<i style="--h:${h}px;--i:${i}"></i>`).join('')}</div>`;

function brand(dark=false) {
  return `<a class="brand" href="/" aria-label="Kendrick home"><span class="brand-crop"><img src="/assets/kendrick-${dark?'dark':'light'}.png" alt="Kendrick" width="674" height="506" /></span></a>`;
}
const navigation = [['/product/','The product'],['/everyday/','Everyday life'],['/approach/','Our approach'],['/about/','About']];
function header(path) {
  return `<div class="announcement"><a href="/get-kendrick/">Introducing Kendrick. A little support for the words that matter. <span>Meet your companion ${arrow}</span></a></div>
  <header class="site-header"><div class="nav-shell">${brand()}<nav class="desktop-nav" aria-label="Main navigation">${navigation.map(([url,name])=>`<a href="${url}" ${path===url?'aria-current="page"':''}>${name}</a>`).join('')}</nav>${link('/get-kendrick/','Get Kendrick','button nav-cta')}<button class="menu-toggle" type="button" aria-label="Open menu" aria-controls="mobile-nav" aria-expanded="false"><span></span><span></span></button></div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>${navigation.map(([url,name])=>`<a href="${url}" ${path===url?'aria-current="page"':''}>${name}${arrow}</a>`).join('')}${link('/get-kendrick/','Get Kendrick')}</nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="footer-top wrap"><p>A little support.<br><span>A lot more you.</span></p><div class="footer-links"><div><span>Discover</span><a href="/product/">The product</a><a href="/everyday/">Everyday life</a><a href="/get-kendrick/">Kendrick for iPhone</a></div><div><span>Our perspective</span><a href="/approach/">Our approach</a><a href="/about/">About Kendrick</a><a href="/privacy/">Privacy</a></div></div></div><div class="footer-wordmark wrap" aria-hidden="true">Kendrick</div></footer>`;
}
function phone({mode='review',id='',compact=false}={}) {
  return `<div class="phone ${compact?'phone-compact':''}" ${id?`id="${id}"`:''} role="img" aria-label="Illustrative Kendrick iPhone preview: listen, review your sentence, then choose to speak or copy it."><div class="phone-status"><span>9:41</span><span class="phone-island"></span><span>▮▮▮ <span class="battery"></span></span></div><div class="phone-app"><span class="phone-wordmark">Kendrick</span><span class="phone-date">A little space to say it.</span><div class="phone-main" data-phone-main>${mode==='listen'?`<span class="phone-kicker">AT YOUR PACE</span><h3>Take your time.<br>I’m listening.</h3>${wave()}<p class="phone-fragments">“coffee… oat milk…<br>no sugar, please”</p><div class="phone-bottom-label">Tap when you’re ready</div><span class="phone-action">Done speaking ${check}</span>`:`<span class="phone-kicker">DOES THIS SAY WHAT YOU MEAN?</span><h3>“A coffee with<br>oat milk and<br>no sugar, please.”</h3><div class="phone-note">Your draft. Your final say.</div><div class="phone-edit">Make a change <span>↗</span></div><span class="phone-action">${sound} Speak this</span><span class="phone-copy">Copy as text</span>`}</div><div class="phone-tabs"><span>${mic} Speak</span><span>▤ Saved phrases</span></div></div><div class="home-indicator"></div></div>`;
}
const faqs = [
  ['What is Kendrick?', 'Kendrick is an assistive communication project being built for iPhone. The intended experience takes spoken or typed fragments, suggests a complete sentence, and lets the speaker review it before speaking or copying it.'],
  ['Who is it being designed for?', 'People who find it difficult to get their words into a sentence, including people with speech or language differences. Support for particular communication needs must be evaluated with the people who have those needs.'],
  ['Will Kendrick speak for me automatically?', 'The product is being designed around a review step. You see the suggested sentence, make any changes, and choose when to speak or copy it.'],
  ['Does the website record my voice?', 'No. The demonstrations on this website use written examples. They do not activate your microphone, process speech, or send conversation text to an AI service.']
];
function faq(items=faqs) {return `<div class="faq-list">${items.map(([q,a])=>`<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div>`;}
function intro(kicker,title,copy,cls='') {return `<section class="page-intro wrap ${cls}">${line(kicker)}<h1>${title}</h1><p class="lede">${copy}</p></section>`;}

const home = `<section class="home-hero-v2 wrap">
  <div class="home-hero-copy reveal">
    <h1>For everything<br><em>you want to say.</em></h1>
    <p>An AI companion for the moments words don’t come easily. A little help shaping your thoughts. A lot more room to be yourself.</p>
    <div class="home-hero-actions">${link('/get-kendrick/','Meet Kendrick')}<a class="text-link" href="/product/#walkthrough">${play} See how it works</a></div>
  </div>
  <div class="home-hero-stage reveal" aria-label="Kendrick in everyday life">
    <img src="/assets/conversation.png" alt="Two friends enjoying a quiet conversation at an outdoor café" width="1536" height="1024" fetchpriority="high">
    <div class="home-hero-shade"></div>
    <p class="home-scene-caption">The little moments.<br><em>They’re everything.</em></p>
    <div class="home-hero-phone">${phone()}</div>
  </div>
</section>
<section class="home-positioning-v2">
  <div class="wrap reveal">
    <h2>Sometimes, the words just need <em>a little support.</em></h2>
    <p>Ordering your usual. Telling a story. Saying what you need. Kendrick is being built to help you stay in the conversation.</p>
  </div>
</section>
<section class="home-flow-v2 wrap" id="home-product">
  <header class="home-section-heading reveal">
    <h2>A few words.<br><em>A whole thought.</em></h2>
    <div><p>A simple journey from what you have to what you want to say.</p>${link('/product/','Explore the product','text-link')}</div>
  </header>
  <div class="home-flow-grid">
    <article class="reveal">
      <span class="home-step-number">01</span>
      <div class="home-step-demo home-step-listen"><p>“coffee… oat milk…<br>no sugar, please”</p>${wave('small-wave')}</div>
      <h3>Say it your way.</h3>
      <p>Start with speech or a few typed words. There’s no perfect sentence to prepare.</p>
    </article>
    <article class="reveal">
      <span class="home-step-number">02</span>
      <div class="home-step-demo home-step-draft"><p>A coffee with oat milk<br>and no sugar, please.</p><span>Suggested wording ${check}</span></div>
      <h3>Find the words together.</h3>
      <p>Review a suggested sentence. Keep it, change it, or go back. Your meaning comes first.</p>
    </article>
    <article class="reveal">
      <span class="home-step-number">03</span>
      <div class="home-step-demo home-step-share">${sound}<p>Say it aloud.<br>Or send it as text.</p></div>
      <h3>You have the final say.</h3>
      <p>Choose when to speak or copy the sentence. Keep the conversation moving in your own way.</p>
    </article>
  </div>
</section>
<section class="home-moments-v2">
  <div class="wrap">
    <header class="home-section-heading reveal">
      <h2>Life doesn’t happen<br><em>in a text box.</em></h2>
      ${link('/everyday/','See the everyday possibilities','text-link')}
    </header>
    <div class="home-moment-grid">
      <a class="home-moment-card home-moment-primary reveal" href="/everyday/#out-and-about"><h3>The morning coffee.</h3><p>A small order. A little independence.</p>${arrow}</a>
      <a class="home-moment-card home-moment-secondary reveal" href="/everyday/#with-your-people"><h3>The family catch-up.</h3><p>A thought you’ve been holding. A chance to share it.</p>${arrow}</a>
      <a class="home-moment-card home-moment-tertiary reveal" href="/everyday/#in-the-classroom"><h3>The question in class.</h3><p>An idea worth hearing. Words to put it out there.</p>${arrow}</a>
    </div>
  </div>
</section>
<section class="home-principles-v2">
  <div class="wrap">
    <div class="home-principles-intro reveal"><h2>Your voice.<br>Your meaning.<br><em>Your decision.</em></h2>${link('/approach/','Meet our approach','text-link')}</div>
    <div class="home-principles-list">
      <article class="reveal"><h3>The speaker stays in control.</h3><p>Every suggestion is a draft. The person using Kendrick decides what gets said.</p></article>
      <article class="reveal"><h3>Uncertainty deserves a pause.</h3><p>Our goal is to ask when meaning is unclear, instead of filling the gap with a guess.</p></article>
      <article class="reveal"><h3>Trust has to be earned.</h3><p>We’re building a prototype. Performance and accessibility need real evaluation, with real people.</p></article>
    </div>
  </div>
</section>
<section class="home-faq-v2 wrap">
  <header class="reveal"><h2>Questions,<br><em>answered plainly.</em></h2><p>Kendrick is early. Here’s what the project is—and what it isn’t.</p></header>
  <div class="reveal">${faq(faqs.slice(0,3))}</div>
</section>`;

const product = `${intro('THE PRODUCT','A little help.<br><em>On your terms.</em>','Meet the communication companion we’re building for iPhone. From a few words to a sentence you choose to share.')}
<section class="product-walk wrap" id="walkthrough"><div class="walk-copy">${line('A WALK THROUGH KENDRICK')}<h2 id="walk-title">Start with<br>what you have.</h2><p id="walk-description">Tap Listen and take your time. The intended app will capture your words, with typing available whenever you prefer.</p><div class="walk-controls" role="group" aria-label="Illustrative walkthrough steps"><button type="button" data-step="0" aria-pressed="true"><span>01</span> Listen</button><button type="button" data-step="1" aria-pressed="false"><span>02</span> Review</button><button type="button" data-step="2" aria-pressed="false"><span>03</span> Share</button></div><p class="walk-disclaimer">An interactive illustration of the planned app.<br>No microphone or AI processing on this website.</p><button type="button" class="text-link replay" id="replay-walk">${play} Play the walkthrough</button></div><div class="walk-phone-stage">${phone({mode:'listen',id:'walk-phone'})}<span class="stage-label">KENDRICK FOR iPHONE · PRODUCT PREVIEW</span></div></section>
<section class="product-details wrap"><div class="section-heading"><h2>Small details.<br><em>Real consideration.</em></h2><p>The product decisions shaping<br>the first version of Kendrick.</p></div><div class="detail-grid"><article><span>01</span><h3>Room to take your time.</h3><p>A clear start and stop, without asking you to rush a thought. The listening experience is a priority for the iPhone build.</p></article><article><span>02</span><h3>A chance to change it.</h3><p>Review the words before they leave your phone. Edit a detail, choose a different sentence, or start again.</p></article><article><span>03</span><h3>More than one way in.</h3><p>Speak when that works for you. Type fragments when it doesn’t. The goal is useful support, on your terms.</p></article><article><span>04</span><h3>Words worth keeping close.</h3><p>We plan to put useful phrases within easy reach, so familiar requests don’t need to be composed each time.</p></article></div></section><section class="dark-statement"><div class="wrap">${line('BUILT AROUND ONE SIMPLE BELIEF')}<h2>A clearer sentence<br>should still be<br><em>your sentence.</em></h2>${link('/approach/','The thinking behind Kendrick','text-link')}</div></section>`;

const everyday = `${intro('EVERYDAY LIFE','For the small things.<br><em>And the everything things.</em>','Communication is part of living. These are a few of the moments guiding the way we’re building Kendrick.')}
<section class="everyday-feature wrap"><img src="/assets/conversation.png" alt="Friends talking together outdoors" width="1536" height="1024"><div>${line('MORE ROOM FOR CONNECTION')}<h2>Be part of<br>the moment.</h2><p>A conversation can be an order, a question, a story, or simply a way of being together.</p></div></section>
<div class="use-cases wrap"><section id="out-and-about"><div class="use-case-title">${line('01 / OUT AND ABOUT')}<h2>Your usual.<br><em>In your words.</em></h2><p>The coffee order. The question at the counter. An everyday exchange that should belong to you.</p></div><div class="sentence-pair"><span>A FEW WORDS</span><p>“coffee… oat milk… no sugar”</p><div class="pair-divider">${arrow}</div><span>A POSSIBLE SENTENCE</span><p>“A coffee with oat milk and no sugar, please.”</p></div></section><section id="with-your-people"><div class="use-case-title">${line('02 / WITH YOUR PEOPLE')}<h2>Keep your place<br><em>in the story.</em></h2><p>Share a plan. Ask about someone’s day. Let the people around you hear what’s on your mind.</p></div><div class="sentence-pair"><span>A FEW WORDS</span><p>“want park… with you… tomorrow”</p><div class="pair-divider">${arrow}</div><span>A POSSIBLE SENTENCE</span><p>“I want to go to the park with you tomorrow.”</p></div></section><section id="in-the-classroom"><div class="use-case-title">${line('03 / IN THE CLASSROOM')}<h2>There’s a thought<br><em>worth hearing.</em></h2><p>A question doesn’t need to arrive perfectly formed to deserve an answer.</p></div><div class="sentence-pair"><span>A FEW WORDS</span><p>“last part… explain again… please”</p><div class="pair-divider">${arrow}</div><span>A POSSIBLE SENTENCE</span><p>“Could you explain the last part again, please?”</p></div></section></div><p class="wrap example-note">These are illustrative scenarios, not customer stories or measured outcomes.</p>`;

const approach = `${intro('OUR APPROACH','Helpful is only helpful<br><em>when it’s yours.</em>','An AI-generated sentence can sound convincing and still get the meaning wrong. Kendrick starts with that responsibility.')}
<section class="approach-banner wrap"><span>THE PRINCIPLE</span><h2>Assist the expression.<br><em>Respect the person.</em></h2></section>
<div class="approach-rows wrap"><section><span>01</span><div><h2>Make room for the speaker.</h2><p>The person using Kendrick knows what they want to say. Our intended flow keeps the original words alongside a suggestion and gives the speaker the final decision.</p></div><aside>Review comes before speaking.</aside></section><section><span>02</span><div><h2>Ask before assuming.</h2><p>“Call Alex tomorrow” can mean more than one thing. The app should clarify important ambiguity, particularly around names, times, actions, and negation.</p></div><aside>A question is better than an invented detail.</aside></section><section><span>03</span><div><h2>Be honest about what works.</h2><p>The current product is a prototype. We have not established accuracy for particular speech or language conditions. Those claims require evaluation, including testing with intended users.</p></div><aside>No invented accuracy scores.</aside></section><section><span>04</span><div><h2>Treat conversations with care.</h2><p>The website doesn’t record or process conversations. Before the iPhone experience is released, its microphone permissions and data handling must be clear at the point of use.</p></div><aside>Know what happens to your words.</aside></section></div>
<section class="approach-boundary wrap">${line('WHAT WE’RE BUILDING')}<h2>Communication support,<br><em>with clear limits.</em></h2><p>Kendrick is being developed as a tool for expression. It is not a diagnosis, a treatment, or a replacement for a person’s existing communication support. The first release needs to earn its place in someone’s daily life.</p></section>`;

const about = `${intro('ABOUT KENDRICK','The thought is there.<br><em>Let’s make room for it.</em>','We’re building Kendrick around a simple idea: people deserve to take part in the conversations that shape their lives.')}
<section class="about-story wrap"><div class="about-margin">THE IDEA<br><span>01 — ORIGIN</span></div><div><p class="big-copy">So much of life is made of ordinary conversations. A coffee order. A family plan. Something you want someone to understand.</p><p>When expressing a thought takes extra effort, those moments can ask more of a person than the people around them realize.</p><p>Kendrick is our exploration of how AI can help turn a few words into a sentence, while keeping the speaker in control of the meaning and the moment.</p><p>We’re starting with a focused iPhone experience: listen, review, and choose what to share. We’re early, and learning how to make that experience useful is the work ahead.</p></div></section><section class="about-pullquote"><div class="wrap"><span>OUR NORTH STAR</span><h2>More room for<br><em>the person behind<br>the words.</em></h2></div></section><section class="about-status wrap"><h2>A beginning.<br><em>Built with intention.</em></h2><div>${line('WHERE WE ARE TODAY')}<p>Kendrick began as a hackathon project exploring accessible communication. The product is in development. This website shares the direction, the decisions, and the experience we’re working toward.</p>${link('/product/','See the product direction','text-link')}</div></section>`;

const getKendrick = `<section class="get-hero wrap"><div>${line('KENDRICK FOR iPHONE')}<h1>A little support.<br><em>Within reach.</em></h1><p class="lede">We’re bringing Kendrick to the phone that’s already part of your day.</p><div class="release-status"><span class="dot"></span> iPhone app in development</div><p class="release-copy">The app isn’t available to download yet. Explore the preview to see what we’re building.</p>${link('/product/#walkthrough','Explore the product preview')}<span class="availability">No App Store release date has been announced.</span></div><div class="get-phone-stage">${phone({mode:'listen'})}</div></section><section class="release-plan wrap"><h2>The next chapter.</h2><ol><li><span class="done">${check}</span><div><h3>The product direction</h3><p>The experience and principles you can explore here.</p></div><span>NOW</span></li><li><span>02</span><div><h3>The iPhone prototype</h3><p>Listening, sentence review, and speaking or copying a message.</p></div><span>NEXT</span></li><li><span>03</span><div><h3>Testing with people</h3><p>Learn where the app helps, where it fails, and what needs to change.</p></div><span>PLANNED</span></li></ol></section><section class="faq-section wrap"><div><h2>Good to know.</h2></div>${faq(faqs.slice(1))}</section>`;

const privacy = `${intro('PRIVACY','Your words<br><em>deserve care.</em>','A plain-language explanation of this website, and the work ahead for the iPhone app.')}
<article class="privacy-body wrap"><p class="updated">Last updated September 5, 2026</p><h2>This website</h2><p>This is a marketing website. Its product previews use illustrative examples. It does not request microphone access, accept conversation input, or send speech to an AI service.</p><h2>Forms and tracking</h2><p>The site does not include a mailing-list signup, advertising trackers, or an analytics script. We do not store personal information in the browser. Basic hosting services may process connection details needed to deliver a webpage.</p><h2>Fonts and hosting</h2><p>The website uses self-hosted brand assets. If the external font service is available, your browser requests Instrument Serif and DM Sans from Google Fonts; otherwise system fonts are used. That request sends connection information such as an IP address to the font provider. The private preview is hosted through Sites.</p><h2>The planned iPhone app</h2><p>Data handling for the phone app is still being designed. Before release, the app will need a specific privacy notice explaining microphone use, speech processing providers, storage, and deletion. This website does not claim that the future app operates entirely on-device or holds any privacy certification.</p><h2>Your choice</h2><p>You can browse every public-facing page without entering a name, email address, or conversation. A privately hosted preview may require the hosting provider’s sign-in.</p>${link('/approach/','Read our product principles','text-link')}</article>`;

const pages=[
  {path:'/',title:'Kendrick — For everything you want to say',description:'Meet Kendrick, an AI communication companion being built for iPhone. A little help shaping your thoughts, with you in control.',body:home},
  {path:'/product/',title:'The product — Kendrick',description:'Explore the planned Kendrick iPhone experience: start with a few words, review your sentence, and choose what to share.',body:product},
  {path:'/everyday/',title:'Everyday life — Kendrick',description:'See the everyday communication moments shaping Kendrick, from ordering coffee to sharing a thought in class.',body:everyday},
  {path:'/approach/',title:'Our approach — Kendrick',description:'The principles behind Kendrick: speaker control, careful handling of uncertainty, and honest evaluation.',body:approach},
  {path:'/about/',title:'About — Kendrick',description:'Why we are building Kendrick, a communication companion that makes more room for the person behind the words.',body:about},
  {path:'/get-kendrick/',title:'Kendrick for iPhone',description:'Kendrick is being built for iPhone. See the product preview and what comes next.',body:getKendrick},
  {path:'/privacy/',title:'Privacy — Kendrick',description:'How the Kendrick marketing website handles data, and the privacy work planned for the iPhone app.',body:privacy}
];
function document(page) {
  const route = page.path.replaceAll('/','') || 'home';
  const bodyClass = page.path === '/' ? 'home-page' : `inner-page page-${route}`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f3f0e8"><title>${page.title}</title><meta name="description" content="${page.description}"><link rel="canonical" href="${origin}${page.path}"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:type" content="website"><meta property="og:url" content="${origin}${page.path}"><link rel="icon" href="data:,"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet"><link rel="stylesheet" href="/marketing.css"><script src="/site.js" defer></script></head><body class="${bodyClass}"><a class="skip-link" href="#main">Skip to content</a>${header(page.path)}<main id="main">${page.body}</main>${footer()}</body></html>`;
}
await mkdir(out,{recursive:true});
for (const page of pages) { const dir=resolve(out,'.'+page.path); await mkdir(dir,{recursive:true}); await writeFile(resolve(dir,'index.html'),document(page)); }
await writeFile(resolve(out,'404.html'),document({path:'/404',title:'Page not found — Kendrick',description:'Find your way back to Kendrick.',body:`${intro('A SMALL DETOUR','Let’s get you<br><em>back to Kendrick.</em>','The page you were looking for isn’t here.')}<div class="wrap not-found">${link('/','Back to the homepage')}</div>`}));
await writeFile(resolve(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
await writeFile(resolve(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>`<url><loc>${origin}${p.path}</loc></url>`).join('')+'</urlset>');
console.log(`Built ${pages.length} marketing pages, a 404 page, and sitemap.`);
await cp(out,resolve('dist'),{recursive:true});


