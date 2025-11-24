
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const container = document.getElementById('eventos-destacados');

if (container) {
  cargarEventosDestacados();
}

async function cargarEventosDestacados() {
  try {
    container.innerHTML = '<p class="loading-events">Cargando eventos...</p>';

    
    const ref = collection(db, 'Conciertos');
    const q = query(ref, orderBy('Fecha'), limit(3));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-events">No hay eventos disponibles.</p>';
      return;
    }

    container.innerHTML = '';

    snapshot.forEach(docSnap => {
      const concierto = docSnap.data();
      const card = crearTarjetaEvento(docSnap.id, concierto);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar eventos destacados:', error);
    container.innerHTML = '<p class="empty-events">Error al cargar eventos.</p>';
  }
}

function crearTarjetaEvento(id, concierto) {
  const card = document.createElement('div');
  card.className = 'evento';


  const imgSrc = concierto.ImagenURL || 'img/Danny_Ocean_tour.png';

  const fechaFormateada = formatearFecha(concierto.Fecha);

  card.innerHTML = `
    <img src="${imgSrc}" alt="${concierto.Artista || 'Concierto'}">
    <h3>${concierto.Artista || 'Concierto sin nombre'}</h3>
    <p>📍 ${concierto.Lugar || ''}</p>
    <p>Fecha: ${fechaFormateada}</p>
    <button onclick="window.location.href='comprar_boleto.html'">Comprar Boleto</button>
  `;

  return card;
}

function formatearFecha(fecha) {
  if (!fecha) return 'N/A';

  try {
    
    if (fecha.toDate) {
      const d = fecha.toDate();
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    
    const d = new Date(fecha);
    if (isNaN(d)) return fecha;

    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return fecha;
  }
}
