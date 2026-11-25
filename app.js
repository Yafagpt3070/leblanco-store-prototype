'use strict';
/* Leblanco storefront prototype. All state is in memory (no browser storage). */

const BRAND = { email:'info@alraqeem.com', phone:'905-949-4717', toll:'1-877-854-0202', addr:'Building 4, Unit 2, 2446 Cawthra Road, Mississauga, ON L5A 3K6' };

const PROVINCES = [
  ['AB','Alberta',5],['BC','British Columbia',5],['MB','Manitoba',5],['NB','New Brunswick',15],['NL','Newfoundland and Labrador',15],
  ['NS','Nova Scotia',14],['NT','Northwest Territories',5],['NU','Nunavut',5],['ON','Ontario',13],['PE','Prince Edward Island',15],
  ['QC','Quebec',0],['SK','Saskatchewan',5],['YT','Yukon',5]
];
const PST_NOTE = ['BC','SK','MB'];

const PERSONAS = {
  visitor:    { label:'Visitor (not logged in)', user:null },
  pending:    { label:'Pending customer (awaiting approval)', user:{ name:'Dana Whitfield', company:'Lakeview Care Centre', type:'Business', status:'pending', group:null, disc:0, terms:null, limit:0, used:0 } },
  standard:   { label:'Approved: Standard group', user:{ name:'Priya Nair', company:'Maple Grove Long-Term Care', type:'Business', status:'approved', group:'Standard', disc:0, terms:null, limit:0, used:0, seed:true } },
  tierb:      { label:'Approved: Tier B, Net 30', user:{ name:'Marc Tremblay', company:'Northshore Health Network', type:'Business', status:'approved', group:'Tier B', disc:12, terms:'Net 30', limit:15000, used:3240, seed:true } },
  distributor:{ label:'Approved: Distributor, Net 45', user:{ name:'Elena Costa', company:'Costa Foodservice Supply', type:'Business', status:'approved', group:'Distributor', disc:25, terms:'Net 45', limit:50000, used:12800, seed:true } },
  individual: { label:'Approved: Individual account', user:{ name:'Sam Okafor', company:'', type:'Individual', status:'approved', group:'Standard', disc:0, terms:null, limit:0, used:0 } }
};

const CATS = ['Porcelain','Reusable Plastic','Disposable Plastic'];
const CAT_BLURB = {
  'Porcelain':'Durable white porcelain plates, bowls and mugs for retherm service.',
  'Reusable Plastic':'High-heat plates, bowls, mugs, lids and cutlery made to withstand repeated washing and reheating.',
  'Disposable Plastic':'Low-temperature and high-heat lids for cups, tumblers, mugs and soup bowls.'
};
const P = (sku,name,cat,type,material,heat,maxC,colour,pack,price,size,cap,kg,stock,extra={}) => ({sku,name,cat,type,material,heat,maxC,colour,pack,price,size,cap,kg,stock,...extra});
const DEMO = [
  P('DEMO-POR-001','9 in Flat-Bottom White Retherm Plate','Porcelain','Plate','Porcelain','High Temp',260,'White',24,96,'9 in (22.9 cm)',null,14,120,{compat:['DEMO-REU-005']}),
  P('DEMO-POR-002','Retherm Soup Bowl, 10 oz','Porcelain','Bowl','Porcelain','High Temp',260,'White',36,84,'5.5 in (14 cm)',10,13,64,{compat:['DEMO-DIS-002']}),
  P('DEMO-POR-003','Retherm Mug, 8 oz','Porcelain','Mug','Porcelain','High Temp',260,'White',36,78,'3.1 in (7.9 cm)',8,11,18),
  P('DEMO-POR-004','Retherm Dessert Bowl, 5 oz','Porcelain','Bowl','Porcelain','High Temp',260,'White',48,72,'4 in (10 cm)',5,10,0,{note:'Backorder: ships when restocked'}),
  P('DEMO-REU-001','9 in High-Heat Reusable Plate','Reusable Plastic','Plate','Polycarbonate','High Temp',135,'Blue',48,142,'9 in (22.9 cm)',null,9,210),
  P('DEMO-REU-002','Reusable Cereal Bowl, 12 oz','Reusable Plastic','Bowl','Polycarbonate','High Temp',135,'Tan',48,128,'6 in (15.2 cm)',12,8,95,{compat:['DEMO-REU-005']}),
  P('DEMO-REU-003','Reusable Mug, 8 oz','Reusable Plastic','Mug','Nylon','High Temp',120,'Tan',36,104,'3 in (7.6 cm)',8,6,150),
  P('DEMO-REU-004','Reusable Tumbler, 9 oz','Reusable Plastic','Tumbler','Polycarbonate','High Temp',135,'Blue',48,118,'3.4 in (8.6 cm)',9,7,12),
  P('DEMO-REU-005','High-Heat Bowl Lid','Reusable Plastic','Lid','Polypropylene','High Temp',120,'Tan',100,88,'6 in (15.2 cm)',null,4,300,{compat:['DEMO-REU-002','DEMO-POR-001']}),
  P('DEMO-REU-006','Reusable Teaspoon','Reusable Plastic','Cutlery','Nylon','High Temp',150,'White',144,64,'5.7 in (14.5 cm)',null,3,500),
  P('DEMO-REU-007','Reusable Jug, 48 oz','Reusable Plastic','Jug','Polycarbonate','High Temp',135,'Clear',12,118,'8 in (20 cm) tall',48,6,40),
  P('DEMO-DIS-001','Disposable Lid for 8 oz Cup','Disposable Plastic','Lid','Polystyrene','Low Temp',70,'White',1000,62,'3.4 in (8.6 cm)',null,5,400),
  P('DEMO-DIS-002','High-Heat Disposable Soup Bowl Lid','Disposable Plastic','Lid','Polypropylene','High Temp',120,'White',500,74,'5.5 in (14 cm)',null,4,180,{compat:['DEMO-POR-002']}),
  P('DEMO-DIS-003','Disposable Tumbler Lid, Slotted','Disposable Plastic','Lid','Polystyrene','Low Temp',70,'Clear',1000,70,'3.4 in (8.6 cm)',null,5,15)
];

/* ---------- state ---------- */
const S = {
  persona:'visitor', user:null, demo:true,
  cart:[], quoteLock:null, quotes:[], orders:[], rmas:[], credit:null,
  twofa:false, q:'', f:{cat:'',material:'',heat:'',colour:'',type:'',sort:'name'},
  ck:{prov:'ON', postal:'', pay:'card', cardKind:'credit', mandate:false, po:'', addr:''},
  tab:'overview', panelOpen:false, cookie:true, modal:null, seq:1001, qseq:301, rseq:51
};
const catalogue = () => S.demo ? DEMO : [];
const byCode = c => DEMO.find(p => p.sku===c);

/* ---------- helpers ---------- */
const $ = (s,r=document) => r.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n);
const isApproved = () => !!S.user && S.user.status==='approved';
const isBiz = () => !!S.user && S.user.type==='Business';
const groupPrice = p => Math.round(p.price*(1-(isApproved()?S.user.disc:0)/100)*100)/100;
const stockLabel = p => p.stock<=0 ? ['Backorder','warn'] : p.stock<=20 ? ['Low stock','warn'] : ['In stock','ok'];
const dateStr = d => d.toLocaleDateString('en-CA',{year:'numeric',month:'short',day:'numeric'});
const addDays = n => {const d=new Date();d.setDate(d.getDate()+n);return d};
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const isQuebecPostal = z => /^[GHJ]/i.test((z||'').trim());
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2600)}

const ICON = {
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 7H6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  alert:'<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v5M12 18v.01"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  box:'<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  inbox:'<path d="M3 13h5l1 3h6l1-3h5"/><path d="M5 5h14l2 8v6H3v-6l2-8Z"/>'
};
const icon = (n,sz=20) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

