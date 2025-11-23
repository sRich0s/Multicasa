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
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const tipo = document.getElementById('tipo').value;
            const ciudad = document.getElementById('ciudad').value;
            const precio = document.getElementById('precio').value;
            const habitaciones = document.getElementById('habitaciones').value;

            if (tipo && ciudad && precio && habitaciones) {
                alert(`Búsqueda realizada:\nTipo: ${tipo}\nCiudad: ${ciudad}\nPrecio: ${precio}\nHabitaciones: ${habitaciones}`);
            } else {
                alert('Por favor completa todos los campos');
            }
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
});


setInterval(function() {
    const connected = Math.floor(Math.random() * 50) + 1;
    document.getElementById('connected').textContent = String(connected).padStart(2, '0');
}, 30000);
