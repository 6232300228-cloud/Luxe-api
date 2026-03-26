// login.js - VERSIÓN COMPLETA SIN VERIFICACIÓN DE CORREO
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const toRegister = document.getElementById("to-register");
const toLogin = document.getElementById("to-login");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");
const btnGoogle = document.getElementById("btnGoogle");

// VARIABLE DE CONFIGURACIÓN
const API_URL = 'https://luxe-api-frr5.onrender.com/api';

// FUNCIÓN PARA OBTENER EL PRIMER NOMBRE
function getPrimerNombre(nombreCompleto) {
    if (!nombreCompleto) return 'Usuario';
    return nombreCompleto.split(' ')[0];
}

// FUNCIÓN PARA MOSTRAR MENSAJES
function mostrarToast(mensaje, tipo = 'error') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: tipo,
            title: mensaje,
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    } else {
        alert(mensaje);
    }
}

// CAMBIO ENTRE FORMULARIOS
if (toRegister) {
    toRegister.addEventListener("click", () => {
        loginSection.classList.add("hidden");
        registerSection.classList.remove("hidden");
    });
}

if (toLogin) {
    toLogin.addEventListener("click", () => {
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
    });
}

// ============================================
// LOGIN
// ============================================
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        let correo = document.getElementById("login-correo").value;
        let contraseña = document.getElementById("login-pass").value;

        if (correo === "" || !correo.includes("@") || contraseña === "") {
            mostrarToast('Por favor, ingresa tu correo y contraseña correctamente', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, contraseña })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                const primerNombre = getPrimerNombre(data.user.nombre);

                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido ${primerNombre}!`,
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                    didClose: () => {
                        if (data.user.role === "admin" || data.user.role === "empleado") {
                            window.location.href = "dashboard.html";
                        } else {
                            window.location.href = "index.html";
                        }
                    }
                });
            } else {
                mostrarToast(data.error || "Error al iniciar sesión", 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarToast('No se pudo conectar con el servidor', 'error');
        }
    });
}

// ============================================
// REGISTRO - SIN VERIFICACIÓN DE CORREO
// ============================================
if (btnRegister) {
    btnRegister.addEventListener("click", async () => {
        // Obtener valores de los inputs
        const nombre = document.getElementById("reg-nombre").value.trim();
        const apellido = document.getElementById("reg-apellido").value.trim();
        const telefono = document.getElementById("reg-telefono").value.trim();
        const calle = document.getElementById("reg-calle").value.trim();
        const numero = document.getElementById("reg-numero").value.trim();
        const colonia = document.getElementById("reg-colonia").value.trim();
        const estado = document.getElementById("reg-estado").value.trim();
        const cp = document.getElementById("reg-cp").value.trim();
        const referencia = document.getElementById("reg-referencia").value.trim();
        const correo = document.getElementById("reg-correo").value.trim();
        const contraseña = document.getElementById("reg-pass").value;

        // ============================================
        // VALIDACIONES
        // ============================================
        
        if (nombre === "") {
            mostrarToast('Por favor ingresa tu nombre', 'error');
            document.getElementById("reg-nombre").focus();
            return;
        }
        
        if (apellido === "") {
            mostrarToast('Por favor ingresa tu apellido', 'error');
            document.getElementById("reg-apellido").focus();
            return;
        }
        
        if (telefono === "") {
            mostrarToast('Por favor ingresa tu teléfono', 'error');
            document.getElementById("reg-telefono").focus();
            return;
        }
        
        if (!/^\d{10}$/.test(telefono)) {
            mostrarToast('El teléfono debe tener exactamente 10 dígitos (solo números)', 'error');
            document.getElementById("reg-telefono").focus();
            return;
        }
        
        if (calle === "") {
            mostrarToast('Por favor ingresa tu calle', 'error');
            document.getElementById("reg-calle").focus();
            return;
        }
        
        if (numero === "") {
            mostrarToast('Por favor ingresa el número exterior', 'error');
            document.getElementById("reg-numero").focus();
            return;
        }
        
        if (colonia === "") {
            mostrarToast('Por favor ingresa tu colonia', 'error');
            document.getElementById("reg-colonia").focus();
            return;
        }
        
        if (estado === "") {
            mostrarToast('Por favor ingresa tu estado', 'error');
            document.getElementById("reg-estado").focus();
            return;
        }
        
        if (cp === "") {
            mostrarToast('Por favor ingresa tu código postal', 'error');
            document.getElementById("reg-cp").focus();
            return;
        }
        
        if (!/^\d{5}$/.test(cp)) {
            mostrarToast('El código postal debe tener exactamente 5 dígitos', 'error');
            document.getElementById("reg-cp").focus();
            return;
        }
        
        if (correo === "") {
            mostrarToast('Por favor ingresa tu correo electrónico', 'error');
            document.getElementById("reg-correo").focus();
            return;
        }
        
        if (!correo.includes("@") || !correo.includes(".")) {
            mostrarToast('Por favor ingresa un correo electrónico válido', 'error');
            document.getElementById("reg-correo").focus();
            return;
        }
        
        if (contraseña === "") {
            mostrarToast('Por favor ingresa una contraseña', 'error');
            document.getElementById("reg-pass").focus();
            return;
        }
        
        if (contraseña.length < 6) {
            mostrarToast('La contraseña debe tener al menos 6 caracteres', 'error');
            document.getElementById("reg-pass").focus();
            return;
        }

        // Deshabilitar botón mientras se procesa
        btnRegister.disabled = true;
        btnRegister.textContent = 'Registrando...';

        // ============================================
        // CONSTRUIR DATOS PARA ENVIAR
        // ============================================
        
        // Nombre completo
        const nombreCompleto = `${nombre} ${apellido}`.trim();
        
        // Dirección completa
        const direccionCompleta = `${calle} #${numero}, ${colonia}, ${estado}, C.P. ${cp}`;
        
        // Dirección detallada para guardar
        const direccionDetallada = {
            calle: calle,
            numero: numero,
            colonia: colonia,
            estado: estado,
            cp: cp,
            referencia: referencia || ''
        };

        console.log('📝 Datos a enviar:', {
            nombre: nombreCompleto,
            correo: correo,
            telefono: `+52${telefono}`,
            direccion: direccionCompleta
        });

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nombre: nombreCompleto, 
                    correo: correo, 
                    telefono: `+52${telefono}`,
                    direccion: direccionCompleta,
                    direccion_detallada: direccionDetallada,
                    contraseña: contraseña 
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token y usuario
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
                
                // Guardar dirección detallada también
                const userData = {
                    ...data.user,
                    direccion_detallada: direccionDetallada,
                    direccion: direccionCompleta
                };
                localStorage.setItem("user", JSON.stringify(userData));

                const primerNombre = getPrimerNombre(nombreCompleto);

                Swal.fire({
                    icon: 'success',
                    title: `¡Bienvenido ${primerNombre}!`,
                    text: 'Cuenta creada exitosamente',
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                    didClose: () => {
                        window.location.href = "index.html";
                    }
                });
            } else {
                mostrarToast(data.error || "Error al registrarse", 'error');
                btnRegister.disabled = false;
                btnRegister.textContent = 'Registrarme';
            }
        } catch (error) {
            console.error('Error en registro:', error);
            mostrarToast('No se pudo conectar con el servidor. Verifica tu conexión.', 'error');
            btnRegister.disabled = false;
            btnRegister.textContent = 'Registrarme';
        }
    });
}

// ============================================
// LOGIN CON GOOGLE
// ============================================
if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
        window.location.href = `${API_URL}/auth/google`;
    });
}

// ============================================
// LOGIN CON TOKEN DE GOOGLE
// ============================================
async function loginConToken(token) {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al obtener usuario');
        }

        const user = await response.json();

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const primerNombre = getPrimerNombre(user.nombre);

        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido ${primerNombre}!`,
            timer: 1500,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });

        if (user.role === "admin" || user.role === "empleado") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarToast('Error al iniciar sesión', 'error');
    }
}

// Procesar token de Google si viene en la URL
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        console.log('Token detectado en URL');
        loginConToken(token);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
})();

// Función para newsletter
function suscribirse() {
    const email = document.getElementById('newsletter-email').value;
    if (email && email.includes('@')) {
        mostrarToast('¡Gracias por suscribirte!', 'success');
        document.getElementById('newsletter-email').value = '';
    } else {
        mostrarToast('Por favor ingresa un email válido', 'error');
    }
}