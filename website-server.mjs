import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./public/',import.meta.url));
const port=Number(process.env.PORT||4174);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end('Method not allowed');return;}
 try{
  const url=new URL(req.url,'http://localhost');const path=decodeURIComponent(url.pathname);
  if(path.includes('\\')||path.includes('\0'))throw new Error('Invalid path');
  let target=resolve(root,'.'+path);
  if(target!==resolve(root)&&!target.startsWith(resolve(root)+sep))throw new Error('Invalid path');
  const info=await stat(target);
  if(info.isDirectory()){if(!path.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});res.end();return;}target=resolve(target,'index.html');}
  const body=await readFile(target);
  res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'microphone=(), camera=(), geolocation=()','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:body);
 }catch{const body=await readFile(resolve(root,'404.html')).catch(()=>Buffer.from('Page not found'));res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(req.method==='HEAD'?undefined:body);}
}).listen(port,'127.0.0.1',()=>console.log(`Kendrick is running at http://127.0.0.1:${port}`));
