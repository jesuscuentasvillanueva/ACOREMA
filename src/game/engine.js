export const missions = [
 {name:'La bahía de los bufeos',place:'BAHÍA DE PISCO',fact:'Los bufeos son mamíferos: suben a la superficie para respirar.',animal:'delfín'},
 {name:'El bosque de algas',place:'COSTA PERUANA',fact:'Las nutrias encuentran alimento y refugio cerca de las costas rocosas.',animal:'nutria'},
 {name:'La gran corriente',place:'MAR COMPARTIDO',fact:'Las tortugas pueden confundir bolsas de plástico con alimento. Reducir su uso ayuda a protegerlas.',animal:'tortuga'}
];
export const WIDTH=2600, HEIGHT=1000;
export function createWorld(level=0){return {level,time:0,x:180,y:300,vx:0,vy:0,energy:100,score:0,collected:0,combo:0,lastPickup:-10,sonar:0,cooldown:0,hits:0,invincible:0,done:false,
 trash:Array.from({length:8},(_,i)=>({x:410+i*265,y:[[270,580,360,730,260,580,340,680],[300,610,280,690,380,540,300,640],[250,560,410,660,320,510,260,700]][level][i],type:i%3,taken:false})),
 rocks:[{x:760,y:780,r:100},{x:1320,y:140,r:100},{x:1810,y:780,r:110},{x:2250,y:130,r:80}],
 animals:Array.from({length:4+level},(_,i)=>({x:600+i*540,y:460+i%2*150,base:460+i%2*150,dir:i%2?1:-1})),event:''};}
export function step(w,input,dt){
 if(w.done)return;dt=Math.min(dt,.04);w.time+=dt;w.event='';w.cooldown=Math.max(0,w.cooldown-dt);w.sonar=Math.max(0,w.sonar-dt);w.invincible=Math.max(0,w.invincible-dt);
 if(input.sonar&&w.cooldown===0){w.sonar=3;w.cooldown=7;w.event='sonar';}
 const boost=input.boost&&w.energy>5, speed=boost?400:220;
 let ix=input.x||0,iy=input.y||0,n=Math.hypot(ix,iy);if(n>1){ix/=n;iy/=n;}
 const current=Math.sin(w.time*.6+w.x/340)*(12+w.level*8);
 const blend=1-Math.exp(-dt*5);w.vx+=(ix*speed+current-w.vx)*blend;w.vy+=(iy*speed+Math.cos(w.time+w.x/500)*8-w.vy)*blend;
 w.x=Math.max(65,Math.min(WIDTH-65,w.x+w.vx*dt));w.y=Math.max(95,Math.min(HEIGHT-100,w.y+w.vy*dt));
 w.energy=Math.max(0,Math.min(100,w.energy+(boost?-22:9)*dt));
 for(const r of w.rocks){const dx=w.x-r.x,dy=w.y-r.y,d=Math.hypot(dx,dy),limit=r.r+34;if(d<limit){w.x=r.x+dx/(d||1)*limit;w.y=r.y+dy/(d||1)*limit;w.vx*=-.3;w.vy*=-.3;if(!w.invincible){w.hits++;w.combo=0;w.invincible=2;w.event='rock';}}}
 for(const a of w.animals){a.x+=a.dir*(30+w.level*8)*dt;if(a.x<250||a.x>WIDTH-180)a.dir*=-1;a.y=a.base+Math.sin(w.time*.8+a.x/300)*45;if(Math.hypot(w.x-a.x,w.y-a.y)<95&&!w.invincible){w.hits++;w.combo=0;w.invincible=2;w.vx*=-.5;w.event='animal';}}
 for(const t of w.trash)if(!t.taken&&Math.hypot(w.x-t.x,w.y-t.y)<(w.sonar?105:65)){t.taken=true;w.combo=w.time-w.lastPickup<8?w.combo+1:1;w.lastPickup=w.time;w.collected++;w.score+=100+Math.min(4,w.combo-1)*25;w.event='pickup';}
 if(w.collected===w.trash.length&&w.x>WIDTH-180&&w.y<400){w.done=true;w.event='complete';}
}
