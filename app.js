// Boracell — app.js
const MXN_TO_USD = 0.051;
let lang = 'es';

function setLang(l) {
  lang = l;
  document.getElementById('btn-es').classList.toggle('active', l==='es');
  document.getElementById('btn-en').classList.toggle('active', l==='en');
  document.querySelectorAll('[data-es]').forEach(el => {
    const v = el.getAttribute('data-'+l);
    if (!v) return;
    if (el.tagName==='H1' || el.innerHTML.includes('<em>')) el.innerHTML = v;
    else el.textContent = v;
  });
  renderCars(); renderFactory();
}

const fmtMXN = n => '$' + Math.round(n).toLocaleString('es-MX') + ' MXN';
const fmtUSD = n => '≈ $' + Math.round(n*MXN_TO_USD).toLocaleString('en-US') + ' USD';

// LOGIN
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name  = document.getElementById('login-name').value.trim();
  const email = document.getElementById('login-email').value.trim();
  const priv  = document.getElementById('login-privacy').checked;
  let ok = true;
  document.getElementById('err-name').classList.remove('show');
  document.getElementById('err-email').classList.remove('show');
  document.getElementById('err-privacy').classList.remove('show');
  if (!name)                            { document.getElementById('err-name').classList.add('show');    ok=false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('err-email').classList.add('show');   ok=false; }
  if (!priv)                            { document.getElementById('err-privacy').classList.add('show'); ok=false; }
  if (!ok) return;
  const ls = document.getElementById('login-screen');
  ls.classList.add('hidden');
  setTimeout(() => { ls.style.display='none'; document.getElementById('app').classList.add('visible'); }, 500);
  showToast(lang==='es' ? `Bienvenido, ${name}` : `Welcome, ${name}`,
            lang==='es' ? 'Tu cartera de $950,000 MXN está lista.' : 'Your $950,000 MXN wallet is ready.');
});

// DATA
const CARS = [
  { id:1, name:'Serie 3 330i', year:2024, price:698000, rent:3500, units:4,
    img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/2022_BMW_330i_%28G20%2C_facelift%29%2C_front_8.20.22.jpg/1280px-2022_BMW_330i_%28G20%2C_facelift%29%2C_front_8.20.22.jpg',
    colors:[{n:'Alpine White',h:'#f0eeea'},{n:'Black Sapphire',h:'#141414'},{n:'Mineral Grey',h:'#7a7a7a'},{n:'Phytonic Blue',h:'#2a4a6e'}],
    specs_es:[{k:'Motor',v:'2.0L TwinPower Turbo'},{k:'Potencia',v:'184 CV'},{k:'0-100 km/h',v:'7.1 seg'},{k:'Transmisión',v:'Automática 8 vel.'},{k:'Tracción',v:'RWD'},{k:'Consumo',v:'7.2 L/100km'}],
    specs_en:[{k:'Engine',v:'2.0L TwinPower Turbo'},{k:'Power',v:'184 HP'},{k:'0-60 mph',v:'6.6 sec'},{k:'Transmission',v:'8-speed Auto'},{k:'Drive',v:'RWD'},{k:'Fuel',v:'7.2 L/100km'}] },
  { id:2, name:'M3 Competition', year:2024, price:1950000, rent:9800, units:2,
    img:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/2019_BMW_M3_Competition_%28F80%2C_facelift%29%2C_front_8.27.19.jpg/1280px-2019_BMW_M3_Competition_%28F80%2C_facelift%29%2C_front_8.27.19.jpg',
    colors:[{n:'Isle of Man Green',h:'#2d5c2e'},{n:'Black Sapphire',h:'#141414'},{n:'Portimao Blue',h:'#1c3a5e'}],
    specs_es:[{k:'Motor',v:'3.0L M TwinPower'},{k:'Potencia',v:'510 CV'},{k:'0-100 km/h',v:'3.9 seg'},{k:'Transmisión',v:'M Steptronic 8'},{k:'Tracción',v:'M xDrive AWD'},{k:'Vel. máx.',v:'290 km/h'}],
    specs_en:[{k:'Engine',v:'3.0L M TwinPower'},{k:'Power',v:'503 HP'},{k:'0-60 mph',v:'3.5 sec'},{k:'Transmission',v:'M Steptronic 8'},{k:'Drive',v:'M xDrive AWD'},{k:'Top speed',v:'180 mph'}] },
  { id:3, name:'X3 M40i', year:2024, price:1180000, rent:5900, units:5,
    img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/BMW_X3_M40i_%28G01%29_%E2%80%93_f_08072018.jpg/1280px-BMW_X3_M40i_%28G01%29_%E2%80%93_f_08072018.jpg',
    colors:[{n:'Mineral White',h:'#e8e6e1'},{n:'Carbon Black',h:'#1a1a1a'},{n:'Phytonic Blue',h:'#2a4a6e'},{n:'Thundernight',h:'#3a1a5a'}],
    specs_es:[{k:'Motor',v:'3.0L TwinPower I6'},{k:'Potencia',v:'382 CV'},{k:'0-100 km/h',v:'4.5 seg'},{k:'Transmisión',v:'Automática 8 vel.'},{k:'Tracción',v:'xDrive AWD'},{k:'Consumo',v:'9.4 L/100km'}],
    specs_en:[{k:'Engine',v:'3.0L TwinPower I6'},{k:'Power',v:'382 HP'},{k:'0-60 mph',v:'4.2 sec'},{k:'Transmission',v:'8-speed Auto'},{k:'Drive',v:'xDrive AWD'},{k:'Fuel',v:'9.4 L/100km'}] }
];
const FAC = [3,2,1];
let wallet=950000, cart=[], orders=[], curCar=null, picked={};

