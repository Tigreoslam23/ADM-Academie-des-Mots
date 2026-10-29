"use strict";
const CACHE="adm-atelier-2.18";
const APP=new URL("adm-v03.html",self.registration.scope).href;
const FILES=[
  "./adm-v03.html","./manifest.webmanifest",
  "./assets/icons/adm-180.png","./assets/icons/adm-192.png","./assets/icons/adm-512.png",
  "./assets/avatars/blaireau.webp","./assets/avatars/renard.webp",
  "./assets/avatars/corbeau.webp","./assets/avatars/hibou.webp",
  "./assets/avatars/chat.webp","./assets/avatars/lievre.webp"
];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("adm-atelier-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=="GET"||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  if(url.pathname===new URL(APP).pathname){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok)await (await caches.open(CACHE)).put(APP,response.clone());
        return response;
      }catch{return await caches.match(APP)||Response.error()}
    })());
  }else if(FILES.some(path=>url.pathname===new URL(path,self.registration.scope).pathname)){
    event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>cached||fetch(request)));
  }
});
