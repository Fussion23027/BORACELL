const LS_KEY = 'boracell_cars';

// Set your own credentials here — these are intentionally left blank
const ACCESS_CODE  = '';
const MANAGER_CODE = '';
const PUBLISH_CODE = '';

let adminName = '';
let editingId = null;
let deleteTargetId = null;
let pendingData = null;
let searchTerm = '';
let filterStatus = 'all';

function getCars() {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : []; }
  catch(e) { return []; }
}
function saveCars(cars) { localStorage.setItem(LS_KEY, JSON.stringify(cars)); }

// Login
document.getElementById('admin-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('a-name').value.trim();
  const code = document.getElementById('a-code').value.trim();
  const mgr  = document.getElementById('a-mgr').value.trim();
  let ok = true;
  ['ae-name','ae-code','ae-mgr'].forEach(id => document.getElementById(id).classList.remove('show'));
  if (!name)           { document.getElementById('ae-name').classList.add('show'); ok = false; }
  if (code !== ACCESS_CODE)  { document.getElementById('ae-code').classList.add('show'); ok = false; }
  if (mgr  !== MANAGER_CODE) { document.getElementById('ae-mgr').classList.add('show'); ok = false; }
  if (!ok) return;
  adminName = name;
  document.getElementById('admin-name-display').textContent = name;
  const ls = document.getElementById('login-screen');
  ls.classList.add('hidden');
  setTimeout(() => { ls.style.display = 'none'; document.getElementById('app').classList.add('visible'); }, 400);
  renderStats(); renderList();
  showToast('Acceso concedido', `Bienvenido, ${name}. Panel BRC activo.`);
});

function logout() {
  document.getElementById('app').classList.remove('visible');
  const ls = document.getElementById('login-screen');
  ls.style.cssText = 'display:flex;opacity:1;visibility:visible;pointer-events:auto';
  ['a-name','a-code','a-mgr'].forEach(id => document.getElementById(id).value = '');
}

