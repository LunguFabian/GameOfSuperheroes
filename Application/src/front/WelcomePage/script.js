const menuOpenButton = document.querySelector("#menu-open-button");
const token = localStorage.getItem("token");
const payload = token ? parseJwt(token) : {};
const lang = localStorage.getItem("lang") || "en";
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

if (!token) {
    document.getElementById("profile").style.display = "none";
    document.getElementById("logout").style.display = "none";
}

if (token && isJwtExpired(token)) {
    localStorage.removeItem('token');
    window.location.href = '/home'
}
function isJwtExpired(token) {
    if (!token) return true;
    const payload = parseJwt(token);
    if (!payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now > payload.exp;
}

if (payload.is_admin) {
    const btn = document.createElement('button');
    btn.id = 'admin-btn';
    btn.innerText = 'Admin';
    btn.onclick = () => {
        window.location.href = '/admin';
    };
    document.getElementById('admin-btn-container').appendChild(btn);
}

function parseJwt(token) {
    if (!token) return {};
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

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

document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();

    const loginBtn = document.querySelector(".button.login");
    const registerBtn = document.querySelector(".button.register");
    const playBtn = document.querySelector(".button.play");
    const profileNav = document.getElementById("profile-nav");

    if (token) {
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        if (playBtn) playBtn.style.display = "inline-block";
    } else {
        if (playBtn) playBtn.style.display = "none";
        if (profileNav) profileNav.style.display = "none";
    }

    const langSelect = document.getElementById('lang-select');
    document.getElementById("lang-select").value = lang;

    playBtn?.addEventListener('click', function(event) {
        event.preventDefault();
        const lang = langSelect.value || 'en';
        window.location.href = `/difficulty?lang=${lang}`;
    });
});

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
});

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});

document.getElementById("lang-select").addEventListener("change", function() {
    localStorage.setItem("lang", this.value);
    location.reload();
});