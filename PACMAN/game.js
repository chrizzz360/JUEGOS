const cv=document.getElementById('c'),ctx=cv.getContext('2d');let K=2,mz,mzW;
const MAP=[
"############################",
"#............##............#",
"#.####.#####.##.#####.####.#",
"#o####.#####.##.#####.####o#",
"#.####.#####.##.#####.####.#",
"#..........................#",
"#.####.##.########.##.####.#",
"#.####.##.########.##.####.#",
"#......##....##....##......#",
"######.##### ## #####.######",
"     #.##### ## #####.#     ",
"     #.##          ##.#     ",
"     #.## ###--### ##.#     ",
"######.## #      # ##.######",
"      .   #      #   .      ",
"######.## #      # ##.######",
"     #.## ######## ##.#     ",
"     #.##          ##.#     ",
"     #.## ######## ##.#     ",
"######.## ######## ##.######",
"#............##............#",
"#.####.#####.##.#####.####.#",
"#.####.#####.##.#####.####.#",
"#o..##.......  .......##..o#",
"###.##.##.########.##.##.###",
"###.##.##.########.##.##.###",
"#......##....##....##......#",
"#.##########.##.##########.#",
"#.##########.##.##########.#",
"#..........................#",
"############################"];
const G=MAP.map(r=>[...r]);for(let r=13;r<16;r++)for(let c=11;c<17;c++)G[r][c]='h';
const wl=(c,r)=>(c==-1||c==28)?[9,13,15,19].includes(r):!!(G[r]&&G[r][c]=='#');
const open=(c,r)=>{if(r==14&&(c<0||c>27))return 1;if(c<0||c>27||r<0||r>30)return 0;const t=G[r][c];return t!='#'&&t!='-'&&t!='h'};
function build(col){const o=document.createElement('canvas');o.width=224*K;o.height=248*K;const x=o.getContext('2d');x.scale(K,K);
const E=new Map(),all=[],add=(a,b,c,d)=>{const e={a:[a,b],b:[c,d],u:0};all.push(e);const k=a+','+b;if(!E.has(k))E.set(k,[]);E.get(k).push(e)};
for(let r=0;r<31;r++)for(let c=-1;c<29;c++)if(wl(c,r)){
if(!wl(c,r-1))add(c,r,c+1,r);if(!wl(c+1,r))add(c+1,r,c+1,r+1);if(!wl(c,r+1))add(c+1,r+1,c,r+1);if(!wl(c-1,r))add(c,r+1,c,r)}
x.strokeStyle=col;x.lineWidth=2;x.lineJoin='round';const IN=2,RAD=4,nm=d=>[-d[1],d[0]];
for(const s of all){if(s.u)continue;const Ls=[];let e=s;
while(e&&!e.u){e.u=1;Ls.push(e);e=(E.get(e.b[0]+','+e.b[1])||[]).find(q=>!q.u)}
const dr=Ls.map(q=>[Math.sign(q.b[0]-q.a[0]),Math.sign(q.b[1]-q.a[1])]),V=[];
Ls.forEach((q,i)=>{const di=dr[(i+Ls.length-1)%Ls.length],dn=dr[i];if(di[0]!=dn[0]||di[1]!=dn[1]){const a=nm(di),b=nm(dn);V.push([q.a[0]*8+IN*(a[0]+b[0]),q.a[1]*8+IN*(a[1]+b[1])])}});
const n=V.length;if(n<3)continue;
const len=i=>Math.hypot(V[(i+1)%n][0]-V[i][0],V[(i+1)%n][1]-V[i][1]),mid=i=>[(V[i][0]+V[(i+1)%n][0])/2,(V[i][1]+V[(i+1)%n][1])/2];
x.beginPath();const m0=mid(n-1);x.moveTo(m0[0],m0[1]);
for(let i=0;i<n;i++){const m=mid(i);x.arcTo(V[i][0],V[i][1],m[0],m[1],Math.min(RAD,len(i)/2,len((i+n-1)%n)/2))}
x.closePath();x.stroke()}
return o}
function rs(){const s=Math.min(innerWidth/224,innerHeight/288);K=Math.max(1,Math.round(s*(devicePixelRatio||1)));cv.width=224*K;cv.height=288*K;cv.style.width=224*s+'px';cv.style.height=288*s+'px';mz=build('#2121de');mzW=build('#fff')}
addEventListener('resize',rs);rs();
/* ---------- AUDIO ---------- */
let AC,so,sg;
function tone(f,d,ty='square',v=.07,f2=0,dl=0){if(!AC)return;const t=AC.currentTime+dl,o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.linearRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.005);g.gain.linearRampToValueAtTime(0,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02)}
function initA(){if(AC){AC.resume();return}AC=new(window.AudioContext||window.webkitAudioContext)();so=AC.createOscillator();so.type='triangle';sg=AC.createGain();sg.gain.value=0;so.connect(sg);sg.connect(AC.destination);so.start()}
let wk=0;const waka=()=>tone((wk^=1)?350:250,.05,'sawtooth',.06);
function jingle(){[659.25,1046.5,783.99,659.25,880,987.77,932.33,880,783.99].forEach((f,i)=>tone(f,i==3?.2:.1,'square',.07,0,[0,.1,.2,.3,.5,.6,.7,.8,.9][i]));[1046.5,1318.5,1568,1046.5,1760,1975.5,1864.7,1760,1568].forEach((f,i)=>tone(f,i==3?.2:.1,'square',.05,0,1.2+[0,.1,.2,.3,.5,.6,.7,.8,.9][i]))}
function deathS(){for(let i=0;i<14;i++)tone(500*2**(-2*i/12),.1,'square',.07,0,i*.1);if(!AC)return;const n=AC.sampleRate*.3,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=AC.createBufferSource(),g=AC.createGain(),fl=AC.createBiquadFilter();fl.frequency.value=900;g.gain.value=.12;s.buffer=b;s.connect(fl);fl.connect(g);g.connect(AC.destination);s.start(AC.currentTime+1.4)}
let sph=0;
function siren(){if(!AC)return;let on=ph=='play',f=400;if(on){const ey=gh.some(g=>g.s=='eyes');if(ft>0){sph+=4/60;f=600+300*(.5-.5*Math.cos(sph*6.283))}else{sph+=(1.2+(1-dots/244)*2.2)/60;f=ey?1100:380+220*Math.abs(Math.sin(sph*3.1416))}}so.frequency.value=f;sg.gain.value=on?.035:0}
/* ---------- ESTADO ---------- */
const U=[0,-1],L_=[-1,0],D_=[0,1],R_=[1,0],DIRS=[U,L_,D_,R_];
const FT=[0,6,5,4,3,2,5,2,2,1,5,2,1,1,3,1,1,0,1,0];
const SCH=[[7,20,7,20,5,20,5],[7,20,7,20,5,1033,1/60],[5,20,5,20,5,1037,1/60]];
const FPTS=[100,300,500,500,700,700,1000,1000,2000,2000,3000,3000,5000],FIDX=[0,1,2,2,3,3,4,4,5,5,6,6,7],FC=['#f00','#f55','#fa3','#e22','#6c3','#ff0','#fd0','#0ff'];
let ph='title',pt=0,lv=1,sc=0,hs=+(localStorage.getItem('pachs')||0),lives=2,dots=0,el=0,ec=0,md=0,mt=0,ft=0,chain=0,fruit=null,pop=null,frz=0,t=0,ie=0,xl=0,Dg=[],P,gh;
const AP=[0,44,90,44];
function lp(){const l=lv;return{p:l==1?.8:l<5?.9:l<21?1:.9,fp:l==1?.9:l<5?.95:1,g:l==1?.75:l<5?.85:.95,fg:l==1?.5:l<5?.55:.6,tn:l==1?.4:l<5?.45:.5}}
function newLevel(){Dg=G.map(r=>r.map(c=>c=='.'?1:c=='o'?2:0));dots=Dg.flat().filter(v=>v).length;el=0;ec=0;resetPos();ph='ready';pt=lv==1&&sc==0?200:110}
function resetPos(){P={x:112,y:188,dx:-1,dy:0,wx:-1,wy:0,fx:-1,fy:0,pause:0,a:0};
const m=(i,c,sc,x,y,s)=>({i,c,sc,x,y,s,dx:-1,dy:-1,a:0,fr:0,rv:0});
gh=[m(0,'#f00',[25,-3],112,92,'out'),m(1,'#ffb8ff',[2,-3],112,116,'house'),m(2,'#0ff',[27,31],96,116,'house'),m(3,'#ffb852',[0,31],128,116,'house')];
gh[0].dy=0;md=0;mt=SCH[lv==1?0:lv<5?1:2][0]*60;ft=0;fruit=null;pop=null;ie=0;ec=0}
function startGame(){sc=0;lives=2;lv=1;xl=0;newLevel();jingle()}
/* ---------- MOVIMIENTO ---------- */
const wrap=e=>{if(e.x<-4)e.x=228;else if(e.x>228)e.x=-4};
function pstep(){const cen=(P.x&7)==4&&(P.y&7)==4;
if(cen){const c=P.x>>3,r=P.y>>3,d=Dg[r]&&Dg[r][c];
if(d){Dg[r][c]=0;dots--;ec++;el++;ie=0;if(d==1){sc+=10;P.pause=1;waka()}else{sc+=50;P.pause=3;power()}
if(el==70||el==170)fruit={t:570+Math.random()*60|0};if(!xl&&sc>=10000){xl=1;lives++;tone(900,.4,'square',.08,1500)}}
if(open(c+P.wx,r+P.wy)){P.dx=P.wx;P.dy=P.wy;P.fx=P.dx;P.fy=P.dy}
if(!open(c+P.dx,r+P.dy)){P.dx=P.dy=0;return}}
else if((P.dx||P.dy)&&P.wx==-P.dx&&P.wy==-P.dy){P.dx=P.wx;P.dy=P.wy;P.fx=P.dx;P.fy=P.dy}
P.x+=P.dx;P.y+=P.dy;wrap(P)}
function power(){chain=0;const T=FT[Math.min(lv,19)]*60;if(T>0){ft=T;for(const g of gh)if(g.s!='eyes'&&g.s!='enter'){g.fr=1;if(g.s=='out')g.rv=1}}}
function tgt(g){const px=P.x>>3,py=P.y>>3;
if(g.s=='eyes')return[13,11];
if(md%2==0&&md<SCH[0].length+1)return g.sc;
if(g.i==0)return[px,py];
if(g.i==1)return[px+4*P.fx-(P.fy==-1?4:0),py+4*P.fy];
if(g.i==2){const a=px+2*P.fx-(P.fy==-1?2:0),b=py+2*P.fy,k=gh[0];return[2*a-(k.x>>3),2*b-(k.y>>3)]}
return(px-(g.x>>3))**2+(py-(g.y>>3))**2>64?[px,py]:g.sc}
function gdec(g){if(g.rv){g.rv=0;g.dx=-g.dx;g.dy=-g.dy;return}
const c=g.x>>3,r=g.y>>3;
let ds=DIRS.filter(d=>!(d[0]==-g.dx&&d[1]==-g.dy)&&open(c+d[0],r+d[1]));
if(!ds.length){g.dx=-g.dx;g.dy=-g.dy;return}
if(g.fr&&g.s=='out'){const d=ds[Math.random()*ds.length|0];g.dx=d[0];g.dy=d[1];return}
if(g.s=='out'&&(c==12||c==15)&&(r==11||r==23)){const f=ds.filter(d=>d!==U);if(f.length)ds=f}
const T=tgt(g);let b=1e9,bd=ds[0];for(const d of ds){const v=(c+d[0]-T[0])**2+(r+d[1]-T[1])**2;if(v<b){b=v;bd=d}}
g.dx=bd[0];g.dy=bd[1]}
function gspeed(g){const q=lp(),c=g.x>>3,tun=(g.y>>3)==14&&(c<=5||c>=22);
if(g.s=='eyes')return 2;if(g.s!='out')return .5;if(tun)return q.tn;if(g.fr)return q.fg;
let s=q.g;if(g.i==0){const e=[20,30,40,40,40,50,50,50,60,60,60,80,80,80,100,100,100,100,120][Math.min(lv-1,18)];if(dots<=e/2)s+=.1;else if(dots<=e)s+=.05}return s}
function gstep(g){const s=g.s;
if(s=='house'){if(g.y<=112)g.dy=1;if(g.y>=120)g.dy=-1;g.y+=g.dy}
else if(s=='leave'){if(g.x!=112)g.x+=Math.sign(112-g.x);else if(g.y>92)g.y--;else{g.s='out';g.dx=-1;g.dy=0}}
else if(s=='enter'){if(g.x!=112)g.x+=Math.sign(112-g.x);else if(g.y<116)g.y++;else{g.s='leave';g.fr=0}}
else{if((g.x&7)==4&&(g.y&7)==4){if(s=='eyes'&&g.y==92&&(g.x==108||g.x==116)){g.s='enter';return}gdec(g)}g.x+=g.dx;g.y+=g.dy;wrap(g)}}
function play(){const q=lp();
if(P.pause>0)P.pause--;else{P.a+=(ft>0?q.fp:q.p)*1.2625;while(P.a>=1){P.a--;pstep()}}
for(const g of gh){g.a+=gspeed(g)*1.2625;while(g.a>=1){g.a--;gstep(g)}}
/* liberar fantasmas */
ie++;const th=[0,lv==1?30:0,lv==1?60:lv==2?50:0],lim=lv<5?240:180;
for(const g of gh)if(g.s=='house'){if(ec>=th[g.i]||ie>lim){g.s='leave';ie=0}break}
/* modos */
if(ft>0){if(--ft==0)for(const g of gh)g.fr=0}
else{const S=SCH[lv==1?0:lv<5?1:2];if(md<S.length&&--mt<=0){md++;mt=md<S.length?S[md]*60:1e9;for(const g of gh)if(g.s=='out')g.rv=1}}
/* fruta */
if(fruit){if(--fruit.t<=0)fruit=null;else if(Math.abs(P.x-112)<6&&Math.abs(P.y-140)<6){const v=FPTS[Math.min(lv-1,12)];sc+=v;pop={x:112,y:140,v};frz=0;fruit=null;tone(700,.3,'square',.08,1400);pt0=60}}
/* colisiones */
for(const g of gh)if(Math.abs(g.x-P.x)<6&&Math.abs(g.y-P.y)<6&&g.s!='eyes'&&g.s!='enter'){
if(g.fr){chain++;const v=100<<chain;sc+=v;g.fr=0;g.s='eyes';pop={x:g.x,y:g.y,v};frz=50;tone(200,.3,'square',.08,1200)}
else{ph='dying';pt=0;break}}
if(dots<=0&&ph=='play'){ph='clear';pt=0}
if(sc>hs){hs=sc}}
let pt0=0;
function upd(){t++;if(pt0>0)pt0--;else if(pop&&frz==0&&ph=='play')pop=null;
if(frz>0){frz--;return}
if(ph=='ready'){if(--pt<=0)ph='play'}
else if(ph=='play')play();
else if(ph=='dying'){pt++;if(pt==60)deathS();if(pt>190){if(lives<=0){ph='over';pt=200;try{localStorage.setItem('pachs',hs)}catch(e){}}else{lives--;resetPos();ph='ready';pt=110}}}
else if(ph=='clear'){pt++;if(pt>150){lv++;newLevel()}}
else if(ph=='over'){if(--pt<=0)ph='title'}}
/* ---------- DIBUJO ---------- */
const FONT='"Press Start 2P",monospace';
function T(s,x,y,c='#fff',al='left',sz=8){ctx.font=sz+'px '+FONT;ctx.textBaseline='top';ctx.textAlign=al;ctx.fillStyle=c;ctx.fillText(s,x,y)}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
/* ---------- SPRITES PIXEL ART ---------- */
const SPC={};
function SP(key,w,h,fn){return SPC[key]||(SPC[key]=(()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn((a,b,pw,ph2,col)=>{x.fillStyle=col;x.fillRect(a,b,pw,ph2)});return c})())}
function PS(half,rot){return SP('p'+Math.round(half*100)+','+Math.round(rot*100),16,16,Q=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const cx=x+.5-8,cy=y+.5-8;if(cx*cx+cy*cy>64)continue;if(half>0){let d=Math.atan2(cy,cx)-rot;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<half)continue}Q(x,y,1,1,'#ffff00')}})}
function dpac(x,y,ap,rot){const d=((Math.round(rot/(Math.PI/2))%4)+4)%4;ctx.drawImage(PS([0,22,45][ap<1?0:ap<60?1:2]*Math.PI/180,d*Math.PI/2),x-8,y-8,16,16)}
const FULL=" ############## ",GB=["     ######     ","   ##########   ","  ############  ",...Array(11).fill(FULL)];
const GF=[[" ###  ####  ### "," ##    ##    ## "],[" ##  ######  ## "," #    ####    # "]];
const EY=[" ## ","####","####","####"," ## "];
function eyesS(Q,dx,dy){const o=dx>0?[2,2]:dx<0?[0,2]:dy<0?[1,0]:[1,3];for(const ex of[3,9]){EY.forEach((s,j)=>{for(let i=0;i<4;i++)if(s[i]=='#')Q(ex+i,4+j,1,1,'#ffffff')});Q(ex+o[0],4+o[1],2,2,'#2121ff')}}
function GS(g){const dx=g.dx,dy=g.dy,eo=g.s=='eyes'||g.s=='enter',fl=g.fr&&ft>0&&ft<=120&&((t/14|0)%2),w=(t/6|0)%2,k=eo?'e':g.fr?(fl?'w':'b'):g.c;
return SP('g'+k+w+(dx>0?'r':dx<0?'l':dy<0?'u':'d'),16,16,Q=>{
if(!eo){const col=g.fr?(fl?'#ffffff':'#0000ff'):g.c;GB.concat(GF[w]).forEach((s,j)=>{for(let i=0;i<16;i++)if(s[i]=='#')Q(i,j,1,1,col)})}
if(eo||!g.fr)eyesS(Q,dx,dy);else{const fc=fl?'#ff0000':'#ffffff';Q(4,5,2,2,fc);Q(10,5,2,2,fc);[2,6,10].forEach(i=>Q(i,10,2,1,fc));[4,8,12].forEach(i=>Q(i,11,2,1,fc))}})}
function dgh(g){ctx.drawImage(GS(g),g.x-8,g.y-8,16,16)}
function PL(){return SP('pel',8,8,Q=>{["  ####  "," ###### ","########","########","########","########"," ###### ","  ####  "].forEach((s,j)=>{for(let i=0;i<8;i++)if(s[i]=='#')Q(i,j,1,1,'#ffb8ae')})})}
function FS(i){return SP('f'+i,16,16,Q=>{const G='#00c000',
D=(cx,cy,r,c,f)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const a=x+.5-cx,b=y+.5-cy;if(a*a+b*b<=r*r)Q(x,y,1,1,f?f(x,y):c)}},
R=(x,y,w,h,c)=>Q(x,y,w,h,c),
Ln=(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++)Q(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),1,1,c)};
if(i==0){Ln(4,9,10,1,G);Ln(11,9,10,1,G);R(10,0,3,2,G);D(4,11.5,3.8,'#ff0000');D(11.5,11.5,3.8,'#ff0000');R(3,10,1,2,'#ffb0b0');R(10,10,1,2,'#ffb0b0')}
else if(i==1){R(3,4,10,5,'#ff0000');R(4,9,8,2,'#ff0000');R(5,11,6,2,'#ff0000');R(6,13,4,1,'#ff0000');R(4,2,8,2,G);R(7,1,2,1,G);[[5,6],[8,5],[10,7],[7,8],[5,10],[9,10],[7,12],[11,5]].forEach(p=>R(p[0],p[1],1,1,'#ffff00'))}
else if(i==2){D(8,9.5,6,'#ff9a00');R(5,6,2,2,'#ffd27a');R(7,2,2,3,G);R(9,3,3,1,G)}
else if(i==3){D(5.5,9.5,4.8,'#ff0000');D(10.5,9.5,4.8,'#ff0000');R(8,1,1,4,'#a0522d');R(9,2,3,1,G);R(3,7,2,2,'#ff9090')}
else if(i==4){D(8,9,6.3,0,(x,y)=>(x*2+y)%5==0?'#b8ffb8':'#2faa2f');R(8,1,1,3,G)}
else if(i==5){R(2,1,2,4,'#ffff00');R(12,1,2,4,'#ffff00');R(2,5,12,2,'#0000ff');R(4,7,8,2,'#0000ff');R(6,3,4,6,'#ff0000');R(7,9,2,4,'#ffffff');R(7,13,2,2,'#00ffff')}
else if(i==6){D(8,7,5,'#ffff00');R(3,8,10,5,'#ffff00');R(2,12,12,2,'#ffff00');R(5,4,1,5,'#ffffff');R(7,14,2,2,'#00ffff');R(7,1,2,2,'#ffff00')}
else{D(8,4,3.6,'#00ffff');D(8,4,1.6,'#000000');R(7,7,2,8,'#c8c8c8');R(9,11,3,1,'#c8c8c8');R(9,13,2,1,'#c8c8c8')}})}
function fi(i,x,y){ctx.drawImage(FS(i),x-8,y-8,16,16)}

