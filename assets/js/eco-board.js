/* Ecosystem Board engine — shared by /marketing-ecosystem/score and the
   /marketing-ecosystem embed. Data-driven: the 22 motions, level definitions,
   unlock rules and EMS weights live in the structures below, so the doctrine can
   be updated here without touching page markup. Auto-inits if #eco-boardroot
   exists. Namespaced (eb- classes, eco- ids) to be collision-safe on any page. */
(function(){
  var mount = document.getElementById('eco-boardroot');
  if(!mount) return;

  var PILLARS=[
   {n:"Create",job:"Make demand exist among buyers not yet searching",c:"var(--eco-lime)",cls:"eb-create"},
   {n:"Capture",job:"Catch the roughly 5 percent actively searching",c:"var(--eco-rust)",cls:"eb-capture"},
   {n:"Connect",job:"Turn anonymous attention into named, scored, routable accounts",c:"var(--eco-blue)",cls:"eb-connect"},
   {n:"Convert + Extend",job:"Turn warm accounts into pipeline; scale reach against a qualified pool",c:"var(--eco-teal)",cls:"eb-convert"},
   {n:"Compound",job:"Measure, diagnose, experiment; the system gets smarter every quarter",c:"var(--eco-bone)",cls:"eb-compound"}
  ];
  var M=[
   {id:"C1",p:0,n:"SEO and content foundation",w:"The articles, solution pages and technical base everything sits on",l:["1 to 5 articles a month, technical basics in place","5 to 10 a month, topic clusters, competitor comparison pages","10 to 20+ a month, AI-search optimization, briefs fed by data"]},
   {id:"C2",p:0,n:"Founder thought leadership",w:"A real human voice posting consistently on LinkedIn",l:["One voice, 2 to 3 posts a week, held 90 days","Engagement loop worked, winners flagged for amplification","Multi-voice engine with systematic repurposing"]},
   {id:"C3",p:0,n:"Organic distribution depth",w:"How far beyond LinkedIn your content travels",l:["LinkedIn only","Plus an owned newsletter with a growth motion","Plus video or audio and community syndication"]},
   {id:"C4",p:0,n:"Thought leader amplification",w:"Paid reach behind posts that already proved themselves",l:["Amplifying top organic posts to warm and ICP","Systematic weekly amplification with format testing","Persona-matched TL by segment"]},
   {id:"C5",p:1,n:"Brand defense search",w:"Owning the searches for your own name",l:["On, with exact brand terms","Plus comparison and pricing queries","Plus defense against named conquest attackers"]},
   {id:"C6",p:1,n:"Core paid search",w:"Capturing solution and category intent on Google",l:["Core terms, tight match types, negatives maintained","Intent-tiered structure, page per theme","Full coverage; search terms feed SEO and messaging"]},
   {id:"C7",p:1,n:"Competitor conquest",w:"Winning the buyers comparing you to alternatives",l:["Top 3 competitors bid","Per-competitor comparison pages","Conquest informed by quarterly white-space work"]},
   {id:"C11",p:2,n:"Conversion tracking",w:"The measurement plumbing under everything",l:["Insight Tag and basic conversions live","CRM synced, key events tracked cross-channel","CAPI, offline conversions, revenue attribution live"]},
   {id:"C12",p:2,n:"Website visitor ID",w:"Naming the companies and people on your site",l:["Installed and collecting","Routed weekly into retargeting and review","Automated enrichment and outreach triggers"]},
   {id:"C13",p:2,n:"Account intelligence",w:"Knowing which target accounts your ads reach, and which they miss",l:["Connected, exposure data flowing","Reachability map maintained, hot list to sales weekly","Full pipeline attribution routing channel decisions"]},
   {id:"C14",p:2,n:"Enrichment and owned audiences",w:"Turning under-reached accounts into lists you own",l:["Ad hoc list pulls","Systematic enrichment of under-reached ICP accounts","Always-on owned-audience factory"]},
   {id:"C8",p:3,n:"LinkedIn retargeting",w:"The qualify-and-trust layer over your warm traffic",l:["Website retargeting pool, single campaign","Segmented pools, stage-matched creative","Signal-triggered journeys per segment"]},
   {id:"C9",p:3,n:"LinkedIn cold and ABM",w:"Reaching the ICP accounts not yet in your pools",l:["Single ICP cold audience","ABM lists with persona splits, reachability watched","Lists built from timing and intent signals"]},
   {id:"C10",p:3,n:"BOF conversion campaigns",w:"The direct asks to your warmest people",l:["Single offer to the warmest pool","Offer testing rotation with lead gen forms","Conversation ads and a validated offer ladder"]},
   {id:"C18",p:3,n:"Landing pages and CRO",w:"Where the earned click becomes a booked call",l:["One working conversion page","Page per theme plus case-study proof pages","A testing program with real velocity"]},
   {id:"C19",p:3,n:"Offer architecture",w:"Asks matched to warmth, not just a demo button",l:["Demo or call only","One validated mid-intent offer","An offer ladder by stage, refreshed by testing"]},
   {id:"C20",p:3,n:"Sales activation loop",w:"Hot accounts reaching sales with context, on time",l:["Ad hoc handoffs","Weekly ranked roster of hot accounts with context","Full-context alerts with SLAs and sequences"]},
   {id:"C15",p:3,act:1,n:"Meta B2B",w:"The same buyers off-duty, at a fraction of the CPM",lock:{req:"C14",lvl:2,msg:"Unlocks at Enrichment L2. Meta without enriched audiences is consumer spray."},l:["Enriched warm and engaged audiences only","Routed under-reached accounts with proof creative","Full routed layer, stage-matched creative"]},
   {id:"C16",p:3,act:1,n:"Programmatic",w:"Account-based air cover across display, native, CTV",lock:{req:"C14",lvl:2,msg:"Unlocks at Enrichment L2, once named-account reach is scaled."},l:["Site retargeting air cover","Named-account coverage across display and native","Buying-committee coverage including CTV"]},
   {id:"C17",p:3,act:1,n:"Email and outreach activation",w:"Working the names your ads surfaced",l:["Replay and nurture to owned lists","Signal-triggered sequences","Orchestrated plays coordinated with ad exposure"]},
   {id:"C21",p:4,n:"Diagnostics and EBR cadence",w:"How often the whole system gets read honestly",l:["Monthly performance reporting","Quarterly diagnostic reads","Full quarterly system read with committed path forward"]},
   {id:"C22",p:4,n:"Experimentation program",w:"A standing slot for the next bet",l:["One-off tests, ad hoc, no hypothesis or kill rule","One named experiment a quarter, hypothesis, budget cap, kill or scale rule","A standing 5 to 10 percent test slot with a backlog"]}
  ];
  var state={}; M.forEach(function(m){state[m.id]=0;});
  var PW=[25,15,25,20,15];
  var byP=[[],[],[],[],[]]; M.forEach(function(m){byP[m.p].push(m.id);});
  var LSKEY='imp_eco_grades';

  /* activate motions (C15/C16/C17) carry 0 weight until live: C15/C16 once their
     C14-L2 gate opens; C17 (ungated) once graded. Doctrine EMS: locked activate
     motions do not count, then fold into Convert. */
  function gateOpen(m){ return !m.lock || state[m.lock.req] >= m.lock.lvl; }
  function countsInConvert(m){
    if(!m.act) return true;
    if(m.lock) return gateOpen(m);
    return state[m.id]>0;
  }
  function find(id){ for(var i=0;i<M.length;i++){ if(M[i].id===id) return M[i]; } return null; }

  var curEms=0, curStage='validate', unlock1Slug='', firstFired=false, completeFired=false, unlockViewFired=false;
  function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  function track(ev,data){ try{ window.dataLayer=window.dataLayer||[]; var o={event:ev}; if(data){for(var k in data){o[k]=data[k];}} window.dataLayer.push(o); }catch(e){} }
  function el(id){ return document.getElementById(id); }

  function build(){
    mount.innerHTML='';
    PILLARS.forEach(function(p,pi){
      var sec=document.createElement('div');sec.className='eb-pillar';
      sec.innerHTML='<div class="eb-phead"><span class="eb-dot" style="background:'+p.c+'"></span><h3>'+p.n+'</h3><span class="eb-job">'+p.job+'</span></div><div class="eb-grid" id="eco-g'+pi+'"></div>';
      mount.appendChild(sec);
      M.filter(function(m){return m.p===pi;}).forEach(function(m){
        var card=document.createElement('div');card.className='eb-card';card.id='eco-card'+m.id;card.style.setProperty('--eb-pc',p.c);
        var lv='<div class="eb-lvls">';
        [0,1,2,3].forEach(function(i){ lv+='<div class="eb-lvl'+(i===0?' on':'')+'" role="button" tabindex="0" aria-label="'+m.id+' level '+i+'" data-m="'+m.id+'" data-l="'+i+'">'+(i===0?'L0':'L'+i)+'</div>'; });
        lv+='</div>';
        card.innerHTML='<a class="eb-mid" href="/marketing-ecosystem/doctrine#'+m.id.toLowerCase()+'" title="Read the '+m.id+' definition">'+m.id+'</a><h4>'+m.n+'</h4><div class="eb-what">'+m.w+'</div>'+lv+'<div class="eb-lvldesc" id="eco-d'+m.id+'"><b>L0</b> Not running yet.</div>';
        if(m.lock){ card.className+=' eb-locked'; var o=document.createElement('div');o.className='eb-lockover';o.id='eco-lock'+m.id;o.innerHTML='<div class="eb-lk">🔒</div><p>'+m.lock.msg+'</p>';card.appendChild(o); }
        el('eco-g'+pi).appendChild(card);
      });
    });
  }
  function renderCard(id){
    var m=find(id),l=state[id];
    var btns=document.querySelectorAll('[data-m="'+id+'"]');
    for(var i=0;i<btns.length;i++){ btns[i].classList.toggle('on', (+btns[i].getAttribute('data-l'))===l); }
    var d=el('eco-d'+id);
    d.innerHTML = l===0 ? '<b>L0</b> Not running yet.' : '<b>L'+l+'</b> '+m.l[l-1];
    el('eco-card'+id).classList.toggle('eb-graded', l>0);
  }
  function setLevel(id,l,silent){
    var m=find(id); if(m.lock && state[m.lock.req]<m.lock.lvl) return;
    state[id]=l; renderCard(id);
    if(!silent){
      if(!firstFired && l>0){ firstFired=true; track('eco_grade_first'); }
      persist();
    }
    refresh();
  }
  function persist(){ try{ localStorage.setItem(LSKEY, JSON.stringify(state)); }catch(e){} }
  function restore(){
    try{
      var raw=localStorage.getItem(LSKEY); if(!raw) return false;
      var saved=JSON.parse(raw), any=false;
      M.forEach(function(m){ if(typeof saved[m.id]==='number'){ state[m.id]=Math.max(0,Math.min(3,saved[m.id])); if(state[m.id]>0){any=true; firstFired=true;} } });
      return any;
    }catch(e){ return false; }
  }
  function refresh(){
    var ems=0;
    PILLARS.forEach(function(p,pi){
      var ids=byP[pi], s=0, n=0;
      ids.forEach(function(id){ var m=find(id); if(pi===3 && !countsInConvert(m)) return; s+=state[id]/3; n++; });
      var pct=n? s/n:0; ems+=pct*PW[pi];
      el('eco-pb'+pi).style.width=(pct*100)+'%';
    });
    ems=Math.round(ems); curEms=ems;
    el('eco-ems').textContent=ems;
    el('eco-emsbar').style.width=ems+'%';
    var si=ems<=20?0:ems<=40?1:ems<=60?2:ems<=80?3:4;
    curStage=['validate','ramp','reach','supply','sustain'][si];
    var stg=document.querySelectorAll('#eco-stages span');
    for(var i=0;i<stg.length;i++){ stg[i].classList.toggle('on', i===si); }
    var graded=0; for(var k in state){ if(state[k]>0) graded++; }
    el('eco-prog').textContent=graded+' of 22 graded';
    if(!completeFired && graded>=18){ completeFired=true; track('eco_grade_complete',{eco_graded:graded,eco_score:ems}); }
    M.filter(function(m){return m.lock;}).forEach(function(m){
      var open=state[m.lock.req]>=m.lock.lvl, card=el('eco-card'+m.id);
      if(open && card.classList.contains('eb-locked')){ card.classList.remove('eb-locked');card.classList.add('eb-unlocking'); var o=el('eco-lock'+m.id); if(o)o.remove(); }
    });
    unlocks(ems,graded);
    updateDemandLink();
  }
  function unlocks(ems,graded){
    var s=state, U=[];
    var anyPaid=s.C5+s.C6+s.C7+s.C8+s.C9+s.C10>0;
    var R=[
     [function(){return s.C11<1&&anyPaid;},{t:"Tracking before scale",tr:"Paid is live with no measurement plumbing under it",mv:"Insight Tag, conversion events and CRM sync before another dollar scales",op:["honest reporting","every downstream unlock"]}],
     [function(){return s.C2===0;},{t:"Start the thought leadership motion",tr:"No founder voice; every paid layer is renting trust it never built",mv:"One voice, 2 to 3 posts a week, held for 90 days",op:["TL amplification","warm pool growth"]}],
     [function(){return s.C8===0&&(s.C1>0||s.C2>0||s.C6>0);},{t:"Turn on LinkedIn retargeting",tr:"Traffic and attention exist with no qualify-and-trust layer catching them",mv:"Website retargeting pool with staged creative; this opens the signal layer",op:["signal layer","warm-first budget"]}],
     [function(){return (s.C12===0||s.C13===0)&&s.C8>0;},{t:"Open the signal layer",tr:"Retargeting is running blind; you cannot see which accounts you reach or miss",mv:"Visitor ID plus account intelligence and the reachability map",op:["hot-account handoff","routed expansion"]}],
     [function(){return s.C18===0&&(s.C10>0||s.C6>0);},{t:"A page before the ask",tr:"Conversion spend is running against a site with no dedicated page",mv:"One conversion page, message-matched, thank-you page included",op:["BOF efficiency","offer testing"]}],
     [function(){return s.C19<=1&&s.C8>=1;},{t:"Build the mid-intent offer",tr:"The only ask is a demo; most of your warm pool is not ready for it",mv:"One gated asset your ICP would actually pay for: an audit, benchmark or teardown",op:["offer ladder","hand-raiser flow"]}],
     [function(){return s.C6===0&&(s.C1>0||s.C2>0);},{t:"Capture the in-market 5 percent",tr:"Demand creation is running while active searchers go to competitors",mv:"Brand defense plus a tight high-intent core search campaign",op:["competitor conquest","cheapest conversions"]}],
     [function(){return s.C14<2&&ems>=30;},{t:"Systematic enrichment",tr:"The reachability map will show ICP accounts LinkedIn cannot reach",mv:"Enrich under-reached accounts into owned lists; this is the gate to Meta and programmatic",op:["Meta B2B","programmatic","email activation"]}],
     [function(){return s.C7===0&&s.C6>=1;},{t:"Competitor conquest",tr:"Core search is proven; comparison traffic is unclaimed",mv:"Top 3 competitors with real comparison pages",op:["white-space messaging"]}],
     [function(){return s.C3<=1&&s.C2>=2;},{t:"Own an audience",tr:"The thought leadership motion is consistent but rents all its distribution",mv:"An owned newsletter with a growth motion",op:["algorithm-proof channel","A1 warm asset"]}],
     [function(){return s.C20<=0&&s.C13>=1;},{t:"Wire the sales loop",tr:"Account intelligence exists but hot accounts are not reaching sales",mv:"A weekly ranked roster of hot accounts with context",op:["pipeline conversion","signal ROI"]}],
     [function(){return s.C22===0&&ems>=25;},{t:"Install the experiment slot",tr:"The system has no standing bet; learning is accidental",mv:"One named experiment per quarter with a kill or scale rule",op:["compounding intelligence"]}]
    ];
    for(var i=0;i<R.length;i++){ if(U.length<3 && R[i][0]()) U.push(R[i][1]); }
    var box=el('eco-unlocks');
    unlock1Slug = U.length? slug(U[0].t) : '';
    if(graded<3){ box.innerHTML=''; el('eco-after').textContent=''; return; }
    var intro=el('eco-unlockintro'); if(intro) intro.textContent='Computed from your grades by the six laws of progression: warm before cold, foundations before amplification, expansion earned by the data.';
    box.innerHTML=U.map(function(u,i){ return '<div class="eb-ucard"><div class="eb-n">UNLOCK 0'+(i+1)+'</div><h4>'+u.t+'</h4><div class="eb-trig"><b>Earned by</b>'+u.tr+'</div><div class="eb-trig"><b>The move</b>'+u.mv+'</div><div class="eb-opens">Opens: '+u.op.map(function(o){return '<span>'+o+'</span>';}).join(' &middot; ')+'</div></div>'; }).join('');
    if(!unlockViewFired && U.length){ unlockViewFired=true; track('eco_unlock_view',{eco_unlock_1:unlock1Slug}); }
    var rest=[]; for(var j=0;j<R.length && rest.length<3;j++){ if(R[j][0]() && U.indexOf(R[j][1])===-1) rest.push(R[j][1].t); }
    el('eco-after').innerHTML=rest.length?'After these: <span>'+rest.join(' &middot; ')+'</span>':'';
  }
  function updateDemandLink(){
    var a=el('eco-demandBtn'); if(!a) return;
    a.href='/competitor-intel-report?eco_score='+encodeURIComponent(curEms)+'&eco_stage='+encodeURIComponent(curStage)+'&eco_unlock_1='+encodeURIComponent(unlock1Slug);
  }

  var demandBtn=el('eco-demandBtn'); if(demandBtn) demandBtn.addEventListener('click',function(){ track('eco_demand_plan_click',{eco_score:curEms,eco_stage:curStage,eco_unlock_1:unlock1Slug}); });
  var auditBtn=el('eco-auditBtn'); if(auditBtn) auditBtn.addEventListener('click',function(){ track('eco_audit_click',{eco_score:curEms,eco_stage:curStage}); });
  var resetBtn=el('eco-resetBtn'); if(resetBtn) resetBtn.addEventListener('click',function(){
    try{ localStorage.removeItem(LSKEY); }catch(e){}
    M.forEach(function(m){ state[m.id]=0; });
    build(); firstFired=false; completeFired=false; unlockViewFired=false;
    var r=el('eco-resume'); if(r) r.classList.remove('on');
    refresh();
  });
  document.addEventListener('click',function(e){ var b=e.target.closest?e.target.closest('.eb-lvl'):null; if(b) setLevel(b.getAttribute('data-m'), +b.getAttribute('data-l')); });
  document.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ var b=e.target.closest?e.target.closest('.eb-lvl'):null; if(b){ e.preventDefault(); setLevel(b.getAttribute('data-m'), +b.getAttribute('data-l')); } } });

  build();
  var resumed=restore();
  if(resumed){ M.forEach(function(m){ renderCard(m.id); }); var r=el('eco-resume'); if(r) r.classList.add('on'); }
  refresh();
})();
