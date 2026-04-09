'use strict';

// ── STATE ──────────────────────────────────────────────
const P = {}; // progress: { id: {c,w,streak,interval,seen} }
const Q = { qs:[], idx:0, res:[], sel:new Set(), done:false, mode:'learn', sec:0, timer:null };

function loadP(){
  try{ const r=localStorage.getItem('sap_p'); if(r) Object.assign(P,JSON.parse(r)); }catch(e){}
}
function saveP(){ localStorage.setItem('sap_p',JSON.stringify(P)); }
function gp(id){
  if(!P[id]) P[id]={c:0,w:0,streak:0,iv:1,seen:null};
  return P[id];
}
function upd(id,correct,conf){
  const p=gp(id); p.seen=Date.now();
  if(correct && conf===2){ p.c++;p.streak++;p.iv=Math.min(p.iv*2,30); }
  else if(correct && conf===1){ p.c++;p.streak++;p.iv=Math.min(p.iv*1.3,30); }
  else{ p.w++;p.streak=0;p.iv=1; }
  saveP();
}

// ── HELPERS ────────────────────────────────────────────
function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
function totalC(){ return Object.values(P).reduce((s,p)=>s+p.c,0); }
function totalW(){ return Object.values(P).reduce((s,p)=>s+p.w,0); }
function mastered(){ return Object.values(P).filter(p=>p.streak>=3).length; }
function accuracy(){ const c=totalC(),w=totalW(); return (c+w)?Math.round(c/(c+w)*100):0; }

function bySource(src){
  if(src==='Alle') return QUESTIONS;
  return QUESTIONS.filter(q=>q.source===src);
}
function themen(src){
  const qs=bySource(src);
  const set=new Set(qs.map(q=>q.thema));
  return ['Alle Themen',...[...set].sort((a,b)=>a.localeCompare(b,'de'))];
}

// ── SCREENS ────────────────────────────────────────────
function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
}

// ── TOAST / MODAL ──────────────────────────────────────
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('on');
  setTimeout(()=>t.classList.remove('on'),2200);
}
function modal(title,txt,cancel,confirm,cb){
  $('m-title').textContent=title; $('m-txt').textContent=txt;
  $('m-cancel').textContent=cancel; $('m-ok').textContent=confirm;
  $('m-ok').onclick=()=>{ hideModal(); cb(); };
  $('modal').classList.add('on');
}
function hideModal(){ $('modal').classList.remove('on'); }
function $(id){ return document.getElementById(id); }

// ── HOME ───────────────────────────────────────────────
function home(){
  $('h-acc').textContent=accuracy()+'%';
  $('h-mas').textContent=mastered()+'/'+QUESTIONS.length;
  show('s-home');
}

// ── SETUP ──────────────────────────────────────────────
let setupSrc='Alle', setupMode='learn';

function openSetup(mode){
  setupMode=mode; setupSrc='Alle';
  const exam=mode==='exam';
  $('su-title').textContent=exam?'Prüfungsmodus':'Lernmodus';
  $('su-cnt').style.display=exam?'none':'block';
  $('su-exam').style.display=exam?'block':'none';
  $('su-start').textContent=exam?'Prüfung starten':'Lernen starten';
  $('su-start').className='btn '+(exam?'btn-red':'btn-blue');

  document.querySelectorAll('.src-btn').forEach(b=>{
    b.classList.toggle('on', b.dataset.s==='Alle');
    b.onclick=()=>{
      setupSrc=b.dataset.s;
      document.querySelectorAll('.src-btn').forEach(x=>x.classList.remove('on'));
      b.classList.add('on');
      fillThemen();
    };
  });
  fillThemen();
  $('sl-val').textContent=$('sl').value;
  show('s-setup');
}

function fillThemen(){
  const sel=$('thema');
  sel.innerHTML=themen(setupSrc).map(t=>`<option>${t}</option>`).join('');
}

function startQuiz(){
  const thema=$('thema').value;
  const cnt=setupMode==='exam'?80:parseInt($('sl').value);
  let pool=bySource(setupSrc);
  if(thema!=='Alle Themen') pool=pool.filter(q=>q.thema===thema);
  pool=shuffle(pool).slice(0,Math.min(cnt,pool.length));
  if(!pool.length){ toast('Keine Fragen für diese Auswahl!'); return; }

  Object.assign(Q,{qs:pool,idx:0,res:[],sel:new Set(),done:false,
    mode:setupMode,sec:setupMode==='exam'?180*60:0,timer:null});
  renderQ();
  if(setupMode==='exam') startTimer();
}

