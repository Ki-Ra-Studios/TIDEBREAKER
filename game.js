(()=>{"use strict";
const c=document.getElementById("game"),g=c.getContext("2d",{alpha:false}),$=id=>document.getElementById(id);
let W=innerWidth,H=innerHeight,dpr=1,last=0;
const S={run:false,t:0,depth:0,scrap:0,oxy:100,speed:95,best:+localStorage.tideBest||0,shake:0,spawn:0};
const sub={x:0,y:0,targetX:0,targetY:0};
const rocks=[],bubbles=[],fish=[],wrecks=[];
const touch={on:false,x:0,y:0,sx:0,sy:0};

function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;c.width=W*dpr;c.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);if(!sub.x){sub.x=W/2;sub.y=H*.55} }
addEventListener("resize",resize);resize();
$("play").onclick=start;$("again").onclick=start;

function start(){
 S.run=true;S.t=0;S.depth=0;S.scrap=0;S.oxy=100;S.speed=95;S.shake=0;S.spawn=.2;
 sub.x=W/2;sub.y=H*.55;sub.targetX=sub.x;sub.targetY=sub.y;
 rocks.length=bubbles.length=fish.length=wrecks.length=0;
 $("start").classList.add("hidden");$("over").classList.add("hidden");toast("DESCENT STARTED");
}
function toast(t){let e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),900)}

c.addEventListener("pointerdown",e=>{touch.on=true;touch.sx=e.clientX;touch.sy=e.clientY;touch.x=e.clientX;touch.y=e.clientY});
c.addEventListener("pointermove",e=>{if(touch.on){touch.x=e.clientX;touch.y=e.clientY;sub.targetX=e.clientX;sub.targetY=e.clientY}});
c.addEventListener("pointerup",()=>touch.on=false);c.addEventListener("pointercancel",()=>touch.on=false);
addEventListener("keydown",e=>{
 if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")sub.targetX-=90;
 if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")sub.targetX+=90;
 if(e.key==="ArrowUp"||e.key.toLowerCase()==="w")sub.targetY-=90;
 if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")sub.targetY+=90;
});

function spawn(){
 const r=Math.random();
 if(r<.58)rocks.push({x:20+Math.random()*(W-40),y:-35,r:12+Math.random()*22,rot:Math.random()*7,vy:40+Math.random()*75});
 else if(r<.82)fish.push({x:Math.random()<.5?-40:W+40,y:90+Math.random()*(H-130),vx:35+(Math.random()*30),s:.7+Math.random()*.8});
 else wrecks.push({x:40+Math.random()*(W-80),y:-50,r:22+Math.random()*12});
}

function burst(x,y,n=8){
 for(let i=0;i<n;i++){let a=Math.random()*7,s=10+Math.random()*55;bubbles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-30,r:1+Math.random()*3,life:.4+Math.random()*.8})}
}

function update(dt){
 S.t+=dt;S.depth+=S.speed*dt*.09;S.speed=Math.min(210,S.speed+dt*2.1);S.oxy-=dt*(.9+S.depth/1300);S.spawn-=dt;
 if(S.spawn<=0){spawn();S.spawn=Math.max(.18,.55-S.depth/3000);if(Math.random()<.7)burst(sub.x+12,sub.y+8,2)}
 if(S.oxy<=0){gameOver();return}
 sub.targetX=Math.max(35,Math.min(W-35,sub.targetX));sub.targetY=Math.max(95,Math.min(H-45,sub.targetY));
 sub.x+=(sub.targetX-sub.x)*Math.min(1,dt*5);sub.y+=(sub.targetY-sub.y)*Math.min(1,dt*5);

 for(let i=rocks.length-1;i>=0;i--){let o=rocks[i];o.y+=o.vy*dt+S.speed*.22*dt;o.rot+=dt;
   if(Math.hypot(o.x-sub.x,o.y-sub.y)<o.r+18){S.oxy-=18;S.shake=12;burst(sub.x,sub.y,14);rocks.splice(i,1);continue}
   if(o.y>H+50)rocks.splice(i,1);
 }
 for(let i=wrecks.length-1;i>=0;i--){let o=wrecks[i];o.y+=S.speed*.4*dt;
   if(Math.hypot(o.x-sub.x,o.y-sub.y)<o.r+22){S.scrap+=10;S.oxy=Math.min(100,S.oxy+7);burst(o.x,o.y,18);wrecks.splice(i,1);toast("+10 SCRAP");continue}
   if(o.y>H+60)wrecks.splice(i,1);
 }
 for(let i=fish.length-1;i>=0;i--){let f=fish[i];f.x+=f.vx*(f.x<0?1:-1)*dt;f.y+=Math.sin(S.t*3+f.x*.01)*8*dt;
   if(Math.hypot(f.x-sub.x,f.y-sub.y)<25){S.oxy-=4;burst(f.x,f.y,6)}
   if(f.x<-80||f.x>W+80)fish.splice(i,1);
 }
 for(let i=bubbles.length-1;i>=0;i--){let b=bubbles[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0)bubbles.splice(i,1)}
 S.shake=Math.max(0,S.shake-dt*20);render();hud();
}

