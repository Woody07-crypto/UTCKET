document.addEventListener("DOMContentLoaded", async function () {
    console.log("🎯 Calendario iniciado correctamente.");

    const db = window.db;

    // ===============================
    //   ELEMENTOS DEL MENÚ
    // ===============================
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const menuOverlay = document.querySelector(".menu-overlay");

    // ABRIR MENÚ
    menuToggle.addEventListener("click", () => {
        menu.classList.add("menu-open");
        menuOverlay.classList.add("overlay-open");
    });

    // CERRAR MENÚ
    menuOverlay.addEventListener("click", () => {
        menu.classList.remove("menu-open");
        menuOverlay.classList.remove("overlay-open");
    });

    // ===============================
    //   ELEMENTOS DEL CALENDARIO
    // ===============================
    const eventosLista = document.getElementById("eventos-lista");
    const formBusqueda = document.getElementById("form-busqueda-calendario");

    const fArtista = document.getElementById("artista");
    const fLugar = document.getElementById("lugar");
    const fFecha = document.getElementById("fecha");

    // ===============================
    //   CARGAR EVENTOS DESDE FIRESTORE
    // ===============================
    let todosLosEventos = [];

    async function cargarEventos() {
        try {
            const res = await db.collection("Conciertos").get();

            todosLosEventos = res.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            mostrarEventos(todosLosEventos);

        } catch (error) {
            console.error("❌ Error cargando conciertos:", error);
            eventosLista.innerHTML = `<p class="no-eventos">Error cargando datos de la base.</p>`;
        }
    }

    cargarEventos(); // Ejecutar al inicio

    // ===============================
    //   MOSTRAR EVENTOS
    // ===============================
    function mostrarEventos(lista) {
        eventosLista.innerHTML = "";

        if (lista.length === 0) {
            eventosLista.innerHTML = `<p class="no-eventos">No se encontraron eventos con esos filtros.</p>`;
            return;
        }

        lista.forEach(evento => {
            const fecha = evento.fecha?.toDate ? evento.fecha.toDate() : null;

            const fechaTexto = fecha
                ? fecha.toLocaleDateString()
                : "Fecha no válida";

            const div = document.createElement("div");
            div.classList.add("evento-card");
            div.innerHTML = `
                <h4>${evento.artista}</h4>
                <p><strong>📅 Fecha:</strong> ${fechaTexto}</p>
                <p><strong>📍 Lugar:</strong> ${evento.lugar}</p>
            `;
            eventosLista.appendChild(div);
        });
    }

    // ===============================
    //   FILTRAR EVENTOS
    // ===============================
    function filtrarEventos(e) {
        e.preventDefault();

        let filtrados = todosLosEventos;

        // ARTISTA
        if (fArtista.value.trim() !== "") {
            filtrados = filtrados.filter(e =>
                e.artista.toLowerCase().includes(fArtista.value.trim().toLowerCase())
            );
        }

        // LUGAR
        if (fLugar.value.trim() !== "") {
            filtrados = filtrados.filter(e =>
                e.lugar.toLowerCase().includes(fLugar.value.trim().toLowerCase())
            );
        }

        // FECHA EXACTA
        if (fFecha.value !== "") {
            const fechaHTML = new Date(fFecha.value + "T00:00:00");

            filtrados = filtrados.filter(e => {
                const fEvento = e.fecha?.toDate ? e.fecha.toDate() : null;
                if (!fEvento) return false;

                return (
                    fEvento.getFullYear() === fechaHTML.getFullYear() &&
                    fEvento.getMonth() === fechaHTML.getMonth() &&
                    fEvento.getDate() === fechaHTML.getDate()
                );
            });
        }

        mostrarEventos(filtrados);
    }

    formBusqueda.addEventListener("submit", filtrarEventos);
});
