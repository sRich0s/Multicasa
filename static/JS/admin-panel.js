// ============================================
// VERIFICAR SESIÓN
// ============================================

const session = JSON.parse(localStorage.getItem('adminSession'));

if (!session) {
    window.location.href = '/admin-login';
} else {
    document.getElementById('adminUsername').textContent = session.username;
}

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('adminSession');
    window.location.href = '/admin-login';
});

// ============================================
// BASE DE DATOS LOCAL (localStorage)
// ============================================

class Database {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        if (!localStorage.getItem('viviendas')) {
            localStorage.setItem('viviendas', JSON.stringify([]));
        }
        if (!localStorage.getItem('noticias')) {
            localStorage.setItem('noticias', JSON.stringify([]));
        }
        if (!localStorage.getItem('contactos')) {
            localStorage.setItem('contactos', JSON.stringify([]));
        }
        if (!localStorage.getItem('transacciones')) {
            localStorage.setItem('transacciones', JSON.stringify([]));
        }
    }

    // VIVIENDAS
    addVivienda(data) {
        const viviendas = JSON.parse(localStorage.getItem('viviendas'));
        const newVivienda = {
            id: Date.now(),
            ...data,
            fechaCreacion: new Date().toLocaleDateString('es-ES')
        };
        viviendas.push(newVivienda);
        localStorage.setItem('viviendas', JSON.stringify(viviendas));
        return newVivienda;
    }

    getViviendas() {
        return JSON.parse(localStorage.getItem('viviendas'));
    }

    updateVivienda(id, data) {
        let viviendas = JSON.parse(localStorage.getItem('viviendas'));
        viviendas = viviendas.map(v => v.id === id ? { ...v, ...data } : v);
        localStorage.setItem('viviendas', JSON.stringify(viviendas));
    }

    // NOTICIAS
    addNoticia(data) {
        const noticias = JSON.parse(localStorage.getItem('noticias'));
        const newNoticia = {
            id: Date.now(),
            ...data,
            fecha: new Date().toLocaleDateString('es-ES')
        };
        noticias.push(newNoticia);
        localStorage.setItem('noticias', JSON.stringify(noticias));
        return newNoticia;
    }

    getNoticias() {
        return JSON.parse(localStorage.getItem('noticias'));
    }

    deleteNoticia(id) {
        let noticias = JSON.parse(localStorage.getItem('noticias'));
        noticias = noticias.filter(n => n.id !== id);
        localStorage.setItem('noticias', JSON.stringify(noticias));
    }

    // CONTACTOS
    addContacto(data) {
        const contactos = JSON.parse(localStorage.getItem('contactos'));
        const newContacto = {
            id: Date.now(),
            ...data,
            fecha: new Date().toLocaleDateString('es-ES')
        };
        contactos.push(newContacto);
        localStorage.setItem('contactos', JSON.stringify(contactos));
        return newContacto;
    }

    getContactos() {
        return JSON.parse(localStorage.getItem('contactos'));
    }

    deleteContacto(id) {
        let contactos = JSON.parse(localStorage.getItem('contactos'));
        contactos = contactos.filter(c => c.id !== id);
        localStorage.setItem('contactos', JSON.stringify(contactos));
    }

    // TRANSACCIONES
    addTransaccion(data) {
        const transacciones = JSON.parse(localStorage.getItem('transacciones'));
        const newTransaccion = {
            id: Date.now(),
            ...data,
            fecha: new Date().toLocaleDateString('es-ES')
        };
        transacciones.push(newTransaccion);
        localStorage.setItem('transacciones', JSON.stringify(transacciones));
        return newTransaccion;
    }

    getTransacciones() {
        return JSON.parse(localStorage.getItem('transacciones'));
    }
}

const db = new Database();

