import React, { useState, useEffect, useRef } from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig";
import HOLIDAYS_DATA from './data/holidays.json';
import RAW_STAFF_LIST from './data/staff.json';
import STATUS_CONFIG from './data/status.json';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vzdrpydtxlamoqtukgld.supabase.co',
  'sb_publishable_o1d0wmxwLrJCuTQ84uY38g__dqoj2dD'
);

const msalInstance = new PublicClientApplication(msalConfig);
const STAFF_LIST = RAW_STAFF_LIST.filter(p => p.id !== 'arthur');
const SUPER_USERS = ['arthur.cheung@patternasia.com', 'brenda.lee@patternasia.com'];
const CHINA_EXTRA = ['jessica.rao@patternasia.com'];

const isSuperUser  = em => SUPER_USERS.includes(em.toLowerCase());
const isChinaExtra = em => CHINA_EXTRA.includes(em.toLowerCase());
const getStaffEntry = em => RAW_STAFF_LIST.find(s => s.email.toLowerCase() === em.toLowerCase());

const ROW_H  = 104;
const NAV_H  = 56;
const SUB_H  = 72;
const TB_H   = 52;
const LG_H   = 36;
const AM_REF = 'am-ref-btn';

// 顶部所有组件的总高度
const HEADER_STICKY_TOP = NAV_H + SUB_H + TB_H + LG_H;

const fmt = date => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
};

const TEAMS_COLORS = ['#B3CEE0','#D1A7C8','#A7C8A0','#E0C8A7','#A7B9E0','#E0A7A7','#C8D1A7','#A7D1CE','#D1C8A7','#B9A7E0','#A7C8D1','#E0B9A7'];
const teamsColor = name => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return TEAMS_COLORS[Math.abs(h) % TEAMS_COLORS.length];
};

const initials = name => {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name[0].toUpperCase();
};

function Avatar({ name, photoUrl, size=34, isMe=false }) {
  if (!name) return null;
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0, overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.36, fontFamily:"'Segoe UI',sans-serif", fontWeight:600,
      letterSpacing:'0.02em', background:photoUrl?'transparent':teamsColor(name),
      color:'#fff', userSelect:'none',
      ...(isMe?{boxShadow:'0 0 0 2px #fff,0 0 0 4px #770bff'}:{}),
    }}>
      {photoUrl ? <img src={photoUrl} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : initials(name)}
    </div>
  );
}

