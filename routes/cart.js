
    
   
    // ============================================
// 1. VARIABLES GLOBALES
// ============================================
const cartItems = document.getElementById("cart-items");
const totalText = document.getElementById("total");
const btnPagarContainer = document.getElementById("btn-pagar-container"); 
const sugerenciasContenedor = document.getElementById("productos-sugeridos");

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ============================================
// 2. ACTUALIZAR HEADER (FAVORITOS)
// ============================================
function actualizarHeader() {
    const favCount = document.getElementById("fav-count");
    let favsActual = JSON.parse(localStorage.getItem("favs")) || [];
    if (favCount) {
        favCount.textContent = favsActual.length;
        favCount.setAttribute("data-count", favsActual.length);
    }
}
// Función para el menú hamburguesa (agrega al final)
function toggleMenu() {
  const menu = document.getElementById('side-menu');
  if (menu) menu.classList.toggle('active');
}
// ============================================
// 3. CATÁLOGO DE SUGERENCIAS
// ============================================
const catalogoSugerencias = [
    { nombre: "Labial Glossy Rosa", precio: 120, img: "img/labial2.png" },
    { nombre: "Mascara de Pestañas", precio: 180, img: "img/rimel.png" },
    { nombre: "Set de Brochas Luxe", precio: 350, img: "img/brochas.png" },
    { nombre: "Delineador Pro Negro", precio: 95, img: "img/delineador.png" },
    { nombre: "Iluminador Sun", precio: 210, img: "img/iluminador.png" }
];

// ============================================
// 4. RENDERIZAR CARRITO
// ============================================
function renderCarrito() {
    cartItems.innerHTML = "";

    if (carrito.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <h2>Tu carrito está vacío </h2>
                <a href="index.html" style="color: #ff4d6d; font-weight:bold;">Ir de compras</a>
            </div>`;
        totalText.innerHTML = "Total: $0.00";
        const shippingBox = document.getElementById("shipping-message");
        if (shippingBox) shippingBox.innerHTML = "";
        if (btnPagarContainer) btnPagarContainer.style.display = "none";
        
        localStorage.removeItem("totalAPagar");
        cargarSugerencias(); 
        actualizarHeader();
        return;
    }

    if (btnPagarContainer) btnPagarContainer.style.display = "block";

    const btnVaciar = document.createElement("button");
    btnVaciar.innerText = "Vaciar carrito";
    btnVaciar.classList.add("btn-vaciar");
    btnVaciar.onclick = vaciarCarrito;
    cartItems.appendChild(btnVaciar);

    let subtotal = 0;

    carrito.forEach((producto, index) => {
        subtotal += Number(producto.precio) * Number(producto.cantidad);

        let card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <div style="display: flex; align-items: center; width: 100%; gap: 15px;">
            <img src="${producto.img}" style="width:60px; height:60px; object-fit:contain;">
            <div style="flex: 1;">
                <h3 style="margin:0; font-size:16px;">${producto.nombre}</h3>
                <p style="margin:2px 0; color:#ff4d6d; font-weight:bold;">$${producto.precio}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
            <button onclick="cambiarCantidad(${index}, -1)" style="width:30px; padding:2px; display: flex; align-items: center; justify-content: center;">
            <img src="/img/icono2.png" alt="Menos" style="width: 100%; height: auto;">
            </button>

            <b>${producto.cantidad}</b>

            <button onclick="cambiarCantidad(${index}, 1)" style="width:30px; padding:2px; display: flex; align-items: center; justify-content: center;">
            <img src="/img/icono1.png" alt="Más" style="width: 100%; height: auto;">
            </button>
            </div>
            <button onclick="eliminarProducto(${index})" style="background:none; color:red; border:none; width:auto; font-size:18px;">Eliminar</button>
          </div>
        `;
        cartItems.appendChild(card);
    });

    // LÓGICA DE ENVÍO
    const envioGratisMin = 500;
    const COSTO_ENVIO = 50; 
    const shippingBox = document.getElementById("shipping-message");
    
    let envio = (subtotal >= envioGratisMin) ? 0 : COSTO_ENVIO;
    let totalFinal = subtotal + envio;

    if (shippingBox) {
        if (subtotal >= envioGratisMin) {
            shippingBox.innerHTML = `¡Envío GRATIS! <div class="shipping-bar"><div class="shipping-progress" style="width:100%; background:#2ecc71;"></div></div>`;
        } else {
            let faltante = envioGratisMin - subtotal;
            let porcentaje = (subtotal / envioGratisMin) * 100;
            shippingBox.innerHTML = `
                Te faltan <b>$${faltante.toFixed(2)}</b> para envío gratis 
                <div class="shipping-bar"><div class="shipping-progress" style="width:${porcentaje}%"></div></div>`;
        }
    }

    // RENDERIZADO DEL TOTAL
    if (envio > 0) {
        totalText.innerHTML = `
            <div style="font-size: 14px; color: #666;">Subtotal: $${subtotal.toFixed(2)}</div>
            <div style="font-size: 14px; color: #666;">Envío: $${envio.toFixed(2)}</div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
            <div style="font-size: 20px; font-weight: bold; color: #ff4d6d;">Total: $${totalFinal.toFixed(2)}</div>
        `;
    } else {
        totalText.innerHTML = `
            <div style="font-size: 24px; font-weight: bold; color: #ff4d6d;">Total: $${totalFinal.toFixed(2)}</div>
            <small style="color: #2ecc71; font-weight: bold;"> Envío Gratis Aplicado</small>
        `;
    }

    localStorage.setItem("totalAPagar", JSON.stringify({
        subtotal: subtotal,
        envio: envio,
        total: totalFinal
    }));

    cargarSugerencias(); 
    actualizarHeader();
}

