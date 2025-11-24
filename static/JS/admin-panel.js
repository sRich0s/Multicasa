// ============================================
// PANEL ADMIN - REINICIALIZACIÓN ORDEN CORRECTO
// ============================================
(function(){
  // ================= Helpers =================
  function g(id){ return document.getElementById(id); }
  function showMessage(message, type='info'){ const box=document.createElement('div'); box.className=`message-box ${type}`; box.textContent=message; const main=document.querySelector('.admin-main'); main.insertBefore(box, main.firstChild); setTimeout(()=>box.remove(),3000); }

  // ================ API =======================
  const api = {
    viviendas:{ list:()=>fetch('/api/viviendas').then(r=>r.json()), create:d=>fetch('/api/viviendas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()), update:(id,d)=>fetch(`/api/viviendas/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()), delete:id=>fetch(`/api/viviendas/${id}`,{method:'DELETE'}).then(r=>r.json())},
    noticias:{ list:()=>fetch('/api/noticias').then(r=>r.json()), create:d=>fetch('/api/noticias',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()), delete:id=>fetch(`/api/noticias/${id}`,{method:'DELETE'}).then(r=>r.json())},
    contactos:{ list:()=>fetch('/api/contactos').then(r=>r.json()), create:d=>fetch('/api/contactos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()), delete:id=>fetch(`/api/contactos/${id}`,{method:'DELETE'}).then(r=>r.json())},
    transacciones:{ list:()=>fetch('/api/transacciones').then(r=>r.json()), create:d=>fetch('/api/transacciones',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json())}
  };

  // ================ Variables DOM =============
  let vivTitulo,vivPrecio,vivLat,vivLng,vivHabitaciones,vivBanos,vivArea,vivTipo,vivEstado,vivDescripcion,tranVivienda,tranTipo,notTitulo,notContenido;

  // ================ Mapa ======================
  let map, marker;
  function initMap(){ const div=g('mapSelector'); if(!div) return; map=L.map('mapSelector').setView([25.7617,-80.1918],10); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(map); map.on('click', e=>{ const {lat,lng}=e.latlng; setMarker(lat,lng); }); }
  function ensureMap(){ const div=g('mapSelector'); if(!div) return; if(!map){ initMap(); } setTimeout(()=>{ if(map) map.invalidateSize(); },100); }
  function setMarker(lat,lng){ if(!map) return; if(marker){ marker.setLatLng([lat,lng]); } else { marker=L.marker([lat,lng],{draggable:true}).addTo(map); marker.on('dragend', e=>{ const p=e.target.getLatLng(); vivLat.value=p.lat.toFixed(6); vivLng.value=p.lng.toFixed(6); }); } vivLat.value=lat.toFixed(6); vivLng.value=lng.toFixed(6); }

  // ================ Render Funcs ==============
  async function renderViviendas(){ const viviendas=await api.viviendas.list(); const tbody=g('viviendasBody'); if(!tbody) return; if(!viviendas.length){ tbody.innerHTML='<tr><td colspan="7" class="empty-state">No hay viviendas registradas</td></tr>'; return;} tbody.innerHTML=viviendas.map(v=>`<tr><td>${v.id}</td><td>${v.titulo}</td><td>$${parseFloat(v.precio).toLocaleString()}</td><td>${v.lat}, ${v.lng}</td><td><span class="status-badge status-${v.tipo}">${v.tipo.toUpperCase()}</span></td><td>${v.estado}</td><td><div class="action-buttons"><button class="btn btn-small btn-secondary" data-edit="${v.id}">Editar</button><button class="btn btn-small btn-danger" data-del="${v.id}">Eliminar</button></div></td></tr>`).join(''); }
  async function renderNoticias(){ const noticias=await api.noticias.list(); const tbody=g('noticiasBody'); if(!tbody) return; if(!noticias.length){ tbody.innerHTML='<tr><td colspan="5" class="empty-state">No hay noticias registradas</td></tr>'; return;} tbody.innerHTML=noticias.map(n=>`<tr><td>${n.id}</td><td>${n.titulo}</td><td>${n.contenido.substring(0,50)}...</td><td>${n.fecha}</td><td><div class="action-buttons"><button class="btn btn-small btn-danger" data-del-noticia="${n.id}">Eliminar</button></div></td></tr>`).join(''); }
  async function renderContactos(){ const contactos=await api.contactos.list(); const tbody=g('contactosBody'); if(!tbody) return; if(!contactos.length){ tbody.innerHTML='<tr><td colspan="6" class="empty-state">No hay contactos registrados</td></tr>'; return;} tbody.innerHTML=contactos.map(c=>`<tr><td>${c.id}</td><td>${c.nombre}</td><td>${c.correo}</td><td>${c.mensaje.substring(0,50)}...</td><td>${c.fecha}</td><td><div class="action-buttons"><button class="btn btn-small btn-secondary" data-view-contacto="${c.id}">Ver</button><button class="btn btn-small btn-danger" data-del-contacto="${c.id}">Eliminar</button></div></td></tr>`).join(''); }
  async function renderTransacciones(){ const trans=await api.transacciones.list(); const tbody=g('transaccionesBody'); if(!tbody) return; if(!trans.length){ tbody.innerHTML='<tr><td colspan="5" class="empty-state">No hay transacciones registradas</td></tr>'; return;} tbody.innerHTML=trans.map(t=>`<tr><td>${t.id}</td><td>${t.viviendasTitulo}</td><td><span class="status-badge status-${t.tipoAnterior}">${t.tipoAnterior.toUpperCase()}</span></td><td><span class="status-badge status-${t.tipoNuevo}">${t.tipoNuevo.toUpperCase()}</span></td><td>${t.fecha}</td></tr>`).join(''); }
  async function updateTransaccionesSelect(){ const viviendas=await api.viviendas.list(); if(!tranVivienda) return; tranVivienda.innerHTML='<option value="">Seleccionar...</option>'+viviendas.map(v=>`<option value="${v.id}">${v.titulo} - (${v.lat}, ${v.lng})</option>`).join(''); }
  async function updateDashboard(){ const [viviendas, contactos]=await Promise.all([api.viviendas.list(), api.contactos.list()]); g('totalViviendas').textContent=viviendas.length; g('totalCompra').textContent=viviendas.filter(v=>v.tipo==='compra').length; g('totalVenta').textContent=viviendas.filter(v=>v.tipo==='venta').length; g('totalContactos').textContent=contactos.length; renderEstadoChart(viviendas); }

  // ========= Gráfica de pastel estados =========
  let estadoChartInstance;
  function renderEstadoChart(viviendas){ const canvas=g('estadoChart'); if(!canvas) return; const estadosCount = viviendas.reduce((acc,v)=>{ acc[v.estado]=(acc[v.estado]||0)+1; return acc; },{}); const labels=Object.keys(estadosCount); const data=Object.values(estadosCount); if(estadoChartInstance){ estadoChartInstance.destroy(); } estadoChartInstance=new Chart(canvas, { type:'pie', data:{ labels, datasets:[{ data, backgroundColor: labels.map(l=>({disponible:'#00ccff',vendida:'#ff6600',alquilada:'#00aa00'}[l]||'#003366')), borderColor:'#fff', borderWidth:2 }] }, options:{ plugins:{ legend:{ position:'bottom' } } } }); }

  // ================ Handlers ==================
  async function handleEditVivienda(id){ const viviendas=await api.viviendas.list(); const v=viviendas.find(x=>x.id===id); if(!v) return; vivTitulo.value=v.titulo; vivPrecio.value=v.precio; vivLat.value=v.lat; vivLng.value=v.lng; vivHabitaciones.value=v.habitaciones; vivBanos.value=v.banos; vivArea.value=v.area; vivTipo.value=v.tipo; vivEstado.value=v.estado; vivDescripcion.value=v.descripcion; ensureMap(); map&&setMarker(v.lat,v.lng); const form=g('viviendasForm'); const btn=form.querySelector('button[type="submit"]'); btn.textContent='Actualizar Vivienda'; form.dataset.editId=id; form.onsubmit=async e=>{ e.preventDefault(); const upd={ titulo:vivTitulo.value, precio:parseFloat(vivPrecio.value), lat:parseFloat(vivLat.value), lng:parseFloat(vivLng.value), habitaciones:parseInt(vivHabitaciones.value), banos:parseInt(vivBanos.value), area:parseInt(vivArea.value), tipo:vivTipo.value, estado:vivEstado.value, descripcion:vivDescripcion.value }; await api.viviendas.update(id, upd); form.reset(); btn.textContent='Agregar Vivienda'; form.dataset.editId=''; form.onsubmit=viviendasCreateHandler; marker&&map.removeLayer(marker); marker=null; renderViviendas(); updateDashboard(); showMessage('Vivienda actualizada','success'); }; window.scrollTo(0,0); }
  async function viviendasCreateHandler(e){ e.preventDefault(); if(!vivLat.value||!vivLng.value){showMessage('Selecciona ubicación','error'); return;} const vivienda={ titulo:vivTitulo.value, precio:parseFloat(vivPrecio.value), lat:parseFloat(vivLat.value), lng:parseFloat(vivLng.value), habitaciones:parseInt(vivHabitaciones.value), banos:parseInt(vivBanos.value), area:parseInt(vivArea.value), tipo:vivTipo.value, estado:vivEstado.value, descripcion:vivDescripcion.value }; await api.viviendas.create(vivienda); e.target.reset(); marker&&map.removeLayer(marker); marker=null; renderViviendas(); updateDashboard(); showMessage('Vivienda agregada','success'); }
  async function noticiasCreateHandler(e){ e.preventDefault(); const noticia={ titulo:notTitulo.value, contenido:notContenido.value }; await api.noticias.create(noticia); e.target.reset(); renderNoticias(); showMessage('Noticia agregada','success'); }
  async function transaccionesCreateHandler(e){ e.preventDefault(); const id=parseInt(tranVivienda.value); const tipoNuevo=tranTipo.value; if(!id||!tipoNuevo){ showMessage('Selecciona vivienda y tipo','error'); return;} await api.transacciones.create({ viviendasId:id, tipoNuevo }); e.target.reset(); renderTransacciones(); updateTransaccionesSelect(); renderViviendas(); updateDashboard(); showMessage('Transacción registrada','success'); }

  // Delegación de eventos para botones dinámicos
  document.addEventListener('click', async e=>{
    if(e.target.matches('[data-edit]')){ handleEditVivienda(parseInt(e.target.dataset.edit)); }
    else if(e.target.matches('[data-del]')){ if(confirm('¿Eliminar vivienda?')){ await api.viviendas.delete(parseInt(e.target.dataset.del)); renderViviendas(); updateDashboard(); showMessage('Vivienda eliminada','success'); } }
    else if(e.target.matches('[data-del-noticia]')){ if(confirm('¿Eliminar noticia?')){ await api.noticias.delete(parseInt(e.target.dataset.delNoticia)); renderNoticias(); showMessage('Noticia eliminada','success'); } }
    else if(e.target.matches('[data-view-contacto]')){ const contactos=await api.contactos.list(); const c=contactos.find(x=>x.id===parseInt(e.target.dataset.viewContacto)); if(c){ alert(`Nombre: ${c.nombre}\nCorreo: ${c.correo}\nMensaje: ${c.mensaje}\nFecha: ${c.fecha}`); } }
    else if(e.target.matches('[data-del-contacto]')){ if(confirm('¿Eliminar contacto?')){ await api.contactos.delete(parseInt(e.target.dataset.delContacto)); renderContactos(); updateDashboard(); showMessage('Contacto eliminado','success'); } }
  });

  // ================ Navegación =================
  function handleSectionNavigation(section){ document.querySelectorAll('.menu-link').forEach(l=>l.classList.remove('active')); document.querySelectorAll('.content-section').forEach(s=>s.classList.remove('active')); const link=document.querySelector(`.menu-link[data-section="${section}"]`); const sec=document.getElementById(section); link&&link.classList.add('active'); sec&&sec.classList.add('active'); if(section==='dashboard') updateDashboard(); else if(section==='viviendas'){ ensureMap(); renderViviendas(); } else if(section==='noticias') renderNoticias(); else if(section==='contactos') renderContactos(); else if(section==='transacciones'){ renderTransacciones(); updateTransaccionesSelect(); } }

  // ================ Sesión =====================
  function checkSession(){ const session=JSON.parse(localStorage.getItem('adminSession')); if(!session){ window.location.href='/admin-login'; return false; } g('adminUsername').textContent=session.username; return true; }

  // ================ Inicialización =============
  window.addEventListener('DOMContentLoaded', ()=>{
    if(!checkSession()) return;
    // Obtener refs
    vivTitulo=g('vivTitulo'); vivPrecio=g('vivPrecio'); vivLat=g('vivLat'); vivLng=g('vivLng'); vivHabitaciones=g('vivHabitaciones'); vivBanos=g('vivBanos'); vivArea=g('vivArea'); vivTipo=g('vivTipo'); vivEstado=g('vivEstado'); vivDescripcion=g('vivDescripcion'); tranVivienda=g('tranVivienda'); tranTipo=g('tranTipo'); notTitulo=g('notTitulo'); notContenido=g('notContenido');
    // Formularios
    const vivForm=g('viviendasForm'); if(vivForm){ vivForm.addEventListener('submit', viviendasCreateHandler); }
    const notForm=g('noticiasForm'); if(notForm){ notForm.addEventListener('submit', noticiasCreateHandler); }
    const tranForm=g('transaccionesForm'); if(tranForm){ tranForm.addEventListener('submit', transaccionesCreateHandler); }
    // Navegación
    document.querySelectorAll('.menu-link').forEach(a=>{ a.addEventListener('click', e=>{ e.preventDefault(); handleSectionNavigation(a.dataset.section); }); });
    // Logout
    const logout=g('logoutBtn'); logout&&logout.addEventListener('click', e=>{ e.preventDefault(); localStorage.removeItem('adminSession'); window.location.href='/admin-login'; });
    // Sección inicial
    handleSectionNavigation(document.querySelector('.menu-link.active')?.dataset.section || 'dashboard');
  });
})();
// ============================================ END FILE ============================================
