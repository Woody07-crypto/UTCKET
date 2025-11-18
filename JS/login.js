import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaIVIY5kRZNMeq50f5XZacJFKUPHx22yM",
  authDomain: "utcket.firebaseapp.com",
  projectId: "utcket",
  storageBucket: "utcket.firebasestorage.app",
  messagingSenderId: "340782027820",
  appId: "1:340782027820:web:6df648a16bec7a30c92d89",
  measurementId: "G-7FTLD4BRV0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.querySelector("#form_container form");
const selectTipo = document.getElementById("tipo_de_usuario");
const inputUsername = document.getElementById("username");
const inputPassword = document.getElementById("password");
const btnIngresar = document.getElementById("button");

const errorBox = document.createElement("p");
errorBox.style.color = "red";
errorBox.style.marginTop = "10px";
errorBox.style.textAlign = "center";
form.appendChild(errorBox);

async function loginAdministrador(username, passwordNumber) {
  const colRef = collection(db, "Administradores");

  const q = query(
    colRef,
    where("Nombre", "==", username),
    where("Contrasena", "==", passwordNumber)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function loginEmpleado(username, passwordNumber) {
  const colRef = collection(db, "Empleado");

  let q;

  if (/^\d+$/.test(username)) {
    q = query(
      colRef,
      where("Carnet", "==", Number(username)),
      where("Contrasena", "==", passwordNumber)
    );
  } else {
    q = query(
      colRef,
      where("Nombre", "==", username),
      where("Contrasena", "==", passwordNumber)
    );
  }

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

async function loginCliente(username, passwordNumber) {
  const colRef = collection(db, "Cliente");

  const q = query(
    colRef,
    where("Nombre", "==", username),
    where("Contrasena", "==", passwordNumber)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";

  const tipo = selectTipo.value;
  const username = inputUsername.value.trim();
  const password = inputPassword.value.trim();

  if (tipo === "Seleccionar" || !tipo) {
    errorBox.textContent = "Por favor, selecciona el tipo de usuario.";
    return;
  }

  if (!username || !password) {
    errorBox.textContent = "Ingresa usuario y contraseña.";
    return;
  }

  const passwordNumber = Number(password);
  if (Number.isNaN(passwordNumber)) {
    errorBox.textContent = "La contraseña debe ser numérica (por ejemplo 1234).";
    return;
  }

  btnIngresar.disabled = true;
  btnIngresar.textContent = "Ingresando...";

  try {
    let esValido = false;

    if (tipo === "Administrador") {
      esValido = await loginAdministrador(username, passwordNumber);
      if (esValido) {
        window.location.href = "admin.html";
        return;
      }
    } else if (tipo === "Empleado") {
      esValido = await loginEmpleado(username, passwordNumber);
      if (esValido) {
        window.location.href = "empleado.html";
        return;
      }
    } else if (tipo === "Cliente") {
      esValido = await loginCliente(username, passwordNumber);
      if (esValido) {
        window.location.href = "index.html";
        return;
      }
    }

    errorBox.textContent = "Usuario o contraseña incorrectos.";

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    errorBox.textContent = "Ocurrió un error al iniciar sesión.";
  } finally {
    btnIngresar.disabled = false;
    btnIngresar.textContent = "Ingresar";
  }
});