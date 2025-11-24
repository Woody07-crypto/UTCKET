import { auth, db } from './firebase-config.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ Página de login cargada");
  initializeLogin();
});

function initializeLogin() {
  const loginForm = document.getElementById("loginForm");
  
  if (!loginForm) {
    console.error("❌ No se encontró el formulario de login");
    return;
  }

  function showMessage(message, type) {
    const container = document.getElementById("auth-messages");
    if (container) {
      container.innerHTML = `<div class="message ${type}">${message}</div>`;
      setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
    }
  }

  async function determineUserTypeByUID(uid) {
    try {
      console.log("🔍 Buscando tipo de usuario por UID:", uid);
      
      const adminSnapshot = await getDocs(collection(db, "Administradores"));
      for (const docSnap of adminSnapshot.docs) {
        const data = docSnap.data();
        if (data.UID === uid) {
          console.log("✅ Usuario es Administrador");
          return "Administrador";
        }
      }

      const empleadoSnapshot = await getDocs(collection(db, "Empleado"));
      for (const docSnap of empleadoSnapshot.docs) {
        const data = docSnap.data();
        if (data.UID === uid) {
          console.log("✅ Usuario es Empleado");
          return "Empleado";
        }
      }

      console.log("⚠️ Usuario es Cliente");
      return "Cliente";

    } catch (error) {
      console.error("❌ Error determinando tipo de usuario:", error);
      return "Cliente";
    }
  }

  async function verifyCredentialsInFirestore(email, password) {
    try {
      console.log("🔍 Verificando credenciales en Firestore");
      const emailLower = email.toLowerCase();
      
      const adminSnapshot = await getDocs(collection(db, "Administradores"));
      for (const docSnap of adminSnapshot.docs) {
        const data = docSnap.data();
        if (data.Correo && data.Correo.toLowerCase() === emailLower) {
          if (data.Contraseña == password || data.Contraseña === Number(password)) {
            return { 
              type: "Administrador", 
              data: data,
              docId: docSnap.id 
            };
          }
        }
      }

      const empleadoSnapshot = await getDocs(collection(db, "Empleado"));
      for (const docSnap of empleadoSnapshot.docs) {
        const data = docSnap.data();
        const empleadoEmail = data.email || data.Correo;
        
        if (empleadoEmail && empleadoEmail.toLowerCase() === emailLower) {
          const empleadoPassword = data.Contraseña || data.password;
          if (empleadoPassword == password || empleadoPassword === Number(password)) {
            return { 
              type: "Empleado", 
              data: data,
              docId: docSnap.id
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Error verificando credenciales:", error);
      return null;
    }
  }

  function redirectBasedOnUserType(userType) {
    console.log("🔄 Redirigiendo usuario tipo:", userType);
    switch(userType) {
      case "Administrador":
        window.location.href = "admin.html";
        break;
      case "Empleado":
        window.location.href = "empleado.html";
        break;
      case "Cliente":
      default:
        window.location.href = "home.html";
    }
  }

  function handleAuthError(error) {
    let message = "Ha ocurrido un error. Intenta nuevamente.";
    
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'El formato del email es inválido.';
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
      default:
        if (error.message === "Credenciales inválidas") {
          message = "Email o contraseña incorrectos.";
        }
    }
    
    showMessage(message, "error");
  }

  // LOGIN
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const button = document.getElementById("button");

    if (!email || !password) {
      showMessage("Ingresa email y contraseña.", "error");
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
        
        userType = await determineUserTypeByUID(user.uid);
        showMessage(`¡Bienvenido!`, "success");
        
        setTimeout(() => {
          redirectBasedOnUserType(userType);
        }, 1000);

      } catch (authError) {
        console.log("⚠️ Error de Firebase Auth:", authError.code);
        
        if (authError.code === 'auth/user-not-found' || 
            authError.code === 'auth/wrong-password' ||
            authError.code === 'auth/invalid-credential') {
          
          const firestoreCredentials = await verifyCredentialsInFirestore(email, password);
          
          if (firestoreCredentials) {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, email, password);
              const user = userCredential.user;
              
              await setDoc(doc(db, firestoreCredentials.type === "Administrador" ? "Administradores" : "Empleado", firestoreCredentials.docId), {
                ...firestoreCredentials.data,
                UID: user.uid
              });

              await setDoc(doc(db, "Users", user.uid), {
                name: firestoreCredentials.data.Nombre || email.split('@')[0],
                email: email,
                userType: firestoreCredentials.type,
                createdAt: new Date()
              });

              showMessage(`¡Bienvenido!`, "success");
              
              setTimeout(() => {
                redirectBasedOnUserType(firestoreCredentials.type);
              }, 1000);

            } catch (migrationError) {
              if (migrationError.code === 'auth/email-already-in-use') {
                showMessage("El usuario existe pero la contraseña no coincide.", "error");
              } else {
                handleAuthError(migrationError);
              }
            }
          } else {
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

  // Verificar si ya está autenticado
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("👤 Usuario ya autenticado, redirigiendo...");
      const userType = await determineUserTypeByUID(user.uid);
      redirectBasedOnUserType(userType);
    }
  });
}