/* ---------- product illustrations (vector drawings, not photography) ---------- */
const COLOURS = {White:'#FBFAF7',Blue:'#8DB4D6',Tan:'#D9C3A0',Clear:'#E4F0F2',Green:'#9CC4A5'};
function artShapes(type,colour){
  const c = COLOURS[colour]||'#FBFAF7', st='#14232B';
  const sw=`stroke="${st}" stroke-opacity=".75" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  switch(type){
    case 'Plate': return `<ellipse cx="100" cy="92" rx="70" ry="26" fill="${c}" ${sw}/><ellipse cx="100" cy="88" rx="52" ry="17" fill="${c}" ${sw}/><ellipse cx="100" cy="88" rx="38" ry="11" fill="none" stroke="${st}" stroke-opacity=".18" stroke-width="2"/>`;
    case 'Bowl': return `<path d="M34 74h132c0 34-28 54-66 54s-66-20-66-54Z" fill="${c}" ${sw}/><ellipse cx="100" cy="74" rx="66" ry="11" fill="${c}" ${sw}/>`;
    case 'Mug': return `<path d="M60 56h72v58a16 16 0 0 1-16 16H76a16 16 0 0 1-16-16V56Z" fill="${c}" ${sw}/><ellipse cx="96" cy="56" rx="36" ry="7" fill="${c}" ${sw}/><path d="M132 70h12a14 14 0 0 1 0 32h-12" fill="none" ${sw}/>`;
    case 'Tumbler': return `<path d="M64 40h72l-8 92H72L64 40Z" fill="${c}" ${sw}/><ellipse cx="100" cy="40" rx="36" ry="7" fill="${c}" ${sw}/><path d="M68 70h64" stroke="${st}" stroke-opacity=".18" stroke-width="2"/>`;
    case 'Lid': return `<ellipse cx="100" cy="96" rx="66" ry="16" fill="${c}" ${sw}/><path d="M50 94c4-26 28-40 50-40s46 14 50 40" fill="${c}" ${sw}/><circle cx="100" cy="58" r="6" fill="${c}" ${sw}/>`;
    case 'Cutlery': return `<ellipse cx="78" cy="52" rx="16" ry="22" fill="${c}" ${sw}/><path d="M78 74v62" ${sw} stroke-width="8"/><path d="M78 74v62" stroke="${c}" stroke-width="4" stroke-linecap="round"/><ellipse cx="128" cy="52" rx="16" ry="22" fill="${c}" ${sw}/><path d="M128 74v62" ${sw} stroke-width="8"/><path d="M128 74v62" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
    case 'Jug': return `<path d="M62 44h62l8 12v66a10 10 0 0 1-10 10H70a10 10 0 0 1-10-10V56l2-12Z" fill="${c}" ${sw}/><path d="M132 62h14a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10h-14" fill="none" ${sw}/>`;
    default: return `<rect x="50" y="50" width="100" height="70" rx="10" fill="${c}" ${sw}/>`;
  }
}
function art(type,colour='White'){
  return `<svg viewBox="0 0 200 160" role="img" aria-label="${esc(type)} illustration, ${esc(colour)}" preserveAspectRatio="xMidYMid meet"><ellipse cx="100" cy="140" rx="64" ry="6" fill="#14232B" opacity=".08"/>${artShapes(type,colour)}</svg>`;
}
const heroArt = () => `<svg viewBox="0 0 400 300" role="img" aria-label="Retherm plate, bowl and mug">
<ellipse cx="200" cy="262" rx="160" ry="12" fill="#000" opacity=".2"/>
<g transform="translate(-10 70) scale(1.5)">${artShapes('Plate','White')}</g>
<g transform="translate(120 10) scale(1.2)">${artShapes('Bowl','White')}</g>
<g transform="translate(190 100) scale(1.2)">${artShapes('Mug','White')}</g>
</svg>`;

/* ---------- pricing, tax, shipping ---------- */
function cartLines(){
  return S.cart.map(l=>{
    const p = byCode(l.sku); if(!p) return null;
    const unit = S.quoteLock ? l.locked : groupPrice(p);
    return {p, qty:l.qty, unit, total:unit*l.qty};
  }).filter(Boolean);
}
function calc(){
  const lines=cartLines(); const sub=lines.reduce((a,l)=>a+l.total,0);
  const kg=lines.reduce((a,l)=>a+l.p.kg*l.qty,0); const pk=Math.max(1,Math.ceil(kg/25));
  const ship = lines.length ? Math.round((12+kg*0.85+pk*4)*100)/100 : 0;
  const prov = PROVINCES.find(x=>x[0]===S.ck.prov)||PROVINCES[8];
  const surchargeOn = S.ck.pay==='card' && S.ck.cardKind==='credit' && isBiz();
  const sur = surchargeOn ? Math.round((sub+ship)*0.024*100)/100 : 0;
  const rate = prov[2]; const tax = Math.round((sub+ship+sur)*rate)/100;
  return {lines,sub,kg,pk,ship,sur,surchargeOn,rate,tax,total:sub+ship+sur+tax,prov};
}
const avail = () => S.user ? Math.max(0,S.user.limit-S.user.used) : 0;
const cartCount = () => S.cart.reduce((a,l)=>a+l.qty,0);

