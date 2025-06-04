const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

menuCloseButton.addEventListener("click", () => menuOpenButton.click());

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});