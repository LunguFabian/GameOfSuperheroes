const menuOpenButton = document.querySelector("#menu-open-button");
menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

const token = localStorage.getItem("token");
if(token==null){
    document.getElementById("profile").style.display = "none";
    document.getElementById("logout").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
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

document.addEventListener('DOMContentLoaded', function() {
    const langSelect = document.getElementById('lang-select');
    const playBtn = document.getElementById('play-btn');

    playBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = langSelect.value || 'en';
        window.location.href = `/difficulty?lang=${lang}`;
    });
});

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});

const TRANSLATABLE_IDS = [
    ["page-title", "title"],
    ["page-title-text", "title"],
    ["rss-link", "rss"],
    ["rank-link", "rank"],
    ["about-link", "about"],
    ["profile-link", "profile"],
    ["logout-btn", "logout"],
    ["welcome-title", "welcome"],
    ["subtitle", "subtitle"],
    ["login-btn", "login"],
    ["register-btn", "register"],
    ["play-btn", "play"]
];

let lang = localStorage.getItem("lang") || "en";
document.getElementById("lang-select").value = lang;

function applyTranslations() {
    fetch(`front/lang/${lang}.json`)
        .then(res => res.json())
        .then(messages => {
            TRANSLATABLE_IDS.forEach(([elId, key]) => {
                const el = document.getElementById(elId);
                if (el && messages[key]) {
                    if (el.tagName === "TITLE") {
                        el.textContent = messages[key];
                        document.title = messages[key];
                    } else {
                        el.textContent = messages[key];
                    }
                }
            });
        });
}

applyTranslations();

document.getElementById("lang-select").addEventListener("change", function() {
    localStorage.setItem("lang", this.value);
    location.reload();
});

