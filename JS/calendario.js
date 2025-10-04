const eventos = [
    {
        id: 1,
        artista: "Bad Bunny",
        ciudad: "San Salvador",
        fecha: "2024-12-15",
        imagen: "img/badbunny_tour.png",
        lugar: "Estadio Cuscatlán",
        precio: "$75 - $250"
    },
    {
        id: 2,
        artista: "Guns N' Roses",
        ciudad: "San Salvador", 
        fecha: "2025-10-04",
        imagen: "img/GunsRoses.png",
        lugar: "Estadio Mágico Gonzalez",
        precio: "$90 - $300"
    },
    {
        id: 3,
        artista: "Danny Ocean",
        ciudad: "San Salvador",
        fecha: "2025-10-10",
        imagen: "img/Danny_Ocean_tour.png",
        lugar: "Parque de pelota Saturnino Bengoa",
        precio: "$45 - $120"
    },
    {
        id: 4,
        artista: "Coldplay",
        ciudad: "Santa Ana",
        fecha: "2024-11-20",
        imagen: "img/badbunny_tour.png",
        lugar: "Gimnasio Nacional",
        precio: "$85 - $200"
    },
    {
        id: 5,
        artista: "Karol G",
        ciudad: "San Miguel",
        fecha: "2025-03-15",
        imagen: "img/GunsRoses.png",
        lugar: "Polideportivo",
        precio: "$65 - $180"
    },
    {
        id: 6,
        artista: "Maná",
        ciudad: "La Libertad",
        fecha: "2025-02-28",
        imagen: "img/Danny_Ocean_tour.png",
        lugar: "Centro Internacional de Ferias",
        precio: "$70 - $220"
    }
];

//FECHA//
function formatearFecha(fechaString) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
}

//EVENTOS//
function mostrarEventos(eventosFiltrados) {
    const eventosLista = document.getElementById('eventos-lista');
    eventosLista.innerHTML = '';

    if (eventosFiltrados.length === 0) {
        eventosLista.innerHTML = '<p class="no-resultados">🎵 No se encontraron eventos con los filtros seleccionados. Intenta con otros criterios.</p>';
        return;
    }

    eventosFiltrados.forEach(evento => {
        const eventoElement = document.createElement('div');
        eventoElement.className = 'evento-card';
        eventoElement.innerHTML = `
            <img src="${evento.imagen}" alt="${evento.artista}" onerror="this.src='img/badbunny_tour.png'">
            <h4>${evento.artista}</h4>
            <p class="ubicacion">📍 ${evento.ciudad} - ${evento.lugar}</p>
            <p class="fecha">📅 ${formatearFecha(evento.fecha)}</p>
            <p class="precio">💰 ${evento.precio}</p>
            <button class="btn-comprar" onclick="comprarBoleto(${evento.id})">Comprar Boleto</button>
        `;
        eventosLista.appendChild(eventoElement);
    });
}

//FILTRO EVENTOS//
function filtrarEventos() {
    const fecha = document.getElementById('fecha').value;
    const ciudad = document.getElementById('ciudad').value.toLowerCase();
    const artista = document.getElementById('artista').value.toLowerCase();

    const eventosFiltrados = eventos.filter(evento => {
        const coincideFecha = !fecha || evento.fecha === fecha;
        const coincideCiudad = !ciudad || evento.ciudad.toLowerCase().includes(ciudad);
        const coincideArtista = !artista || evento.artista.toLowerCase().includes(artista);

        return coincideFecha && coincideCiudad && coincideArtista;
    });

    mostrarEventos(eventosFiltrados);
}

//COMPRA BOLETOS//
function comprarBoleto(eventoId) {
    alert(`🎟️ Redirigiendo a compra de boletos para el evento ID: ${eventoId}`);
}

document.addEventListener('DOMContentLoaded', function() {
    mostrarEventos(eventos);

    //FILTRO FORMUARIO//
    document.getElementById('form-busqueda-calendario').addEventListener('submit', function(e) {
        e.preventDefault();
        filtrarEventos();
    });

    //FILTRO INPUTS//
    document.getElementById('fecha').addEventListener('change', filtrarEventos);
    document.getElementById('ciudad').addEventListener('input', filtrarEventos);
    document.getElementById('artista').addEventListener('input', filtrarEventos);

    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});