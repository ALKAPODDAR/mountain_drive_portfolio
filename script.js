const chapters=[
{id:"about",number:"01",progress:.14,heading:"ABOUT ME",title:"The person behind the work.",body:"I am a Computer Science graduate building a career around data, analytical thinking and practical problem solving."},
{id:"skills",number:"02",progress:.29,heading:"SKILLS",title:"Tools are only the beginning.",body:"Python · SQL · Power BI · Pandas · Dashboarding"},
{id:"experience",number:"03",progress:.45,heading:"EXPERIENCE",title:"Where I learned by doing.",body:"Internships, apprenticeships, research."},
{id:"projects",number:"04",progress:.61,heading:"PROJECTS",title:"Things I have built and analysed.",body:"Projects: problem, data, approach, insight and result."},
{id:"education",number:"05",progress:.77,heading:"EDUCATION",title:"The foundation of the journey.",body:"Degree, university, graduation year, certifications and relevant coursework."},
{id:"contact",number:"06",progress:.91,heading:"CONTACT",title:"Let's take the next road.",body:"Email: yourname@email.com · LinkedIn: linkedin.com/in/yourname · GitHub: github.com/yourname. Replace with real links:)"}
];
const key="mountain-drive-start-stop-v2";
const svg=document.querySelector("#scene"),path=document.querySelector("#roadPath"),car=document.querySelector("#car"),shadow=document.querySelector("#carShadow"),signs=document.querySelector("#signLayer");
const card=document.querySelector("#card"),no=document.querySelector("#cardNo"),kicker=document.querySelector("#cardKicker"),title=document.querySelector("#cardTitle"),body=document.querySelector("#cardBody"),chapterName=document.querySelector("#chapterName"),bar=document.querySelector("#progressBar");
const signal=document.querySelector("#signalButton"),status=document.querySelector("#statusText"),statusBox=document.querySelector(".status"),mobileDetails=document.querySelector("#mobileDetailsButton");
let p=.015,running=false,last=performance.now();

function load(){
 let saved={};try{saved=JSON.parse(localStorage.getItem(key)||"{}")}catch(e){}
 document.querySelectorAll("[data-edit-key]").forEach(el=>{
   if(saved[el.dataset.editKey]!=null)el.innerHTML=saved[el.dataset.editKey];
   el.addEventListener("blur",()=>{let d={};try{d=JSON.parse(localStorage.getItem(key)||"{}")}catch(e){}d[el.dataset.editKey]=el.innerHTML;localStorage.setItem(key,JSON.stringify(d));});
 });
}
load();

const total=path.getTotalLength();
const CAMERA_W=620;
const CAMERA_H=465;
const CAR_X=.50;
const CAR_Y=.74;