// ============================================
// NAVEGACIÓN DEL PANEL
// ============================================
// Eliminar duplicado y usar un único listener que también maneja el mapa
function handleSectionNavigation(section) {
    // Remover clase active de todos
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    // Activar sección
    document.querySelector(`.menu-link[data-section="${section}"]`)?.classList.add('active');
    document.getElementById(section)?.classList.add('active');
    // Actualizar datos según sección
    if (section === 'dashboard') {
        updateDashboard();
    } else if (section === 'viviendas') {
        ensureMap();
        renderViviendas();
    } else if (section === 'noticias') {
        renderNoticias();
    } else if (section === 'contactos') {
        renderContactos();
    } else if (section === 'transacciones') {
        renderTransacciones();
        updateTransaccionesSelect();
    }
}
// Limpiar listeners previos si existieran
document.querySelectorAll('.menu-link').forEach(link => {
    const clone = link.cloneNode(true);
    link.parentNode.replaceChild(clone, link);
});
// Registrar nuevo listener
document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const section = this.getAttribute('data-section');
        handleSectionNavigation(section);
    });
});
// Inicializar sección activa en carga
window.addEventListener('DOMContentLoaded', () => {
    // Verificar Leaflet cargado
    if (typeof L === 'undefined') {
        console.error('Leaflet no se cargó. Revisa la etiqueta <script> y la conexión a internet.');
        showMessage('Error cargando el mapa (Leaflet).', 'error');
    }
    const activeLink = document.querySelector('.menu-link.active');
    const initialSection = activeLink ? activeLink.getAttribute('data-section') : 'dashboard';
    handleSectionNavigation(initialSection);
});

// ============================================
// DASHBOARD
// ============================================

function updateDashboard() {
    const viviendas = db.getViviendas();
    const contactos = db.getContactos();
    
    const totalViviendas = viviendas.length;
    const totalCompra = viviendas.filter(v => v.tipo === 'compra').length;
    const totalVenta = viviendas.filter(v => v.tipo === 'venta').length;
    const totalContactos = contactos.length;
    
    document.getElementById('totalViviendas').textContent = totalViviendas;
    document.getElementById('totalCompra').textContent = totalCompra;
    document.getElementById('totalVenta').textContent = totalVenta;
    document.getElementById('totalContactos').textContent = totalContactos;
}

// ============================================
// GESTIÓN DE VIVIENDAS
// ============================================

document.getElementById('viviendasForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!document.getElementById('vivLat').value || !document.getElementById('vivLng').value) {
        showMessage('Selecciona una ubicación en el mapa', 'error');
        return;
    }
    const vivienda = {
        titulo: document.getElementById('vivTitulo').value,
        precio: document.getElementById('vivPrecio').value,
        lat: parseFloat(document.getElementById('vivLat').value),
        lng: parseFloat(document.getElementById('vivLng').value),
        habitaciones: document.getElementById('vivHabitaciones').value,
        banos: document.getElementById('vivBanos').value,
        area: document.getElementById('vivArea').value,
        tipo: document.getElementById('vivTipo').value,
        estado: document.getElementById('vivEstado').value,
        descripcion: document.getElementById('vivDescripcion').value
    };
    db.addVivienda(vivienda);
    this.reset();
    if (marker) { map.removeLayer(marker); marker = null; }
    renderViviendas();
    showMessage('Vivienda agregada exitosamente', 'success');
});

