import {
    collection,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
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
        window.location.href = "../login.html";
    }
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "../login.html";
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
const btnCancelar = document.getElementById("btnCancelar");

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

onSnapshot(collection(db, "Conciertos"), (snapshot) => {
    if (!listaConciertos) return;

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

function activarBotonesEditar() {
    const botones = document.querySelectorAll(".btn-editar");

    botones.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;
            await cargarConciertoDesdeFirestore(id);
        });
    });
}

async function cargarConciertoDesdeFirestore(id) {
    try {
        const ref = doc(db, "Conciertos", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            alert("No se encontró el concierto en la base de datos.");
            return;
        }

        const c = snap.data();

        idEditando = id;

        inputArtista.value = c.Artista || "";
        inputLugar.value = c.Lugar || "";
        inputFecha.value = c.Fecha
            ? new Date(c.Fecha).toISOString().slice(0, 10)
            : "";

        if (Array.isArray(c.Localidades)) {
            inputLocalidades.value = c.Localidades.join(", ");
        } else {
            inputLocalidades.value = "";
        }

        if (Array.isArray(c.Precios)) {
            inputPrecio.value = c.Precios.join(", ");
        } else {
            inputPrecio.value = "";
        }

        inputImagen.value = c.Imagen || "";

        form.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
        console.error("Error al cargar concierto:", err);
        alert("Error al cargar el concierto.");
    }
}

if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
        idEditando = null;   
        form.reset();
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const artista = inputArtista.value.trim();
    const lugar = inputLugar.value.trim();
    const fecha = inputFecha.value;
    const imagen = inputImagen.value.trim();
    const localidadesTexto = inputLocalidades.value.trim();
    const preciosTexto = inputPrecio.value.trim();

    if (!artista || !lugar || !fecha) {
        alert("Por favor completa al menos Artista, Fecha y Lugar.");
        return;
    }

    const localidades = localidadesTexto
        ? localidadesTexto.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const precios = preciosTexto
        ? preciosTexto.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const data = {
        Artista: artista,
        Lugar: lugar,
        Fecha: fecha,  
    };

    if (localidades.length) data.Localidades = localidades;
    if (precios.length) data.Precios = precios;
    if (imagen) data.Imagen = imagen;

    try {
        if (idEditando) {
            const ref = doc(db, "Conciertos", idEditando);
            await updateDoc(ref, data);
            alert("Concierto actualizado correctamente ✅");
        } else {
            await addDoc(collection(db, "Conciertos"), data);
            alert("Concierto agregado correctamente ✅");
        }

        idEditando = null;
        form.reset();
    } catch (error) {
        console.error("Error al guardar concierto:", error);
        alert("Ocurrió un error al guardar el concierto.");
    }
});