// ── QUIZ ───────────────────────────────────────────────
function renderQ(){
  const q=Q.qs[Q.idx];
  const pct=(Q.idx+1)/Q.qs.length;
  const exam=Q.mode==='exam';

  const bar=$('q-bar');
  bar.style.width=(pct*100)+'%';
  bar.style.background=exam?'#E07060':'#4A9EBF';

  $('q-num').textContent=`Frage ${Q.idx+1} von ${Q.qs.length}`;
  $('q-thema').textContent=q.thema;
  $('q-timer-wrap').style.display=exam?'flex':'none';
  const correctCount = q.richtige_antworten.length;
  if(q.typ==='multiple_select'){
    $('multi-tag').style.display='inline-block';
    $('multi-tag').textContent=correctCount+' Antworten richtig';
  } else {
    $('multi-tag').style.display='none';
  }
  $('q-text').textContent=q.frage;

  const oc=$('opts');
  oc.innerHTML='';
  const multi=q.typ==='multiple_select';
  q.optionen.forEach(opt=>{
    const b=document.createElement('button');
    b.className='opt';
    b.dataset.o=opt;
    b.innerHTML=`<span class="opt-chk${multi?' sq':''}">${Q.sel.has(opt)?'✓':''}</span>
      <span class="opt-txt">${opt}</span><span class="opt-ico"></span>`;
    if(Q.sel.has(opt)) b.classList.add('sel');
    b.onclick=()=>pick(opt);
    oc.appendChild(b);
  });

  $('fb-area').style.display='none';
  $('q-confirm').style.display='block';
  $('q-confirm').disabled=Q.sel.size===0;

  show('s-quiz');
}

function pick(opt){
  if(Q.done) return;
  const q=Q.qs[Q.idx];
  if(q.typ==='multiple_select'){
    if(Q.sel.has(opt)){ Q.sel.delete(opt); }
    else if(Q.sel.size < q.richtige_antworten.length){ Q.sel.add(opt); }
    else{ return; }
  } else { Q.sel=new Set([opt]); }
  document.querySelectorAll('.opt').forEach(b=>{
    const on=Q.sel.has(b.dataset.o);
    b.classList.toggle('sel',on);
    b.querySelector('.opt-chk').textContent=on?'✓':'';
  });
  $('q-confirm').disabled=Q.sel.size===0;
}

function correct(){
  const q=Q.qs[Q.idx];
  const right=new Set(q.richtige_antworten);
  if(Q.sel.size!==right.size) return false;
  for(const s of Q.sel) if(!right.has(s)) return false;
  return true;
}

function confirm(){
  if(!Q.sel.size) return;
  Q.done=true;
  const q=Q.qs[Q.idx];
  const ok=correct();
  Q.res.push(ok);

  document.querySelectorAll('.opt').forEach(b=>{
    const opt=b.dataset.o;
    const isRight=q.richtige_antworten.includes(opt);
    const chosen=Q.sel.has(opt);
    b.classList.remove('sel');
    if(isRight){ b.classList.add('ok'); b.querySelector('.opt-ico').textContent='✓'; }
    else if(chosen){ b.classList.add('no'); b.querySelector('.opt-ico').textContent='✗'; }
    b.disabled=true;
  });

  $('q-confirm').style.display='none';

  if(Q.mode==='exam'){
    upd(q.id,ok,2);
    setTimeout(next,500);
    return;
  }

  const fb=$('fb-box');
  fb.className='fb '+(ok?'ok':'no');
  $('fb-ico').textContent=ok?'✓':'✗';
  $('fb-txt').textContent=ok?'Richtig!':'Falsch';
  $('exp-richtig').textContent=q.erklaerung.richtig||'';
  const esEl=$('exp-esels-row');
  if(q.erklaerung.eselsbruecke){
    esEl.style.display='flex';
    $('exp-esels').textContent=q.erklaerung.eselsbruecke;
  } else { esEl.style.display='none'; }

  const expBtn=$('exp-btn');
  const expBox=$('exp-box');
  expBtn.classList.remove('open');
  expBox.classList.remove('show');
  $('fb-area').style.display='block';
}

function setConf(v){
  upd(Q.qs[Q.idx].id,correct(),v);
  next();
}

function next(){
  if(Q.idx>=Q.qs.length-1){ finish(); return; }
  Q.idx++; Q.sel=new Set(); Q.done=false;
  renderQ();
}

// ── TIMER ──────────────────────────────────────────────
function startTimer(){
  Q.timer=setInterval(()=>{
    Q.sec--;
    const m=String(Math.floor(Q.sec/60)).padStart(2,'0');
    const s=String(Q.sec%60).padStart(2,'0');
    const el=$('q-timer');
    el.textContent=`${m}:${s}`;
    el.className='timer'+(Q.sec<600?' warn':'');
    if(Q.sec<=0){ clearInterval(Q.timer); finish(); }
  },1000);
  const el=$('q-timer');
  el.textContent='03:00';
}

