import { db, auth } from "./firebase-config.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
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

const id = localStorage.getItem("conciertoEditarId");
if (!id) {
  alert("No se seleccionó ningún concierto para editar.");
  window.location.href = "empleado.html";
}

const form = document.getElementById("formEditar");
const inputArtista = document.getElementById("artista");
const inputFecha = document.getElementById("fecha");
const inputLugar = document.getElementById("lugar");
const inputLocalidades = document.getElementById("localidades");
const inputPrecios = document.getElementById("precios");
const inputImagen = document.getElementById("imagen");
const btnVolver = document.getElementById("btnVolver");

(async () => {
  try {
    const ref = doc(db, "Conciertos", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("El concierto ya no existe.");
      window.location.href = "empleado.html";
      return;
    }

    const c = snap.data();

    inputArtista.value = c.Artista || "";
    inputLugar.value = c.Lugar || "";
    inputImagen.value = c.Imagen || "";

    let fechaStr = "";
    if (c.Fecha?.seconds) {
      const d = new Date(c.Fecha.seconds * 1000);
      fechaStr = d.toISOString().slice(0, 10);
    } else if (c.Fecha) {
      fechaStr = new Date(c.Fecha).toISOString().slice(0, 10);
    }
    inputFecha.value = fechaStr;

    if (Array.isArray(c.Localidades)) {
      inputLocalidades.value = c.Localidades.join(", ");
    }
    if (Array.isArray(c.Precios)) {
      inputPrecios.value = c.Precios.join(", ");
    }
  } catch (err) {
    console.error(err);
    alert("Error al cargar el concierto.");
    window.location.href = "empleado.html";
  }
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const artista = inputArtista.value.trim();
  const lugar = inputLugar.value.trim();
  const fecha = inputFecha.value;
  const imagen = inputImagen.value.trim();
  const locs = inputLocalidades.value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const precios = inputPrecios.value
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));

  if (!artista || !lugar || !fecha) {
    alert("Artista, lugar y fecha son obligatorios.");
    return;
  }

  if (locs.length !== precios.length) {
    alert("Debe haber la misma cantidad de localidades y precios.");
    return;
  }

  try {
    await updateDoc(doc(db, "Conciertos", id), {
      Artista: artista,
      Lugar: lugar,
      Fecha: fecha,
      Localidades: locs,
      Precios: precios,
      Imagen: imagen
    });

    alert("Concierto actualizado correctamente.");
    window.location.href = "empleado.html";
  } catch (err) {
    console.error(err);
    alert("Error al actualizar el concierto.");
  }
});

btnVolver.addEventListener("click", () => {
  window.location.href = "empleado.html";
});