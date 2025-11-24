import {
    doc,
    getDoc,
    updateDoc
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

const params = new URLSearchParams(window.location.search);
const conciertoId = params.get("id");

if (!conciertoId) {
    alert("No se recibió el concierto a editar.");
    window.location.href = "empleado.html";
}

const form = document.getElementById("formConcierto");
const inputArtista = document.getElementById("artista");
const inputFecha = document.getElementById("fecha");
const inputLugar = document.getElementById("lugar");
const inputLocalidades = document.getElementById("localidades");
const inputPrecio = document.getElementById("precio");
const inputImagen = document.getElementById("imagen");
const btnCancelar = document.getElementById("btnCancelar");

(async () => {
    try {
        const ref = doc(db, "Conciertos", conciertoId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            alert("El concierto no existe.");
            window.location.href = "empleado.html";
            return;
        }

        const c = snap.data();

        inputArtista.value = c.Artista || c.artista || "";
        inputLugar.value = c.Lugar || c.lugar || "";
        inputImagen.value = c.Imagen || c.imagen || "";

        const fecha = c.Fecha || c.fecha;
        if (fecha) {
            const d = fecha.seconds
                ? new Date(fecha.seconds * 1000)
                : new Date(fecha);
            inputFecha.value = d.toISOString().slice(0, 10);
        }

        if (Array.isArray(c.Localidades)) {
            inputLocalidades.value = c.Localidades.join(", ");
        }

        if (Array.isArray(c.Precios)) {
            inputPrecio.value = c.Precios.join(", ");
        }
    } catch (err) {
        console.error(err);
        alert("Error al cargar el concierto.");
    }
})();

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const artista = inputArtista.value.trim();
    const lugar = inputLugar.value.trim();
    const fecha = inputFecha.value;
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
        await updateDoc(doc(db, "Conciertos", conciertoId), data);
        alert("Concierto actualizado correctamente ✅");
        window.location.href = "empleado.html";
    } catch (err) {
        console.error(err);
        alert("Error al actualizar el concierto.");
    }
});

btnCancelar.addEventListener("click", () => {
    window.location.href = "empleado.html";
});