// ── RESULT ─────────────────────────────────────────────
function finish(){
  if(Q.timer) clearInterval(Q.timer);
  const ok=Q.res.filter(Boolean).length;
  const tot=Q.res.length;
  const pct=tot?Math.round(ok/tot*100):0;
  const exam=Q.mode==='exam';
  const pass=pct>=70;

  $('r-circle').className='res-circle'+(pass?'':' fail');
  $('r-pct').textContent=pct+'%';
  $('r-sub').textContent=exam?(pass?'Bestanden':'Nicht bestanden'):'Ergebnis';
  $('r-title').textContent=exam?(pass?'Glückwunsch!':'Weiter üben!'):'Durchlauf abgeschlossen';
  $('r-detail').textContent=`${ok} von ${tot} richtig · ${tot-ok} Fehler`;

  const wrong=Q.qs.filter((_,i)=>!Q.res[i]);
  const eb=$('r-err-btn');
  if(wrong.length){
    eb.style.display='block';
    eb.textContent=`Nur Fehler wiederholen (${wrong.length})`;
    eb.onclick=()=>retryErrors(wrong);
  } else { eb.style.display='none'; }

  show('s-result');
}

function retryErrors(wrong){
  Object.assign(Q,{qs:wrong,idx:0,res:[],sel:new Set(),done:false,mode:'learn',sec:0,timer:null});
  renderQ();
}

// ── ERROR POOL ─────────────────────────────────────────
function openErrors(){
  const errs=QUESTIONS
    .filter(q=>(P[q.id]?.w||0)>0)
    .sort((a,b)=>(P[b.id]?.w||0)-(P[a.id]?.w||0));

  $('err-hdr').style.display=errs.length?'flex':'none';
  $('err-empty').style.display=errs.length?'none':'block';
  $('err-list').style.display=errs.length?'block':'none';

  if(errs.length){
    $('err-lbl').textContent=`${errs.length} Fragen mit Fehlern`;
    $('err-start').onclick=()=>retryErrors(errs);
    $('err-list').innerHTML=errs.map(q=>{
      const w=P[q.id]?.w||0;
      const short=q.frage.length>90?q.frage.substring(0,90)+'…':q.frage;
      return `<div class="ei"><div class="ei-cnt">${w}x</div>
        <div><div class="ei-q">${short}</div>
        <div class="ei-t">${q.thema}</div></div></div>`;
    }).join('');
  }
  show('s-errors');
}

// ── STATS ──────────────────────────────────────────────
function openStats(){
  $('st-acc').textContent=accuracy()+'%';
  $('st-mas').textContent=mastered()+'/'+QUESTIONS.length;
  $('st-ok').textContent=totalC();
  $('st-bad').textContent=totalW();

  const tm={};
  QUESTIONS.forEach(q=>{
    if(!tm[q.thema]) tm[q.thema]={c:0,w:0,tot:0};
    const p=P[q.id];
    if(p){tm[q.thema].c+=p.c;tm[q.thema].w+=p.w;}
    tm[q.thema].tot++;
  });

  const sorted=Object.entries(tm).sort((a,b)=>b[1].w-a[1].w);
  $('st-list').innerHTML=sorted.map(([name,s])=>{
    const tot=s.c+s.w;
    const rate=tot?s.c/tot:-1;
    const pct=tot?Math.round(rate*100)+'%':'—';
    const col=rate<0?'#4A5568':rate>=0.7?'#4CAF50':rate>=0.5?'#FFB347':'#E07060';
    const bar=rate<0?0:Math.round(rate*100);
    return `<div class="tc">
      <div style="display:flex;align-items:center;margin-bottom:8px">
        <div class="th-name">${name}</div>
        <div class="th-pct" style="color:${col}">${pct}</div>
      </div>
      <div class="th-bar"><div class="th-fill" style="width:${bar}%;background:${col}"></div></div>
      <div class="th-det">${s.c} richtig · ${s.w} falsch · ${s.tot} Fragen</div>
    </div>`;
  }).join('');
  show('s-stats');
}

function resetStats(){
  modal('Fortschritt zurücksetzen?',
    'Alle Statistiken werden gelöscht.','Abbrechen','Löschen',()=>{
      Object.keys(P).forEach(k=>delete P[k]);
      saveP(); toast('Zurückgesetzt'); openStats();
    });
}

function quitQuiz(){
  modal('Quiz beenden?','Fortschritt in diesem Durchlauf geht verloren.',
    'Weiter','Beenden',()=>{
      if(Q.timer) clearInterval(Q.timer);
      home();
    });
}

// ── INIT ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  loadP();

  $('sl').addEventListener('input',()=>{ $('sl-val').textContent=$('sl').value; });

  $('exp-btn').addEventListener('click',()=>{
    $('exp-btn').classList.toggle('open');
    $('exp-box').classList.toggle('show');
  });

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }

  home();
});
