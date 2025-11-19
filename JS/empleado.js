// =============================================
//            IMPORTS FIREBASE v9
// =============================================
import {
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// auth y db vienen desde HTML (window.auth/db)
const auth = window.auth;
const db = window.db;


// =============================================
//        1. VERIFICAR SESIÓN DEL EMPLEADO
// =============================================
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Si no hay usuario autenticado → fuera
        window.location.href = "../login.html";
    }
});


// =============================================
//             2. CERRAR SESIÓN
// =============================================
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "../login.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});


// =============================================
//      3. CRUD - COLECCIÓN: CONCIERTOS
// =============================================
const listaConciertos = document.getElementById("lista-conciertos");
const form = document.getElementById("formConcierto");

let idEditando = null; // si NO es null → estamos editando


// =============================================
//      LEER Y MOSTRAR CONCIERTOS EN TIEMPO REAL
// =============================================
onSnapshot(collection(db, "conciertos"), (snapshot) => {
    listaConciertos.innerHTML = ""; // limpiar antes de renderizar

    snapshot.forEach((docu) => {
        const concierto = docu.data();
        const id = docu.id;

        const card = document.createElement("div");
        card.classList.add("fila-concierto");
        card.innerHTML = `
            <p><strong>Artista:</strong> ${concierto.artista}</p>
            <p><strong>Fecha:</strong> ${concierto.fecha}</p>
            <p><strong>Lugar:</strong> ${concierto.lugar}</p>
            <p><strong>Localidades:</strong> ${concierto.localidades}</p>
            <p><strong>Precio:</strong> $${concierto.precio}</p>

            <button class="btn-editar" data-id="${id}">Editar</button>
            <button class="btn-eliminar" data-id="${id}">Eliminar</button>
        `;

        listaConciertos.appendChild(card);
    });

    activarBotones();
});


// =============================================
//    ACTIVAR BOTONES EDITAR Y ELIMINAR
// =============================================
function activarBotones() {
    // EDITAR
    document.querySelectorAll(".btn-editar").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;

            // obtener datos actuales
            const snapshot = await getDocs(collection(db, "conciertos"));
            snapshot.forEach((documento) => {
                if (documento.id === id) {
                    const datos = documento.data();

                    // llenar formulario
                    form.artista.value = datos.artista;
                    form.fecha.value = datos.fecha;
                    form.lugar.value = datos.lugar;
                    form.localidades.value = datos.localidades;
                    form.precio.value = datos.precio;

                    idEditando = id; // activar modo edición
                }
            });
        });
    });

    // ELIMINAR
    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;

            if (confirm("¿Eliminar este concierto?")) {
                await deleteDoc(doc(db, "conciertos", id));
            }
        });
    });
}


// =============================================
//             AGREGAR / EDITAR
// =============================================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const concierto = {
        artista: form.artista.value,
        fecha: form.fecha.value,
        lugar: form.lugar.value,
        localidades: Number(form.localidades.value),
        precio: Number(form.precio.value)
    };

    try {

        if (idEditando) {
            // =============================
            //         EDITAR
            // =============================
            await updateDoc(doc(db, "conciertos", idEditando), concierto);
            idEditando = null;

        } else {
            // =============================
            //        AGREGAR NUEVO
            // =============================
            await addDoc(collection(db, "conciertos"), concierto);
        }

        form.reset(); // limpiar formulario

    } catch (error) {
        console.error("Error al guardar:", error);
    }
});
