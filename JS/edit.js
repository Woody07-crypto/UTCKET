// edit.js - Con manejo de errores para el campo de imagen
import { db } from './firebase-config.js';
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("edit.js cargado correctamente");

// Variables globales
let documentoActualId = null;
let tipoDocumento = null;

// Cargar datos del concierto para editar
window.cargarConciertoParaEditar = async function(id) {
    try {
        documentoActualId = id;
        tipoDocumento = 'concierto';
        
        const docRef = doc(db, 'Conciertos', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const concierto = docSnap.data();
            console.log("Concierto a editar:", concierto);
            
            // Mostrar campos de concierto y ocultar campos de empleado
            document.getElementById('concierto-fields').style.display = 'block';
            document.getElementById('empleado-fields').style.display = 'none';
            document.getElementById('modal-title').textContent = 'Editar Concierto';
            
            // Llenar el formulario con los datos existentes
            document.getElementById('edit-artist-name').value = concierto.Artista || '';
            document.getElementById('edit-concert-date').value = formatearFechaParaInput(concierto.Fecha);
            document.getElementById('edit-concert-venue').value = concierto.Lugar || '';
            
            // AGREGAR ESTA LÍNEA CON MANEJO DE ERRORES
            const imagenInput = document.getElementById('edit-concert-image');
            if (imagenInput) {
                imagenInput.value = concierto.Imagen || '';
            } else {
                console.warn('⚠️ Campo edit-concert-image no encontrado en el HTML');
            }
            
            // Procesar localidades, cantidades y precios
            if (concierto.Localidades && Array.isArray(concierto.Localidades)) {
                document.getElementById('edit-venue-seats').value = concierto.Localidades.join(', ');
            }
            
            if (concierto['Cantidad de ticket'] && Array.isArray(concierto['Cantidad de ticket'])) {
                document.getElementById('edit-ticket-quantity').value = concierto['Cantidad de ticket'].join(', ');
            }
            
            if (concierto.Precios && Array.isArray(concierto.Precios)) {
                document.getElementById('edit-ticket-prices').value = concierto.Precios.join(', ');
            }
            
            // Mostrar el modal de edición
            document.getElementById('editModal').style.display = 'block';
            
        } else {
            alert('❌ No se encontró el concierto');
        }
    } catch (error) {
        console.error('Error al cargar concierto:', error);
        alert('❌ Error al cargar el concierto: ' + error.message);
    }
}

// Cargar datos del empleado para editar
window.cargarEmpleadoParaEditar = async function(id) {
    try {
        documentoActualId = id;
        tipoDocumento = 'empleado';
        
        const docRef = doc(db, 'Empleado', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const empleado = docSnap.data();
            console.log("Empleado a editar:", empleado);
            
            // Mostrar campos de empleado y ocultar campos de concierto
            document.getElementById('empleado-fields').style.display = 'block';
            document.getElementById('concierto-fields').style.display = 'none';
            document.getElementById('modal-title').textContent = 'Editar Empleado';
            
            // Llenar el formulario con los datos existentes
            document.getElementById('edit-emp-first').value = empleado.Nombre || '';
            document.getElementById('edit-emp-last').value = empleado.Apellido || '';
            document.getElementById('edit-emp-carnet').value = empleado.Carnet || '';
            document.getElementById('edit-emp-puesto').value = empleado.Puesto || '';
            document.getElementById('edit-emp-email').value = empleado.Email || '';
            
            // Mostrar el modal de edición
            document.getElementById('editModal').style.display = 'block';
            
        } else {
            alert('❌ No se encontró el empleado');
        }
    } catch (error) {
        console.error('Error al cargar empleado:', error);
        alert('❌ Error al cargar el empleado: ' + error.message);
    }
}