function getArrival(type) {
  const now=new Date();
  if (type==='buy') {
    const d=new Date(now.getTime()+(3+Math.floor(Math.random()*3))*86400000);
    return (lang==='es'?'Entrega: ':'Delivery: ')+d.toLocaleDateString(lang==='es'?'es-MX':'en-US',{weekday:'long',day:'numeric',month:'long'});
  }
  const s=new Date(now.getTime()+7200000), e=new Date(s.getTime()+86400000);
  return (lang==='es'?'Desde ':'From ')+s.toLocaleTimeString(lang==='es'?'es-MX':'en-US',{hour:'2-digit',minute:'2-digit'})+' → '+e.toLocaleDateString(lang==='es'?'es-MX':'en-US',{month:'short',day:'numeric'});
}
function getRefund() {
  const d=new Date(Date.now()+3*86400000);
  return d.toLocaleDateString(lang==='es'?'es-MX':'en-US',{day:'numeric',month:'long',year:'numeric'});
}

// TICKER
(function(){
  const msgs=['Financiamiento 0% en modelos seleccionados — 0% Financing on select models','Renta desde $3,500 MXN / día — Rental from $179 USD / day','Entrega inmediata CDMX y MTY — Immediate delivery available','Saldo bienvenida $950,000 MXN — Welcome wallet $950,000 MXN','Factory: Serie 3 · M3 Competition · X3 M40i','Descuento 15% rentas semanales Serie M — 15% off weekly M Series'];
  const el=document.getElementById('ticker-track');
  if(el) el.innerHTML=[...msgs,...msgs].map(m=>`<span class="ticker-item">${m} &nbsp; —</span>`).join('');
})();

