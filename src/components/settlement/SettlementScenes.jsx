import { LogoChar } from './SettlementChar';

export function SceneL1({ frame }) {
  const T = frame % 260;
  const phase = T < 60 ? 0 : T < 90 ? 1 : T < 160 ? 2 : 3;
  const walkT = Math.min(1, T / 60);
  const charX = phase === 0 ? 185 - walkT * 75 : 110;
  const charY = 130;
  const walking = phase === 0;
  const legPhase = walking ? Math.floor(frame / 4) % 4 : 1;
  const walkBob = walking ? Math.abs(Math.sin(frame * 0.6)) * 1.2 : 0;
  const sitDip = phase === 1 ? ((T - 60) / 30) * 4 : (phase >= 2 ? 4 : 0);
  const pourT = phase === 2 ? (T - 90) / 70 : 0;
  const kettleTilt = phase === 2 ? Math.min(1, pourT * 2) * 35 : 0;
  const pouring = phase === 2 && pourT > 0.25 && pourT < 0.95;
  const sipT = phase === 3 ? (T - 160) / 100 : 0;
  const mugRaise = phase === 3 ? Math.min(1, sipT * 3) * 6 : 0;
  const sipping = phase === 3 && sipT > 0.3 && sipT < 0.85;
  const bob = phase >= 2 ? Math.sin(frame * 0.12) * 0.5 : 0;
  const blink = phase === 3 && sipping ? true : (frame % 80) < 4;
  const eyeShape = walking ? 'open' : (sipping ? 'closed' : (blink ? 'closed' : 'happy'));
  const mouth = phase === 0 ? 'soft' : (sipping ? 'soft' : (phase >= 2 ? 'grin' : 'soft'));
  const fireF = frame % 6;
  const flameH = [9, 11, 8, 10, 9, 11][fireF];
  const flameW = [7, 8, 7, 8, 7, 8][fireF];

  const stream = [];
  if (pouring) for (let i = 0; i < 5; i++) stream.push(<rect key={'st' + i} x={charX - 12} y={charY - 2 + i * 2} width="1" height="2" fill="#5a3a20" opacity={0.9} />);

  const steamPuffs = [];
  if (phase >= 2) for (let i = 0; i < 3; i++) {
    const age = (frame + i * 12) % 36;
    const sx = (phase === 3 ? charX - 3 : charX - 13) + Math.sin(age * 0.2 + i) * 1.5;
    const sy = (phase === 3 ? charY + 4 - mugRaise : charY + 8) - age * 0.6;
    steamPuffs.push(<rect key={'sm' + i} x={sx} y={sy} width="2" height="1" fill="#e0d0f0" opacity={Math.max(0, 1 - age / 36) * 0.7} />);
  }

  const fireflies = [];
  for (let i = 0; i < 3; i++) {
    const age = (frame + i * 40) % 120;
    const fx = 30 + i * 55 + Math.sin(age * 0.05) * 8;
    const fy = 60 + Math.cos(age * 0.07) * 15 + i * 5;
    const op = 0.4 + 0.4 * Math.sin(age * 0.2);
    fireflies.push(<g key={'ff' + i}><rect x={fx} y={fy} width="2" height="2" fill="#ffd9a8" opacity={op} /><rect x={fx - 1} y={fy} width="1" height="2" fill="#ffb070" opacity={op * 0.5} /><rect x={fx + 2} y={fy} width="1" height="2" fill="#ffb070" opacity={op * 0.5} /></g>);
  }

  const embers = [];
  for (let i = 0; i < 5; i++) {
    const age = (frame + i * 8) % 40;
    embers.push(<rect key={'em' + i} x={70 + i * 2 + Math.sin(age * 0.3 + i) * 3} y={130 - age * 1.4} width="1" height="1" fill="#ffb070" opacity={Math.max(0, 1 - age / 40)} />);
  }

  return (
    <svg viewBox="0 0 200 200">
      <defs>
        <radialGradient id="bg-l1" cx="50%" cy="65%"><stop offset="0%" stopColor="#3a2a48" /><stop offset="60%" stopColor="#1a1426" /><stop offset="100%" stopColor="#0a0612" /></radialGradient>
        <radialGradient id="firelight" cx="50%" cy="50%"><stop offset="0%" stopColor="rgba(255,180,80,0.55)" /><stop offset="100%" stopColor="rgba(255,180,80,0)" /></radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="200" fill="url(#bg-l1)" />
      <g>{[[30,30],[60,18],[160,40],[180,70],[150,15],[40,55]].map(([x,y],i)=><rect key={'s'+i} x={x} y={y} width="1" height="1" fill="#ffd9f0" opacity={(frame+i*7)%60<10?0.4:0.85}/>)}</g>
      <ellipse cx="40" cy="170" rx="60" ry="22" fill="#1a2238" /><ellipse cx="160" cy="175" rx="70" ry="20" fill="#1a2238" /><ellipse cx="100" cy="190" rx="120" ry="28" fill="#241830" />
      {fireflies}
      <circle cx="78" cy="148" r="38" fill="url(#firelight)" />
      <g><path d="M 124 168 L 145 144 L 166 168 Z" fill="#5a4a7a" /><path d="M 124 168 L 145 144 L 166 168 Z" fill="none" stroke="#8a7aaa" strokeWidth="1" /><rect x="144" y="148" width="1" height="20" fill="#8a7aaa" /><path d="M 142 168 L 145 159 L 148 168 Z" fill="#ffb070" opacity="0.7" /><rect x="144" y="137" width="1" height="7" fill="#8a7aaa" /><rect x="145" y="137" width="3" height="2" fill="#ffd9a8" /></g>
      <rect x="68" y="160" width="20" height="3" fill="#5a3a20" /><rect x="68" y="160" width="20" height="1" fill="#8a5a30" />
      <g><rect x={78 - flameW / 2} y={158 - flameH} width={flameW} height={flameH} fill="#ff8030" /><rect x={78 - flameW / 2 + 1} y={158 - flameH + 1} width={flameW - 2} height={flameH - 2} fill="#ffb050" /><rect x={78 - flameW / 2 + 2} y={158 - flameH + 2} width={flameW - 4} height={flameH - 4} fill="#ffe080" /><rect x={78} y={158 - flameH - 1} width="1" height="2" fill="#fff5b0" /></g>
      {embers}
      <g style={{ transform: `translateY(${bob + walkBob + sitDip}px)` }}>
        <LogoChar cx={charX} cy={charY} pose={{ legPhase, bob: 0, armL: walking ? 25 : (phase === 2 ? 60 : (phase === 3 ? 70 + mugRaise * 3 : 50)), armR: walking ? -25 : (phase === 2 ? -75 : (phase === 3 ? -55 : -50)), eyeShape, mouth }} hideLegs={false} />
        {walking && <g><rect x={charX + 6} y={charY - 2} width="6" height="8" fill="#8a5a40" /><rect x={charX + 6} y={charY - 2} width="6" height="1" fill="#a07050" /><rect x={charX + 7} y={charY + 1} width="4" height="1" fill="#a07050" /></g>}
        {phase === 2 && <g transform={`rotate(${-kettleTilt} ${charX - 7} ${charY - 2})`}><rect x={charX - 12} y={charY - 6} width="7" height="5" fill="#3a3a4a" /><rect x={charX - 12} y={charY - 6} width="7" height="1" fill="#5a5a6a" /><rect x={charX - 15} y={charY - 5} width="3" height="2" fill="#3a3a4a" /><rect x={charX - 9} y={charY - 7} width="1" height="1" fill="#ffd060" /></g>}
        {phase === 2 && <g><rect x={charX - 14} y={charY + 8} width="6" height="5" fill="#a05a40" /><rect x={charX - 14} y={charY + 8} width="6" height="1" fill="#c87a60" /><rect x={charX - 13} y={charY + 9} width="4" height="2" fill="#3a1a08" /></g>}
        {phase === 3 && <g transform={`translate(0 ${-mugRaise})`}><rect x={charX - 6} y={charY + 4} width="6" height="5" fill="#a05a40" /><rect x={charX - 6} y={charY + 4} width="6" height="1" fill="#c87a60" /><rect x={charX - 5} y={charY + 5} width="4" height="2" fill="#3a1a08" /></g>}
        {stream}{steamPuffs}
      </g>
    </svg>
  );
}

