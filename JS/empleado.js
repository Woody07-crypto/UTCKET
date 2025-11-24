import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();

const listaConciertos = document.getElementById("lista-conciertos");
const btnAgregarConcierto = document.getElementById("btnAgregarConcierto");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "login.html";
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error(error);
        }
    });
}

if (btnAgregarConcierto) {
    btnAgregarConcierto.addEventListener("click", () => {
        window.location.href = "empleado_agregar.html";
    });
}

function formatearFecha(fecha) {
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
    onSnapshot(collection(db, "Conciertos"), snapshot => {
        listaConciertos.innerHTML = "";
        snapshot.forEach(docSnap => {
            const c = docSnap.data();
            const id = docSnap.id;

            const artista = c.Artista || c.artista || "Sin artista";
            const lugar = c.Lugar || c.lugar || "Sin lugar";
            const fecha = c.Fecha || c.fecha;
            const fechaTexto = formatearFecha(fecha);
            const imagen = c.Imagen || c.imagen || c.imagenUrl || "img/concierto_fondo.jpeg";

            const card = document.createElement("div");
            card.className = "evento";
            card.innerHTML = `
                <img src="${imagen}" alt="${artista}">
                <h3>${artista}</h3>
                <p>📍 ${lugar}</p>
                <p>Fecha: ${fechaTexto}</p>
                <button class="btn-editar" data-id="${id}">Editar</button>
            `;
            listaConciertos.appendChild(card);
        });

        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.addEventListener("click", e => {
                const id = e.currentTarget.dataset.id;
                window.location.href = "empleado_editar.html?id=" + encodeURIComponent(id);
            });
        });
    });
}