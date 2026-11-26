#!/usr/bin/env node
/* Smoke-Test für Bus-Imperium Europa (v10).
   Aufruf: node busunternehmen/tests/smoke.js
   Braucht Playwright (Pfad per PLAYWRIGHT_PATH überschreibbar). Exit-Code ≠ 0 bei Fehlern. */
'use strict';
const path=require('path');
let pw;
try{pw=require(process.env.PLAYWRIGHT_PATH||'/opt/node-tools/node_modules/playwright');}catch(e){pw=require('playwright');}
const {chromium}=pw;
const URL='file://'+path.resolve(__dirname,'..','index.html');
const fails=[];
const ok=(cond,msg)=>{console.log((cond?'  ok   ':'  FAIL ')+msg);if(!cond)fails.push(msg);};

// Läuft im Browser: Hilfsfunktionen
const HELPERS=()=>{
  const B=window.__bus;
  window.T={
    B,
    hide(){document.getElementById('modalbg').style.display='none';},
    closeModals(){let k=0;while(B.ui.modalOpen&&k++<20){const h=document.querySelector('#modal h2');if(h&&/Insolvenz/.test(h.textContent))break;const b=document.querySelector('#modal .btns button');if(!b)break;b.click();}T.hide();},
    days(n){for(let d=0;d<n;d++){for(let i=0;i<240;i++)B.step(0.1);T.closeModals();}},
    nanScan(o,p,out,seen){
      out=out||[];seen=seen||new Set();p=p||'S';
      if(o===null||typeof o!=='object'){if(typeof o==='number'&&!Number.isFinite(o))out.push(p);return out;}
      if(seen.has(o))return out;seen.add(o);
      for(const k of Object.keys(o))T.nanScan(o[k],p+'.'+k,out,seen);
      return out;
    },
    renderAll(){
      const errs=[];
      for(const [k,f] of Object.entries(B.TABS)){
        try{const h=f();if(typeof h!=='string'||/NaN|undefined|Infinity/.test(h.replace(/<[^>]*>/g,'')))errs.push(k+': verdächtige Ausgabe');}
        catch(e){errs.push(k+': '+e.message);}
      }
      return errs;
    },
    buyFor(L){
      const S=B.S;Object.assign(B.ui.cfg,B.recSpec(L),{qty:1,design:null});
      const n=S.buses.length;B.buyBuses();
      if(S.buses.length>n){const b=S.buses[S.buses.length-1];return B.tryAssign(b,L)?b:null;}
      return null;
    },
  };
};