export function SceneL2({ frame }) {
  const cycle = (frame % 240) / 240;
  const bricksPlaced = Math.min(6, Math.floor(cycle * 7) + 1);
  const topBrickTop = 168 - (bricksPlaced - 1) * 2;
  const topBrickMidX = 111;
  const cx = 78, cy = 154;
  const bob = Math.sin(frame * 0.18) * 0.4;
  const handX = cx - 9, handY = cy + 5;
  const dx = topBrickMidX - handX, dy = topBrickTop - handY;
  const reach = Math.sqrt(dx * dx + dy * dy);
  const localAimAngle = Math.atan2(dx, dy) * 180 / Math.PI;
  const hammerPhase = frame % 6;
  const swingOffset = [0, 10, 22, 36, 16, 6][hammerPhase];
  const isStrike = hammerPhase === 0;
  const handleLen = isStrike ? reach : Math.max(14, reach - 2 - swingOffset * 0.1);
  const hammerAngle = localAimAngle + swingOffset;
  const hit = isStrike;
  const blink = (frame % 70) < 3;
  const placeFlashAge = (frame % Math.max(1, Math.floor(240 / 7)));
  const flashTop = placeFlashAge < 4;
  const dust = [], sparks = [];
  if (hit) {
    for (let i = 0; i < 3; i++) dust.push(<rect key={'d'+i} x={topBrickMidX-3+i*2} y={topBrickTop-1-i} width="2" height="1" fill="#a090b0" opacity={0.65-i*0.18}/>);
    sparks.push(<rect key="sp1" x={topBrickMidX-2} y={topBrickTop-2} width="1" height="1" fill="#ffd0ff"/>);
    sparks.push(<rect key="sp2" x={topBrickMidX+2} y={topBrickTop-3} width="1" height="1" fill="#aef0ff"/>);
    sparks.push(<rect key="sp3" x={topBrickMidX} y={topBrickTop-4} width="1" height="1" fill="#fff8a0"/>);
  }

  return (
    <svg viewBox="0 0 200 200">
      <defs><radialGradient id="bg-l2" cx="50%" cy="60%"><stop offset="0%" stopColor="#2a2a52" /><stop offset="100%" stopColor="#0a0a1a" /></radialGradient></defs>
      <rect x="0" y="0" width="200" height="200" fill="url(#bg-l2)" />
      <g>{[[30,30],[160,25],[180,55],[20,15],[170,80],[55,45],[140,60],[100,18]].map(([x,y],i)=><rect key={'s'+i} x={x} y={y} width="1" height="1" fill={i%2?'#aef0ff':'#ffd9f0'} opacity={(frame+i*5)%50<8?0.3:0.85}/>)}</g>
      <ellipse cx="50" cy="180" rx="80" ry="22" fill="#1a2a48" /><ellipse cx="160" cy="185" rx="70" ry="20" fill="#22203c" /><ellipse cx="100" cy="195" rx="140" ry="22" fill="#2a2050" />
      <g><path d="M 158 168 L 168 154 L 178 168 Z" fill="#5a4a7a" /><rect x="167.5" y="158" width="1" height="10" fill="#8a7aaa" /><circle cx="153" cy="170" r="2.5" fill="#ff9050" opacity={0.35+0.25*Math.sin(frame*0.18)} /><circle cx="153" cy="170" r="1" fill="#ffd060" opacity={0.7+0.3*Math.sin(frame*0.18)} /></g>
      <rect x="60" y="170" width="80" height="2" fill="#3a2a55" /><rect x="60" y="170" width="80" height="1" fill="#5a4a80" />
      <g>
        {[{x:106,y:166,w:22,h:2,c:'#0a72c4'},{x:104,y:164,w:22,h:2,c:'#0a72c4'},{x:102,y:162,w:22,h:2,c:'#0a72c4'},{x:100,y:160,w:22,h:2,c:'#1e9eff'},{x:98,y:158,w:22,h:2,c:'#1e9eff'},{x:96,y:156,w:22,h:2,c:'#1e9eff'}].slice(0,bricksPlaced).map((b,i)=>{
          const isTop = i===bricksPlaced-1;
          return <g key={'br'+i}><rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.c}/><rect x={b.x} y={b.y} width={b.w} height="1" fill={i<3?'#5fc4ff':'#8ddcff'} opacity="0.85"/>{isTop&&flashTop&&<rect x={b.x-1} y={b.y-1} width={b.w+2} height={b.h+2} fill="none" stroke="#ffd0ff" strokeWidth="1" opacity="0.8"/>}</g>;
        })}
      </g>
      <g style={{ transform: `translateY(${bob}px)` }}>
        <g transform={`translate(${2*cx} 0) scale(-1 1)`}>
          <LogoChar cx={cx} cy={cy} pose={{ legPhase:1, bob:0, armL:30, armR:-55, eyeShape:blink?'closed':'focus', mouth:'determined' }} />
        </g>
        <g transform={`translate(${2*handX} 0) scale(-1 1) rotate(${hammerAngle} ${handX} ${handY})`}>
          <rect x={handX-1} y={handY} width="2" height={handleLen} fill="#8a6a4a"/>
          <rect x={handX-4} y={handY+handleLen} width="8" height="4" fill="#a0a0b0"/>
          <rect x={handX-4} y={handY+handleLen} width="8" height="1" fill="#d0d0e0"/>
        </g>
        {hit&&<g><rect x={topBrickMidX-5} y={topBrickTop-1} width="1" height="1" fill="#fff" opacity="0.7"/><rect x={topBrickMidX+5} y={topBrickTop-1} width="1" height="1" fill="#fff" opacity="0.7"/></g>}
        {dust}{sparks}
      </g>
    </svg>
  );
}

