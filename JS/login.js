// Importar Firebase desde el archivo de configuración
import { auth, db } from './firebase-config.js';  // <-- NOTA: Con guion

// Importar solo las funciones de Auth y Firestore que necesitas
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ DOM cargado, inicializando UI...");
  initializeAuthUI();
});

function initializeAuthUI() {
  // Elementos del DOM
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const resetPasswordForm = document.getElementById("resetPasswordForm");
  const showRegisterLink = document.getElementById("showRegister");
  const forgotPasswordLink = document.getElementById("forgotPassword");
  const backToLoginBtn = document.getElementById("backToLogin");
  const backToLoginFromResetBtn = document.getElementById("backToLoginFromReset");

  // Verificar que los elementos existan
  if (!loginForm || !registerForm || !resetPasswordForm) {
    console.error("❌ No se encontraron los formularios en el DOM");
    return;
  }

  console.log("✅ Formularios encontrados");

  // Mostrar mensajes
  function showMessage(message, type, containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div class="message ${type}">${message}</div>`;
      setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
    }
  }

  // Cambiar entre formularios
  function showLoginForm() {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    resetPasswordForm.style.display = 'none';
  }

  function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    resetPasswordForm.style.display = 'none';
  }

  function showResetPasswordForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    resetPasswordForm.style.display = 'block';
  }

  // Event Listeners para cambiar entre formularios
  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRegisterForm();
    });
  }

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      showResetPasswordForm();
    });
  }

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginForm();
    });
  }

  if (backToLoginFromResetBtn) {
    backToLoginFromResetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginForm();
    });
  }

  // Función para determinar el tipo de usuario
  async function determineUserType(email) {
    try {
      console.log("🔍 Buscando tipo de usuario para:", email);
      const emailLower = email.toLowerCase();
      
      // 1. Buscar en Administradores (usa "Correo" con mayúscula)
      // Obtener TODOS los documentos y buscar manualmente
      const adminSnapshot = await getDocs(collection(db, "Administradores"));
      console.log("📊 Total documentos en Administradores:", adminSnapshot.size);
      
      for (const docSnap of adminSnapshot.docs) {
        const data = docSnap.data();
        console.log("📧 Comparando con:", data.Correo);
        
        if (data.Correo && data.Correo.toLowerCase() === emailLower) {
          console.log("✅ Usuario es Administrador - Match encontrado!");
          return "Administrador";
        }
      }

      // 2. Buscar en Empleado
      const empleadoSnapshot = await getDocs(collection(db, "Empleado"));
      console.log("📊 Total documentos en Empleado:", empleadoSnapshot.size);
      
      for (const docSnap of empleadoSnapshot.docs) {
        const data = docSnap.data();
        if (data.email && data.email.toLowerCase() === emailLower) {
          console.log("✅ Usuario es Empleado");
          return "Empleado";
        }
      }

      // 3. Buscar en Cliente (si existe esa colección)
      try {
        const clienteSnapshot = await getDocs(collection(db, "Cliente"));
        console.log("📊 Total documentos en Cliente:", clienteSnapshot.size);
        
        for (const docSnap of clienteSnapshot.docs) {
          const data = docSnap.data();
          if (data.email && data.email.toLowerCase() === emailLower) {
            console.log("✅ Usuario es Cliente");
            return "Cliente";
          }
        }
      } catch (e) {
        console.log("⚠️ Colección Cliente no existe");
      }

      // 4. Por defecto, es Cliente
      console.log("⚠️ No se encontró en ninguna colección, asignando Cliente por defecto");
      return "Cliente";

    } catch (error) {
      console.error("❌ Error determinando tipo de usuario:", error);
      return "Cliente"; // Por defecto
    }
  }

  // Función para verificar credenciales en Firestore
  async function verifyCredentialsInFirestore(email, password) {
    try {
      console.log("🔍 Verificando credenciales en Firestore para:", email);
      
      // Buscar en Administradores
      const adminQuery = query(
        collection(db, "Administradores"),
        where("Correo", "==", email),
        where("Contraseña", "==", Number(password))
      );
      const adminSnapshot = await getDocs(adminQuery);
      if (!adminSnapshot.empty) {
        console.log("✅ Credenciales válidas en Administradores");
        return { 
          type: "Administrador", 
          data: adminSnapshot.docs[0].data(),
          docId: adminSnapshot.docs[0].id 
        };
      }

      // Buscar en Empleado
      const empleadoQuery = query(
        collection(db, "Empleado"),
        where("email", "==", email),
        where("Contraseña", "==", Number(password))
      );
      const empleadoSnapshot = await getDocs(empleadoQuery);
      if (!empleadoSnapshot.empty) {
        console.log("✅ Credenciales válidas en Empleado");
        return { 
          type: "Empleado", 
          data: empleadoSnapshot.docs[0].data(),
          docId: empleadoSnapshot.docs[0].id
        };
      }

      console.log("❌ No se encontraron credenciales válidas");
      return null;

    } catch (error) {
      console.error("❌ Error verificando credenciales en Firestore:", error);
      return null;
    }
  }

  // Función para redirigir según el tipo de usuario
  function redirectBasedOnUserType(userType) {
    console.log("🔄 Redirigiendo usuario tipo:", userType);
    switch(userType) {
      case "Administrador":
        console.log("➡️ Redirigiendo a admin.html");
        window.location.href = "admin.html";
        break;
      case "Empleado":
        console.log("➡️ Redirigiendo a empleado.html");
        window.location.href = "empleado.html";
        break;
      case "Cliente":
      default:
        console.log("➡️ Redirigiendo a home.html");
        window.location.href = "home.html";
    }
  }

  // Manejar errores de autenticación
  function handleAuthError(error, containerId = "auth-messages") {
    let message = "Ha ocurrido un error. Intenta nuevamente.";
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'El formato del email es inválido.';
        break;
      case 'auth/user-disabled':
        message = 'Esta cuenta ha sido deshabilitada.';
        break;
      case 'auth/user-not-found':
        message = 'No existe una cuenta con este email.';
        break;
      case 'auth/wrong-password':
        message = 'La contraseña es incorrecta.';
        break;
      case 'auth/invalid-credential':
        message = 'Credenciales inválidas.';
        break;
      case 'auth/email-already-in-use':
        message = 'Ya existe una cuenta con este email.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres.';
        break;
      case 'auth/network-request-failed':
        message = 'Error de conexión. Verifica tu internet.';
        break;
      default:
        if (error.message === "Credenciales inválidas") {
          message = "Email o contraseña incorrectos.";
        }
    }
    
    showMessage(message, "error", containerId);
  }

  // LOGIN
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const button = document.getElementById("button");

    console.log("📧 Intentando login con:", email);

    if (!email || !password) {
      showMessage("Ingresa email y contraseña.", "error", "auth-messages");
      return;
    }

    button.disabled = true;
    button.textContent = "Ingresando...";

    try {
      let userCredential;
      let userType;
      
      try {
        console.log("🔐 Intentando con Firebase Auth...");
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("✅ Usuario autenticado con Firebase Auth:", user.email);

        // Determinar tipo de usuario
        userType = await determineUserType(email);
        console.log("👤 Tipo de usuario detectado:", userType);
        
        showMessage(`¡Bienvenido!`, "success", "auth-messages");
        
        setTimeout(() => {
          redirectBasedOnUserType(userType);
        }, 1000);

      } catch (authError) {
        console.log("⚠️ Error de Firebase Auth:", authError.code);
        
        // Si falla Firebase Auth, buscar en Firestore
        if (authError.code === 'auth/user-not-found' || 
            authError.code === 'auth/wrong-password' ||
            authError.code === 'auth/invalid-credential') {
          
          console.log("🔍 Intentando autenticación con Firestore...");
          const firestoreCredentials = await verifyCredentialsInFirestore(email, password);
          
          if (firestoreCredentials) {
            console.log("✅ Credenciales válidas en Firestore:", firestoreCredentials.type);
            
            // Migrar usuario a Firebase Auth
            try {
              console.log("📦 Migrando usuario a Firebase Auth...");
              userCredential = await createUserWithEmailAndPassword(auth, email, password);
              const user = userCredential.user;
              
              await updateProfile(user, {
                displayName: firestoreCredentials.data.Nombre || email.split('@')[0]
              });

              await setDoc(doc(db, "Users", user.uid), {
                name: firestoreCredentials.data.Nombre || email.split('@')[0],
                email: email,
                userType: firestoreCredentials.type,
                migratedFrom: firestoreCredentials.type,
                createdAt: new Date(),
                isActive: true
              });

              console.log("✅ Usuario migrado exitosamente");
              showMessage(`¡Bienvenido ${firestoreCredentials.data.Nombre || email}!`, "success", "auth-messages");
              
              setTimeout(() => {
                redirectBasedOnUserType(firestoreCredentials.type);
              }, 1000);

            } catch (migrationError) {
              console.error("❌ Error migrando usuario:", migrationError);
              
              if (migrationError.code === 'auth/email-already-in-use') {
                showMessage("El usuario existe pero la contraseña no coincide. Usa 'Olvidé mi contraseña'.", "error", "auth-messages");
              } else {
                handleAuthError(migrationError);
              }
            }

          } else {
            console.log("❌ Credenciales no encontradas en Firestore");
            throw new Error("Credenciales inválidas");
          }
        } else {
          throw authError;
        }
      }

    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      handleAuthError(error);
    } finally {
      button.disabled = false;
      button.textContent = "Ingresar";
    }
  });

  // REGISTRO
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;
    const button = document.getElementById("registerButton");

    if (!name || !email || !password || !confirmPassword) {
      showMessage("Por favor, completa todos los campos.", "error", "register-messages");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Las contraseñas no coinciden.", "error", "register-messages");
      return;
    }

    if (password.length < 6) {
      showMessage("La contraseña debe tener al menos 6 caracteres.", "error", "register-messages");
      return;
    }

    button.disabled = true;
    button.textContent = "Registrando...";

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name
      });

      await setDoc(doc(db, "Users", user.uid), {
        name: name,
        email: email,
        userType: "Cliente",
        createdAt: new Date(),
        isActive: true
      });

      showMessage("¡Cuenta creada exitosamente! Redirigiendo...", "success", "register-messages");
      
      setTimeout(() => {
        window.location.href = "home.html";
      }, 2000);

    } catch (error) {
      console.error("Error al registrar:", error);
      handleAuthError(error, "register-messages");
    } finally {
      button.disabled = false;
      button.textContent = "Registrarse";
    }
  });

  // RESTABLECER CONTRASEÑA
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("resetEmail").value.trim();
    const button = document.getElementById("resetButton");

    if (!email) {
      showMessage("Ingresa tu email.", "error", "reset-messages");
      return;
    }

    button.disabled = true;
    button.textContent = "Enviando...";

    try {
      await sendPasswordResetEmail(auth, email);
      showMessage("Se ha enviado un enlace para restablecer tu contraseña a tu email.", "success", "reset-messages");
      
      document.getElementById("resetEmail").value = "";
      
      setTimeout(() => {
        showLoginForm();
      }, 3000);

    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      handleAuthError(error, "reset-messages");
    } finally {
      button.disabled = false;
      button.textContent = "Enviar enlace";
    }
  });

  // Verificar si el usuario ya está autenticado
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("👤 Usuario ya autenticado:", user.email);
      
      // Solo redirigir si estamos en la página de login
      const currentPage = window.location.pathname;
      const isLoginPage = currentPage.includes('login') || currentPage.includes('index') || currentPage === '/';
      
      if (isLoginPage) {
        console.log("📄 Estamos en página de login, redirigiendo...");
        const userType = await determineUserType(user.email);
        redirectBasedOnUserType(userType);
      } else {
        console.log("📄 No estamos en login, manteniendo en página actual");
      }
    } else {
      console.log("❌ No hay usuario autenticado");
    }
  });
}