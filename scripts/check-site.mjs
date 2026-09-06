import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve('public');const paths=['/','/product/','/everyday/','/approach/','/about/','/get-kendrick/','/privacy/'];const pages=new Map();
for(const path of paths)pages.set(path,await readFile(resolve(root,'.'+path,'index.html'),'utf8'));
let links=0;
for(const [path,html] of pages){
 assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,`${path} needs one h1`);assert(html.includes('<main id="main">'),`${path} needs main landmark`);assert(!html.includes('96%'),`${path} fabricated confidence`);assert(!html.includes('<textarea'),`${path} must not embed composer`);
 for(const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)){
  const url=match[1];if(!url.startsWith('/')&&!url.startsWith('#'))continue;const[targetPath,hash]=url.split('#');
  if(!targetPath){assert(html.includes(`id="${hash}"`),`${path} anchor ${url} missing`);continue;}
  const target=resolve(root,'.'+targetPath+(targetPath.endsWith('/')?'index.html':''));await stat(target).catch(()=>{throw new Error(`${path}: broken URL ${url}`);});
  if(hash){const doc=pages.get(targetPath)||await readFile(target,'utf8');assert(doc.includes(`id="${hash}"`),`${path}: missing target ${url}`);}links++;
 }
}
const client=await readFile(resolve(root,'site.js'),'utf8');assert(!/getUserMedia|SpeechRecognition|fetch\(/.test(client),'Marketing client must not process conversations');assert(client.includes('prefers-reduced-motion'),'Walkthrough needs reduced motion support');console.log(`PASS: ${pages.size} pages, ${links} internal links/assets, anchors, landmarks, marketing/product separation.`);