function renderViviendas() {
    const viviendas = db.getViviendas();
    const tbody = document.getElementById('viviendasBody');
    if (viviendas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay viviendas registradas</td></tr>';
        return;
    }
    tbody.innerHTML = viviendas.map(v => `
        <tr>
            <td>${v.id}</td>
            <td>${v.titulo}</td>
            <td>$${parseFloat(v.precio).toLocaleString()}</td>
            <td>${v.lat}, ${v.lng}</td>
            <td><span class="status-badge status-${v.tipo}">${v.tipo.toUpperCase()}</span></td>
            <td>${v.estado}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-secondary" onclick="editVivienda(${v.id})">Editar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteViviendaConfirm(${v.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteViviendaConfirm(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta vivienda?')) {
        db.deleteVivienda(id);
        renderViviendas();
        showMessage('Vivienda eliminada exitosamente', 'success');
    }
}

function editVivienda(id) {
    const viviendas = db.getViviendas();
    const vivienda = viviendas.find(v => v.id === id);
    if (vivienda) {
        document.getElementById('vivTitulo').value = vivienda.titulo;
        document.getElementById('vivPrecio').value = vivienda.precio;
        document.getElementById('vivLat').value = vivienda.lat;
        document.getElementById('vivLng').value = vivienda.lng;
        document.getElementById('vivHabitaciones').value = vivienda.habitaciones;
        document.getElementById('vivBanos').value = vivienda.banos;
        document.getElementById('vivArea').value = vivienda.area;
        document.getElementById('vivTipo').value = vivienda.tipo;
        document.getElementById('vivEstado').value = vivienda.estado;
        document.getElementById('vivDescripcion').value = vivienda.descripcion;
        ensureMap();
        if (map) {
            map.setView([vivienda.lat, vivienda.lng], 14);
            setMarker(vivienda.lat, vivienda.lng);
        }
        const form = document.getElementById('viviendasForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Actualizar Vivienda';
        form.dataset.editId = id;
        form.onsubmit = function(e) {
            e.preventDefault();
            if (!document.getElementById('vivLat').value || !document.getElementById('vivLng').value) {
                showMessage('Selecciona una ubicación en el mapa', 'error');
                return;
            }
            const vivienda = {
                titulo: document.getElementById('vivTitulo').value,
                precio: document.getElementById('vivPrecio').value,
                lat: parseFloat(document.getElementById('vivLat').value),
                lng: parseFloat(document.getElementById('vivLng').value),
                habitaciones: document.getElementById('vivHabitaciones').value,
                banos: document.getElementById('vivBanos').value,
                area: document.getElementById('vivArea').value,
                tipo: document.getElementById('vivTipo').value,
                estado: document.getElementById('vivEstado').value,
                descripcion: document.getElementById('vivDescripcion').value
            };
            db.updateVivienda(id, vivienda);
            form.reset();
            submitBtn.textContent = 'Agregar Vivienda';
            delete form.dataset.editId;
            form.onsubmit = null;
            if (marker) { map.removeLayer(marker); marker = null; }
            renderViviendas();
            showMessage('Vivienda actualizada exitosamente', 'success');
        };
        window.scrollTo(0, 0);
    }
}

// ============================================
// GESTIÓN DE NOTICIAS
// ============================================

document.getElementById('noticiasForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const noticia = {
        titulo: document.getElementById('notTitulo').value,
        contenido: document.getElementById('notContenido').value
    };
    
    db.addNoticia(noticia);
    this.reset();
    renderNoticias();
    showMessage('Noticia agregada exitosamente', 'success');
});

function renderNoticias() {
    const noticias = db.getNoticias();
    const tbody = document.getElementById('noticiasBody');
    
    if (noticias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay noticias registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = noticias.map(n => `
        <tr>
            <td>${n.id}</td>
            <td>${n.titulo}</td>
            <td>${n.contenido.substring(0, 50)}...</td>
            <td>${n.fecha}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-danger" onclick="deleteNoticiaConfirm(${n.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteNoticiaConfirm(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
        db.deleteNoticia(id);
        renderNoticias();
        showMessage('Noticia eliminada exitosamente', 'success');
    }
}

// ============================================
// GESTIÓN DE CONTACTOS
// ============================================

function renderContactos() {
    const contactos = db.getContactos();
    const tbody = document.getElementById('contactosBody');
    
    if (contactos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay contactos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = contactos.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.correo}</td>
            <td>${c.mensaje.substring(0, 50)}...</td>
            <td>${c.fecha}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-secondary" onclick="viewContacto(${c.id})">Ver</button>
                    <button class="btn btn-small btn-danger" onclick="deleteContactoConfirm(${c.id})">Eliminar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewContacto(id) {
    const contactos = db.getContactos();
    const contacto = contactos.find(c => c.id === id);
    
    if (contacto) {
        alert(`Nombre: ${contacto.nombre}\nCorreo: ${contacto.correo}\nMensaje: ${contacto.mensaje}\nFecha: ${contacto.fecha}`);
    }
}

function deleteContactoConfirm(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
        db.deleteContacto(id);
        renderContactos();
        showMessage('Contacto eliminado exitosamente', 'success');
    }
}

// ============================================
// GESTIÓN DE TRANSACCIONES
// ============================================

function updateTransaccionesSelect() {
    const viviendas = db.getViviendas();
    const select = document.getElementById('tranVivienda');
    select.innerHTML = '<option value="">Seleccionar...</option>' + 
        viviendas.map(v => `<option value="${v.id}">${v.titulo} - (${v.lat}, ${v.lng})</option>`).join('');
}

document.getElementById('transaccionesForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const viviendasId = parseInt(document.getElementById('tranVivienda').value);
    const nuevoTipo = document.getElementById('tranTipo').value;
    
    const viviendas = db.getViviendas();
    const vivienda = viviendas.find(v => v.id === viviendasId);
    
    if (vivienda) {
        const tipoAnterior = vivienda.tipo;
        
        // Actualizar vivienda
        db.updateVivienda(viviendasId, { tipo: nuevoTipo });
        
        // Registrar transacción
        db.addTransaccion({
            viviendasId: viviendasId,
            viviendasTitulo: vivienda.titulo,
            tipoAnterior: tipoAnterior,
            tipoNuevo: nuevoTipo
        });
        
        this.reset();
        renderTransacciones();
        updateTransaccionesSelect();
        showMessage('Transacción registrada exitosamente', 'success');
    }
});

function renderTransacciones() {
    const transacciones = db.getTransacciones();
    const tbody = document.getElementById('transaccionesBody');
    
    if (transacciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay transacciones registradas</td></tr>';
        return;
    }
    
    tbody.innerHTML = transacciones.map(t => `
        <tr>
            <td>${t.id}</td>
            <td>${t.viviendasTitulo}</td>
            <td><span class="status-badge status-${t.tipoAnterior}">${t.tipoAnterior.toUpperCase()}</span></td>
            <td><span class="status-badge status-${t.tipoNuevo}">${t.tipoNuevo.toUpperCase()}</span></td>
            <td>${t.fecha}</td>
        </tr>
    `).join('');
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function showMessage(message, type = 'info') {
    const messageBox = document.createElement('div');
    messageBox.className = `message-box ${type}`;
    messageBox.textContent = message;
    
    const mainContent = document.querySelector('.admin-main');
    mainContent.insertBefore(messageBox, mainContent.firstChild);
    
    setTimeout(() => {
        messageBox.remove();
    }, 3000);
}

// ============================================
// MAPA LEAFLET PARA SELECCIONAR COORDENADAS
// ============================================
let map, marker;
function initMap() {
    const mapDiv = document.getElementById('mapSelector');
    if (!mapDiv) return; // Solo si existe
    map = L.map('mapSelector').setView([25.7617, -80.1918], 10); // Vista inicial
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        setMarker(lat, lng);
    });
}
function ensureMap() {
    const mapDiv = document.getElementById('mapSelector');
    if (!mapDiv) return;
    if (!map) {
        initMap();
    }
    // Forzar recalculo de tamaño después de que la sección se muestra
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
}
function setMarker(lat, lng) {
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on('dragend', function(e) {
            const pos = e.target.getLatLng();
            document.getElementById('vivLat').value = pos.lat.toFixed(6);
            document.getElementById('vivLng').value = pos.lng.toFixed(6);
        });
    }
    document.getElementById('vivLat').value = lat.toFixed(6);
    document.getElementById('vivLng').value = lng.toFixed(6);
}

// QUITAR llamada inicial para evitar crear mapa oculto
// initMap();

// Actualizar listener de navegación (ya existente) para llamar ensureMap cuando sección viviendas
document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remover clase active de todos
        document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        
        // Agregar clase active al clickeado
        this.classList.add('active');
        const section = this.getAttribute('data-section');
        document.getElementById(section).classList.add('active');
        
        // Actualizar datos según la sección
        if (section === 'dashboard') {
            updateDashboard();
        } else if (section === 'viviendas') {
            ensureMap();
            renderViviendas();
        } else if (section === 'noticias') {
            renderNoticias();
        } else if (section === 'contactos') {
            renderContactos();
        } else if (section === 'transacciones') {
            renderTransacciones();
            updateTransaccionesSelect();
        }
    });
});

// Inicializar dashboard al cargar
updateDashboard();