/* ---------- persona ---------- */
function setPersona(k){
  S.persona=k; S.user = PERSONAS[k].user ? JSON.parse(JSON.stringify(PERSONAS[k].user)) : null;
  S.cart=[]; S.quoteLock=null; S.quotes=[]; S.orders=[]; S.rmas=[]; S.credit=null; S.twofa=false; S.ck.pay='card'; S.ck.cardKind='credit'; S.tab='overview';
  if(S.user && S.user.seed){
    S.orders=[
      {id:'LB-0982',date:addDays(-24),status:'Delivered',deliveredOn:addDays(-12),method:'On account',total:2184.5,
       lines:[{sku:'DEMO-POR-001',qty:6},{sku:'DEMO-REU-005',qty:4}],pkgs:[{trk:'2024 6618 3301 5502',st:'Delivered'},{trk:'2024 6618 3301 5519',st:'Delivered'}],po:'PO-4417'},
      {id:'LB-0990',date:addDays(-5),status:'Partially shipped',method:'PAD',total:864.2,
       lines:[{sku:'DEMO-REU-001',qty:4},{sku:'DEMO-REU-004',qty:2}],pkgs:[{trk:'2024 6618 3377 9041',st:'In transit'},{trk:'Label pending',st:'Packing'}]}
    ];
  }
}
const go = h => { location.hash = h; };
function route(){ const h=location.hash.replace(/^#/,'')||'/'; const [path,qs]=h.split('?'); return {parts:path.split('/').filter(Boolean),qs:new URLSearchParams(qs||'')}; }

/* ---------- shell ---------- */
function shell(content,cur){
  const n=cartCount();
  const nav=[['/shop','Shop all'],...CATS.map(c=>['/shop?cat='+encodeURIComponent(c),c]),['/quotes','Quotes'],['/about','About'],['/contact','Contact']];
  return `
  <div class="util"><div class="wrap"><span>Supplying Canadian healthcare institutions since 1970</span><span><a href="mailto:${BRAND.email}">${BRAND.email}</a> &nbsp;|&nbsp; <a href="tel:${BRAND.phone.replace(/-/g,'')}">${BRAND.phone}</a></span></div></div>
  <header class="head"><div class="wrap head-row">
    <a class="logo" href="#/" aria-label="Leblanco home">Leblanco<small>Limited</small></a>
    <form class="search" role="search" data-form="search">${icon('search',18)}<input type="text" name="q" value="${esc(S.q)}" placeholder="Search by item code, name or material" aria-label="Search products"></form>
    <div class="head-actions">
      ${S.user?`<a class="iconbtn" href="#/account" data-testid="link-account">${icon('user')}<span class="hide-sm">${esc(S.user.name.split(' ')[0])}</span></a>`:`<a class="iconbtn" href="#/login" data-testid="link-login">${icon('user')}<span class="hide-sm">Log in</span></a>`}
      <a class="iconbtn" href="#/cart" data-testid="link-cart" aria-label="Cart, ${n} items">${icon('cart')}<span class="hide-sm">Cart</span>${n?`<span class="badge">${n}</span>`:''}</a>
    </div></div>
    <nav class="nav" aria-label="Main"><div class="wrap">${nav.map(([h,t])=>`<a href="#${h}" ${cur===h?'aria-current="page"':''}>${t}</a>`).join('')}</div></nav>
  </header>
  <main id="main" tabindex="-1">${content}</main>
  ${footer()}
  ${protoPanel()}
  ${S.cookie?`<div class="cookie" role="dialog" aria-label="Cookies"><b>Cookies</b><p class="small" style="margin:6px 0 0">We use essential cookies to run the store. Analytics cookies are optional.</p><div class="acts"><button class="btn sm" data-act="cookie">Accept all</button><button class="btn sm ghost" data-act="cookie">Essential only</button></div></div>`:''}
  ${S.modal||''}`;
}
function footer(){
  return `<footer class="foot"><div class="wrap">
  <div class="foot-grid">
    <div><a class="logo" href="#/">Leblanco<small style="color:#9FB3B8">Limited</small></a>
      <p style="margin-top:12px">Retherm porcelain and high-heat reusable plastic dishes, plus disposable options, for Canadian healthcare.</p>
      <span class="qc">We do not currently sell to or ship to Quebec.</span></div>
    <div><h4>Shop</h4><ul>${CATS.map(c=>`<li><a href="#/shop?cat=${encodeURIComponent(c)}">${c}</a></li>`).join('')}<li><a href="#/quotes">Quotes</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="#/about">About us</a></li><li><a href="#/contact">Contact</a></li><li><a href="#/page/shipping">Shipping policy</a></li><li><a href="#/page/returns">Returns and refunds</a></li><li><a href="#/page/terms">Terms of service</a></li><li><a href="#/page/privacy">Privacy policy</a></li></ul></div>
    <div><h4>Contact</h4><ul><li><a href="mailto:${BRAND.email}">${BRAND.email}</a></li><li>${BRAND.phone}</li><li>${BRAND.toll}</li><li>${BRAND.addr}</li></ul></div>
  </div>
  <div class="legal"><span>&copy; Leblanco Limited. Prices in CAD, per case, before tax.</span><span>Payments by card and Canadian pre-authorized debit through Stripe.</span></div></div></footer>`;
}
function protoPanel(){
  return `<div class="proto"><button class="proto-btn" data-act="panel" aria-expanded="${S.panelOpen}" data-testid="button-proto">Prototype controls</button>
  ${S.panelOpen?`<div class="proto-panel" role="dialog" aria-label="Prototype controls">
    <h4>Preview as</h4>
    <div class="field"><select data-sel="persona" aria-label="Preview as customer type">${Object.entries(PERSONAS).map(([k,v])=>`<option value="${k}" ${S.persona===k?'selected':''}>${v.label}</option>`).join('')}</select></div>
    <label class="small" style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><input type="checkbox" data-chk="demo" ${S.demo?'checked':''} style="width:18px;height:18px;accent-color:var(--accent)"> Show demo products</label>
    <p class="tiny muted" style="margin:0">The real catalogue launches empty (spec CAT-10). Demo items are for review only. Nothing is sent or stored.</p>
  </div>`:''}</div>`;
}

/* ---------- pages ---------- */
function home(){
  return `
  <section class="hero"><div class="wrap hero-grid">
    <div>
      <div class="eyebrow">Healthcare tableware, since 1970</div>
      <h1>Dishes built for the retherm kitchen.</h1>
      <p class="lead">Retherm porcelain and high-heat reusable plastic dishes, plus disposable options, supplied to Canadian healthcare institutions since 1970.</p>
      <div class="hero-cta"><a class="btn" href="#/shop" data-testid="button-browse">Browse products</a>${S.user?'':`<a class="btn ghost" href="#/register" data-testid="button-register">Open a business account</a>`}</div>
      <p class="small muted">Order inquiries: ${BRAND.phone} or ${BRAND.toll}</p>
    </div>
    <div class="hero-art">${heroArt()}</div>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="eyebrow">Categories</div><h2>Three ranges, one dependable supplier</h2>
    <div class="grid g3" style="margin-top:24px">
      ${CATS.map((c,i)=>`<a class="card cat-card" href="#/shop?cat=${encodeURIComponent(c)}" data-testid="card-cat-${slug(c)}"><div class="art">${art(['Plate','Mug','Lid'][i],i===1?'Blue':'White')}</div><div class="body"><h3>${c}</h3><p class="muted small">${CAT_BLURB[c]}</p><span class="linkbtn small">View ${c.toLowerCase()}</span></div></a>`).join('')}
    </div></div></section>

  <section class="section alt"><div class="wrap">
    <div class="eyebrow">Built for business buying</div><h2>Approved accounts, your pricing, your terms</h2>
    <div class="grid g4" style="margin-top:24px">
      <div><h3>Approved accounts</h3><p class="muted small">Register once. Sales reviews your account and assigns your customer group.</p></div>
      <div><h3>Customer-group pricing</h3><p class="muted small">List prices are public. After login you see your own group price.</p></div>
      <div><h3>Net terms</h3><p class="muted small">Apply for credit once. Approved customers can pay on account up to their limit.</p></div>
      <div><h3>Quotes</h3><p class="muted small">Request a quote for larger orders, then accept it online and pay.</p></div>
    </div></div></section>

  <section class="section tight"><div class="wrap">
    <div class="eyebrow">How ordering works</div><h2>From account to delivery</h2>
    <ol class="steps" style="margin-top:24px">
      <li><h4>Register</h4><p class="muted small">Tell us about your organization. Sales approves your account.</p></li>
      <li><h4>See your price</h4><p class="muted small">Log in to see group pricing, then buy directly or request a quote.</p></li>
      <li><h4>Pay your way</h4><p class="muted small">Card, Canadian pre-authorized debit, or on account if approved.</p></li>
      <li><h4>Track each package</h4><p class="muted small">Large orders may ship in several packages, each with its own tracking.</p></li>
    </ol></div></section>

  <section class="section alt"><div class="wrap grid g2" style="align-items:center">
    <div><div class="eyebrow">Our commitment</div><h2>More for our customers</h2>
      <ul class="checks"><li>More choice of quality products</li><li>More price protection</li><li>More friendly, efficient service</li><li>More dependable delivery</li></ul></div>
    <div class="card"><h3>Talk to sales</h3><p class="muted">Questions about a product, a quote or an order? Tell us which products you are asking about so we can respond faster.</p>
      <p><b>${BRAND.email}</b><br>${BRAND.phone} &nbsp;|&nbsp; ${BRAND.toll}</p><a class="btn ghost" href="#/contact">Contact us</a></div>
  </div></section>`;
}

function priceBlock(p){
  const gp=groupPrice(p); const disc=isApproved()&&S.user.disc>0;
  return disc ? `<span class="price num" data-testid="text-price-${p.sku}">${money(gp)}<s>${money(p.price)}</s></span>` : `<span class="price num" data-testid="text-price-${p.sku}">${money(p.price)}</span>`;
}
function filtered(){
  let l=catalogue().slice(); const f=S.f, q=S.q.trim().toLowerCase();
  if(f.cat) l=l.filter(p=>p.cat===f.cat); if(f.material) l=l.filter(p=>p.material===f.material);
  if(f.heat) l=l.filter(p=>p.heat===f.heat); if(f.colour) l=l.filter(p=>p.colour===f.colour); if(f.type) l=l.filter(p=>p.type===f.type);
  if(q) l=l.filter(p=>[p.sku,p.name,p.material,p.colour,p.type,p.cat,p.heat].join(' ').toLowerCase().includes(q));
  l.sort((a,b)=> f.sort==='low'?a.price-b.price : f.sort==='high'?b.price-a.price : a.name.localeCompare(b.name));
  return l;
}
function facet(label,key,vals){
  return `<h4>${label}</h4><label><input type="radio" name="${key}" value="" data-facet="${key}" ${!S.f[key]?'checked':''}> All</label>`+vals.map(v=>`<label><input type="radio" name="${key}" value="${esc(v)}" data-facet="${key}" ${S.f[key]===v?'checked':''}> ${esc(v)}</label>`).join('');
}
function shop(){
  const all=catalogue(); const uniq=k=>[...new Set(all.map(p=>p[k]))].sort();
  const list=filtered();
  const body = !all.length ? `<div class="empty">${icon('inbox',40)}<h2>The catalogue is empty</h2><p class="muted" style="max-width:34em;margin-inline:auto">Products are loaded with the WooCommerce import template. Once the first products are uploaded they appear here with filters, specifications and group pricing.</p><button class="btn ghost" data-act="demo-on">Show demo products for preview</button></div>`
    : !list.length ? `<div class="empty">${icon('search',40)}<h2>No products match</h2><p class="muted">Try removing a filter or searching by item code.</p><button class="btn ghost" data-act="clear">Clear filters</button></div>`
    : `<div class="pgrid">${list.map(card).join('')}</div>`;
  return `<div class="wrap"><div class="crumbs"><a href="#/">Home</a> / Shop${S.f.cat?` / ${esc(S.f.cat)}`:''}</div>
  <div class="shop"><aside class="filters" aria-label="Filters"><h3 style="margin:0">Filter</h3>
    ${facet('Category','cat',CATS)}${facet('Product type','type',uniq('type'))}${facet('Material','material',uniq('material'))}${facet('Heat rating','heat',uniq('heat'))}${facet('Colour','colour',uniq('colour'))}
    <p style="margin-top:16px"><button class="linkbtn small" data-act="clear">Clear all filters</button></p></aside>
  <section><div class="toolbar"><div><h1 style="font-size:28px;margin:0">${S.f.cat?esc(S.f.cat):'All products'}</h1><span class="small muted" data-testid="text-count">${list.length} of ${all.length} products${S.q?` for "${esc(S.q)}"`:''}</span></div>
    <label class="small">Sort <select data-sel="sort" aria-label="Sort"><option value="name" ${S.f.sort==='name'?'selected':''}>Name</option><option value="low" ${S.f.sort==='low'?'selected':''}>Price, low to high</option><option value="high" ${S.f.sort==='high'?'selected':''}>Price, high to low</option></select></label></div>
    ${S.demo&&all.length?`<p class="notice warn" style="margin-bottom:16px">${icon('info',18)}<span>Demo products for review only. The live store launches with an empty catalogue.</span></p>`:''}
    ${!S.user?`<p class="notice info" style="margin-bottom:16px">${icon('info',18)}<span>List prices are shown to everyone. <a href="#/login">Log in</a> with an approved account to buy or request a quote, and to see your group price.</span></p>`:''}
    ${body}</section></div></div>`;
}
function card(p){
  const [sl,sk]=stockLabel(p);
  return `<article class="pcard" data-testid="card-product-${p.sku}"><a class="art" href="#/product/${p.sku}" aria-label="${esc(p.name)}">${art(p.type,p.colour)}</a>
  <div class="body"><span class="demo-flag">Demo item</span><h3><a href="#/product/${p.sku}">${esc(p.name)}</a></h3><span class="sku">${p.sku}</span>
  <div>${priceBlock(p)} <span class="per">per case</span></div><div class="per">Case of ${p.pack.toLocaleString('en-CA')} &nbsp;|&nbsp; <span class="pill ${sk}">${sl}</span></div><div class="spacer"></div>
  ${isApproved()?`<button class="btn sm block" data-add="${p.sku}" data-testid="button-add-${p.sku}">Add to cart</button>`:`<a class="btn sm ghost block" href="#/${S.user?'account':'login'}">${S.user?'Awaiting approval':'Log in to order'}</a>`}</div></article>`;
}
function product(sku){
  const p=byCode(sku); if(!p||!S.demo) return `<div class="wrap section"><div class="empty"><h2>Product not found</h2><p class="muted">This product is not in the catalogue.</p><a class="btn" href="#/shop">Back to shop</a></div></div>`;
  const [sl,sk]=stockLabel(p);
  const f2c=c=>Math.round(c*9/5+32);
  const rows=[['Item code',p.sku],['Category',p.cat],['Product type',p.type],['Material',p.material],['Heat rating',`${p.heat}, up to ${p.maxC} C (${f2c(p.maxC)} F)`],['Colour',p.colour],['Size',p.size],p.cap?['Capacity',`${p.cap} oz`]:null,['Pack size',`Case of ${p.pack.toLocaleString('en-CA')}`],['Case weight',`${p.kg} kg`],p.note?['Note',p.note]:null].filter(Boolean);
  const comp=(p.compat||[]).map(byCode).filter(Boolean);
  let buy;
  if(!S.user) buy=`<div class="notice info">${icon('info',18)}<span>Log in or register to order. Prices shown are list prices.</span></div><div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap"><a class="btn" href="#/login" data-testid="button-login-to-order">Log in to order</a><a class="btn ghost" href="#/register">Register</a></div>`;
  else if(!isApproved()) buy=`<div class="notice warn">${icon('alert',18)}<span>Your account is pending approval. You can browse list prices now. Sales will enable ordering and quotes once approved.</span></div>`;
  else buy=`<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><div class="qty" role="group" aria-label="Quantity in cases"><button data-qtyb="-1" aria-label="Fewer">&minus;</button><input type="number" id="qty" value="1" min="1" aria-label="Cases"><button data-qtyb="1" aria-label="More">+</button></div>
    <button class="btn" data-addq="${p.sku}" data-testid="button-add-to-cart">Add to cart</button><button class="btn ghost" data-quote1="${p.sku}" data-testid="button-request-quote">Request a quote</button></div>`;
  return `<div class="wrap"><div class="crumbs"><a href="#/">Home</a> / <a href="#/shop">Shop</a> / <a href="#/shop?cat=${encodeURIComponent(p.cat)}">${p.cat}</a> / ${esc(p.name)}</div>
  <div class="pdp"><div class="art">${art(p.type,p.colour)}</div>
  <div><span class="demo-flag">Demo item</span><h1 style="font-size:clamp(26px,3vw,34px);margin-top:10px">${esc(p.name)}</h1><div class="sku">Item code ${p.sku}</div>
    <div class="buybox"><div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap">${priceBlock(p)}<span class="per">per case, before tax</span></div>
      ${isApproved()&&S.user.disc>0?`<p class="tiny muted" style="margin:4px 0 0">Your ${esc(S.user.group)} price. List price ${money(p.price)}.</p>`:''}
      <p class="small" style="margin:8px 0 16px">Case of ${p.pack.toLocaleString('en-CA')} &nbsp;|&nbsp; <span class="pill ${sk}">${sl}</span></p>${buy}</div>
    <h3>Specifications</h3><table class="spec"><tbody>${rows.map(r=>`<tr><th scope="row">${r[0]}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>
    <p class="small muted" style="margin-top:12px">Care notes (dishwasher, microwave) appear here for each live product.</p>
    ${comp.length?`<h3 style="margin-top:24px">Compatible products</h3><ul class="checks">${comp.map(c=>`<li><a href="#/product/${c.sku}">${esc(c.name)}</a> <span class="sku">${c.sku}</span></li>`).join('')}</ul>`:''}
  </div></div></div>`;
}

function cart(){
  const c=calc();
  if(!c.lines.length) return `<div class="wrap section"><div class="empty">${icon('cart',40)}<h2>Your cart is empty</h2><p class="muted">Add products from the shop to build an order or request a quote.</p><a class="btn" href="#/shop">Browse products</a></div></div>`;
  return `<div class="wrap"><div class="crumbs"><a href="#/">Home</a> / Cart</div><h1 style="font-size:30px">Your cart</h1>
  ${S.quoteLock?`<p class="notice ok">${icon('check',18)}<span>Prices are locked from accepted quote ${S.quoteLock}.</span></p>`:''}
  <div class="two"><section>${c.lines.map(l=>`<div class="line" data-testid="row-cart-${l.p.sku}"><div class="art">${art(l.p.type,l.p.colour)}</div>
    <div><a href="#/product/${l.p.sku}"><b>${esc(l.p.name)}</b></a><div class="sku">${l.p.sku} &nbsp;|&nbsp; Case of ${l.p.pack}</div><div class="small">${money(l.unit)} per case</div>
      ${S.quoteLock?'':`<button class="linkbtn small" data-rm="${l.p.sku}">Remove</button>`}</div>
    <div style="text-align:right">${S.quoteLock?`<div class="small muted">Qty ${l.qty}</div>`:`<div class="qty"><button data-q="${l.p.sku}:-1" aria-label="Fewer">&minus;</button><input type="number" value="${l.qty}" min="1" data-qin="${l.p.sku}" aria-label="Cases"><button data-q="${l.p.sku}:1" aria-label="More">+</button></div>`}<div class="price num" style="font-size:17px;margin-top:6px">${money(l.total)}</div></div></div>`).join('')}
  </section>
  <aside class="card summary"><h3>Order summary</h3>
    <div class="sumrow"><span>Subtotal</span><span class="num">${money(c.sub)}</span></div>
    <div class="sumrow muted"><span>Shipping and tax</span><span>At checkout</span></div>
    <p class="tiny muted">Estimated ${c.pk} package${c.pk>1?'s':''}. Each package gets its own label and tracking number.</p>
    <a class="btn block" href="#/checkout" data-testid="button-checkout">Continue to checkout</a>
    ${S.quoteLock?'':`<button class="btn ghost block" style="margin-top:10px" data-act="quote-cart" data-testid="button-quote-cart">Request a quote for this cart</button>`}</aside></div></div>`;
}

function checkout(){
  if(!S.user) return gate('Log in to check out','Checkout is available to approved accounts.');
  if(!isApproved()) return gate('Account pending approval','Ordering opens once Sales approves your account.');
  const c=calc(); if(!c.lines.length) return cart();
  const ck=S.ck, qc = ck.prov==='QC' || isQuebecPostal(ck.postal);
  const canAcct = !!S.user.terms && isBiz();
  const acctOk = canAcct && c.total<=avail();
  const pay=ck.pay==='account'&&!canAcct?'card':ck.pay;
  const padOk = pay!=='pad' || ck.mandate;
  const poOk = pay!=='account' || ck.po.trim();
  const block = qc || (pay==='account'&&!acctOk) || !padOk || !poOk || !ck.postal.trim();
  return `<div class="wrap"><div class="crumbs"><a href="#/">Home</a> / <a href="#/cart">Cart</a> / Checkout</div><h1 style="font-size:30px">Checkout</h1>
  <div class="two"><section>
   <div class="card" style="margin-bottom:20px"><h3>1. Delivery address</h3>
    <div class="field"><label for="addr">Street address</label><input type="text" id="addr" data-ck="addr" value="${esc(ck.addr)}" placeholder="Receiving dock or kitchen address" autocomplete="street-address"></div>
    <div class="row2"><div class="field"><label for="prov">Province or territory</label><select id="prov" data-ck="prov" data-testid="select-province">${PROVINCES.map(p=>`<option value="${p[0]}" ${ck.prov===p[0]?'selected':''}>${p[1]}</option>`).join('')}</select></div>
    <div class="field"><label for="postal">Postal code</label><input type="text" id="postal" data-ck="postal" value="${esc(ck.postal)}" placeholder="A1A 1A1" autocomplete="postal-code" data-testid="input-postal"></div></div>
    ${qc?`<div class="notice err" role="alert" data-testid="notice-quebec">${icon('alert',18)}<span><b>We do not currently sell to or ship to Quebec.</b> Please use a delivery address in another province or territory. Contact ${BRAND.email} with questions.</span></div>`:''}
    ${!qc&&PST_NOTE.includes(ck.prov)?`<div class="notice warn">${icon('info',18)}<span>Provincial sales tax for this province is pending accountant review and is not included below.</span></div>`:''}
    <p class="tiny muted" style="margin:10px 0 0">Shipping uses a flat estimate formula in this prototype. The live store uses Canada Post rates.</p></div>
   <div class="card"><h3>2. Payment</h3>
    <label class="opt"><span class="t"><input type="radio" name="pay" value="card" data-pay="card" ${pay==='card'?'checked':''}> Credit or debit card</span><span class="d">Visa, Mastercard, Amex, Apple Pay and Google Pay through Stripe.</span>
      ${pay==='card'?`<div class="d" style="margin-top:10px"><label class="small" style="margin-right:16px"><input type="radio" name="ckind" data-cardkind="credit" ${ck.cardKind==='credit'?'checked':''}> Credit card</label><label class="small"><input type="radio" name="ckind" data-cardkind="debit" ${ck.cardKind==='debit'?'checked':''}> Debit card</label>
      <div class="tiny" style="margin-top:6px">${isBiz()?'A card fee of 2.4% applies to credit cards and is shown as a separate taxed line. Debit cards, bank debit and on-account payments have no fee.':'No card fee applies to this account.'}</div></div>`:''}</label>
    <label class="opt"><span class="t"><input type="radio" name="pay" value="pad" data-pay="pad" ${pay==='pad'?'checked':''}> Canadian pre-authorized debit (PAD)</span><span class="d">Pay from a Canadian bank account. No card fee. Your order stays in Awaiting payment until the debit clears, usually 2 to 3 business days.</span>
      ${pay==='pad'?`<div class="d" style="margin-top:10px"><label class="small" style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" data-mandate ${ck.mandate?'checked':''} style="margin-top:3px"> I authorize Leblanco Limited to debit my Canadian bank account for this order under the PAD agreement (shown in Stripe's hosted form in the live store).</label></div>`:''}</label>
    ${isBiz()?`<label class="opt ${canAcct?'':'off'}"><span class="t"><input type="radio" name="pay" value="account" data-pay="account" ${pay==='account'?'checked':''} ${canAcct?'':'disabled'}> Pay on account${S.user.terms?` (${S.user.terms})`:''}</span>
      <span class="d">${canAcct?`Available credit ${money(avail())} of ${money(S.user.limit)}.`:'Not available yet. Apply for net terms in My Account, under Credit.'}</span>
      ${pay==='account'?`<div class="d" style="margin-top:10px"><label class="small" for="po"><b>PO number (required)</b></label><input type="text" id="po" data-ck="po" value="${esc(ck.po)}" placeholder="PO-0000" data-testid="input-po">
        ${!acctOk?`<div class="notice err" style="margin-top:8px" role="alert">${icon('alert',18)}<span>This order is above your available credit. Choose card or PAD.</span></div>`:''}</div>`:''}</label>`:`<p class="tiny muted">Pay on account is not offered to Individual accounts.</p>`}
   </div></section>
  <aside class="card summary"><h3>Order summary</h3>
   ${c.lines.map(l=>`<div class="sumrow"><span>${esc(l.p.name)} &times; ${l.qty}</span><span class="num">${money(l.total)}</span></div>`).join('')}
   <div class="sumrow" style="border-top:1px solid var(--line);margin-top:6px;padding-top:10px"><span>Subtotal</span><span class="num">${money(c.sub)}</span></div>
   <div class="sumrow"><span>Shipping (${c.pk} package${c.pk>1?'s':''})</span><span class="num">${money(c.ship)}</span></div>
   ${c.surchargeOn?`<div class="sumrow" data-testid="row-surcharge"><span>Credit card fee (2.4%)</span><span class="num">${money(c.sur)}</span></div>`:''}
   <div class="sumrow"><span>${qc?'Tax':(c.rate===5?'GST 5%':`HST ${c.rate}%`)}</span><span class="num">${qc?'n/a':money(c.tax)}</span></div>
   <div class="sumrow total"><span>Total</span><span class="num" data-testid="text-total">${qc?'n/a':money(c.total)}</span></div>
   <button class="btn block" style="margin-top:16px" data-act="place" ${block?'disabled':''} data-testid="button-place-order">Place order</button>
   ${!ck.postal.trim()?'<p class="tiny muted" style="margin-top:8px">Enter a postal code to continue.</p>':''}</aside></div></div>`;
}
function gate(t,m){return `<div class="wrap section"><div class="empty">${icon('user',40)}<h2>${t}</h2><p class="muted">${m}</p><a class="btn" href="#/login">Log in</a></div></div>`}

function loginPage(){
  return `<div class="wrap section"><div class="grid g2" style="align-items:start">
  <div class="card"><h1 style="font-size:28px">Log in</h1><p class="muted">Use your Leblanco account to see group pricing, order and request quotes.</p>
   <form data-form="login"><div class="field"><label for="le">Email</label><input type="email" id="le" name="email" value="buyer@example.ca" autocomplete="username"></div>
   <div class="field"><label for="lp">Password</label><input type="password" id="lp" name="pw" value="demo-password" autocomplete="current-password"></div>
   <button class="btn block" type="submit" data-testid="button-login-submit">Log in</button></form>
   <p class="small muted" style="margin-top:12px">Customers can turn on two-factor authentication in My Account. Staff accounts always require it.</p></div>
  <div class="card"><h3>Preview a customer type</h3><p class="muted small">This prototype has no real accounts. Choose a demo profile to see how pricing and checkout change.</p>
   ${Object.entries(PERSONAS).filter(([k])=>k!=='visitor').map(([k,v])=>`<button class="btn ghost block" style="margin-bottom:10px;justify-content:flex-start" data-persona="${k}" data-testid="button-demo-${k}">${v.label}</button>`).join('')}
   <hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><p class="small">New to Leblanco? <a href="#/register">Register a business account</a></p></div></div></div>`;
}
function registerPage(){
  return `<div class="wrap section"><div class="card" style="max-width:720px;margin-inline:auto"><h1 style="font-size:28px">Register an account</h1>
  <p class="muted">Sales reviews every new account before assigning pricing or terms. Until then you can browse list prices.</p>
  <form data-form="register" novalidate>
  <div class="row2"><div class="field"><label for="rt">Account type</label><select id="rt" name="type"><option>Business</option><option>Individual</option></select></div>
   <div class="field"><label for="rc">Organization</label><input type="text" id="rc" name="company" autocomplete="organization"></div></div>
  <div class="row2"><div class="field"><label for="rn">Contact name</label><input type="text" id="rn" name="name" required autocomplete="name"></div>
   <div class="field"><label for="rp">Phone</label><input type="tel" id="rp" name="phone" autocomplete="tel"></div></div>
  <div class="row2"><div class="field"><label for="re">Email</label><input type="email" id="re" name="email" required autocomplete="email"></div>
   <div class="field"><label for="rpw">Password</label><input type="password" id="rpw" name="pw" autocomplete="new-password"></div></div>
  <div class="row2"><div class="field"><label for="rpr">Province or territory</label><select id="rpr" name="prov" data-regprov>${PROVINCES.map(p=>`<option value="${p[0]}" ${p[0]==='ON'?'selected':''}>${p[1]}</option>`).join('')}</select></div>
   <div class="field"><label for="rz">Postal code</label><input type="text" id="rz" name="postal" autocomplete="postal-code" data-regpostal></div></div>
  <div id="reg-qc"></div>
  <label class="small" style="display:flex;gap:8px;align-items:flex-start;margin-bottom:16px"><input type="checkbox" name="terms" style="margin-top:3px;width:18px;height:18px;accent-color:var(--accent)"> I want to apply for net terms after my account is approved.</label>
  <button class="btn" type="submit" data-testid="button-register-submit">Submit for approval</button></form></div></div>`;
}

function accountPage(){
  if(!S.user) return gate('Log in to see your account','Orders, quotes, credit and security settings live here.');
  const u=S.user; const tabs=[['overview','Overview'],['orders','Orders'],['quotes','Quotes'],['credit','Credit'],['security','Security']];
  let body='';
  if(S.tab==='overview'){
    body=`<div class="grid g3"><div class="card"><div class="eyebrow">Account</div><h3>${esc(u.company||u.name)}</h3><p class="small muted">${esc(u.name)} &nbsp;|&nbsp; ${u.type}</p>
      <span class="pill ${isApproved()?'ok':'warn'}">${isApproved()?'Approved':'Pending approval'}</span></div>
      <div class="card"><div class="eyebrow">Pricing group</div><h3>${u.group?esc(u.group):'None yet'}</h3><p class="small muted">${isApproved()?(u.disc?`${u.disc}% below list on all products`:'List price'):'Sales assigns your group after approval.'}</p></div>
      <div class="card"><div class="eyebrow">Net terms</div><h3>${u.terms||'Not set'}</h3>${u.terms?`<div class="bar" aria-hidden="true"><i style="width:${Math.min(100,u.used/u.limit*100)}%"></i></div><p class="small muted" style="margin-top:8px">${money(avail())} available of ${money(u.limit)}</p>`:'<p class="small muted">Apply under Credit.</p>'}</div></div>`;
  }
  if(S.tab==='orders') body = S.orders.length? S.orders.map(orderCard).join('') : `<div class="empty"><h3>No orders yet</h3><p class="muted">Orders you place will appear here with a status for every package.</p><a class="btn" href="#/shop">Browse products</a></div>`;
  if(S.tab==='quotes') body = quotesList();
  if(S.tab==='credit') body = creditTab();
  if(S.tab==='security') body=`<div class="card" style="max-width:560px"><h3>Two-factor authentication</h3><p class="muted">Optional for customers. Staff and admin accounts must use it. When on, you enter a code from an authenticator app each time you log in.</p>
     <span class="pill ${S.twofa?'ok':'gray'}">${S.twofa?'On':'Off'}</span> <button class="btn sm ${S.twofa?'ghost':''}" style="margin-left:10px" data-act="twofa" data-testid="button-2fa">${S.twofa?'Turn off':'Turn on'}</button></div>`;
  return `<div class="wrap"><div class="crumbs"><a href="#/">Home</a> / My Account</div><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px"><h1 style="font-size:30px;margin:0">My Account</h1><button class="btn ghost sm" data-act="logout" data-testid="button-logout">Log out</button></div>
  ${!isApproved()?`<p class="notice warn" style="margin-top:16px">${icon('alert',18)}<span>Your account is awaiting Sales approval. You cannot place orders or request quotes yet.</span></p>`:''}
  <div class="tabs" role="tablist" style="margin-top:20px">${tabs.map(([k,t])=>`<button role="tab" aria-selected="${S.tab===k}" data-tab="${k}">${t}</button>`).join('')}</div>
  <div style="padding-bottom:72px">${body}</div></div>`;
}
const STAGES=['Received','Awaiting payment','Paid','Processing','Partially shipped','Shipped','Delivered'];
function orderCard(o){
  const days = o.deliveredOn ? 30-Math.floor((Date.now()-o.deliveredOn.getTime())/864e5) : null;
  const rma=S.rmas.filter(r=>r.order===o.id);
  const idx=STAGES.indexOf(o.status);
  return `<div class="card" style="margin-bottom:16px" data-testid="card-order-${o.id}"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><h3 style="margin:0">Order ${o.id}</h3><span class="small muted">${dateStr(o.date)} &nbsp;|&nbsp; ${o.method}${o.po?` &nbsp;|&nbsp; ${esc(o.po)}`:''}</span></div><div style="text-align:right"><b class="num">${money(o.total)}</b><div><span class="pill ${o.status==='Delivered'?'ok':'warn'}">${o.status}</span></div></div></div>
   <div class="timeline">${STAGES.map((s,i)=>`<span class="${i<idx?'done':i===idx?'now':''}">${s}</span>`).join('')}</div>
   <p class="small" style="margin:6px 0">${o.lines.map(l=>`${l.qty} &times; ${esc(byCode(l.sku)?.name||l.sku)}`).join(', ')}</p>
   <div class="small"><b>Packages (${o.pkgs.length}):</b> ${o.pkgs.map((p,i)=>`<span style="display:inline-block;margin-right:14px">#${i+1} ${esc(p.trk)} <span class="pill gray">${p.st}</span></span>`).join('')}</div>
   ${o.deliveredOn?`<div style="margin-top:12px">${days>0?`<button class="btn sm ghost" data-return="${o.id}" data-testid="button-return-${o.id}">Request a return</button> <span class="small muted">${days} days left in the 30-day window after delivery. You pay return shipping.</span>`:'<span class="small muted">The 30-day return window has closed.</span>'}</div>`:''}
   ${rma.map(r=>`<div class="notice info" style="margin-top:10px">${icon('box',18)}<span><b>${r.id}</b> &nbsp;${r.status}. ${r.pkgs} return package${r.pkgs>1?'s':''}; ${esc(r.mode)}.</span></div>`).join('')}</div>`;
}
function quotesList(){
  if(!S.quotes.length) return `<div class="empty"><h3>No quotes yet</h3><p class="muted">${isApproved()?'Add products to your cart and choose Request a quote.':'Quotes open once your account is approved.'}</p><a class="btn" href="#/shop">Browse products</a></div>`;
  return S.quotes.map(q=>{const req=q.status==='Quote requested';
   return `<div class="card" style="margin-bottom:16px" data-testid="card-quote-${q.id}"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><h3 style="margin:0">Quote ${q.id}</h3><span class="small muted">Requested ${dateStr(q.date)}${q.delivery?` &nbsp;|&nbsp; Needed by ${esc(q.delivery)}`:''}</span></div><span class="pill ${q.status==='Quote sent'||q.status==='Quote accepted'?'ok':q.status==='Declined'?'err':'warn'}">${q.status}</span></div>
   <div class="tablewrap"><table class="data" style="margin-top:10px"><thead><tr><th>Product</th><th class="tr">Cases</th><th class="tr">${req?'Estimate':'Quoted'}</th><th class="tr">Total</th></tr></thead><tbody>${q.lines.map(l=>{const u=req||l.locked==null?l.est:l.locked;return `<tr><td>${esc(byCode(l.sku)?.name||l.sku)}</td><td class="tr">${l.qty}</td><td class="tr num">${money(u)}</td><td class="tr num">${money(u*l.qty)}</td></tr>`}).join('')}</tbody></table></div>
   ${q.note?`<p class="small muted" style="margin-top:8px">Notes: ${esc(q.note)}</p>`:''}
   ${req?`<p class="small muted" style="margin-top:10px">Sales will price this quote. Estimates use your group price.</p><button class="btn sm ghost" data-simq="${q.id}" data-testid="button-sim-quote">Prototype: simulate Sales reply</button>`:''}
   ${q.status==='Quote sent'?`<p class="small" style="margin:10px 0">Valid until ${dateStr(q.expires)}. Sales applied a 4% reduction to your group price. Tax is estimated at checkout.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn sm" data-acceptq="${q.id}" data-testid="button-accept-quote">Accept and pay</button><button class="btn sm ghost" data-revq="${q.id}">Request changes</button><button class="btn sm ghost" data-decq="${q.id}">Decline</button></div>`:''}
   ${q.status==='Revision requested'?`<p class="small muted" style="margin-top:10px">Sales has been asked to revise this quote.</p><button class="btn sm ghost" data-simq="${q.id}">Prototype: simulate Sales reply</button>`:''}
   ${q.status==='Quote accepted'?`<p class="small muted" style="margin-top:10px">Converted to an order. Quoted prices were locked.</p>`:''}</div>`}).join('');
}
function creditTab(){
  const u=S.user;
  if(!isBiz()) return `<div class="notice info">${icon('info',18)}<span>Pay on account is not offered to Individual accounts.</span></div>`;
  if(u.terms) return `<div class="card" style="max-width:560px"><h3>Credit approved</h3><p>Terms: <b>${u.terms}</b><br>Limit: <b>${money(u.limit)}</b><br>Available: <b>${money(avail())}</b></p><p class="small muted">Available credit is your limit minus unpaid and open orders. An order above it falls back to card or PAD.</p></div>`;
  if(S.credit) return `<div class="notice ok">${icon('check',18)}<span>Credit application submitted. Sales will review it and set your terms and limit.</span></div>`;
  if(!isApproved()) return `<div class="notice warn">${icon('alert',18)}<span>You can apply for credit once your account is approved.</span></div>`;
  return `<div class="card" style="max-width:640px"><h3>Apply for net terms</h3><form data-form="credit">
   <div class="row2"><div class="field"><label for="c1">Legal name</label><input type="text" id="c1" required></div><div class="field"><label for="c2">Business number</label><input type="text" id="c2"></div></div>
   <div class="row2"><div class="field"><label for="c3">Years in business</label><input type="number" id="c3" min="0"></div><div class="field"><label for="c4">Requested terms</label><select id="c4"><option>Net 15</option><option selected>Net 30</option><option>Net 45</option></select></div></div>
   <div class="row2"><div class="field"><label for="c5">Requested limit (CAD)</label><input type="number" id="c5" min="0" value="10000"></div><div class="field"><label for="c6">Bank reference</label><input type="text" id="c6"></div></div>
   <div class="field"><label for="c7">Trade references (up to three)</label><textarea id="c7"></textarea></div>
   <button class="btn" type="submit" data-testid="button-credit-submit">Submit application</button></form></div>`;
}
function quotesPage(){
  if(!S.user) return gate('Log in to request quotes','Quotes are available to approved customers.');
  return `<div class="wrap"><div class="crumbs"><a href="#/">Home</a> / Quotes</div><h1 style="font-size:30px">Quotes</h1>
  <p class="muted" style="max-width:44em">Request a quote from any product page or your cart. Sales prices it, you accept it online, and the quoted prices are locked when it becomes an order.</p><div style="padding:16px 0 72px">${quotesList()}</div></div>`;
}

const POLICIES = {
 shipping:['Shipping policy',`<h3>Order processing</h3><p>We typically process orders within 5 to 7 business days of your order confirmation, excluding weekends and holidays. If an item will take longer, we will tell you. You will receive an email when your order ships.</p>
<h3>Several packages</h3><p>Large orders may ship in more than one package. Each package has its own tracking number, and you will receive an email for each one.</p>
<h3>Tracking</h3><p>Your shipping email includes a tracking number for each package. Tracking details can take 3 to 7 business days to appear. If your order has not arrived within 30 days of your shipping confirmation, email ${BRAND.email} with your name and order number and we will look into it.</p>
<h3>Damaged orders</h3><p>If your order arrives damaged, email ${BRAND.email} as soon as you can, with your order number and a photo of the damage. We review each case individually and work with you on a fair solution.</p>
<h3>Shipping charges and taxes</h3><p>Shipping is calculated at checkout. Tax is based on the province you are delivering to. We do not currently sell to or ship to Quebec.</p>`],
 returns:['Return and refund policy',`<h3>30-day returns</h3><p>You may request a return within 30 days after delivery.</p>
<h3>Eligibility</h3><p>Items must be unused, in the condition you received them, and in their original packaging. Keep your receipt or proof of purchase.</p>
<h3>How to return</h3><ol><li>Request a return from your order in My Account, or email ${BRAND.email}.</li><li>If we approve it, we will send you an RMA number and instructions. An order can have more than one return package, and each package needs its own RMA number.</li><li>Ship the goods to Leblanco Limited, ${BRAND.addr}.</li></ol><p>Goods sent back without prior approval will not be accepted.</p>
<h3>Return shipping costs</h3><p>You pay the cost of returning goods. We can buy a return label for you and deduct its cost from your refund, or you can arrange your own shipping and give us the tracking number.</p>
<h3>Damaged, defective or wrong items</h3><p>Inspect your delivery when it arrives. If an item is defective, damaged or not what you ordered, contact us right away so we can make it right.</p>
<h3>Items we cannot take back</h3><p>Custom or special-order products, hazardous materials, flammable liquids and gases, and sale items.</p>
<h3>Refunds</h3><p>After we receive and inspect your return, we will email you the decision. An approved refund goes to your original payment method within 10 business days, less the return shipping cost where we bought the label. If more than 15 business days pass after approval, contact ${BRAND.email}.</p>
<h3>Where this policy applies</h3><p>We do not currently sell to or ship to Quebec, so this policy applies to orders delivered elsewhere in Canada.</p>`],
 terms:['Terms of service','<div class="notice warn">'+icon('alert',18)+'<span>Draft text pending lawyer review. The full plain-language terms are in Section 9.6 of the specification.</span></div><p style="margin-top:16px">These terms apply when you visit leblanco.ca or buy from Leblanco Limited. We do not currently sell to or ship to Quebec. Accounts are reviewed before pricing or terms are assigned. Payment may be by card, Canadian pre-authorized debit, or on account when credit is approved. Tax is charged based on your delivery province.</p>'],
 privacy:['Privacy policy','<div class="notice warn">'+icon('alert',18)+'<span>Draft outline pending lawyer review. It replaces the Shopify-based 2022 policy.</span></div><p style="margin-top:16px">The final policy will cover what we collect (account, order, credit-application and quote data), how Stripe handles payment data, who we share it with, retention, your access and deletion rights, and our privacy contact at '+BRAND.email+'.</p>']
};
function policy(k){const p=POLICIES[k]; if(!p) return `<div class="wrap section"><h1>Page not found</h1></div>`; return `<div class="wrap section"><div class="crumbs" style="padding-top:0"><a href="#/">Home</a> / ${p[0]}</div><div class="prose"><h1>${p[0]}</h1>${p[1]}</div></div>`}
function about(){
  return `<div class="wrap section"><div class="prose"><div class="eyebrow">About us</div><h1>Who we are</h1>
  <p>Leblanco Limited is a proudly Canadian company that has served healthcare facilities and institutions since 1970. We specialize in retherm porcelain dishes and high-heat reusable plastic dishes and accessories. Our wider range also includes environmentally friendly products.</p>
  <table class="spec"><tbody><tr><th scope="row">Founder</th><td>Mr. Leon Blanchette</td></tr><tr><th scope="row">Founded</th><td>1970</td></tr><tr><th scope="row">Location</th><td>Mississauga, Ontario</td></tr><tr><th scope="row">Main markets</th><td>Hospitals, healthcare institutions, elder care facilities and mental health facilities</td></tr></tbody></table>
  <h3 style="margin-top:32px">Our mission</h3><p>To supply healthcare kitchens with dependable, safe and durable tableware at fair prices, backed by responsive service and reliable delivery.</p></div></div>`;
}
function contact(){
  return `<div class="wrap section"><div class="grid g2" style="align-items:start"><div><div class="eyebrow">Contact us</div><h1>Talk to sales</h1>
  <p class="muted">Questions about a product, a quote or an order? Tell us which products you are asking about so we can respond faster.</p>
  <table class="spec"><tbody><tr><th scope="row">Email</th><td>${BRAND.email}</td></tr><tr><th scope="row">Phone</th><td>${BRAND.phone}</td></tr><tr><th scope="row">Toll-free</th><td>${BRAND.toll}</td></tr><tr><th scope="row">Address</th><td>${BRAND.addr}, Canada</td></tr></tbody></table></div>
  <div class="card" id="contact-card"><form data-form="contact"><div class="row2"><div class="field"><label for="k1">Name</label><input type="text" id="k1" required></div><div class="field"><label for="k2">Organization</label><input type="text" id="k2"></div></div>
  <div class="row2"><div class="field"><label for="k3">Email</label><input type="email" id="k3" required></div><div class="field"><label for="k4">Phone</label><input type="tel" id="k4"></div></div>
  <div class="field"><label for="k5">Product or item code</label><input type="text" id="k5"></div><div class="field"><label for="k6">Message</label><textarea id="k6"></textarea></div>
  <button class="btn" type="submit" data-testid="button-contact-submit">Send to sales</button><p class="tiny muted" style="margin-top:10px">Prototype: the message is not sent anywhere.</p></form></div></div></div>`;
}
function donePage(id){
  const o=S.orders.find(x=>x.id===id); if(!o) return `<div class="wrap section"><div class="empty"><h2>Order not found</h2><a class="btn" href="#/">Home</a></div></div>`;
  const msg = o.method==='PAD'?'Your order stays in Awaiting payment until the bank debit clears, usually 2 to 3 business days.':o.method==='On account'?'Your order was placed on account. An invoice with a due date will follow.':'Payment received.';
  return `<div class="wrap section"><div class="card" style="max-width:680px;margin-inline:auto;text-align:center">${icon('check',44)}<h1 style="font-size:30px;margin-top:8px">Order ${o.id} received</h1><p class="muted">${msg}</p><p><span class="pill warn">${o.status}</span></p>
  <p class="small muted">A confirmation would be emailed from ${BRAND.email}. Each package gets its own tracking email when it ships.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn" href="#/account" data-testid="button-view-orders" data-tab-go="orders">View my orders</a><a class="btn ghost" href="#/shop">Keep shopping</a></div></div></div>`;
}

/* ---------- render ---------- */
function render(){
  const r=route(); const [a,b]=r.parts; let html='', cur='/';
  if(!a){html=home()}
  else if(a==='shop'){ S.f.cat=r.qs.get('cat')||''; html=shop(); cur=S.f.cat?'/shop?cat='+encodeURIComponent(S.f.cat):'/shop' }
  else if(a==='product')html=product(b);
  else if(a==='cart')html=cart();
  else if(a==='checkout')html=checkout();
  else if(a==='login')html=loginPage();
  else if(a==='register')html=registerPage();
  else if(a==='account')html=accountPage();
  else if(a==='quotes'){html=quotesPage();cur='/quotes'}
  else if(a==='about'){html=about();cur='/about'}
  else if(a==='contact'){html=contact();cur='/contact'}
  else if(a==='page')html=policy(b);
  else if(a==='done')html=donePage(b);
  else html=`<div class="wrap section"><div class="empty"><h2>Page not found</h2><a class="btn" href="#/">Home</a></div></div>`;
  const ae=document.activeElement; const keep=ae&&ae.id; const pos=ae&&ae.selectionStart;
  $('#app').innerHTML=shell(html,cur);
  if(keep&&['addr','postal','po'].includes(keep)){const el=document.getElementById(keep); if(el){el.focus(); try{el.setSelectionRange(pos,pos)}catch(e){}}}
}

/* ---------- actions ---------- */
function addToCart(sku,q=1){
  if(!isApproved()) return;
  if(S.quoteLock){S.quoteLock=null;S.cart=[]}
  const l=S.cart.find(x=>x.sku===sku); if(l)l.qty+=q; else S.cart.push({sku,qty:q});
  render(); toast('Added to cart');
}
function makeQuote(lines,note,delivery){
  const id='Q-'+(S.qseq++);
  S.quotes.unshift({id,date:new Date(),status:'Quote requested',note,delivery,lines:lines.map(l=>({sku:l.sku,qty:l.qty,est:groupPrice(byCode(l.sku)),locked:null}))});
  S.tab='quotes'; go('/account'); render(); toast('Quote '+id+' requested');
}
function openQuoteModal(lines){
  S._ql=lines.map(l=>({sku:l.sku,qty:l.qty}));
  S.modal=`<div class="modal-back" data-act="closemodal"><div class="modal" role="dialog" aria-label="Request a quote"><h3>Request a quote</h3><p class="small muted">${lines.map(l=>`${l.qty} &times; ${esc(byCode(l.sku).name)}`).join('<br>')}</p>
   <div class="field"><label for="qd">Delivery needed by</label><input type="date" id="qd"></div><div class="field"><label for="qn">Notes for Sales</label><textarea id="qn" placeholder="Delivery site, split shipments, standing order"></textarea></div>
   <div style="display:flex;gap:10px"><button class="btn" data-act="sendquote" data-testid="button-send-quote">Send request</button><button class="btn ghost" data-act="closemodal">Cancel</button></div></div></div>`;
  render();
}
function openReturn(id){
  const o=S.orders.find(x=>x.id===id);
  S.modal=`<div class="modal-back" data-act="closemodal"><div class="modal" role="dialog" aria-label="Request a return"><h3>Request a return</h3><p class="small muted">Order ${id}. Returns are accepted within 30 days after delivery. You pay return shipping.</p>
   <div class="field"><label for="rr1">Items to return</label><select id="rr1" multiple size="${o.lines.length}">${o.lines.map(l=>`<option selected value="${l.sku}">${l.qty} &times; ${esc(byCode(l.sku)?.name||l.sku)}</option>`).join('')}</select></div>
   <div class="field"><label for="rr2">Number of return packages</label><select id="rr2"><option>1</option><option>2</option><option>3</option></select><div class="hint">Each package gets its own RMA number.</div></div>
   <div class="field"><label for="rr3">Return shipping</label><select id="rr3"><option value="Leblanco buys the label and deducts the cost from your refund">Leblanco buys the label, cost deducted from refund</option><option value="you ship it yourself and enter the tracking number">I ship it myself and enter tracking</option></select></div>
   <div class="field"><label for="rr4">Reason</label><textarea id="rr4"></textarea></div>
   <div style="display:flex;gap:10px"><button class="btn" data-sendrma="${id}" data-testid="button-send-rma">Submit request</button><button class="btn ghost" data-act="closemodal">Cancel</button></div></div></div>`;
  render();
}
function placeOrder(){
  const c=calc(); const ck=S.ck; const pay=ck.pay==='account'&&!(S.user.terms)?'card':ck.pay;
  const id='LB-'+(S.seq++); const method=pay==='pad'?'PAD':pay==='account'?'On account':(ck.cardKind==='credit'?'Credit card':'Debit card');
  const status=pay==='pad'?'Awaiting payment':pay==='account'?'Received':'Processing';
  S.orders.unshift({id,date:new Date(),status,method,total:c.total,po:pay==='account'?ck.po:'',lines:c.lines.map(l=>({sku:l.p.sku,qty:l.qty})),pkgs:Array.from({length:c.pk},()=>({trk:'Label pending',st:'Packing'}))});
  if(pay==='account') S.user.used+=c.total;
  S.cart=[]; S.quoteLock=null; ck.mandate=false; ck.po=''; go('/done/'+id);
}
function regCheck(){
  const p=$('[data-regprov]'),z=$('[data-regpostal]'),box=$('#reg-qc'); if(!p||!box) return;
  const qc=p.value==='QC'||isQuebecPostal(z.value);
  box.innerHTML=qc?`<div class="notice err" role="alert" style="margin-bottom:16px" data-testid="notice-reg-quebec">${icon('alert',18)}<span><b>We do not currently sell to or ship to Quebec.</b> We cannot open an account with a Quebec address.</span></div>`:'';
  $('[data-testid=button-register-submit]').disabled=qc;
}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act],[data-add],[data-addq],[data-quote1],[data-rm],[data-q],[data-qtyb],[data-tab],[data-persona],[data-return],[data-simq],[data-acceptq],[data-revq],[data-decq],[data-pay],[data-cardkind],[data-sendrma],[data-tab-go]');
  if(!t) return; const d=t.dataset;
  if(d.act==='closemodal' && !t.classList.contains('btn') && e.target.closest('.modal')) return;
  if(d.act==='panel'){S.panelOpen=!S.panelOpen;render();return}
  if(d.act==='cookie'){S.cookie=false;render();return}
  if(d.act==='demo-on'){S.demo=true;render();return}
  if(d.act==='clear'){S.f={cat:'',material:'',heat:'',colour:'',type:'',sort:'name'};S.q='';go('/shop');render();return}
  if(d.act==='logout'){setPersona('visitor');go('/');render();toast('Logged out');return}
  if(d.act==='twofa'){S.twofa=!S.twofa;render();toast('Two-factor authentication '+(S.twofa?'on':'off'));return}
  if(d.act==='quote-cart'){openQuoteModal(S.cart);return}
  if(d.act==='closemodal'){S.modal=null;render();return}
  if(d.act==='sendquote'){const n=$('#qn')?.value||'',dl=$('#qd')?.value||'';S.modal=null;makeQuote(S._ql,n,dl);return}
  if(d.act==='place'){placeOrder();return}
  if(d.tabGo){S.tab=d.tabGo;return}
  if(d.add){addToCart(d.add);return}
  if(d.addq){addToCart(d.addq,Math.max(1,parseInt($('#qty').value)||1));return}
  if(d.quote1){openQuoteModal([{sku:d.quote1,qty:Math.max(1,parseInt($('#qty').value)||1)}]);return}
  if(d.rm){S.cart=S.cart.filter(l=>l.sku!==d.rm);render();return}
  if(d.q){const[s,n]=d.q.split(':');const l=S.cart.find(x=>x.sku===s);l.qty=Math.max(1,l.qty+parseInt(n));render();return}
  if(d.qtyb){const i=$('#qty');i.value=Math.max(1,(parseInt(i.value)||1)+parseInt(d.qtyb));return}
  if(d.tab){S.tab=d.tab;render();return}
  if(d.persona){setPersona(d.persona);go('/account');render();toast('Previewing: '+PERSONAS[d.persona].label);return}
  if(d.pay){S.ck.pay=d.pay;render();return}
  if(d.cardkind){S.ck.cardKind=d.cardkind;render();return}
  if(d.simq){const q=S.quotes.find(x=>x.id===d.simq);q.lines.forEach(l=>l.locked=Math.round(l.est*0.96*100)/100);q.status='Quote sent';q.expires=addDays(30);render();toast('Quote priced by Sales (simulated)');return}
  if(d.acceptq){const q=S.quotes.find(x=>x.id===d.acceptq);q.status='Quote accepted';S.cart=q.lines.map(l=>({sku:l.sku,qty:l.qty,locked:l.locked}));S.quoteLock=q.id;go('/checkout');render();toast('Quote accepted. Prices locked.');return}
  if(d.revq){S.quotes.find(x=>x.id===d.revq).status='Revision requested';render();return}
  if(d.decq){S.quotes.find(x=>x.id===d.decq).status='Declined';render();return}
  if(d.return){openReturn(d.return);return}
  if(d.sendrma){const id='RMA-'+(S.rseq++);S.rmas.push({id,order:d.sendrma,status:'Return requested',pkgs:parseInt($('#rr2').value)||1,mode:$('#rr3').value});S.modal=null;render();toast(id+' requested');return}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.sel==='persona'){setPersona(t.value);if(/^#\/(account|checkout|cart|quotes|done)/.test(location.hash))go('/');render();return}
  if(t.dataset.sel==='sort'){S.f.sort=t.value;render();return}
  if(t.dataset.chk==='demo'){S.demo=t.checked;if(!S.demo)S.cart=[];render();return}
  if(t.dataset.facet==='cat'){go('/shop'+(t.value?'?cat='+encodeURIComponent(t.value):''));return}
  if(t.dataset.facet){S.f[t.dataset.facet]=t.value;render();return}
  if(t.dataset.ck==='prov'){S.ck.prov=t.value;render();return}
  if(t.hasAttribute('data-mandate')){S.ck.mandate=t.checked;render();return}
  if(t.dataset.qin){const l=S.cart.find(x=>x.sku===t.dataset.qin);l.qty=Math.max(1,parseInt(t.value)||1);render();return}
  if(t.matches('[data-regprov],[data-regpostal]')) regCheck();
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.ck==='addr'){S.ck.addr=t.value}
  if(t.dataset.ck==='postal'){S.ck.postal=t.value;render()}
  if(t.dataset.ck==='po'){S.ck.po=t.value;render()}
  if(t.matches('[data-regpostal]')) regCheck();
});
document.addEventListener('submit',e=>{
  const f=e.target.closest('[data-form]'); if(!f) return; e.preventDefault(); const k=f.dataset.form; const fd=new FormData(f);
  if(k==='search'){S.q=fd.get('q')||'';S.f={cat:'',material:'',heat:'',colour:'',type:'',sort:'name'};go('/shop');render();return}
  if(k==='login'){setPersona('tierb');go('/account');render();toast('Logged in as demo account (Tier B)');return}
  if(k==='register'){
    if(fd.get('prov')==='QC'||isQuebecPostal(fd.get('postal'))){regCheck();return}
    if(!fd.get('name')||!fd.get('email')){toast('Enter your name and email');return}
    setPersona('pending'); S.user={...PERSONAS.pending.user,name:fd.get('name'),company:fd.get('company')||'',type:fd.get('type')}; go('/account'); render(); toast('Account submitted for approval'); return}
  if(k==='credit'){S.credit=true;render();toast('Credit application submitted');return}
  if(k==='contact'){$('#contact-card').innerHTML=`<div class="notice ok">${icon('check',18)}<span>Thanks. In the live store this message goes to ${BRAND.email}.</span></div>`;return}
});
window.addEventListener('hashchange',()=>{S.modal=null;render();window.scrollTo(0,0);const m=$('#main'); if(m) m.focus({preventScroll:true})});
setPersona('visitor'); render();
