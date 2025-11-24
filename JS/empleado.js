// JS/empleado.js

// Firestore (misma versión que usan en add.js / edit.js)
import {
    collection,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Traemos auth y db desde el firebase-config.js compartido
import { auth, db } from "./firebase-config.js";

// ================== AUTENTICACIÓN ==================
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // IMPORTANTE: sin ../ para no salir de /UTCKET
        window.location.href = "login.html";
    }
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    });
}

// ================== REFERENCIAS DOM ==================
const listaConciertos = document.getElementById("lista-conciertos");
const form = document.getElementById("formConcierto");

const inputArtista = document.getElementById("artista");
const inputFecha = document.getElementById("fecha");
const inputLugar = document.getElementById("lugar");
const inputLocalidades = document.getElementById("localidades");
const inputPrecio = document.getElementById("precio");
const inputImagen = document.getElementById("imagen");

let idEditando = null;

// ================== FORMATOS DE FECHA ==================
function formatearFechaMostrar(fecha) {
    if (!fecha) return "Sin fecha";

    try {
        let d;

        if (fecha.seconds) {
            d = new Date(fecha.seconds * 1000);
        } else {
            d = new Date(fecha);
        }

        return d.toLocaleDateString("es-SV", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    } catch {
        return fecha.toString();
    }
}

// ================== ESCUCHAR CAMBIOS EN CONCIERTOS ==================
if (listaConciertos) {
    onSnapshot(collection(db, "Conciertos"), (snapshot) => {
        listaConciertos.innerHTML = "";

        snapshot.forEach((documento) => {
            const c = documento.data();
            const id = documento.id;

            const artista = c.Artista || c.artista || "Sin artista";
            const lugar = c.Lugar || c.lugar || "Sin lugar";
            const fecha = c.Fecha || c.fecha;
            const fechaTexto = formatearFechaMostrar(fecha);

            const imagen =
                c.Imagen ||
                c.imagen ||
                c.imagenUrl ||
                "img/concierto_fondo.jpeg";

            const card = document.createElement("div");
            card.classList.add("evento");

            card.innerHTML = `
                <img src="${imagen}" alt="${artista}">
                <h3>${artista}</h3>
                <p>📍 ${lugar}</p>
                <p>Fecha: ${fechaTexto}</p>
                <button class="btn-editar" data-id="${id}">Editar</button>
            `;

            listaConciertos.appendChild(card);
        });

        activarBotonesEditar();
    });
}

// ================== BOTONES EDITAR ==================
function activarBotonesEditar() {
    const botones = document.querySelectorAll(".btn-editar");

    botones.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".evento");
            const id = e.target.dataset.id;

            cargarConciertoDesdeTarjeta(id, card);
        });
    });
}

function cargarConciertoDesdeTarjeta(id, card) {
    idEditando = id;

    const nombre = card.querySelector("h3")?.textContent || "";
    const lugarTexto = card.querySelector("p:nth-of-type(1)")?.textContent || "";
    const imgSrc = card.querySelector("img")?.src || "";

    inputArtista.value = nombre;
    inputLugar.value = lugarTexto.replace("📍", "").trim();
    inputFecha.value = "";
    inputLocalidades.value = "";
    inputPrecio.value = "";
    inputImagen.value = imgSrc;

    form.scrollIntoView({ behavior: "smooth" });
}

// ================== ENVÍO DEL FORMULARIO ==================
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!idEditando) {
            alert("Primero selecciona un concierto dando clic en el botón 'Editar'.");
            return;
        }

        const artista = inputArtista.value.trim();
        const lugar = inputLugar.value.trim();
        const fecha = inputFecha.value; // YYYY-MM-DD
        const imagen = inputImagen.value.trim();

        if (!artista || !lugar) {
            alert("Por favor completa al menos Artista y Lugar.");
            return;
        }

        try {
            const docRef = doc(db, "Conciertos", idEditando);

            const dataActualizada = {
                Artista: artista,
                Lugar: lugar
            };

            if (fecha) {
                dataActualizada.Fecha = fecha;
            }

            if (imagen) {
                dataActualizada.Imagen = imagen;
            }

            await updateDoc(docRef, dataActualizada);

            alert("Concierto actualizado correctamente ✅");

            idEditando = null;
            form.reset();
        } catch (error) {
            console.error("Error al actualizar concierto:", error);
            alert("Ocurrió un error al actualizar el concierto.");
        }
    });
}
