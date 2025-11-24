import { db, auth } from "./firebase-config.js";
import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

const listaConciertos = document.getElementById("lista-conciertos");
const btnAgregar = document.getElementById("btnAgregarConcierto");
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      alert("Ocurrió un error al cerrar sesión.");
    }
  });
}

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");
const overlay = document.getElementById("menuOverlay");

if (menuToggle && menu && overlay) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("open");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    menu.classList.remove("open");
    overlay.classList.remove("active");
  });
}

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
      const imagen =
        c.Imagen || c.imagen || c.imagenUrl || "img/concierto_fondo.jpeg";

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

function activarBotonesEditar() {
  const botones = document.querySelectorAll(".btn-editar");
  botones.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (!id) return;

      localStorage.setItem("conciertoEditarId", id);

      window.location.href = "empleado-editar.html";
    });
  });
}

if (btnAgregar) {
  btnAgregar.addEventListener("click", () => {
    localStorage.removeItem("conciertoEditarId");
    window.location.href = "empleado-agregar.html";
  });
}
