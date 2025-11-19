// =========================
//   LECTURA DE URL
// =========================
function getParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        localidad: urlParams.get("localidad") || "",
        precio: parseFloat(urlParams.get("precio")) || 0,
        cantidad: parseInt(urlParams.get("cantidad")) || 1,
    };
}

const data = getParams();

// =========================
//   ELEMENTOS DEL DOM
// =========================
const totalAmount = document.querySelector(".total-amount");
const cantidadInput = document.querySelector("input[type='number']");

// Si la cantidad viene desde la URL, ponerla en el input
if (data.cantidad) cantidadInput.value = data.cantidad;

// =========================
//   CALCULAR TOTAL
// =========================
function calcularTotal() {
    const cantidad = parseInt(cantidadInput.value) || 1;
    const subtotal = data.precio * cantidad;
    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    totalAmount.textContent = `$${total.toFixed(2)}`;
}

calcularTotal();

// Recalcular cuando el usuario cambia la cantidad
cantidadInput.addEventListener("input", calcularTotal);

// =========================
//   VALIDAR FORMULARIO
// =========================
const botonPagar = document.querySelector("button");

botonPagar.addEventListener("click", function (e) {
    e.preventDefault();

    const inputs = document.querySelectorAll("input");
    for (let input of inputs) {
        if (input.value.trim() === "") {
            alert("Por favor complete todos los campos antes de continuar.");
            return;
        }
    }

    alert("Compra realizada con éxito. ¡Gracias por su compra!");
});

// =========================
//   MENÚ HAMBURGUESA
// =========================
const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");
const overlay = document.getElementById("menuOverlay");

menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
    menu.classList.remove("active");
    overlay.classList.remove("active");
});