export function SceneL3({ frame }) {
  const cx = 100, cy = 152;
  const bob = Math.sin(frame * 0.15) * 0.8;
  const legPhase = Math.floor(frame / 10) % 4;
  const wavePhase = frame % 100;
  const isWaving = wavePhase < 20;
  const waveArm = isWaving ? -20 + Math.sin(wavePhase * 0.5) * 30 : -15;
  const blink = (frame % 75) < 3;
  const jumpCycle = (frame % 90) / 90;
  const jumpY = -4 * 16 * jumpCycle * (1 - jumpCycle);
  const isAirborne = jumpCycle > 0.05 && jumpCycle < 0.95;
  const windowOn = (i) => ((frame + i * 17) % (60 + i * 8)) < (40 + i * 5);
  const orbs = [];
  for (let i = 0; i < 5; i++) {
    const age = (frame + i * 30) % 150;
    const ox = 25 + i * 38 + Math.sin(age * 0.04) * 5;
    const oy = 175 - age;
    orbs.push(<g key={'o'+i} opacity={Math.max(0,1-age/150)}><circle cx={ox} cy={oy} r="2" fill="#aef0ff" opacity="0.4"/><rect x={ox} y={oy} width="1" height="1" fill="#fff"/></g>);
  }
  const vineSway = Math.sin(frame * 0.1) * 1.5;

  return (
    <svg viewBox="0 0 200 200">
      <defs><radialGradient id="bg-l3" cx="50%" cy="55%"><stop offset="0%" stopColor="#2a2050"/><stop offset="100%" stopColor="#0a0816"/></radialGradient></defs>
      <rect x="0" y="0" width="200" height="200" fill="url(#bg-l3)"/>
      <g>{[[20,20],[40,15],[80,25],[120,18],[160,22],[180,40],[100,10]].map(([x,y],i)=><rect key={'s'+i} x={x} y={y} width="1" height="1" fill="#ffe0f5" opacity={(frame+i*4)%40<5?0.3:0.9}/>)}</g>
      <ellipse cx="40" cy="175" rx="70" ry="20" fill="#2a2058"/><ellipse cx="160" cy="178" rx="70" ry="22" fill="#28204a"/>
      <path d="M 20 195 Q 100 170 180 195" fill="none" stroke="#5a4a90" strokeWidth="1" strokeDasharray="2 3"/>
      <g style={{transform:`translateX(${vineSway}px)`}}>
        <rect x="15" y="140" width="2" height="40" fill="#5a3a7a"/><ellipse cx="16" cy="138" rx="6" ry="8" fill="#60a060" opacity="0.85"/>
        <rect x="183" y="142" width="2" height="40" fill="#5a3a7a"/><ellipse cx="184" cy="140" rx="7" ry="9" fill="#60a060" opacity="0.85"/>
      </g>
      <g>
        <path d="M 30 152 L 52 152 L 48 158 L 26 158 Z" fill="#1e9eff"/><rect x="32" y="158" width="22" height="12" fill="#1a2050"/>
        <rect x="36" y="161" width="3" height="3" fill={windowOn(0)?'#ffe080':'#0a0a18'}/><rect x="44" y="161" width="3" height="3" fill={windowOn(1)?'#ffe080':'#0a0a18'}/>
        <path d="M 56 142 L 78 142 L 74 148 L 52 148 Z" fill="#c060ff"/><rect x="58" y="148" width="22" height="22" fill="#2a1840"/>
        <rect x="62" y="152" width="3" height="3" fill={windowOn(2)?'#ffe080':'#0a0a18'}/><rect x="70" y="152" width="3" height="3" fill={windowOn(3)?'#ffd0a0':'#0a0a18'}/>
        <rect x="62" y="160" width="3" height="3" fill={windowOn(4)?'#ffe080':'#0a0a18'}/><rect x="70" y="160" width="3" height="3" fill={windowOn(5)?'#ffe080':'#0a0a18'}/>
        <path d="M 116 132 L 144 132 L 138 140 L 110 140 Z" fill="#60d0ff"/><rect x="112" y="140" width="28" height="28" fill="#0e2440"/>
        <rect x="116" y="144" width="3" height="3" fill={windowOn(6)?'#ffe080':'#0a0a18'}/><rect x="123" y="144" width="3" height="3" fill={windowOn(7)?'#ffd0a0':'#0a0a18'}/><rect x="130" y="144" width="3" height="3" fill={windowOn(8)?'#ffe080':'#0a0a18'}/>
        <path d="M 150 150 L 172 150 L 168 156 L 146 156 Z" fill="#aef0a0"/><rect x="152" y="156" width="22" height="14" fill="#1a2820"/>
        <rect x="156" y="160" width="3" height="3" fill={windowOn(3)?'#aef0c0':'#0a0a18'}/><rect x="164" y="160" width="3" height="3" fill={windowOn(4)?'#ffe080':'#0a0a18'}/>
      </g>
      {orbs}
      <g style={{transform:`translateY(${bob+jumpY}px)`,transformOrigin:`${cx}px ${cy+12}px`}}>
        <g transform={`rotate(${isAirborne?Math.sin(jumpCycle*Math.PI*2)*8:0} ${cx-19} ${cy+12})`}>
          <rect x={cx-20} y={cy+10} width="2" height="3" fill="#8a6a4a"/>
          <circle cx={cx-19} cy={cy+15} r="3" fill="#ffe080" opacity="0.9"/>
          <circle cx={cx-19} cy={cy+15} r="6" fill="#ffd060" opacity="0.25"/>
        </g>
        <LogoChar cx={cx} cy={cy} pose={{legPhase:isAirborne?2:legPhase,bob:0,armL:isAirborne?55:35,armR:isWaving?waveArm:(isAirborne?-45:-20),armUp:isWaving||isAirborne,eyeShape:blink?'closed':(isAirborne?'sparkle':'happy'),mouth:'bigGrin'}}/>
      </g>
    </svg>
  );
}

