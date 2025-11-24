import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc
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

const form = document.getElementById("formAgregar");
const inputArtista = document.getElementById("artista");
const inputFecha = document.getElementById("fecha");
const inputLugar = document.getElementById("lugar");
const inputLocalidades = document.getElementById("localidades");
const inputPrecios = document.getElementById("precios");
const inputImagen = document.getElementById("imagen");
const btnVolver = document.getElementById("btnVolver");

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

  if (locs.length === 0 || precios.length === 0) {
    alert("Ingresa al menos una localidad y un precio.");
    return;
  }

  if (locs.length !== precios.length) {
    alert("Debe haber la misma cantidad de localidades y precios.");
    return;
  }

  try {
    await addDoc(collection(db, "Conciertos"), {
      Artista: artista,
      Lugar: lugar,
      Fecha: fecha,
      Localidades: locs,
      Precios: precios,
      Imagen: imagen
    });

    alert("Concierto agregado correctamente.");
    window.location.href = "empleado.html";
  } catch (err) {
    console.error(err);
    alert("Error al agregar concierto.");
  }
});

btnVolver.addEventListener("click", () => {
  window.location.href = "empleado.html";
});