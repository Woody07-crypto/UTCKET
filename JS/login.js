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

  // Función para determinar el tipo de usuario basado en UID
  async function determineUserTypeByUID(uid) {
    try {
      console.log("🔍 Buscando tipo de usuario por UID:", uid);
      
      // 1. Buscar en Administradores por UID
      const adminSnapshot = await getDocs(collection(db, "Administradores"));
      console.log("📊 Total documentos en Administradores:", adminSnapshot.size);
      
      for (const docSnap of adminSnapshot.docs) {
        const data = docSnap.data();
        console.log("🆔 UID en Admin:", data.UID);
        
        if (data.UID === uid) {
          console.log("✅ Usuario es Administrador - Match por UID!");
          return "Administrador";
        }
      }

      // 2. Buscar en Empleado por UID
      const empleadoSnapshot = await getDocs(collection(db, "Empleado"));
      console.log("📊 Total documentos en Empleado:", empleadoSnapshot.size);
      
      for (const docSnap of empleadoSnapshot.docs) {
        const data = docSnap.data();
        console.log("🆔 UID en Empleado:", data.UID);
        
        if (data.UID === uid) {
          console.log("✅ Usuario es Empleado - Match por UID!");
          return "Empleado";
        }
      }

      // 3. Si no está en ninguna colección, es Cliente por defecto
      console.log("⚠️ UID no encontrado en Administradores ni Empleado, asignando Cliente");
      return "Cliente";

    } catch (error) {
      console.error("❌ Error determinando tipo de usuario:", error);
      return "Cliente";
    }
  }

  // Función legacy para determinar tipo por email (mantener como fallback)
  async function determineUserType(email) {
    try {
      console.log("🔍 Buscando tipo de usuario para:", email);
      const emailLower = email.toLowerCase();
      
      // 1. Buscar en Administradores
      const adminSnapshot = await getDocs(collection(db, "Administradores"));
      console.log("📊 Total documentos en Administradores:", adminSnapshot.size);
      
      for (const docSnap of adminSnapshot.docs) {
        const data = docSnap.data();
        
        if (data.Correo && data.Correo.toLowerCase() === emailLower) {
          console.log("✅ Usuario es Administrador - Match por email!");
          return "Administrador";
        }
      }

      // 2. Buscar en Empleado
      const empleadoSnapshot = await getDocs(collection(db, "Empleado"));
      console.log("📊 Total documentos en Empleado:", empleadoSnapshot.size);
      
      for (const docSnap of empleadoSnapshot.docs) {
        const data = docSnap.data();
        
        // Verificar ambos campos posibles: "email" o "Correo"
        const empleadoEmail = data.email || data.Correo;
        
        if (empleadoEmail && empleadoEmail.toLowerCase() === emailLower) {
          console.log("✅ Usuario es Empleado - Match por email!");
          return "Empleado";
        }
      }

      // 3. Por defecto, es Cliente
      console.log("⚠️ No se encontró en ninguna colección, asignando Cliente por defecto");
      return "Cliente";

    } catch (error) {
      console.error("❌ Error determinando tipo de usuario:", error);
      return "Cliente";
    }
  }

  // Función para verificar credenciales en Firestore
  async function verifyCredentialsInFirestore(email, password) {
    try {
      console.log("🔍 Verificando credenciales en Firestore para:", email);
      const emailLower = email.toLowerCase();
      
      // Buscar en Administradores
      const adminSnapshot = await getDocs(collection(db, "Administradores"));
      console.log("📊 Verificando en Administradores...");
      
      for (const docSnap of adminSnapshot.docs) {
        const data = docSnap.data();
        console.log("🔑 Comparando:", {
          correo: data.Correo,
          contraseña: data.Contraseña,
          passwordIngresado: password
        });
        
        if (data.Correo && data.Correo.toLowerCase() === emailLower) {
          // Verificar contraseña (puede ser número o string)
          if (data.Contraseña == password || data.Contraseña === Number(password)) {
            console.log("✅ Credenciales válidas en Administradores");
            return { 
              type: "Administrador", 
              data: data,
              docId: docSnap.id 
            };
          } else {
            console.log("❌ Email correcto pero contraseña incorrecta");
          }
        }
      }

      // Buscar en Empleado
      const empleadoSnapshot = await getDocs(collection(db, "Empleado"));
      console.log("📊 Verificando en Empleado...");
      
      for (const docSnap of empleadoSnapshot.docs) {
        const data = docSnap.data();
        
        // Verificar ambos campos posibles: "email" o "Correo"
        const empleadoEmail = data.email || data.Correo;
        
        console.log("🔑 Comparando Empleado:", {
          correo: empleadoEmail,
          contraseña: data.Contraseña || data.password,
          passwordIngresado: password
        });
        
        if (empleadoEmail && empleadoEmail.toLowerCase() === emailLower) {
          // Verificar contraseña (puede ser número o string, y en diferentes campos)
          const empleadoPassword = data.Contraseña || data.password;
          
          if (empleadoPassword == password || empleadoPassword === Number(password)) {
            console.log("✅ Credenciales válidas en Empleado");
            return { 
              type: "Empleado", 
              data: data,
              docId: docSnap.id
            };
          } else {
            console.log("❌ Email correcto pero contraseña incorrecta en Empleado");
          }
        }
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
        console.log("🆔 UID del usuario:", user.uid);

        // Determinar tipo de usuario POR UID (más seguro)
        userType = await determineUserTypeByUID(user.uid);
        console.log("👤 Tipo de usuario detectado por UID:", userType);
        
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
              
              // Si el usuario tiene UID en Firestore, intentar vincularlo
              if (firestoreCredentials.uid) {
                console.log("🆔 Usuario tiene UID en Firestore:", firestoreCredentials.uid);
                // Este usuario YA DEBERÍA existir en Firebase Auth con este UID
                // Intentar autenticarse de nuevo (probablemente la contraseña está mal)
                showMessage("Usuario existe. Verifica tu contraseña o usa 'Olvidé mi contraseña'.", "error", "auth-messages");
                return;
              }
              
              // Si no tiene UID, crear nuevo usuario en Firebase Auth
              userCredential = await createUserWithEmailAndPassword(auth, email, password);
              const user = userCredential.user;
              console.log("✅ Usuario creado en Firebase Auth con UID:", user.uid);
              
              await updateProfile(user, {
                displayName: firestoreCredentials.data.Nombre || email.split('@')[0]
              });

              // Actualizar el UID en Firestore
              await setDoc(doc(db, firestoreCredentials.type === "Administrador" ? "Administradores" : "Empleado", firestoreCredentials.docId), {
                ...firestoreCredentials.data,
                UID: user.uid // Agregar el UID generado
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
      console.log("🆔 UID:", user.uid);
      
      // Solo redirigir si estamos en la página de login
      const currentPage = window.location.pathname;
      const isLoginPage = currentPage.includes('login') || currentPage.includes('index') || currentPage === '/';
      
      if (isLoginPage) {
        console.log("📄 Estamos en página de login, redirigiendo...");
        // Usar UID para determinar tipo de usuario (más seguro)
        const userType = await determineUserTypeByUID(user.uid);
        redirectBasedOnUserType(userType);
      } else {
        console.log("📄 No estamos en login, manteniendo en página actual");
      }
    } else {
      console.log("❌ No hay usuario autenticado");
    }
  });
}