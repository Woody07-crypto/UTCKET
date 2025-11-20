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


const auth = window.auth;
const db = window.db;



onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../login.html";
    }
});



document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "../login.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});



const listaConciertos = document.getElementById("lista-conciertos");
const form = document.getElementById("formConcierto");

let idEditando = null;



onSnapshot(collection(db, "Conciertos"), (snapshot) => {

    listaConciertos.innerHTML = ""; 

    snapshot.forEach((documento) => {
        const c = documento.data();
        const id = documento.id;

    
        const card = document.createElement("div");
        card.classList.add("evento");

        card.innerHTML = `
            <img src="../img/default_concierto.png" alt="Imagen concierto">

            <h3>${c.artista}</h3>

            <p>📍 ${c.lugar}</p>
            <p>Fecha: ${c.fecha}</p>
            <p>Localidades: ${c.localidades}</p>
            <p>Precio: $${c.precio}</p>

            <button class="btn-editar" data-id="${id}">Editar</button>
            <button class="btn-eliminar" data-id="${id}">Eliminar</button>
        `;

        listaConciertos.appendChild(card);
    });

    activarBotones();
});



function activarBotones() {

    
    document.querySelectorAll(".btn-editar").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;

            const snap = await getDocs(collection(db, "Conciertos"));
            snap.forEach((docu) => {
                if (docu.id === id) {
                    const c = docu.data();
                    form.artista.value = c.artista;
                    form.fecha.value = c.fecha;
                    form.lugar.value = c.lugar;
                    form.localidades.value = c.localidades;
                    form.precio.value = c.precio;

                    idEditando = id;
                }
            });
        });
    });


    
    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;

            if (confirm("¿Seguro que quieres eliminar este concierto?")) {
                await deleteDoc(doc(db, "Conciertos", id));
            }
        });
    });
}



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
            await updateDoc(doc(db, "Conciertos", idEditando), concierto);
            idEditando = null;
        } else {
            await addDoc(collection(db, "Conciertos"), concierto);
        }

        form.reset();

    } catch (error) {
        console.error("Error al guardar:", error);
    }
});