// Actualizar concierto - CON MANEJO DE CAMPO IMAGEN
async function actualizarConcierto() {
    try {
        // Obtener valores del formulario
        const artista = document.getElementById('edit-artist-name').value.trim();
        const fecha = document.getElementById('edit-concert-date').value;
        const lugar = document.getElementById('edit-concert-venue').value.trim();
        
        // OBTENER IMAGEN CON MANEJO DE ERRORES
        let imagen = '';
        const imagenInput = document.getElementById('edit-concert-image');
        if (imagenInput) {
            imagen = imagenInput.value.trim();
        }
        
        const localidadesRaw = document.getElementById('edit-venue-seats').value;
        const cantidadesRaw = document.getElementById('edit-ticket-quantity').value;
        const preciosRaw = document.getElementById('edit-ticket-prices').value;
        
        // Procesar arrays (separados por coma)
        const localidades = localidadesRaw.split(',').map(s => s.trim()).filter(s => s);
        const cantidades = cantidadesRaw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        const precios = preciosRaw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        
        // Validaciones
        if (!artista || !fecha || !lugar) {
            alert('❌ Por favor completa todos los campos obligatorios');
            return false;
        }
        
        if (localidades.length === 0 || cantidades.length === 0 || precios.length === 0) {
            alert('❌ Por favor ingresa al menos una localidad, cantidad y precio');
            return false;
        }
        
        if (localidades.length !== cantidades.length || localidades.length !== precios.length) {
            alert('❌ El número de localidades, cantidades y precios debe coincidir');
            return false;
        }
        
        // Crear objeto de datos actualizado
        const conciertoData = {
            Artista: artista,
            Fecha: fecha,
            Lugar: lugar,
            Localidades: localidades,
            'Cantidad de ticket': cantidades,
            Precios: precios,
            fechaActualizacion: serverTimestamp()
        };
        
        // Agregar imagen solo si se proporcionó y el campo existe
        if (imagen) {
            conciertoData.Imagen = imagen;
        }
        
        console.log("Actualizando concierto:", documentoActualId, conciertoData);
        
        // Actualizar en Firestore
        const docRef = doc(db, 'Conciertos', documentoActualId);
        await updateDoc(docRef, conciertoData);
        
        alert('✅ Concierto actualizado exitosamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error al actualizar concierto:', error);
        alert('❌ Error al actualizar concierto: ' + error.message);
        return false;
    }
}

// Actualizar empleado
async function actualizarEmpleado() {
    try {
        // Obtener valores del formulario
        const nombre = document.getElementById('edit-emp-first').value.trim();
        const apellido = document.getElementById('edit-emp-last').value.trim();
        const carnet = document.getElementById('edit-emp-carnet').value.trim();
        const puesto = document.getElementById('edit-emp-puesto').value.trim();
        const email = document.getElementById('edit-emp-email').value.trim();
        const password = document.getElementById('edit-emp-password').value;
        
        // Validaciones
        if (!nombre || !apellido || !carnet || !puesto || !email) {
            alert('❌ Por favor completa todos los campos obligatorios');
            return false;
        }
        
        // Crear objeto de datos actualizado
        const empleadoData = {
            Nombre: nombre,
            Apellido: apellido,
            Carnet: carnet,
            Puesto: puesto,
            Email: email,
            Usuario: email.split('@')[0],
            fechaActualizacion: serverTimestamp()
        };
        
        // Solo actualizar la contraseña si se proporcionó una nueva
        if (password && password.length >= 8) {
            empleadoData.Password = password;
        } else if (password && password.length > 0 && password.length < 8) {
            alert('❌ La contraseña debe tener al menos 8 caracteres');
            return false;
        }
        
        console.log("Actualizando empleado:", documentoActualId, { ...empleadoData, Password: '****' });
        
        // Actualizar en Firestore
        const docRef = doc(db, 'Empleado', documentoActualId);
        await updateDoc(docRef, empleadoData);
        
        alert('✅ Empleado actualizado exitosamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error al actualizar empleado:', error);
        alert('❌ Error al actualizar empleado: ' + error.message);
        return false;
    }
}

// Formatear fecha para input datetime-local
function formatearFechaParaInput(fecha) {
    if (!fecha) return '';
    
    try {
        let date;
        
        // Si es un timestamp de Firestore
        if (fecha.seconds) {
            date = new Date(fecha.seconds * 1000);
        } else {
            // Si es una cadena de fecha
            date = new Date(fecha);
        }
        
        // Formatear para input datetime-local (YYYY-MM-DDTHH:MM)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
        
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return '';
    }
}

// Manejar envío del formulario de edición
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            let exito = false;
            
            if (tipoDocumento === 'concierto') {
                exito = await actualizarConcierto();
            } else if (tipoDocumento === 'empleado') {
                exito = await actualizarEmpleado();
            }
            
            if (exito) {
                // Cerrar modal
                document.getElementById('editModal').style.display = 'none';
                
                // Recargar la página para ver los cambios
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
    }
    
    // Cerrar modal al hacer clic en la X
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.getElementById('editModal').style.display = 'none';
        });
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Función para cancelar edición
window.cancelarEdicion = function() {
    document.getElementById('editModal').style.display = 'none';
    documentoActualId = null;
    tipoDocumento = null;
};