// Stats
function renderStats() {
  const cars = getCars();
  const avail = cars.filter(c => c.units > 0).length;
  const units = cars.reduce((s, c) => s + Number(c.units || 0), 0);
  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card"><div class="stat-label">Total vehículos</div><div class="stat-val">${cars.length}</div><div class="stat-sub">en catálogo</div></div>
    <div class="stat-card"><div class="stat-label">Con stock</div><div class="stat-val" style="color:var(--grn)">${avail}</div><div class="stat-sub">modelos disponibles</div></div>
    <div class="stat-card"><div class="stat-label">Sin stock</div><div class="stat-val" style="color:var(--bad)">${cars.length - avail}</div><div class="stat-sub">modelos agotados</div></div>
    <div class="stat-card"><div class="stat-label">Unidades totales</div><div class="stat-val">${units}</div><div class="stat-sub">en inventario</div></div>`;
}

// List
function filterList() {
  searchTerm = document.getElementById('search-input').value.toLowerCase();
  filterStatus = document.getElementById('filter-status').value;
  renderList();
}

function renderList() {
  const cars = getCars();
  let list = cars.filter(c => {
    const matchSearch = !searchTerm || (c.name + c.year + c.price).toLowerCase().includes(searchTerm);
    const matchStatus = filterStatus === 'all' || (filterStatus === 'available' ? c.units > 0 : c.units === 0);
    return matchSearch && matchStatus;
  });

  const wrap = document.getElementById('car-list-wrap');
  const fmt = n => '$' + Math.round(n || 0).toLocaleString('es-MX');

  if (!cars.length) {
    wrap.innerHTML = `<div class="table-empty"><h3>Catálogo vacío</h3><p>Agrega un vehículo con el botón "+ Agregar vehículo".</p></div>`;
    return;
  }
  if (!list.length) {
    wrap.innerHTML = `<div class="table-empty"><h3>Sin resultados</h3><p>No hay vehículos con los filtros aplicados.</p></div>`;
    return;
  }

  wrap.innerHTML = `<table class="car-table">
    <thead><tr>
      <th>Img</th><th>ID</th><th>Modelo</th><th>Año</th>
      <th>Precio</th><th>Renta/día</th><th>Unid.</th><th>Estado</th><th>Colores</th><th>Acciones</th>
    </tr></thead>
    <tbody>${list.map(c => `<tr>
      <td>${c.img ? `<img class="td-img" src="${c.img}" onerror="this.style.display='none'">` : `<div class="td-img-ph">—</div>`}</td>
      <td class="td-id">${c.id}</td>
      <td class="td-name">${c.name}</td>
      <td>${c.year || '—'}</td>
      <td class="td-price">${fmt(c.price)}</td>
      <td>${fmt(c.rent)}</td>
      <td style="color:${c.units > 0 ? 'var(--grn)' : 'var(--bad)'}; font-weight:600">${c.units}</td>
      <td><span class="bp ${c.units > 0 ? 'bp-ok' : 'bp-no'}">${c.units > 0 ? 'Disponible' : 'Sin stock'}</span></td>
      <td>${(c.colors || []).map(col => `<span title="${col.n}" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${col.h};margin-right:3px;border:1px solid rgba(255,255,255,.15)"></span>`).join('') || '—'}</td>
      <td><div class="td-actions">
        <button class="btn-edit" onclick="openPanel(${c.id})">Editar</button>
        <button class="btn-del" onclick="openDelModal(${c.id})">Eliminar</button>
      </div></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

// Panel
function openPanel(id) {
  editingId = id;
  document.getElementById('panel-title').textContent = id ? 'Editar vehículo' : 'Agregar vehículo';
  ['pfe-name','pfe-year','pfe-price','pfe-rent','pfe-units'].forEach(i => document.getElementById(i).classList.remove('show'));

  if (id) {
    const c = getCars().find(x => x.id === id);
    if (!c) return;
    document.getElementById('pf-name').value  = c.name || '';
    document.getElementById('pf-year').value  = c.year || '';
    document.getElementById('pf-price').value = c.price || '';
    document.getElementById('pf-rent').value  = c.rent || '';
    document.getElementById('pf-units').value = c.units || 0;
    document.getElementById('pf-desc').value  = c.description || '';
    document.getElementById('pf-img').value   = c.img || '';
    previewImg();
    buildColors(c.colors || []);
    buildSpecs(c.specs || []);
  } else {
    ['pf-name','pf-year','pf-price','pf-rent','pf-desc','pf-img'].forEach(i => document.getElementById(i).value = '');
    document.getElementById('pf-units').value = 0;
    document.getElementById('img-preview').innerHTML = '<div class="img-preview-ph">Vista previa</div>';
    buildColors([]);
    buildSpecs([]);
  }

  document.getElementById('panel-overlay').classList.add('open');
  document.getElementById('side-panel').classList.add('open');
}

function closePanel() {
  document.getElementById('panel-overlay').classList.remove('open');
  document.getElementById('side-panel').classList.remove('open');
  editingId = null;
}

function previewImg() {
  const url = document.getElementById('pf-img').value.trim();
  const box = document.getElementById('img-preview');
  box.innerHTML = url
    ? `<img src="${url}" onerror="this.parentNode.innerHTML='<div class=img-preview-ph>URL inválida</div>'">`
    : '<div class="img-preview-ph">Vista previa</div>';
}

// Colors
function buildColors(colors) {
  document.getElementById('color-builder').innerHTML = colors.map((c, i) => colorRow(c.n, c.h, i)).join('');
}
function colorRow(name, hex, idx) {
  return `<div class="color-item" id="ci-${idx}">
    <div class="color-swatch" style="background:${hex || '#555'}" onclick="document.getElementById('cp-${idx}').click()"></div>
    <input type="color" id="cp-${idx}" value="${hex || '#555555'}" style="position:absolute;opacity:0;width:0;height:0" oninput="syncSwatch(${idx})">
    <input class="color-name-in" type="text" value="${name || ''}" placeholder="Nombre del color">
    <input class="color-hex-in" type="text" value="${hex || ''}" placeholder="#rrggbb" oninput="swatchFromText(this,${idx})">
    <button class="color-rm" onclick="removeColor(${idx})">✕</button>
  </div>`;
}
function addColor() {
  const el = document.getElementById('color-builder');
  const d = document.createElement('div');
  d.innerHTML = colorRow('', '#555555', el.children.length);
  el.appendChild(d.firstChild);
}
function removeColor(idx) { document.getElementById(`ci-${idx}`)?.remove(); }
function syncSwatch(idx) {
  const p = document.getElementById(`cp-${idx}`);
  const r = document.getElementById(`ci-${idx}`);
  if (!p || !r) return;
  r.querySelector('.color-swatch').style.background = p.value;
  r.querySelector('.color-hex-in').value = p.value;
}
function swatchFromText(input, idx) {
  const r = document.getElementById(`ci-${idx}`);
  if (r && /^#[0-9a-fA-F]{6}$/.test(input.value.trim()))
    r.querySelector('.color-swatch').style.background = input.value.trim();
}
function getColors() {
  return Array.from(document.getElementById('color-builder').children).map(item => ({
    n: item.querySelector('.color-name-in')?.value.trim() || '',
    h: item.querySelector('.color-hex-in')?.value.trim() || ''
  })).filter(c => c.n || c.h);
}

// Specs
function buildSpecs(specs) {
  document.getElementById('spec-builder').innerHTML = specs.map((s, i) => specRow(s.k, s.v, i)).join('');
}
function specRow(k, v, idx) {
  return `<div class="spec-item" id="si-${idx}">
    <input class="spec-k" type="text" value="${k || ''}" placeholder="Propiedad">
    <input class="spec-v" type="text" value="${v || ''}" placeholder="Valor">
    <button class="spec-rm" onclick="removeSpec(${idx})">✕</button>
  </div>`;
}
function addSpec() {
  const el = document.getElementById('spec-builder');
  const d = document.createElement('div');
  d.innerHTML = specRow('', '', el.children.length);
  el.appendChild(d.firstChild);
}
function removeSpec(idx) { document.getElementById(`si-${idx}`)?.remove(); }
function getSpecs() {
  return Array.from(document.getElementById('spec-builder').children).map(item => {
    const ins = item.querySelectorAll('input');
    return { k: ins[0]?.value.trim() || '', v: ins[1]?.value.trim() || '' };
  }).filter(s => s.k || s.v);
}

// Validate
function validate() {
  let ok = true;
  const checks = [
    { id: 'pf-name',  err: 'pfe-name',  test: v => v.trim().length > 0 },
    { id: 'pf-year',  err: 'pfe-year',  test: v => v >= 1990 && v <= 2030 },
    { id: 'pf-price', err: 'pfe-price', test: v => Number(v) > 0 },
    { id: 'pf-rent',  err: 'pfe-rent',  test: v => Number(v) > 0 },
    { id: 'pf-units', err: 'pfe-units', test: v => Number(v) >= 0 },
  ];
  checks.forEach(c => {
    const valid = c.test(document.getElementById(c.id).value);
    document.getElementById(c.err).classList.toggle('show', !valid);
    if (!valid) ok = false;
  });
  return ok;
}

function collectData() {
  return {
    name:        document.getElementById('pf-name').value.trim(),
    year:        Number(document.getElementById('pf-year').value) || 2024,
    price:       Number(document.getElementById('pf-price').value) || 0,
    rent:        Number(document.getElementById('pf-rent').value) || 0,
    units:       Number(document.getElementById('pf-units').value) || 0,
    description: document.getElementById('pf-desc').value.trim(),
    img:         document.getElementById('pf-img').value.trim(),
    colors:      getColors(),
    specs:       getSpecs(),
  };
}

// Publish flow
function requestPublish() {
  if (!validate()) return;
  pendingData = collectData();
  document.getElementById('publish-code-input').value = '';
  document.getElementById('publish-err').textContent = '';
  document.getElementById('modal-publish').classList.add('open');
  setTimeout(() => document.getElementById('publish-code-input').focus(), 100);
}
function closePublishModal() {
  document.getElementById('modal-publish').classList.remove('open');
  pendingData = null;
}
function submitPublish() {
  const code = document.getElementById('publish-code-input').value.trim();
  if (code !== PUBLISH_CODE) {
    document.getElementById('publish-err').textContent = 'Código incorrecto.';
    document.getElementById('publish-code-input').value = '';
    document.getElementById('publish-code-input').focus();
    return;
  }
  closePublishModal();
  saveCar(pendingData);
  pendingData = null;
}

function saveCar(data) {
  const cars = getCars();
  if (editingId !== null) {
    const idx = cars.findIndex(c => c.id === editingId);
    if (idx !== -1) { cars[idx] = { ...cars[idx], ...data }; saveCars(cars); showToast('Actualizado', `${data.name} guardado.`); }
  } else {
    const dup = cars.find(c => c.name.trim().toLowerCase() === data.name.trim().toLowerCase());
    if (dup) { showToast('Nombre duplicado', `Ya existe "${data.name}". Usa un nombre diferente.`); return; }
    const newId = cars.length ? Math.max(...cars.map(c => c.id)) + 1 : 1;
    cars.push({ id: newId, ...data });
    saveCars(cars);
    showToast('Publicado', `${data.name} ya es visible en el catálogo.`);
  }
  closePanel();
  renderStats();
  renderList();
}

// Delete
function openDelModal(id) {
  deleteTargetId = id;
  const c = getCars().find(x => x.id === id);
  document.getElementById('del-msg').textContent = `¿Eliminar "${c ? c.name : 'este vehículo'}"? Esta acción no se puede deshacer.`;
  document.getElementById('modal-del').classList.add('open');
}
function closeDelModal() { document.getElementById('modal-del').classList.remove('open'); deleteTargetId = null; }
function confirmDelete() {
  if (deleteTargetId === null) return;
  saveCars(getCars().filter(c => c.id !== deleteTargetId));
  closeDelModal();
  renderStats(); renderList();
  showToast('Eliminado', 'El vehículo fue removido del catálogo.');
}

// Toast
function showToast(title, msg) {
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent = msg;
  const el = document.getElementById('toast');
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3600);
}

document.getElementById('modal-del').addEventListener('click', e => { if (e.target === e.currentTarget) closeDelModal(); });
document.getElementById('modal-publish').addEventListener('click', e => { if (e.target === e.currentTarget) closePublishModal(); });
