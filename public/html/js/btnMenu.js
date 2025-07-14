document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('menu-btn-id');
    const menuContent = document.getElementById('menu-content-id');

    menuBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
    });

    // Cierra el menú si se hace clic fuera de él
    window.addEventListener('click', function (event) {
        if (menuContent.style.display === 'block' && !menuBtn.contains(event.target)) {
            menuContent.style.display = 'none';
        }
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            alert('Estás seguro de que quieres cerrar tu sesión?');
            sessionStorage.removeItem('dniUsuario');
            window.location.href = '/html/login.html';
            });
    }
});