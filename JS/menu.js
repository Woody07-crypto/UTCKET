
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
const menuOverlay = document.querySelector('.menu-overlay');
const body = document.body;
const menuLinks = document.querySelectorAll('.menu__link');


function toggleMenu() {
    menuToggle.classList.toggle('active');
    menu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    body.classList.toggle('menu-open');
}


function closeMenu() {
    menuToggle.classList.remove('active');
    menu.classList.remove('active');
    menuOverlay.classList.remove('active');
    body.classList.remove('menu-open');
}


if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
}


menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
});


if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
}


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
        closeMenu();
    }
});


const style = document.createElement('style');
style.textContent = `
    body.menu-open {
        overflow: hidden;
    }
`;
document.head.appendChild(style);


let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && menu.classList.contains('active')) {
            closeMenu();
        }
    }, 250);
});