function renderCars() {
  const t=lang, el=document.getElementById('v-grid'); if(!el) return;
  el.innerHTML=CARS.map(c=>`
    <div class="v-card">
      <div class="v-img-wrap">
        <img class="v-img" src="${c.img}" alt="${c.name}" onerror="this.outerHTML='<div class=v-img-fb>${c.name.split(' ').slice(-1)[0]}</div>'">
        <span class="v-avail ${c.units>0?'avail-y':'avail-n'}">${c.units>0?c.units+(t==='es'?' unid.':' units'):(t==='es'?'Sin stock':'Out of stock')}</span>
      </div>
      <div class="v-accent"></div>
      <div class="v-body">
        <div class="v-brand">BMW · ${c.year}</div>
        <div class="v-name">${c.name}</div>
        <div class="v-engine">${c['specs_'+t][0].v}</div>
        <div class="v-colors"><span class="v-clabel">Color</span>${c.colors.map((col,i)=>`<div class="vcdot ${i===0?'on':''}" style="background:${col.h}" title="${col.n}"></div>`).join('')}</div>
        <hr class="v-divider">
        <div class="v-prices">
          <div><div class="vp-label">${t==='es'?'Compra':'Purchase'}</div><div class="vp-main">${fmtMXN(c.price)}</div><div class="vp-usd">${fmtUSD(c.price)}</div></div>
          <div style="text-align:right"><div class="vp-label">${t==='es'?'Renta / día':'Rental / day'}</div><div class="vp-rent">${fmtMXN(c.rent)}</div><div class="vp-rent-usd">${fmtUSD(c.rent)}</div></div>
        </div>
        <div class="v-actions">
          <button class="v-btn-buy" ${c.units===0?'disabled':''} onclick="quickAdd(${c.id},'buy')">${t==='es'?'Comprar':'Buy'}</button>
          <button class="v-btn-rent" ${c.units===0?'disabled':''} onclick="quickAdd(${c.id},'rent')">${t==='es'?'Rentar':'Rent'}</button>
          <button class="v-btn-detail" onclick="openModal(${c.id})">${t==='es'?'Ver':'View'}</button>
        </div>
      </div>
    </div>`).join('');
}