function gameOver(){
 S.run=false;S.best=Math.max(S.best,Math.floor(S.depth));localStorage.tideBest=S.best;
 $("endDepth").textContent=Math.floor(S.depth);$("endScrap").textContent=S.scrap;$("over").classList.remove("hidden");
}
function hud(){$("depth").textContent=Math.floor(S.depth);$("scrap").textContent=S.scrap;$("best").textContent=S.best;$("oxy").textContent=Math.max(0,Math.ceil(S.oxy));$("oxybar").style.width=Math.max(0,S.oxy)+"%"}

function render(){
 g.save();g.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#063142");bg.addColorStop(.55,"#052330");bg.addColorStop(1,"#020a10");g.fillStyle=bg;g.fillRect(-20,-20,W+40,H+40);
 // light rays
 g.globalAlpha=.08;g.fillStyle="#70e7ff";for(let i=0;i<5;i++){g.beginPath();g.moveTo(W*.5,H*.08);g.lineTo(W*(i*.3-.1),H);g.lineTo(W*(i*.3+.12),H);g.closePath();g.fill()}g.globalAlpha=1;
 // distant ruins
 g.strokeStyle="#0c5366";g.lineWidth=2;
 for(let i=0;i<9;i++){let xx=(i+.5)*W/9,yy=H*.42+((i*37)%70);g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+12,yy-45);g.lineTo(xx+26,yy);g.stroke()}
 // wrecks
 for(const o of wrecks){g.save();g.translate(o.x,o.y);g.rotate(-.15);g.fillStyle="#5d6e70";g.beginPath();g.moveTo(-o.r,-o.r*.3);g.lineTo(-o.r*.3,-o.r);g.lineTo(o.r,.2*o.r);g.lineTo(o.r*.5,o.r);g.lineTo(-o.r*.7,o.r*.7);g.closePath();g.fill();g.strokeStyle="#8ba0a0";g.stroke();g.restore()}
 // rocks
 for(const o of rocks){g.save();g.translate(o.x,o.y);g.rotate(o.rot);g.fillStyle="#263b40";g.strokeStyle="#49636a";g.beginPath();for(let i=0;i<7;i++){let a=i*Math.PI*2/7,rr=o.r*(.7+Math.sin(i*9)*.2);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.closePath();g.fill();g.stroke();g.restore()}
 // fish
 for(const f of fish){g.save();g.translate(f.x,f.y);if(f.x>W/2)g.scale(-1,1);g.fillStyle="#4e9aa3";g.beginPath();g.ellipse(0,0,12,6,0,0,7);g.fill();g.beginPath();g.moveTo(-8,0);g.lineTo(-17,-7);g.lineTo(-17,7);g.closePath();g.fill();g.restore()}
 // sub
 g.save();g.translate(sub.x,sub.y);g.shadowBlur=20;g.shadowColor="#70e7ff";g.fillStyle="#c9e8eb";g.beginPath();g.ellipse(0,0,27,13,0,0,7);g.fill();g.shadowBlur=0;g.fillStyle="#31545b";g.fillRect(-13,-17,26,8);g.fillStyle="#70e7ff";g.beginPath();g.arc(0,-14,7,0,7);g.fill();g.fillStyle="#15343c";g.beginPath();g.arc(0,-14,4,0,7);g.fill();g.fillStyle="#719399";g.fillRect(23,-3,10,6);g.restore();
 for(const b of bubbles){g.globalAlpha=Math.max(0,b.life);g.strokeStyle="#8eefff";g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.stroke();g.globalAlpha=1}
 g.restore();
}
function loop(t){let dt=Math.min(.033,(t-last)/1000||0);last=t;if(S.run)update(dt);else render();requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();