document.addEventListener('DOMContentLoaded', function() {
    let visits = localStorage.getItem('visits');
    if (!visits) {
        visits = 7890;
    } else {
        visits = parseInt(visits) + 1;
    }
    localStorage.setItem('visits', visits);
    document.getElementById('visits').textContent = String(visits).padStart(5, '0');

    const connected = Math.floor(Math.random() * 50) + 1;
    document.getElementById('connected').textContent = String(connected).padStart(2, '0');

    // Manejar formulario de búsqueda
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            // Redirigir a página de mapa con parámetros (estado, precios, etc.)
            const params = new URLSearchParams({
                estado: document.getElementById('fEstado')?.value || '',
                minPrecio: document.getElementById('fMinPrecio')?.value || '',
                maxPrecio: document.getElementById('fMaxPrecio')?.value || '',
                habitaciones: document.getElementById('fHabitaciones')?.value || '',
                banos: document.getElementById('fBanos')?.value || '',
                area: document.getElementById('fArea')?.value || ''
            });
            window.location.href = '/mapa-viviendas?' + params.toString();
        });
    }

    // Agregar efectos hover a los enlaces
    const navLinks = document.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });

    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                const id = href.slice(1);
                const target = document.getElementById(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nombre = document.getElementById('contactName').value.trim();
            const correo = document.getElementById('contactEmail').value.trim();
            const mensaje = document.getElementById('contactMessage').value.trim();
            if (!nombre || !correo || !mensaje) {
                alert('Completa todos los campos');
                return;
            }
            try {
                const resp = await fetch('/api/contactos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, correo, mensaje })
                });
                if (!resp.ok) throw new Error('Error en el servidor');
                const data = await resp.json();
                alert('Contacto enviado. ID: ' + data.id);
                contactForm.reset();
            } catch (err) {
                alert('No se pudo enviar el contacto: ' + err.message);
            }
        });
    }
});


setInterval(function() {
    const connected = Math.floor(Math.random() * 50) + 1;
    document.getElementById('connected').textContent = String(connected).padStart(2, '0');
}, 30000);
