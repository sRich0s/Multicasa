// ============================================
// SISTEMA DE AUTENTICACIÓN
// ============================================

// Credenciales de prueba
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '1234'
};

// Manejar formulario de login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Guardar sesión en localStorage
        localStorage.setItem('adminSession', JSON.stringify({
            username: username,
            loginTime: new Date().getTime()
        }));
        
        // Redirigir al panel
        window.location.href = '/admin-panel';
    } else {
        errorMessage.textContent = 'Usuario o contraseña incorrectos';
        errorMessage.style.display = 'block';
        document.getElementById('password').value = '';
    }
});