(async()=>{
  const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const errors=[];
  const newPage=async(init)=>{
    const ctx=await br.newContext({viewport:{width:1280,height:820}});
    if(init)await ctx.addInitScript(init.fn,init.arg);
    const pg=await ctx.newPage();
    pg.on('pageerror',e=>errors.push(e.message));
    pg.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
    await pg.goto(URL);await pg.waitForTimeout(300);
    await pg.evaluate(HELPERS);
    return {ctx,pg};
  };

  console.log('1) Neues Spiel, Schwierigkeit, Linien, Busse');
  let {ctx,pg}=await newPage();
  let r=await pg.evaluate(()=>{
    const B=T.B,S=B.S;
    const startModal=document.querySelector('#modal h2').textContent;
    B.setDiff('hard');B.startIn('BER');B.modalQ.length=0;B.ui.modalOpen=false;T.hide();B.S.speed=0;
    const cash0=B.S.cash,diff=B.S.diff;
    B.createLine('BER','LEI');B.createLine('BER','DRE');
    const L1=B.S.lines[0],L2=B.S.lines[1];
    const start=B.S.buses[0];const okStart=B.tryAssign(start,L1)||B.tryAssign(start,L2);
    B.S.cash+=400000;
    const b1=T.buyFor(L1),b2=T.buyFor(L2),b3=T.buyFor(L2);
    return {startModal,cash0,diff,lines:B.S.lines.length,assigned:B.S.buses.filter(b=>b.line).length,okStart,b:!!(b1&&b2&&b3)};
  });
  ok(/Schwierigkeit/.test(r.startModal),'Startdialog fragt nach Schwierigkeit');
  ok(r.cash0===90000&&r.diff==="hard","Schwer: 90.000 € Startkapital");
  ok(r.lines===2&&r.b&&r.assigned>=3,'Linien angelegt, Busse gekauft und eingesetzt');

  console.log('2) Neue Systeme');
  r=await pg.evaluate(()=>{
    const B=T.B,S=B.S,out={};
    // Wartung
    S.maint=60;
    // Personal
    S.staff.wage=0.85;
    // Ausschreibung
    S.tenders.offers=[];B.genTenders();
    out.tenders=S.tenders.offers.length;
    const o=S.tenders.offers[0];
    if(o){B.acceptTender(o.id);const L=S.lines.find(l=>l.tn);out.tLine=!!L;
      if(L){for(let i=0;i<L.tn.minBuses;i++)T.buyFor(L);}}
    B.genTenders();out.tenders2=S.tenders.offers.length;
    // Saison
    const muc=B.CITIES.find(c=>c.id==='MUC'),ber=B.CITIES.find(c=>c.id==='BER');
    out.season=[B.seasonCity(muc,6),B.seasonCity(muc,0),B.seasonCity(ber,11),B.seasonCity(ber,3)];
    T.days(65);
    out.day=S.day;out.mis=Object.keys(S.mis.done);out.repairs=S.mis.rep;
    out.months=S.months.length;out.sat=S.staff.sat;
    const tl=S.lines.find(l=>l.tn);out.tPaid=tl?tl.tn.paid:(S.log.some(l=>/Ausschreibung .* erfüllt|entzogen/.test(l.m))?1:0);
    out.tGone=S.log.some(l=>/ging an/.test(l.m));
    out.autoLog=S.log.some(l=>/Automatische Wartung heute/.test(l.m));
    out.perBusLog=S.log.filter(l=>/automatisch gewartet/.test(l.m)).length;
    // Layer
    B.setLayer('riv');out.rivLayer=Object.keys(B.layerData()).length;
    B.setLayer('dem');out.demLayer=Object.keys(B.layerData()).length;
    B.setLayer('none');
    // Linie löschen mit Ausschreibung -> Strafe
    return out;
  });
  ok(r.tenders>=1&&r.tLine,'Ausschreibung erzeugt und angenommen');
  ok(r.tPaid>0,'Ausschreibung zahlt Zuschuss');
  ok(r.tGone,'Nicht angenommene Ausschreibung geht an einen Rivalen');
  ok(r.season[0]>1.2&&r.season[1]<0.85&&r.season[2]>1.05&&r.season[3]===1,'Saisonfaktoren (Sommer/Winter/Dezember)');
  ok(r.day>=65,'65 Tage simuliert');
  ok(r.mis.includes('line')&&r.mis.includes('assign')&&r.mis.includes('bus2'),'Erste Schritte erledigt: '+r.mis.join(','));
  ok(r.repairs>0&&r.autoLog&&r.perBusLog===0,'Automatische Wartung mit Tageszusammenfassung');
  ok(r.months>=1,'Monatsbericht aufgezeichnet ('+r.months+')');
  ok(r.sat<60,'Niedriger Lohn senkt Zufriedenheit ('+Math.round(r.sat)+' %)');
  ok(r.rivLayer>0&&r.demLayer>0,'Kartenebenen liefern Daten');

  console.log('3) Tempo 10×, Meldungen, Export/Import, alle Reiter');
  await pg.evaluate(()=>{T.B.S.speed=10;});
  const d0=await pg.evaluate(()=>T.B.S.t);
  await pg.waitForTimeout(1500);
  await pg.evaluate(()=>T.closeModals());
  const d1=await pg.evaluate(()=>{T.B.S.speed=0;return T.B.S.t;});
  ok(d1-d0>2,'10× Tempo läuft ('+(d1-d0).toFixed(1)+' h in 1,5 s)');
  r=await pg.evaluate(()=>{
    const B=T.B,out={};
    B.openLog();out.log=document.querySelectorAll('#modal .fulllog div').length;T.closeModals();
    B.exportSave();const txt=document.getElementById('expTxt').value;out.exp=txt.length;
    const day=B.S.day;T.closeModals();
    B.S.day+=0; const saved=txt;
    B.importSave();document.getElementById('impTxt').value='kaputt';[...document.querySelectorAll('#modal .btns button')].find(b=>b.textContent==='Laden').click();
    out.badMsg=document.querySelector('#modal h2').textContent;T.closeModals();
    B.importSave();document.getElementById('impTxt').value=saved;[...document.querySelectorAll('#modal .btns button')].find(b=>b.textContent==='Laden').click();T.closeModals();
    out.dayAfter=B.S.day;out.day=day;
    out.render=T.renderAll();
    for(const t of Object.keys(B.TABS)){B.ui.tab=t;}
    B.ui.tab='ov';
    out.nan=T.nanScan(B.S);
    return out;
  });
  ok(r.log>5,'Volles Meldungsprotokoll ('+r.log+' Einträge)');
  ok(r.exp>1000,'Export liefert Text ('+Math.round(r.exp/1024)+' KB)');
  ok(/fehlgeschlagen/.test(r.badMsg),'Import lehnt ungültigen Text ab');
  ok(r.dayAfter===r.day,'Import stellt Spielstand wieder her');
  ok(r.render.length===0,'Alle Reiter rendern: '+(r.render.join('; ')||'ok'));
  ok(r.nan.length===0,'Keine NaN/Infinity im Zustand '+r.nan.slice(0,5).join(','));
  // echtes Rendern über die Tabs
  for(const t of ['ov','lines','fleet','sites','tech','market','firm','stats','wealth']){
    await pg.click(`#tabs button[data-tab="${t}"]`);await pg.waitForTimeout(60);
  }
  r=await pg.evaluate(()=>({err:T.B.S.log.filter(l=>/Fehler im Spiel/.test(l.m)).map(l=>l.m)}));
  ok(r.err.length===0,'Keine Fehler im Spiel-Log '+r.err.join(' | '));

  // Speicherstand für v9-Test sichern
  const saveJson=await pg.evaluate(()=>JSON.stringify(T.B.S));
  await ctx.close();

  console.log('4) Karriere: vom Fahrer zum Unternehmer');
  ({ctx,pg}=await newPage());
  r=await pg.evaluate(()=>{
    const B=T.B;B.modalQ.length=0;B.ui.modalOpen=false;T.hide();
    B.setDiff('normal');B.startCareer('BER');B.S.speed=0;
    const S=B.S,C=S.career,out={start:S.wealth,owned:S.owned,tab:B.ui.tab};
    let d=0;
    while(d<250&&!(C.cert&&S.wealth>=12000)){
      const lv=B.careerLevel();
      if(C.fat>55)C.shift='off';else C.shift=lv>=2?'dispo':lv>=1?'long':'city';
      C.ot=C.fat<35&&C.shift!=='off';
      if(lv>=2&&!C.cert&&C.course===0&&S.wealth>=3000+1000)B.startCourse();
      T.days(1);d++;
    }
    out.days=d;out.cert=C.cert;out.wealth=Math.round(S.wealth);out.lvl=B.careerLevel();
    out.render=T.renderAll().filter(x=>!/^(ov|lines|fleet|sites|tech|market|firm|stats):/.test(x));
    B.careerFound();
    out.owned2=B.S.owned;out.done=B.S.career&&B.S.career.done;out.cash=B.S.cash;out.buses=B.S.buses.length;
    T.days(20);
    out.nan=T.nanScan(B.S);out.render2=T.renderAll();
    return out;
  });
  ok(!r.owned&&r.tab==='career','Karriere startet ohne Unternehmen im Reiter Karriere');
  ok(r.cert&&r.wealth>=12000,`Gründungsbedingungen nach ${r.days} Tagen erreicht (Stufe ${r.lvl}, ${r.wealth} €)`);
  ok(r.render.length===0,'Karriere-Reiter rendern '+r.render.join('; '));
  ok(r.owned2&&r.done&&r.buses===1&&r.cash>5000,'Gründung aus der Karriere');
  ok(r.nan.length===0&&r.render2.length===0,'Nach Gründung: keine NaN, alle Reiter rendern '+r.nan.concat(r.render2).slice(0,5).join(','));
  r=await pg.evaluate(()=>{const B=T.B;B.restart();B.modalQ.length=0;B.ui.modalOpen=false;T.hide();B.startCareer('MUC');B.skipCareer();return {owned:B.S.owned,cash:B.S.cash,career:B.S.career};});
  ok(r.owned&&r.cash===120000&&r.career===null,'Karriere überspringen gibt den normalen Start');
  await ctx.close();

  console.log('5) Alter v9-Spielstand');
  const s=JSON.parse(saveJson);
  for(const k of ['diff','maint','mis','career','staff','tenders','months','monAcc','autoRep','paxMark','rivNid'])delete s[k];
  for(const L of s.lines){delete L.h30;delete L.tn;delete L.nb;}
  for(const l of s.log)delete l.d;
  for(const k of Object.keys(s.today))if(k==='sub')delete s.today[k];
  s.v=3;
  ({ctx,pg}=await newPage({fn:([k,v])=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(k,v);sessionStorage.setItem('seeded','1');}},arg:['busimperium_eu_v1',JSON.stringify(s)]}));
  r=await pg.evaluate(()=>{
    const B=T.B,S=B.S;T.hide();
    const out={loaded:S.lines.length,day:S.day,diff:S.diff,maint:S.maint,modal:B.ui.modalOpen};
    S.speed=0;T.days(10);
    out.day2=S.day;out.nan=T.nanScan(S);out.render=T.renderAll();
    out.err=S.log.filter(l=>/Fehler im Spiel/.test(l.m)).length;
    return out;
  });
  ok(r.loaded>=2&&r.diff==='normal'&&r.maint===40&&!r.modal,'v9-Stand geladen mit Standardwerten');
  ok(r.day2===r.day+10&&r.nan.length===0&&r.render.length===0&&r.err===0,'v9-Stand läuft 10 Tage fehlerfrei '+r.nan.concat(r.render).slice(0,5).join(','));
  await ctx.close();

  ok(errors.length===0,'Keine Seitenfehler '+errors.slice(0,5).join(' | '));
  await br.close();
  console.log(fails.length?`\n${fails.length} FEHLER`:'\nAlles in Ordnung.');
  process.exit(fails.length?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
