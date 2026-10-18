
const inventario = [
    { id: 1, nombre: "Paracetamol 500mg", precio: 1.50, stock: 100, fechaVenc: "2028-12-31", requiereReceta: false },
    { id: 2, nombre: "Ibuprofeno 400mg", precio: 2.20, stock: 80, fechaVenc: "2027-08-15", requiereReceta: false },
    { id: 3, nombre: "Amoxicilina 500mg (Antibiótico)", precio: 12.50, stock: 50, fechaVenc: "2028-01-20", requiereReceta: true },
    { id: 4, nombre: "Aspirina Infantil (Vencida)", precio: 0.90, stock: 30, fechaVenc: "2025-01-10", requiereReceta: false },
    { id: 5, nombre: "Omeprazol 20mg", precio: 4.80, stock: 45, fechaVenc: "2027-11-30", requiereReceta: false },
    { id: 6, nombre: "Clonazepam 2mg (Controlado)", precio: 18.00, stock: 20, fechaVenc: "2028-05-15", requiereReceta: true }
];

let carrito = [];

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    mostrarCatalogo(inventario);
});

// Función para renderizar la tabla del catálogo de medicamentos
function mostrarCatalogo(items) {
    const tbody = document.getElementById("tablaMedicamentos");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    // Fecha actual en formato YYYY-MM-DD para validar vencimiento
    const hoy = new Date();
    const fechaHoyStr = hoy.toISOString().split("T")[0];

    items.forEach(item => {
        const estaVencido = item.fechaVenc < fechaHoyStr;
        const sinStock = item.stock <= 0;

        let estadoBadge = "";
        if (estaVencido) {
            estadoBadge = `<span class="badge badge-red">Vencido</span>`;
        } else if (sinStock) {
            estadoBadge = `<span class="badge badge-red">Agotado</span>`;
        } else {
            estadoBadge = `<span class="badge badge-green">Disponible</span>`;
        }

        if (item.requiereReceta && !estaVencido) {
            estadoBadge += ` <span class="badge badge-orange">Receta Obligatoria</span>`;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.id}</td>
            <td><strong>${item.nombre}</strong></td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>${item.stock}</td>
            <td>${estadoBadge}</td>
            <td>
                <button class="btn btn-primary btn-sm" 
                        onclick="agregarAlCarrito(${item.id})"
                        ${estaVencido || sinStock ? "disabled style='opacity:0.5; cursor:not-allowed;'" : ""}>
                    + Agregar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Filtrar medicamentos dinámicamente mediante el campo de búsqueda
function filtrarMedicamentos() {
    const input = document.getElementById("inputBuscar");
    if (!input) return;
    
    const texto = input.value.toLowerCase().trim();
    const filtrados = inventario.filter(m => m.nombre.toLowerCase().includes(texto));
    mostrarCatalogo(filtrados);
}

// Agregar medicamento al carrito
function agregarAlCarrito(id) {
    ocultarAlerta();
    const producto = inventario.find(p => p.id === id);
    if (!producto) return;

    // Verificar si el medicamento está vencido
    const hoy = new Date().toISOString().split("T")[0];
    if (producto.fechaVenc < hoy) {
        mostrarAlerta("Bloqueo Sanitario: No se puede agregar un medicamento vencido.", "error");
        return;
    }

    const itemEnCarrito = carrito.find(c => c.id === id);

    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad + 1 > producto.stock) {
            mostrarAlerta(`Stock insuficiente. Solo quedan ${producto.stock} unidades de ${producto.nombre}.`, "error");
            return;
        }
        itemEnCarrito.cantidad++;
        itemEnCarrito.subtotal = itemEnCarrito.cantidad * itemEnCarrito.precio;
    } else {
        if (producto.stock < 1) {
            mostrarAlerta("Producto agotado.", "error");
            return;
        }
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            subtotal: producto.precio,
            requiereReceta: producto.requiereReceta
        });
    }

    actualizarCarritoUI();
}

// Actualizar la interfaz del carrito y los totales
function actualizarCarritoUI() {
    const tbody = document.getElementById("tablaCarrito");
    const totalElem = document.getElementById("totalPagar");
    const seccionReceta = document.getElementById("seccionReceta");

    if (!tbody || !totalElem) return;

    tbody.innerHTML = "";

    if (carrito.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">El carrito está vacío.</td></tr>`;
        totalElem.innerText = "\$0.00";
        if (seccionReceta) seccionReceta.classList.add("hidden");
        return;
    }

    let total = 0;
    let requiereRecetaGeneral = false;

    carrito.forEach((item, index) => {
        total += item.subtotal;
        if (item.requiereReceta) requiereRecetaGeneral = true;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.subtotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="quitarDelCarrito(${index})">✕</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    totalElem.innerText = `$${total.toFixed(2)}`;

    // Mostrar u ocultar sección de receta según los productos agregados
    if (seccionReceta) {
        if (requiereRecetaGeneral) {
            seccionReceta.classList.remove("hidden");
        } else {
            seccionReceta.classList.add("hidden");
        }
    }
}

// Eliminar un elemento del carrito por su índice
function quitarDelCarrito(index) {
    ocultarAlerta();
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

// Procesar la venta simulando la transacción de la base de datos
function procesarVenta() {
    ocultarAlerta();

    if (carrito.length === 0) {
        mostrarAlerta("El carrito está vacío. Agregue medicamentos antes de procesar.", "error");
        return;
    }

    // Comprobar si requiere receta
    const requiereReceta = carrito.some(item => item.requiereReceta);

    if (requiereReceta) {
        const medico = document.getElementById("medicoNombre") ? document.getElementById("medicoNombre").value.trim() : "";
        const cedula = document.getElementById("medicoCedula") ? document.getElementById("medicoCedula").value.trim() : "";
        const paciente = document.getElementById("pacienteNombre") ? document.getElementById("pacienteNombre").value.trim() : "";

        if (!medico || !cedula || !paciente) {
            mostrarAlerta("Bloqueo Regulatorio: Debe ingresar el Nombre del Médico, la Cédula y el Paciente para dispensar medicamentos controlados.", "error");
            return;
        }
    }

    // Descontar stock del inventario simulando el Trigger de MySQL (trg_actualizar_stock)
    carrito.forEach(item => {
        const prod = inventario.find(p => p.id === item.id);
        if (prod) {
            prod.stock -= item.cantidad;
        }
    });

    // Mensaje de éxito
    mostrarAlerta("¡Venta procesada exitosamente! Se ha registrado la transacción y actualizado el inventario en MySQL.", "exito");

    // Limpiar carrito y campos de receta
    carrito = [];
    if (document.getElementById("medicoNombre")) document.getElementById("medicoNombre").value = "";
    if (document.getElementById("medicoCedula")) document.getElementById("medicoCedula").value = "";
    if (document.getElementById("pacienteNombre")) document.getElementById("pacienteNombre").value = "";

    actualizarCarritoUI();
    mostrarCatalogo(inventario);
}

// Mostrar mensajes de alerta en la interfaz
function mostrarAlerta(mensaje, tipo) {
    const alertBox = document.getElementById("alertBox");
    if (!alertBox) return;

    alertBox.className = `alert ${tipo === "error" ? "alert-error" : "alert-exito"}`;
    alertBox.innerText = mensaje;
    alertBox.classList.remove("hidden");
}

// Ocultar mensajes de alerta
function ocultarAlerta() {
    const alertBox = document.getElementById("alertBox");
    if (alertBox) {
        alertBox.classList.add("hidden");
    }
}