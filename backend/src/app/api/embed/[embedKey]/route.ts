import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ embedKey: string }> }
) {
  const { embedKey } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3001";
  const bpWebhookSecret = process.env.BP_WEBHOOK_SECRET?.trim() ?? "";

  const script = `
(function(){
  var EMBED_KEY=${JSON.stringify(embedKey)};
  var BASE=${JSON.stringify(baseUrl)};
  window.__piq_bp_webhook_secret=${JSON.stringify(bpWebhookSecret)};
  var FP_KEY="piq_fp";
  var startTime=Date.now();

  function getFingerprint(){
    try{
      var existing=localStorage.getItem(FP_KEY);
      if(existing)return existing;
    }catch(e){}
    var fp="fp_"+Math.random().toString(36).slice(2)+Date.now().toString(36);
    try{localStorage.setItem(FP_KEY,fp);}catch(e){}
    return fp;
  }

  function postFingerprint(){
    var fingerprint=getFingerprint();
    return fetch(BASE+"/api/fingerprint",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        embedKey:EMBED_KEY,
        fingerprint:fingerprint,
        path:location.pathname,
        title:document.title,
        language:(navigator.language||"en").split("-")[0],
        referrer:document.referrer||undefined
      })
    }).then(function(r){return r.json();});
  }

  function flushTime(){
    var ms=Date.now()-startTime;
    if(ms<1000)return;
    var detail=window.__piq_last||{};
    if(!detail.visitorId)return;
    fetch(BASE+"/api/fingerprint",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        embedKey:EMBED_KEY,
        fingerprint:getFingerprint(),
        path:location.pathname,
        title:document.title,
        language:(navigator.language||"en").split("-")[0]
      })
    }).catch(function(){});
  }

  postFingerprint().then(function(res){
    if(res&&res.success&&res.data){
      window.__piq_last=res.data;
      window.dispatchEvent(new CustomEvent("presenceiq:ready",{
        detail:{
          visitorId:res.data.visitorId,
          businessId:res.data.businessId,
          sessionId:res.data.sessionId,
          returnCount:res.data.returnCount,
          isKnownVisitor:res.data.isKnownVisitor
        }
      }));
    }
  }).catch(function(err){
    console.error("[PresenceIQ] fingerprint failed",err);
  });

  document.addEventListener("visibilitychange",function(){
    if(document.visibilityState==="hidden")flushTime();
  });
  window.addEventListener("beforeunload",flushTime);
})();
`.trim();

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
