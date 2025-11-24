import {
    collection,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (!user) {
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

const listaConciertos = document.getElementById("lista-conciertos");
const form = document.getElementById("formConcierto");

const inputArtista = document.getElementById("artista");
const inputFecha = document.getElementById("fecha");
const inputLugar = document.getElementById("lugar");
const inputLocalidades = document.getElementById("localidades");
const inputPrecio = document.getElementById("precio");
const inputImagen = document.getElementById("imagen");

let idEditando = null;

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

            let textoLocalidades = "";
            let textoPrecios = "";

            if (Array.isArray(c.Localidades)) {
                textoLocalidades = c.Localidades.join(", ");
            }

            if (Array.isArray(c.Precios)) {
                textoPrecios = c.Precios.join(", ");
            }

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
                <p>Localidades: ${textoLocalidades || "N/D"}</p>
                <p>Precios: ${textoPrecios || "N/D"}</p>
                <button 
                    class="btn-editar" 
                    data-id="${id}"
                    data-localidades="${textoLocalidades}"
                    data-precios="${textoPrecios}"
                >
                    Editar
                </button>
            `;

            listaConciertos.appendChild(card);
        });

        activarBotonesEditar();
    });
}

function activarBotonesEditar() {
    const botones = document.querySelectorAll(".btn-editar");

    botones.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".evento");
            const id = e.target.dataset.id;
            const localidades = e.target.dataset.localidades || "";
            const precios = e.target.dataset.precios || "";

            cargarConciertoDesdeTarjeta(id, card, localidades, precios);
        });
    });
}

function cargarConciertoDesdeTarjeta(id, card, localidades, precios) {
    idEditando = id;

    const nombre = card.querySelector("h3")?.textContent || "";
    const lugarTexto = card.querySelector("p:nth-of-type(1)")?.textContent || "";
    const imgSrc = card.querySelector("img")?.src || "";

    inputArtista.value = nombre;
    inputLugar.value = lugarTexto.replace("📍", "").trim();
    inputFecha.value = "";
    inputLocalidades.value = localidades;
    inputPrecio.value = precios;
    inputImagen.value = imgSrc;

    form.scrollIntoView({ behavior: "smooth" });
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!idEditando) {
            alert("Primero selecciona un concierto dando clic en el botón 'Editar'.");
            return;
        }

        const artista = inputArtista.value.trim();
        const lugar = inputLugar.value.trim();
        const fecha = inputFecha.value;
        const imagen = inputImagen.value.trim();
        const localidadesRaw = inputLocalidades.value.trim();
        const preciosRaw = inputPrecio.value.trim();

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

            if (localidadesRaw) {
                dataActualizada.Localidades = localidadesRaw
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
            }

            if (preciosRaw) {
                dataActualizada.Precios = preciosRaw
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
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