function draw(){ctx.setTransform(K,0,0,K,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,224,288);
if(ph=='title'||(t/20|0)%2==0)T('1UP',24,0,'#fff');
T(String(sc).padStart(ph=='title'?2:2,' '),56,8,'#fff','right');T('HIGH SCORE',112,0,'#fff','center');T(String(hs),128,8,'#fff','right');
const flash=ph=='clear'&&pt>40&&(((pt-40)/20|0)%2==0);
ctx.drawImage(flash?mzW:mz,0,24,224,248);
ctx.save();ctx.translate(0,24);
if(ph!='title'&&!(ph=='clear'&&pt>40)){
ctx.fillStyle='#ffb8ae';for(let r=0;r<31;r++)for(let c=0;c<28;c++){const d=Dg[r]&&Dg[r][c];if(d==1)ctx.fillRect(c*8+3,r*8+3,2,2);else if(d==2&&((t/14|0)%2==0||ph!='play'))ctx.drawImage(PL(),c*8,r*8,8,8)}}
ctx.fillStyle='#ffb8de';ctx.fillRect(103,99,18,2);
if(ph=='title'){T('PAC-MAN',112,60,'#ff0','center',16);T('REPLICA FAN',112,84,'#0ff','center');
dpac(112,128,AP[(t/4|0)%4>2?1:(t/4|0)%4],0);if((t/30|0)%2==0)T('TOCA PARA JUGAR',112,168,'#fff','center');T('SWIPE O FLECHAS',112,184,'#ffb8ae','center',7);ctx.restore();return}
if(fruit)fi(FIDX[Math.min(lv-1,12)]>7?7:FIDX[Math.min(lv-1,12)],112,140);
const hideG=ph=='dying'&&pt>=60;
if(!hideG){for(const g of gh){if(pop&&frz>0&&pop.g==undefined&&false)continue;dgh(g)}}
if(ph!='ready'||true){
if(ph=='dying'){if(pt<60)dpac(P.x,P.y,0,0);else if(pt<150)ctx.drawImage(PS(Math.min(11,(pt-60)/7.5|0)/11*Math.PI,-Math.PI/2),P.x-8,P.y-8,16,16);else if(pt<175){const k=(pt-150)/8;ctx.fillStyle='#ffff00';for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.fillRect(Math.round(P.x+Math.cos(a)*(3+k*3))-1,Math.round(P.y+Math.sin(a)*(3+k*3))-1,2,2)}}}
else if(ph!='over'&&(ph!='clear'||pt<=40)){const mv=(P.dx||P.dy)&&ph=='play',ap=mv?AP[[0,1,2,3][(t/2|0)%4]]:(ph=='ready'?0:AP[2]);if(!(pop&&frz>0&&pop.v!=undefined&&ph=='play'&&pop.g!==undefined))dpac(P.x,P.y,ap,Math.atan2(P.fy,P.fx))}}
if(pop&&(frz>0||pt0>0))T(String(pop.v),pop.x,pop.y-3,pop.v>=1000&&pt0>0?'#f8f':'#0ff','center',6);
if(ph=='ready'){T('READY!',112,136,'#ff0','center');if(lv==1&&sc==0)T('PLAYER ONE',112,80,'#0ff','center')}
if(ph=='over')T('GAME  OVER',112,136,'#f00','center');
ctx.restore();
for(let i=0;i<lives;i++){ctx.save();dpac(24+i*16,280,AP[2],Math.PI);ctx.restore()}
for(let i=0;i<Math.min(lv,7);i++){const k=lv-Math.min(lv,7)+i;fi(Math.min(FIDX[Math.min(k,12)],7),208-(Math.min(lv,7)-1-i)*16,280)}}
/* ---------- ENTRADA ---------- */
const setW=(x,y)=>{if(P){P.wx=x;P.wy=y}};
function tap(){initA();if(ph=='title')startGame()}
addEventListener('keydown',e=>{const k={ArrowUp:U,ArrowLeft:L_,ArrowDown:D_,ArrowRight:R_,w:U,a:L_,s:D_,d:R_}[e.key];if(k){e.preventDefault();tap();setW(k[0],k[1])}else if(e.key==' '||e.key=='Enter')tap()});
let ts;cv.addEventListener('touchstart',e=>{e.preventDefault();ts=e.touches[0];tap()},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();const q=e.touches[0],dx=q.clientX-ts.clientX,dy=q.clientY-ts.clientY;if(Math.hypot(dx,dy)>14){Math.abs(dx)>Math.abs(dy)?setW(dx>0?1:-1,0):setW(0,dy>0?1:-1);ts=q}},{passive:false});
cv.addEventListener('mousedown',tap);
/* ---------- BUCLE ---------- */
resetPos();let last=performance.now(),acc=0;
(function loop(n){acc+=Math.min(n-last,100);last=n;while(acc>=16.667){acc-=16.667;upd()}draw();siren();requestAnimationFrame(loop)})(last);