function renderFactory() {
  const t=lang, el=document.getElementById('fac-grid'); if(!el) return;
  el.innerHTML=FAC.map(id=>{
    const c=CARS.find(x=>x.id===id);
    return `<div class="fac-card" onclick="openModal(${c.id})">
      <div class="fac-img-wrap">
        <img class="fac-img" src="${c.img}" alt="${c.name}" onerror="this.outerHTML='<div class=fac-fb>${c.name.split(' ').slice(-1)[0]}</div>'">
        <span class="v-avail ${c.units>0?'avail-y':'avail-n'}">${c.units>0?c.units+(t==='es'?' unid.':' units'):(t==='es'?'Sin stock':'Out of stock')}</span>
      </div>
      <div class="fac-bar"></div>
      <div class="fac-body">
        <span class="fac-tag-pill">${t==='es'?'Fabricación Boracell':'Boracell Manufacturing'}</span>
        <div class="fac-name">${c.name}</div>
        <div class="fac-engine">${c['specs_'+t][0].v}</div>
        <div class="fac-specs-mini">${c['specs_'+t].slice(1,5).map(s=>`<div><div class="fsm-k">${s.k}</div><div class="fsm-v">${s.v}</div></div>`).join('')}</div>
        <div class="fac-footer">
          <div><div class="fac-pl">${t==='es'?'Precio':'Price'}</div><div class="fac-pv">${fmtMXN(c.price)}</div><div class="fac-pv-usd">${fmtUSD(c.price)}</div></div>
          <div class="fac-units ${c.units>0?'fu-y':'fu-n'}">${c.units>0?c.units+(t==='es'?' disponibles':' available'):(t==='es'?'Sin stock':'Out of stock')}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openModal(id) {
  curCar=CARS.find(c=>c.id===id); const c=curCar, t=lang;
  const photo=document.getElementById('m-photo');
  photo.innerHTML=`<img src="${c.img}" alt="${c.name}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:16px 0 0 16px;filter:brightness(.75)" onerror="this.outerHTML='<div class=m-photo-fb>${c.name.split(' ').slice(-1)[0]}</div>'">`;
  document.getElementById('m-title').textContent=c.name;
  document.getElementById('m-subtitle').textContent=c.year+' — '+c['specs_'+t][0].v;
  document.getElementById('m-specs-title').textContent=t==='es'?'Especificaciones':'Specifications';
  document.getElementById('m-color-title').textContent=t==='es'?'Color disponible':'Available color';
  document.getElementById('m-pbuy').textContent=fmtMXN(c.price);
  document.getElementById('m-pbuy-usd').textContent=fmtUSD(c.price);
  document.getElementById('m-prent').textContent=fmtMXN(c.rent)+(t==='es'?'/día':'/day');
  document.getElementById('m-prent-usd').textContent=fmtUSD(c.rent)+(t==='es'?'/día':'/day');
  document.getElementById('m-label-buy').textContent=t==='es'?'Compra':'Purchase';
  document.getElementById('m-label-rent').textContent=t==='es'?'Renta / día':'Rental / day';
  document.getElementById('m-specs').innerHTML=c['specs_'+t].map(s=>`<div class="m-spec"><span class="m-spec-k">${s.k}</span><span class="m-spec-v">${s.v}</span></div>`).join('');
  picked[c.id]=c.colors[0];
  document.getElementById('m-colors').innerHTML=c.colors.map((col,i)=>`<div class="mc-opt" onclick="pickColor(${c.id},${i})"><div class="mc-sw ${i===0?'sel':''}" id="sw-${c.id}-${i}" style="background:${col.h}"></div><div class="mc-nm">${col.n}</div></div>`).join('');
  const ok=c.units>0;
  const bb=document.getElementById('ma-buy'), br=document.getElementById('ma-rent');
  bb.disabled=!ok; br.disabled=!ok;
  bb.textContent=t==='es'?'Comprar':'Buy';
  br.textContent=t==='es'?'Rentar':'Rent';
  document.getElementById('m-units').innerHTML=ok
    ?`<span class="unit-ok">${c.units} ${t==='es'?`unidad${c.units!==1?'es':''} disponible${c.units!==1?'s':''}`:`unit${c.units!==1?'s':''} available`}</span>`
    :`<span class="unit-no">${t==='es'?'Sin unidades disponibles':'No units available'}</span>`;
  bb.onclick=()=>addToCart(c.id,'buy');
  br.onclick=()=>addToCart(c.id,'rent');
  document.getElementById('modal-vehicle').classList.add('open');
}
function closeModal(){document.getElementById('modal-vehicle').classList.remove('open')}
function pickColor(cid,idx){
  const c=CARS.find(x=>x.id===cid); picked[cid]=c.colors[idx];
  c.colors.forEach((_,i)=>{const el=document.getElementById(`sw-${cid}-${i}`);if(el)el.classList.toggle('sel',i===idx)});
}
function quickAdd(id,type){if(!picked[id])picked[id]=CARS.find(x=>x.id===id).colors[0];addToCart(id,type)}

function addToCart(id,type){
  const c=CARS.find(x=>x.id===id), color=picked[id]||c.colors[0], price=type==='buy'?c.price:c.rent;
  cart.push({uid:Date.now(),id,name:c.name,type,price,color:color.n,arrival:getArrival(type)});
  updateBadge(); closeModal();
  showToast(lang==='es'?(type==='buy'?'Agregado al carrito':'Renta agregada'):(type==='buy'?'Added to cart':'Rental added'),`${c.name} — ${color.n} — ${fmtMXN(price)}`);
}
function removeItem(uid){cart=cart.filter(x=>x.uid!==uid);updateBadge();renderCart()}
function updateBadge(){document.getElementById('cart-count').textContent=cart.length}
function openCart(){renderCart();document.getElementById('modal-cart').classList.add('open')}
function closeCart(){document.getElementById('modal-cart').classList.remove('open')}

function renderCart(){
  const t=lang, body=document.getElementById('cart-items'), sum=document.getElementById('cart-summary');
  const tEl=document.querySelector('.cart-title'); if(tEl) tEl.textContent=t==='es'?'Carrito':'Cart';
  if(!cart.length){body.innerHTML=`<div class="cart-empty">${t==='es'?'El carrito está vacío':'Your cart is empty'}</div>`;sum.innerHTML='';return}
  body.innerHTML=cart.map(item=>`
    <div class="cart-row">
      <div>
        <div class="cr-name">${item.name}</div>
        <div class="cr-detail">Color: ${item.color}</div>
        <span class="cr-badge ${item.type==='buy'?'crb-buy':'crb-rent'}">${item.type==='buy'?(t==='es'?'Compra':'Purchase'):(t==='es'?'Renta/día':'Rental/day')}</span>
        <div class="cr-arrival">${item.arrival}</div>
      </div>
      <div class="cr-right">
        <div class="cr-price">${fmtMXN(item.price)}</div>
        <div class="cr-price-usd">${fmtUSD(item.price)}</div>
        <button class="cr-remove" onclick="removeItem(${item.uid})">${t==='es'?'Eliminar':'Remove'}</button>
      </div>
    </div>`).join('');
  const total=cart.reduce((s,x)=>s+x.price,0), canPay=wallet>=total;
  sum.innerHTML=`
    <div class="cs-row"><span class="cs-label">Total</span><div style="text-align:right"><div class="cs-total">${fmtMXN(total)}</div><div class="cs-total-usd">${fmtUSD(total)}</div></div></div>
    <div class="cs-row" style="margin-bottom:10px"><span class="cs-label">${t==='es'?'Saldo disponible':'Available balance'}</span><span class="cs-wallet">${fmtMXN(wallet)}</span></div>
    <div class="wallet-status ${canPay?'ws-ok':'ws-fail'}">${canPay?(t==='es'?'Saldo suficiente para confirmar.':'Sufficient balance to confirm.'):(t==='es'?'Saldo insuficiente. Elimina artículos.':'Insufficient balance. Remove items.')}</div>
    <button class="btn-confirm" ${!canPay?'disabled':''} onclick="confirmOrder()">${t==='es'?'Confirmar operación':'Confirm order'}</button>`;
}

function confirmOrder(){
  const total=cart.reduce((s,x)=>s+x.price,0);
  wallet-=total; document.getElementById('wallet-display').textContent=fmtMXN(wallet);
  cart.forEach(item=>orders.push({...item,orderId:'BRC-'+Math.random().toString(36).substr(2,7).toUpperCase(),confirmedAt:new Date(),status:'confirmed',refundDeadline:getRefund()}));
  const lastId=orders[orders.length-1].orderId;
  cart=[]; updateBadge(); closeCart();
  showToast(lang==='es'?'Operación confirmada':'Order confirmed',lang==='es'?'Abriendo detalle de tu orden...':'Opening your order details...');
  setTimeout(()=>openOrderDetail(lastId),400);
}

function openOrderDetail(orderId){
  const order=orders.find(o=>o.orderId===orderId); if(!order) return;
  const t=lang;
  const steps_es=['Confirmado','Procesando','En tránsito','Entregado'];
  const steps_en=['Confirmed','Processing','In transit','Delivered'];
  const steps=t==='es'?steps_es:steps_en;
  const aStep=order.status==='cancelled'?-1:1;
  const sLabel={confirmed:{es:'Confirmado',en:'Confirmed',cls:'bl'},cancelled:{es:'Cancelado',en:'Cancelled',cls:'rv'},refunded:{es:'Reembolsado',en:'Refunded',cls:'gn'}}[order.status];
  const policy=t==='es'
    ?'Las compras pueden cancelarse dentro de 72 horas sin cargo. Pasado ese plazo, se aplica una retención del 15%. Las rentas no son reembolsables una vez iniciadas.'
    :'Purchases can be cancelled within 72 hours at no charge. After that, a 15% fee applies. Rentals are non-refundable once started.';
  document.getElementById('op-content').innerHTML=`
    <div class="op-header"><div class="op-title">${t==='es'?'Detalle de Orden':'Order Details'}</div><button class="modal-close" style="position:static" onclick="closeOrderDetail()">✕</button></div>
    <div class="op-body">
      ${order.status!=='cancelled'?`<div class="op-status-bar">${steps.map((s,i)=>`<div class="op-step ${i<aStep?'done':i===aStep?'active':''}"><div class="op-dot">${i<aStep?'✓':i+1}</div><div class="op-step-label">${s}</div></div>`).join('')}</div>`
      :`<div style="background:rgba(255,69,58,.08);border:1px solid rgba(255,69,58,.2);border-radius:8px;padding:12px 16px;margin-bottom:24px;color:#ff453a;font-size:12px">${t==='es'?'Esta orden fue cancelada y reembolsada.':'This order was cancelled and refunded.'}</div>`}
      <div class="op-section">
        <div class="op-section-title">${t==='es'?'Información de orden':'Order information'}</div>
        <div class="op-row"><span class="op-key">${t==='es'?'Número':'Order #'}</span><span class="op-val bl">${order.orderId}</span></div>
        <div class="op-row"><span class="op-key">${t==='es'?'Tipo':'Type'}</span><span class="op-val">${order.type==='buy'?(t==='es'?'Compra':'Purchase'):(t==='es'?'Renta':'Rental')}</span></div>
        <div class="op-row"><span class="op-key">${t==='es'?'Estado':'Status'}</span><span class="op-val ${sLabel.cls}">${sLabel[t]}</span></div>
        <div class="op-row"><span class="op-key">${t==='es'?'Fecha':'Date'}</span><span class="op-val">${order.confirmedAt.toLocaleDateString(t==='es'?'es-MX':'en-US',{day:'numeric',month:'long',year:'numeric'})}</span></div>
      </div>
      <div class="op-section">
        <div class="op-section-title">${t==='es'?'Vehículo':'Vehicle'}</div>
        <div class="op-row"><span class="op-key">${t==='es'?'Modelo':'Model'}</span><span class="op-val">${order.name}</span></div>
        <div class="op-row"><span class="op-key">${t==='es'?'Color':'Color'}</span><span class="op-val">${order.color}</span></div>
        <div class="op-row"><span class="op-key">${order.type==='buy'?(t==='es'?'Entrega estimada':'Est. delivery'):(t==='es'?'Periodo':'Period')}</span><span class="op-val">${order.arrival}</span></div>
      </div>
      <div class="op-section">
        <div class="op-section-title">${t==='es'?'Desglose financiero':'Financial breakdown'}</div>
        <div class="op-row"><span class="op-key">MXN</span><span class="op-val">${fmtMXN(order.price)}</span></div>
        <div class="op-row"><span class="op-key">USD</span><span class="op-val">${fmtUSD(order.price)}</span></div>
        <div class="op-row"><span class="op-key">${t==='es'?'Tipo de cambio':'Rate'}</span><span class="op-val">$1 USD = $${(1/MXN_TO_USD).toFixed(1)} MXN</span></div>
        <div class="op-row"><span class="op-key">${t==='es'?'Método':'Payment'}</span><span class="op-val">${t==='es'?'Cartera Boracell':'Boracell Wallet'}</span></div>
      </div>
      <div class="op-section">
        <div class="op-section-title">${t==='es'?'Política de cancelación':'Cancellation policy'}</div>
        <div class="op-policy"><div class="op-policy-title">${t==='es'?'Condiciones':'Terms'}</div><p>${policy}</p></div>
        ${order.status==='confirmed'?`<div class="op-row"><span class="op-key">${t==='es'?'Cancelación gratis hasta':'Free cancellation until'}</span><span class="op-val yl">${order.refundDeadline}</span></div>`:''}
      </div>
      <div class="op-actions">
        <button class="op-btn-cancel" ${order.status!=='confirmed'?'disabled':''} onclick="cancelOrder('${order.orderId}')">${t==='es'?'Cancelar y reembolsar':'Cancel & refund'}</button>
        <button class="op-btn-close" onclick="closeOrderDetail()">${t==='es'?'Cerrar':'Close'}</button>
      </div>
    </div>`;
  document.getElementById('modal-order').classList.add('open');
}

function closeOrderDetail(){document.getElementById('modal-order').classList.remove('open')}

function cancelOrder(orderId){
  const order=orders.find(o=>o.orderId===orderId);
  if(!order||order.status!=='confirmed') return;
  order.status='cancelled'; wallet+=order.price;
  document.getElementById('wallet-display').textContent=fmtMXN(wallet);
  closeOrderDetail();
  showToast(lang==='es'?'Orden cancelada':'Order cancelled',`${order.name} — ${lang==='es'?'Reembolso de':'Refund of'} ${fmtMXN(order.price)} ${lang==='es'?'aplicado.':'applied.'}`);
}

function showToast(title,msg){
  document.getElementById('toast-title').textContent=title;
  document.getElementById('toast-msg').textContent=msg;
  const el=document.getElementById('toast'); el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),3600);
}

['modal-vehicle','modal-cart','modal-order'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.addEventListener('click',e=>{
    if(e.target===e.currentTarget){if(id==='modal-vehicle')closeModal();else if(id==='modal-cart')closeCart();else closeOrderDetail()}
  });
});

renderCars(); renderFactory();