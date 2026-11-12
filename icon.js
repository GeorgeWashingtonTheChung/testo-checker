/* Apex T — live icon v2. Runs after the main script; only replaces window.updateIcon (drawing + favicon + badge).
   Colour chain (shared by neighbouring bands, so every 100-mark matches):
   + side: 0 red · 100 green · 200 blue · 300 violet · 400 gold · 500 white-hot
   − side: 0 orchid · −100 indigo · −200 cobalt · −300 teal · −400 ice · −500 white, on a violet void, bowl-shaped gauge */
(function(){
  const POS=["#ff4d5e","#39d98a","#3aa0ff","#9b6bff","#ffc13d","#fff4d6"];
  const NEG=["#b04ad8","#6a3df0","#2f5bd8","#1fa3b8","#8fe3f0","#ffffff"];
  const hex=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
  const mix=(a,b,t)=>{const x=hex(a),y=hex(b);return "rgb("+x.map((v,i)=>Math.round(v+(y[i]-v)*t)).join(",")+")";};
  function band(score){
    const neg=score<0, a=Math.abs(score), b=Math.min(4,Math.floor(a/100)), f=b===4&&a>=500?1:(a-b*100)/100;
    const P=neg?NEG:POS; return {neg,b,f,c0:P[b],c1:P[b+1],cur:mix(P[b],P[b+1],f)};
  }
  function mover(){ // biggest 24h swing across the group, ignoring hidden gym gains
    const cut=Date.now()-864e5, tot={};
    for(const e of state.events) if(isLive(e)&&!e.h&&e.t>cut&&state.players[e.p]) tot[e.p]=(tot[e.p]||0)+e.d;
    let best=null; for(const id in tot) if(tot[id]&&(!best||Math.abs(tot[id])>Math.abs(best.d))) best={n:state.players[id].name,d:tot[id]};
    return best;
  }
  function draw(ctx,S,score,mv){
    const B=band(score), neg=B.neg, cx=S/2, N=48;
    if(neg){const g=ctx.createRadialGradient(cx,S*.4,S*.05,cx,S*.4,S*.8);g.addColorStop(0,"#1d0f33");g.addColorStop(1,"#06030c");ctx.fillStyle=g;}
    else ctx.fillStyle="#0d0f14";
    ctx.fillRect(0,0,S,S);
    const cy=neg?S*.36:S*.60, r=S*.34, lw=S*.105;
    const pt=(u,rr)=>{const a=u*Math.PI;return neg?[cx-Math.cos(a)*rr,cy+Math.sin(a)*rr]:[cx-Math.cos(a)*rr,cy-Math.sin(a)*rr];};
    ctx.lineWidth=lw; ctx.lineCap="butt";
    for(let i=0;i<N;i++){
      const u0=i/N,u1=(i+1)/N+.004;
      ctx.strokeStyle=mix(B.c0,B.c1,(i+.5)/N); ctx.globalAlpha=(i+.5)/N<=B.f+.001?1:.38;
      ctx.beginPath(); ctx.arc(cx,cy,r,neg?u0*Math.PI:Math.PI+u0*Math.PI,neg?u1*Math.PI:Math.PI+u1*Math.PI); ctx.stroke();
    }
    ctx.globalAlpha=1;
    const needle=pt(Math.max(.02,Math.min(.98,B.f)),r*.74);
    ctx.strokeStyle="#f2f5fa"; ctx.lineWidth=Math.max(2,S*.04); ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(needle[0],needle[1]); ctx.stroke();
    ctx.fillStyle=B.cur; ctx.beginPath(); ctx.arc(cx,cy,S*.05,0,7); ctx.fill();
    const txt=(score<0?"\u2212":"")+Math.abs(score);
    ctx.textAlign="center"; ctx.fillStyle=B.cur;
    ctx.font="800 "+(S*(txt.length>3?.21:.27))+"px ui-rounded,system-ui,sans-serif";
    ctx.fillText(txt,cx,neg?S*.24:S*.95);
    if(mv){
      const up=mv.d>0,col=up?"#39d98a":"#ff4d5e",y=neg?S*.94:S*.13;
      ctx.fillStyle=col;
      if(S<100){ ctx.beginPath(); const t=S*.06; if(up){ctx.moveTo(cx,y-t*1.2);ctx.lineTo(cx-t,y+t*.5);ctx.lineTo(cx+t,y+t*.5);}else{ctx.moveTo(cx,y+t*.5);ctx.lineTo(cx-t,y-t*1.2);ctx.lineTo(cx+t,y-t*1.2);} ctx.fill(); }
      else{ ctx.font="700 "+(S*.095)+"px ui-rounded,system-ui,sans-serif";
        ctx.fillText((up?"\u25B2 ":"\u25BC ")+mv.n.slice(0,7)+" "+(up?"+":"\u2212")+Math.abs(mv.d),cx,y+S*.03); }
    }
  }
  addEventListener("load",()=>{
    window.updateIcon=function(){
      if(!state) return;
      const pid=(ME&&ME.id&&state.players[ME.id])?ME.id:(viewing&&state.players[viewing]?viewing:Object.keys(state.players)[0]);
      if(!pid) return;
      const sc=scoreOf(pid), mv=mover();
      draw($("icontile").getContext("2d"),64,sc,mv);
      const big=document.createElement("canvas"); big.width=big.height=180; draw(big.getContext("2d"),180,sc,mv);
      let fav=document.querySelector("link[rel=icon]");
      if(!fav){fav=document.createElement("link");fav.rel="icon";document.head.appendChild(fav);}
      fav.href=big.toDataURL("image/png");
      if(navigator.setAppBadge){try{navigator.setAppBadge(Math.abs(sc));}catch(_){}}
    };
    try{updateIcon();}catch(_){}
  });
})();