// ============================================
// 5. CARGAR SUGERENCIAS
// ============================================
function cargarSugerencias() {
    if (!sugerenciasContenedor) return;
    const sugerenciasFiltradas = catalogoSugerencias.filter(prod => 
        !carrito.some(item => item.nombre === prod.nombre)
    );
    
    const seleccionadas = sugerenciasFiltradas.sort(() => 0.5 - Math.random()).slice(0, 3);
    sugerenciasContenedor.innerHTML = "";

    seleccionadas.forEach(prod => {
        const div = document.createElement("div");
        div.className = "card";
        div.style = "display:flex; align-items:center; gap:10px; padding:10px; margin-bottom:10px; border:1px solid #fff0f3;";
        div.innerHTML = `
            <img src="${prod.img}" style="width:45px; height:45px; object-fit:contain;">
            <div style="flex:1;">
                <h4 style="font-size:12px; margin:0;">${prod.nombre}</h4>
                <p style="color:#ff4d6d; font-size:11px; margin:0;">$${prod.precio}</p>
            </div>
            <button onclick='agregarSugerencia(${JSON.stringify(prod)})' style="width:30px; cursor:pointer; background:#ff4d6d; color:white; border:none; border-radius:5px;">+</button>
        `;
        sugerenciasContenedor.appendChild(div);
    });
}

// ============================================
// 6. AGREGAR SUGERENCIA AL CARRITO
// ============================================
window.agregarSugerencia = function(prod) {
    prod.cantidad = 1;
    carrito.push(prod);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
}

// ============================================
// 7. CAMBIAR CANTIDAD
// ============================================
function cambiarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) carrito[index].cantidad = 1;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
}

// ============================================
// 8. ELIMINAR PRODUCTO
// ============================================
function eliminarProducto(index) {
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderCarrito();
}

// ============================================
// 9. VACIAR CARRITO (solo localStorage)
// ============================================
function vaciarCarrito() {
    if(confirm("¿Vaciar carrito?")) {
        carrito = [];
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderCarrito();
    }
}

// ============================================
// 10. INICIALIZAR
// ============================================
renderCarrito();