const GlobalStyles = () => (
  <style>{`
    *,*:before,*:after{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%}
    @keyframes holiBounce{0%{transform:scale(1)}30%{transform:scale(1.03)}60%{transform:scale(0.98)}85%{transform:scale(1.01)}100%{transform:scale(1)}}
    @keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
    @keyframes pulseDot{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 4px rgba(34,197,94,0)}}
    .holi-tap{animation:holiBounce 0.4s cubic-bezier(0.25,0.46,0.45,0.94) both !important;transform-origin:center center;isolation:isolate}
    body{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;background:#f4f5f7;color:#111827;-webkit-font-smoothing:antialiased}
    
    /* 导航栏部分：确保它们是 Fixed 或 Sticky */
    .nav{height:${NAV_H}px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 28px;position:sticky;top:0;z-index:1000}
    .sub-header{height:${SUB_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;position:sticky;top:${NAV_H}px;z-index:999}
    .toolbar{height:${TB_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;position:sticky;top:${NAV_H+SUB_H}px;z-index:998}
    .legend{height:${LG_H}px;padding:0 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:20px;position:sticky;top:${NAV_H+SUB_H+TB_H}px;z-index:997}

    /* 表格容器：移除 overflow-x: auto 对 sticky 的破坏，或者确保高度不受限 */
    .tbl-outer{padding:0 28px 48px;background:#f4f5f7; position: relative;}
    
    .main-tbl{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;min-width:860px}
    
    /* 核心冻结逻辑：直接作用于 TH */
    .main-tbl thead th {
      position: sticky;
      top: ${HEADER_STICKY_TOP}px;
      background: #f4f5f7;
      z-index: 800; /* 高于普通单元格 */
      box-shadow: inset 0 -1px 0 #ebebeb; /* 模拟边框，防止滚动时边框消失 */
    }

    /* 左上角角块：双重冻结（横向+纵向） */
    .sticky-h {
      position: sticky;
      left: 0;
      top: ${HEADER_STICKY_TOP}px;
      z-index: 900 !important; /* 最高级别，确保遮挡所有滚动内容 */
      background: #f4f5f7;
    }

    /* 员工姓名列：横向冻结 */
    .sticky-c {
      position: sticky;
      left: 0;
      z-index: 700;
      background: #f4f5f7;
    }

    .main-tbl td{padding:0;height:${ROW_H}px;vertical-align:top}
    .sticky-c::after,.sticky-h::after{content:'';position:absolute;top:0;right:-16px;bottom:0;width:16px;background:linear-gradient(to right,rgba(0,0,0,0.04),transparent);pointer-events:none}
    
    /* 样式微调... */
    .nav-tab{height:${NAV_H}px;display:flex;align-items:center;padding:0 14px;font-size:13px;font-weight:400;color:#6b7280;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;user-select:none}
    .nav-tab.active{color:transparent;background:linear-gradient(90deg,#009bff,#770bff);-webkit-background-clip:text;background-clip:text;border-image:linear-gradient(90deg,#009bff,#770bff) 1;font-weight:600}
    .nw{height:${ROW_H}px;display:flex;align-items:center;gap:10px;padding:0 8px;border-bottom:1px solid #ebebeb}
    .dw{height:${ROW_H}px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:0 4px;border-bottom:1px solid #ebebeb}
    .sh{height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;cursor:pointer;transition:all 0.1s;border:none}
    .sh.preview{background:#dbeafe !important;border:2px dashed #0284c7 !important;opacity:0.8}
    /* 其他样式省略，保持不变... */
  `}</style>
);

// ... (LoginScreen, AccessDeniedScreen 保持不变)

export default function App() {
  // ... (State 和 useEffect 逻辑完全保持不变)

  return (
    <div style={{minHeight:'100vh', background:'#f4f5f7'}} onMouseUp={handleStatusCellMouseUp}>
      <GlobalStyles />
      {/* 假期飘浮标签逻辑... */}
      
      {/* Navbar, Subheader, Toolbar, Legend 区域保持不变 */}
      <nav className="nav">...</nav>
      <div className="sub-header">...</div>
      <div className="toolbar">...</div>
      <div className="legend">...</div>

      <div className="tbl-outer dsz">
        <table className="main-tbl">
          <colgroup>
            <col style={{width:'200px'}}/>
            {week.map(d => <col key={d.ds}/>)}
          </colgroup>
          <thead>
            <tr>
              {/* 这里就是“左上角”的格子 */}
              <th className="sticky-h"></th>
              {week.map(d => (
                <th key={d.ds}>
                  <div style={{fontSize:'10px',fontWeight:'600',color:d.isToday?'#770bff':'#9ca3af',marginBottom:'5px',letterSpacing:'0.06em'}}>{d.dayName.toUpperCase()}</div>
                  <div style={{width:'30px',height:'30px',borderRadius:'50%',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',background:d.isToday?'linear-gradient(135deg,#009bff,#770bff)':'transparent',color:d.isToday?'#fff':'#111827',fontSize:'14px',fontWeight:'600'}}>{d.num}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staffList.map((m, rowIdx) => (
              <tr key={m.id} id={m.email.toLowerCase() === me ? 'my-row' : undefined}>
                {/* 姓名列：sticky-c 实现横向冻结 */}
                <td className="sticky-c">
                  <div className="nw">
                    {/* ... 姓名和头像代码 ... */}
                  </div>
                </td>
                {/* ... 日期单元格代码 ... */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}