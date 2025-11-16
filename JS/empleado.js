// ================================
// IMPORTS DE FIREBASE
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// VERIFICAR SI HAY SESIÓN ACTIVA
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Si no hay sesión, enviarlo al login
        window.location.href = "login.html";
    } else {
        console.log("Empleado autenticado:", user.email);

        // mostrar el nombre en pantalla:
        const userName = document.getElementById("userName");
        if (userName) {
            userName.textContent = user.displayName || user.email;
        }
    }
});



// BOTÓN DE SALIR
const btnLogout = document.getElementById("btnLogout");

if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                console.log("Sesión cerrada");
                window.location.href = "login.html";
            })
            .catch(err => console.error("Error al cerrar sesión", err));
    });
}
