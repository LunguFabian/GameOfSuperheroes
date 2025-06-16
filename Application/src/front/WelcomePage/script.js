const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");
console.log("aici");
menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

menuCloseButton.addEventListener("click", () => menuOpenButton.click());

const token = localStorage.getItem("token");
if(token==null){
    document.getElementById("profile").style.display = "none";
    document.getElementById("logout").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    console.log("functie");
    console.log(token);
    const loginBtn = document.querySelector(".button.login");
    const registerBtn = document.querySelector(".button.register");
    const playBtn = document.querySelector(".button.play");
    const profileNav = document.getElementById("profile-nav");

    if (token) {
        console.log("cu token");
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        if (playBtn) playBtn.style.display = "inline-block";
    } else {
        console.log("fara token");
        if (playBtn) playBtn.style.display = "none";
        if (profileNav) profileNav.style.display = "none";
    }
});
document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});