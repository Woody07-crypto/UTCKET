import {
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  
  const auth = window.auth;
  
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../login.html";
    }
  });
  
  const btnLogout = document.getElementById("logoutBtn");
  
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "../login.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    });
  }  