export function SceneL4({ frame }) {
  const blink = (frame % 90) < 3;
  const pulse = (i) => 0.6 + 0.4 * Math.sin(frame * 0.2 + i);
  const carCycle = (frame % 240) / 240;
  const carX = -30 + carCycle * 260;
  const carY = 128 + Math.sin(frame * 0.1) * 1.5;
  const vehicles = [];
  for (let i = 0; i < 3; i++) {
    const lane = [40, 70, 95][i];
    const speed = [0.9, 1.4, 1.1][i];
    const dir = i % 2 ? 1 : -1;
    const age = ((frame * speed + i * 60) % 240);
    const vx = dir > 0 ? age - 20 : 220 - age;
    const colors = ['#ff00aa', '#00d4ff', '#aaff00'];
    vehicles.push(<g key={'v'+i} opacity={vx>-10&&vx<210?1:0}><rect x={vx} y={lane} width="7" height="2" fill={colors[i]}/><rect x={vx+1} y={lane-1} width="5" height="1" fill="#fff"/></g>);
  }
  const parts = [];
  for (let i = 0; i < 8; i++) {
    const age = (frame * 1.5 + i * 47) % 80;
    const px = (i * 23 + frame * 0.3) % 200;
    const colors = ['#ff00aa', '#00d4ff', '#aaff00', '#ffd000'];
    parts.push(<rect key={'pt'+i} x={px} y={200-age*2.5} width="1" height="3" fill={colors[i%4]} opacity={Math.max(0,1-age/80)*0.6}/>);
  }
  const rot = (frame % 108) / 108;
  const scaleX = Math.cos(rot * Math.PI * 2);
  const isBack = scaleX < 0;
  const logoFlicker = (frame % 24) < 1 ? 0.5 : 1;

  return (
    <svg viewBox="0 0 200 200">
      <defs><radialGradient id="bg-l4" cx="50%" cy="50%"><stop offset="0%" stopColor="#28063e"/><stop offset="60%" stopColor="#0e0220"/><stop offset="100%" stopColor="#02000a"/></radialGradient></defs>
      <rect x="0" y="0" width="200" height="200" fill="url(#bg-l4)"/>
      <rect x="0" y="115" width="200" height="2" fill="#ff00aa" opacity="0.5"/>
      <g style={{opacity:logoFlicker}}>
        <rect x="64" y="22" width="72" height="72" fill="#00d4ff" opacity="0.08"/>
        <g transform={`translate(100 58) scale(${Math.max(0.05,Math.abs(scaleX))} 1)`}>
          <path d="M -14 -10 L 14 -10 L 6 -2 L -22 -2 Z" fill={isBack?'#0a72c4':'#1e9eff'} stroke={isBack?'#00d4ff':'#80e0ff'} strokeWidth="0.8"/>
          <path d="M -8 -2 L 20 -2 L 12 6 L -16 6 Z" fill={isBack?'#085088':'#0a72c4'} stroke={isBack?'#0099cc':'#3bb8ff'} strokeWidth="0.8"/>
        </g>
        <text x="100" y="84" textAnchor="middle" fontFamily="Geist Mono,monospace" fontSize="5" fill="#00d4ff" letterSpacing="2">WHEREABOUTS</text>
      </g>
      <g opacity="0.7"><rect x="10" y="100" width="14" height="80" fill="#1a0a30"/><rect x="10" y="100" width="14" height="1" fill="#ff00aa"/><rect x="178" y="92" width="14" height="88" fill="#0a1030"/><rect x="178" y="92" width="14" height="1" fill="#00d4ff"/></g>
      <g>
        <rect x="42" y="80" width="22" height="100" fill="#1a0628"/><rect x="42" y="80" width="22" height="2" fill="#ff00aa"/><rect x="42" y="80" width="1" height="100" fill="#ff00aa"/>
        {[0,1,2,3,4,5,6,7].map(i=>[0,1,2].map(j=><rect key={`mwA${i}${j}`} x={45+j*6} y={88+i*11} width="3" height="4" fill="#ffd000" opacity={pulse(i+j)}/>))}
        <rect x="138" y="76" width="22" height="104" fill="#06182c"/><rect x="138" y="76" width="22" height="2" fill="#00d4ff"/>
        {[0,1,2,3,4,5,6,7,8].map(i=>[0,1,2].map(j=><rect key={`mwB${i}${j}`} x={141+j*6} y={84+i*11} width="3" height="4" fill="#aef0ff" opacity={pulse(i*0.7+j)}/>))}
        <rect x="92" y="108" width="16" height="72" fill="#0a1030"/><rect x="92" y="108" width="16" height="2" fill="#aaff00"/>
        {[0,1,2,3,4,5].map(i=><g key={`cw${i}`}><rect x="95" y={168-i*10} width="4" height="3" fill="#ffd000" opacity={pulse(i)}/><rect x="101" y={168-i*10} width="4" height="3" fill="#ffd000" opacity={pulse(i+1)}/></g>)}
      </g>
      <g>
        <ellipse cx={carX+14} cy="184" rx="22" ry="2.5" fill="#000" opacity="0.5"/>
        <path d={`M ${carX-6} ${carY+14} L ${carX-2} ${carY+10} L ${carX+22} ${carY+10} L ${carX+30} ${carY+12} L ${carX+34} ${carY+15} L ${carX+30} ${carY+17} L ${carX-2} ${carY+17} Z`} fill="#220838"/>
        <rect x={carX-2} y={carY+10} width="24" height="1" fill="#ff00aa" opacity="0.9"/>
        <rect x={carX-2} y={carY+18} width="32" height="1" fill="#00d4ff" opacity="0.85"/>
        <rect x={carX+33} y={carY+13} width="2" height="2" fill="#fff8a0"/>
        <rect x={carX+8} y={carY+6} width="2" height="6" fill="#0a72c4"/><rect x={carX+18} y={carY+6} width="2" height="6" fill="#0a72c4"/>
        <LogoChar cx={carX+13} cy={carY-2} pose={{legPhase:1,armL:70,armR:70,eyeShape:blink?'closed':'sparkle',mouth:'grin'}} hideLegs={true}/>
        {[0,1,2,3].map(i=><rect key={'sl'+i} x={carX-12-i*5} y={carY+12+i} width="6" height="1" fill="#ff00aa" opacity={0.55-i*0.13}/>)}
      </g>
      {vehicles}{parts}
      <rect x="0" y="180" width="200" height="20" fill="#0a0218"/>
      <rect x="0" y="180" width="200" height="1" fill="#ff00aa"/>
    </svg>
  );
}

