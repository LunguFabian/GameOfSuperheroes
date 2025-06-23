const TRANSLATABLE_IDS = [
    ["page-title", "about"],
    ["site-title", "title"],
    ["rss-link", "rss"],
    ["rank-link", "rank"],
    ["about-link", "about"],
    ["profile-link", "profile"],
    ["logout-btn", "logout"],
    ["meet-the-team-title", "meet_the_team"],
    ["project-description", "project_description"],
    ["fabian-description", "fabian_description"],
    ["bianca-description", "bianca_description"]
];
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");
const token = localStorage.getItem("token");
let lang = localStorage.getItem("lang") || "en";

if(token == null){
    document.getElementById("profile").style.display = "none";
    document.getElementById("logout").style.display = "none";
}

function applyTranslations() {
    fetch(`/front/lang/${lang}.json`)
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

document.getElementById("lang-select").value = lang;
document.addEventListener("DOMContentLoaded", async function () {
    applyTranslations();
});
document.getElementById("lang-select").addEventListener("change", function() {
    localStorage.setItem("lang", this.value);
    location.reload();
});

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})