function point(t){
 const l=Math.max(0,Math.min(total,t*total)),q=path.getPointAtLength(l);
 return {x:q.x,y:q.y};
}
function tangent(t){
 const l=Math.max(0,Math.min(total,t*total));
 const a=path.getPointAtLength(Math.max(0,l-3)),b=path.getPointAtLength(Math.min(total,l+3));
 return {x:b.x-a.x,y:b.y-a.y};
}
function camera(){
 const q=point(p);
 // The camera follows the car. The car itself remains fixed in the foreground.
 let vx=q.x-CAMERA_W*CAR_X;
 let vy=q.y-CAMERA_H*CAR_Y;
 // Keep following the road all the way through the final CONTACT board.
 // The world has generous artwork beyond the nominal SVG edges, so the camera
 // is intentionally allowed to travel past the old clamp point.
 return {x:vx,y:vy};
}
function worldToScreen(x,y,cam){
 const r=svg.getBoundingClientRect();
 return {x:(x-cam.x)/CAMERA_W*r.width,y:(y-cam.y)/CAMERA_H*r.height,sx:r.width/CAMERA_W,sy:r.height/CAMERA_H};
}
function applyCamera(){
 const cam=camera();
 svg.setAttribute("viewBox",`${cam.x} ${cam.y} ${CAMERA_W} ${CAMERA_H}`);
 // Car is the viewer's fixed foreground reference. It does not rotate.
 const rect=document.querySelector(".experience").getBoundingClientRect();
 const cx=rect.left+rect.width*CAR_X,cy=rect.top+rect.height*CAR_Y;
 car.style.left=cx+"px";car.style.top=cy+"px";
 shadow.style.left=cx+"px";shadow.style.top=(cy+10)+"px";
 // The car body stays completely upright, but the headlights/beam point along the road direction.
 const tv=tangent(Math.min(1,p+.004));
 const tr=Math.atan2(tv.y,tv.x)*180/Math.PI;
 const lightAngle=tr;
 document.querySelectorAll("#car .light").forEach((l,i)=>l.style.transform=`rotate(${lightAngle}deg)`);
 car.style.setProperty("--beam-angle", lightAngle+"deg");
 car.style.setProperty("--beam-scale", Math.max(.8,Math.min(1.35,1+Math.hypot(tv.x,tv.y)/700)));
 placeSigns(cam);
}
function placeSigns(cam){
 chapters.forEach((c,i)=>{
   const q=point(c.progress),t=tangent(c.progress),m=Math.hypot(t.x,t.y)||1;
   const side=i%2===0?-1:1,off=55;
   const sx=q.x+(-t.y/m)*off*side,sy=q.y+(t.x/m)*off*side;
   const s=worldToScreen(sx,sy,cam),el=signs.children[i];
   el.style.left=s.x+"px";el.style.top=s.y+"px";
   const d=Math.abs(p-c.progress);
   el.classList.toggle("active",d<.022);
 });
}
function makeSigns(){
 signs.innerHTML="";
 chapters.forEach(c=>{
  const s=document.createElement("div");s.className="sign";
  const b=document.createElement("div");b.className="board";b.contentEditable="true";b.textContent=c.heading;
  const saved=localStorage.getItem(key+"-sign-"+c.id);if(saved)b.innerHTML=saved;
  b.addEventListener("blur",()=>localStorage.setItem(key+"-sign-"+c.id,b.innerHTML));
  const post=document.createElement("div");post.className="post";s.append(b,post);signs.appendChild(s);
 });
}
makeSigns();
function open(c){no.textContent=c.number;kicker.textContent=c.heading;title.innerHTML=c.title;body.innerHTML=c.body;chapterName.textContent=c.heading;card.classList.add("open"); if(window.matchMedia("(max-width:700px)").matches){body.classList.add("mobile-collapsed");mobileDetails.textContent="VIEW DETAILS";}}
function trigger(i){
 const s=signs.children[i];s.classList.add("passed");setTimeout(()=>s.classList.remove("passed"),800);open(chapters[i]);
}
function cross(prev,next){chapters.forEach((c,i)=>{if(c.progress>prev&&c.progress<=next)trigger(i);});}
function render(){
 applyCamera();
 bar.style.width=(p*100)+"%";
 const near=chapters.reduce((a,c)=>Math.abs(c.progress-p)<Math.abs(a.progress-p)?c:a,chapters[0]);
 chapterName.textContent=Math.abs(near.progress-p)<.04?near.heading:(running?"DRIVING":"STOPPED");
}
function startCar(){if(p>=.995)p=.015;running=true;signal.classList.add("running");status.textContent="ENGINE ON";statusBox.classList.add("running");}
function stopCar(){running=false;signal.classList.remove("running");status.textContent="STOPPED";statusBox.classList.remove("running");}
signal.addEventListener("click",()=>{if(running)stopCar();else startCar();});
document.querySelector("#closeCard").addEventListener("click",()=>card.classList.remove("open"));
mobileDetails.addEventListener("click",()=>{const expanded=!body.classList.contains("mobile-collapsed");body.classList.toggle("mobile-collapsed",expanded);mobileDetails.textContent=expanded?"VIEW DETAILS":"CLOSE DETAILS";});
window.addEventListener("resize",()=>{if(window.matchMedia("(min-width:701px)").matches){body.classList.remove("mobile-collapsed");mobileDetails.textContent="VIEW DETAILS";}});
window.addEventListener("resize",render);
// Intentionally no arrow-key, wheel, or swipe driving: START and STOP are the only driving controls.
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopCar();});
function tick(now){
 const dt=Math.min(.04,(now-last)/1000);last=now;
 if(running){const prev=p;p=Math.min(1,p+.075*dt);cross(prev,p);render();
  // Let the car travel beyond the final (06) sign before the automatic end-of-route stop.
  // Sign 06 is at .91, so the car only stops after it has clearly passed that sign.
  if(p>=.999)stopCar();
 }
 requestAnimationFrame(tick);
}
render();requestAnimationFrame(tick);
