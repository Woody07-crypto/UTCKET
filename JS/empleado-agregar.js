import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = window.auth;
const db = window.db;

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

const form = document.getElementById("formConcierto");
const inputArtista = document.getElementById("artista");
const inputFecha = document.getElementById("fecha");
const inputLugar = document.getElementById("lugar");
const inputLocalidades = document.getElementById("localidades");
const inputPrecio = document.getElementById("precio");
const inputImagen = document.getElementById("imagen");
const btnCancelar = document.getElementById("btnCancelar");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const artista = inputArtista.value.trim();
    const fecha = inputFecha.value;
    const lugar = inputLugar.value.trim();
    const imagen = inputImagen.value.trim();
    const localidades = inputLocalidades.value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
    const precios = inputPrecio.value
        .split(",")
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n));

    if (!artista || !lugar || !fecha) {
        alert("Artista, lugar y fecha son obligatorios.");
        return;
    }

    const data = {
        Artista: artista,
        Lugar: lugar,
        Fecha: fecha,
        Localidades: localidades,
        Precios: precios
    };

    if (imagen) data.Imagen = imagen;

    try {
        await addDoc(collection(db, "Conciertos"), data);
        alert("Concierto agregado correctamente ✅");
        window.location.href = "empleado.html";
    } catch (err) {
        console.error(err);
        alert("Error al agregar concierto.");
    }
});

btnCancelar.addEventListener("click", () => {
    window.location.href = "empleado.html";
});