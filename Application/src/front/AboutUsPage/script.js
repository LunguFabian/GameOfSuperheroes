document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    if(token == null){
        document.getElementById("profile").style.display = "none";
        document.getElementById("logout").style.display = "none";
    }
});

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