export function SceneL0({ frame }) {
  const T = frame % 220;
  const phase = T < 44 ? 0 : T < 58 ? 1 : T < 110 ? 2 : T < 160 ? 3 : 4;
  const standX = 110, groundY = 130;
  const fallT = phase === 0 ? T / 44 : 1;
  const fallY = phase === 0 ? -40 + (fallT * fallT) * (groundY + 10) : groundY;
  const sqT = phase === 1 ? (T - 44) / 14 : 0;
  const squash = phase === 1 ? Math.sin(sqT * Math.PI) * 0.28 : 0;
  const charScaleY = 1 - squash, charScaleX = 1 + squash * 0.5;
  const sitOffsetY = phase >= 2 ? 6 : 0;
  const sitLean = phase >= 2 ? 4 : 0;
  const charY = phase === 0 ? fallY : (phase === 1 ? groundY : groundY + sitOffsetY);
  let eyeShape = 'wide', mouth = 'ohh';
  if (phase === 0) { eyeShape = 'wide'; mouth = 'ohh'; }
  else if (phase === 1) { eyeShape = 'closed'; mouth = 'determined'; }
  else if (phase === 2) { eyeShape = 'sleepy'; mouth = 'soft'; }
  else if (phase === 3) { eyeShape = (frame % 26) < 3 ? 'closed' : 'open'; mouth = 'soft'; }
  else { eyeShape = (frame % 50) < 3 ? 'closed' : 'happy'; mouth = 'bigGrin'; }
  const waveT = phase === 4 ? (T - 160) / 60 : 0;
  const waveAngle = phase === 4 ? Math.sin(waveT * Math.PI * 4) * 22 : 0;
  const scratchUp = phase === 3;
  const stars = phase === 2 ? Array.from({ length: 5 }, (_, i) => {
    const ang = frame * 0.12 + (i / 5) * Math.PI * 2;
    return <rect key={'s' + i} x={standX + Math.cos(ang) * 9} y={(charY - 12) + Math.sin(ang) * 3.5} width="2" height="2" fill="#ffd060" />;
  }) : [];
  const dustPhase = phase === 1 ? (T - 44) / 14 : (phase === 2 && T < 74 ? (T - 58) / 16 : -1);
  const dust = dustPhase >= 0 && dustPhase <= 1 ? [-1, 1].flatMap((dir, k) =>
    Array.from({ length: 4 }, (_, i) => <rect key={'d' + k + i} x={standX + dir * (4 + i * 3 + dustPhase * 14)} y={groundY + 12 - i - dustPhase * 2} width={2 + i} height="1" fill="#3a2a48" opacity={(1 - dustPhase) * 0.7} />)
  ) : [];
  const speedLines = phase === 0 && fallT > 0.3 ? Array.from({ length: 5 }, (_, i) =>
    <rect key={'sl' + i} x={90 + i * 8 + (i % 2) * 4} y={(frame * 4 + i * 30) % 120} width="1" height="6" fill="#4a3060" opacity={0.55} />
  ) : [];
  const sweatVisible = phase === 3 && ((T - 110) / 50) > 0.15;
  const showBubble = phase === 4 && waveT > 0.2;
  return (
    <svg viewBox="0 0 200 200">
      <defs>
        <radialGradient id="bg-l0" cx="50%" cy="65%">
          <stop offset="0%" stopColor="#3a2a48" /><stop offset="60%" stopColor="#1a1426" /><stop offset="100%" stopColor="#0a0612" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="200" height="200" fill="url(#bg-l0)" />
      <g>{[[30,30],[60,18],[160,40],[180,70],[150,15],[40,55]].map(([x,y],i)=>{
        const tw=(frame+i*7)%60;
        return <rect key={'s'+i} x={x} y={y} width="1" height="1" fill="#ffd9f0" opacity={tw<10?0.4:0.85}/>;
      })}</g>
      <ellipse cx="40" cy="170" rx="60" ry="22" fill="#1a2238" />
      <ellipse cx="160" cy="175" rx="70" ry="20" fill="#1a2238" />
      <ellipse cx="100" cy="190" rx="120" ry="28" fill="#241830" />
      {speedLines}{dust}
      <g style={{ transform: `scale(${charScaleX}, ${charScaleY})`, transformOrigin: `${standX}px ${groundY + 8}px` }}>
        <LogoChar cx={standX} cy={charY} pose={{
          legPhase: 0,
          armL: phase===0?60:(phase===1?40:(phase===2?-10:(phase===3?-20:30))),
          armR: phase===0?-60:(phase===1?-40:(phase===2?10:(phase===3?-50:(-30-waveAngle)))),
          armUp: phase===4||scratchUp, bodyLean: sitLean+(phase===0?Math.sin(frame*0.4)*3:0),
          eyeShape, mouth,
        }} hideLegs={phase >= 2} />
      </g>
      {phase >= 2 && <g>
        <rect x={standX-8} y={groundY+12} width="6" height="3" fill="#0a72c4"/>
        <rect x={standX-8} y={groundY+12} width="6" height="1" fill="#08324d"/>
        <rect x={standX-8} y={groundY+15} width="6" height="1" fill="#08324d"/>
        <rect x={standX-14} y={groundY+11} width="6" height="4" fill="#08538a"/>
        <rect x={standX-14} y={groundY+11} width="6" height="1" fill="#08324d"/>
        <rect x={standX-14} y={groundY+14} width="6" height="1" fill="#08324d"/>
        <rect x={standX+2} y={groundY+12} width="6" height="3" fill="#0a72c4"/>
        <rect x={standX+2} y={groundY+12} width="6" height="1" fill="#08324d"/>
        <rect x={standX+2} y={groundY+15} width="6" height="1" fill="#08324d"/>
        <rect x={standX+8} y={groundY+11} width="6" height="4" fill="#08538a"/>
        <rect x={standX+8} y={groundY+11} width="6" height="1" fill="#08324d"/>
        <rect x={standX+8} y={groundY+14} width="6" height="1" fill="#08324d"/>
      </g>}
      {stars}
      {sweatVisible && <g><rect x={standX+11} y={(charY-12)+((T-110)/50*4)%8} width="2" height="3" fill="#60d0ff"/><rect x={standX+11} y={(charY-12)+((T-110)/50*4)%8-1} width="2" height="1" fill="#aef0ff"/></g>}
      {showBubble && <g>
        <rect x={standX+18} y={charY-18} width="32" height="14" fill="#ffffff"/>
        <rect x={standX+18} y={charY-18} width="32" height="1" fill="#08324d"/>
        <rect x={standX+18} y={charY-5} width="32" height="1" fill="#08324d"/>
        <rect x={standX+18} y={charY-18} width="1" height="14" fill="#08324d"/>
        <rect x={standX+49} y={charY-18} width="1" height="14" fill="#08324d"/>
        <rect x={standX+16} y={charY-8} width="3" height="1" fill="#ffffff"/>
        <rect x={standX+14} y={charY-7} width="5" height="1" fill="#ffffff"/>
        <rect x={standX+16} y={charY-8} width="1" height="1" fill="#08324d"/>
        <rect x={standX+14} y={charY-7} width="1" height="1" fill="#08324d"/>
        <rect x={standX+14} y={charY-6} width="5" height="1" fill="#08324d"/>
        <rect x={standX+23} y={charY-14} width="1" height="6" fill="#08324d"/>
        <rect x={standX+27} y={charY-14} width="1" height="6" fill="#08324d"/>
        <rect x={standX+23} y={charY-11} width="5" height="1" fill="#08324d"/>
        <rect x={standX+31} y={charY-14} width="3" height="1" fill="#08324d"/>
        <rect x={standX+31} y={charY-9} width="3" height="1" fill="#08324d"/>
        <rect x={standX+32} y={charY-14} width="1" height="6" fill="#08324d"/>
        <rect x={standX+38} y={charY-14} width="1" height="4" fill="#08324d"/>
        <rect x={standX+38} y={charY-9} width="1" height="1" fill="#08324d"/>
        <rect x={standX+43} y={charY-13} width="1" height="1" fill="#ff60c0"/>
        <rect x={standX+45} y={charY-13} width="1" height="1" fill="#ff60c0"/>
        <rect x={standX+42} y={charY-12} width="5" height="1" fill="#ff60c0"/>
        <rect x={standX+43} y={charY-11} width="3" height="1" fill="#ff60c0"/>
        <rect x={standX+44} y={charY-10} width="1" height="1" fill="#ff60c0"/>
      </g>}
    </svg>
  );
}
