import { auth } from './firebase-config.js';
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
  console.log("Página de reset password cargada");
  
  const resetForm = document.getElementById("resetPasswordForm");
  
  if (!resetForm) {
    console.error("❌ No se encontró el formulario");
    return;
  }

  function showMessage(message, type) {
    const container = document.getElementById("reset-messages");
    if (container) {
      container.className = `auth-messages ${type}`;
      container.textContent = message;
      container.style.display = 'block';
      
      setTimeout(() => {
        container.style.display = 'none';
      }, 5000);
    }
  }

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("resetEmail").value.trim();
    const button = document.getElementById("resetButton");
    const originalText = button.innerHTML;

    if (!email) {
      showMessage("Por favor ingresa tu email.", "error");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Por favor ingresa un email válido.", "error");
      return;
    }

    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Enviando...';

    try {
      await sendPasswordResetEmail(auth, email);
      
      showMessage(
        "Se ha enviado un enlace de recuperación a tu correo electrónico. Revisa tu bandeja de entrada.", 
        "success"
      );
      
      // Limpiar el formulario
      document.getElementById("resetEmail").value = "";
      
      // Redirigir después de 4 segundos
      setTimeout(() => {
        window.location.href = "index.html";
      }, 4000);

    } catch (error) {
      console.error("❌ Error al enviar email de recuperación:", error);
      
      let errorMessage = "Ocurrió un error al enviar el enlace. Intenta nuevamente.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No existe una cuenta con este correo electrónico.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico es inválido.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos. Por favor espera un momento e intenta nuevamente.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión. Verifica tu internet e intenta nuevamente.";
          break;
      }
      
      showMessage(errorMessage, "error");
      
    } finally {
      button.disabled = false;
      button.classList.remove('loading');
      button.innerHTML = originalText;
    }
  });
});