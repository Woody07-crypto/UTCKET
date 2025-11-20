// ========== JAVASCRIPT PARA MENÚ HAMBURGUESA ==========

// Seleccionar elementos del DOM
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
const menuOverlay = document.querySelector('.menu-overlay');
const body = document.body;
const menuLinks = document.querySelectorAll('.menu__link');

// Función para abrir/cerrar el menú
function toggleMenu() {
    menuToggle.classList.toggle('active');
    menu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    body.classList.toggle('menu-open');
}

// Función para cerrar el menú
function closeMenu() {
    menuToggle.classList.remove('active');
    menu.classList.remove('active');
    menuOverlay.classList.remove('active');
    body.classList.remove('menu-open');
}

// Event listener para el botón hamburguesa
if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
}

// Cerrar menú al hacer click en un link
menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});

// Cerrar menú al hacer click en el overlay
if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
}

// Cerrar menú con la tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
        closeMenu();
    }
});

// Prevenir scroll cuando el menú está abierto
const style = document.createElement('style');
style.textContent = `
    body.menu-open {
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Ajustar el menú al cambiar el tamaño de la ventana
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && menu.classList.contains('active')) {
            closeMenu();
        }
    }, 250);
});