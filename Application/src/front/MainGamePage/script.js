const TRANSLATABLE_IDS = [
    ["page-title", "difficulty_page_title"],
    ["site-title", "site_title"],
    ["difficulty-title", "difficulty_title"],
    ["easy-title", "easy"],
    ["medium-title", "medium"],
    ["hard-title", "hard"],
    ["easyButton", "play"],
    ["normalButton", "play"],
    ["hardButton", "play"]
];
const token = localStorage.getItem("token");
const lang = getLangFromUrl();
let transMessages = {};

if (!token || isJwtExpired(token)) {
    window.location.href = "/unauthorized";
}

applyTranslations();

function isJwtExpired(token) {
    if (!token) return true;
    const payload = parseJwt(token);
    if (!payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now > payload.exp;
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

function sendGameRequest(difficulty) {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang') || 'en';
    fetch("/api/game/start.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ difficulty: difficulty, language: lang })
    })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
            if (status === 200) {
                window.location.href = `/game?difficulty=${difficulty}&game_id=${body.game_id}&lang=${lang}`;
            } else {
                showCustomPopup(t(body.message),5000);
                if(body.message === "hero_not_selected"){
                    setTimeout(function() {
                        window.location.href = "/profile";
                    }, 3000);
                }
            }
        })
        .catch(err => {
            console.error("Eroare:", err);
            showCustomPopup(t("error_500"),5000);
        });
}

function applyTranslations() {
    fetch(`/front/lang/${lang}.json`)
        .then(res => res.json())
        .then(messages => {
            transMessages=messages;
            TRANSLATABLE_IDS.forEach(([id, key]) => {
                const el = document.getElementById(id);
                if (id === "page-title" && langMessages[key]) {
                    document.title = langMessages[key];
                } else if (el && langMessages[key]) {
                    el.textContent = langMessages[key];
                }
            });
        });
}

function t(key) {
    return transMessages[key] || key;
}

function showCustomPopup(message, duration = 5000) {
    const popup = document.getElementById('customPopup');
    const msgElem = document.getElementById('customPopupMessage');
    msgElem.textContent = message;
    popup.style.display = 'flex';

    document.getElementById('closePopupBtn').onclick = () => {
        popup.style.display = 'none';
    };
    if (duration > 0) {
        setTimeout(() => {
            popup.style.display = 'none';
        }, duration);
    }
}

function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || 'en';
}

document.getElementById("easyButton").addEventListener("click", function(e) {
    e.preventDefault();
    sendGameRequest("easy");
});

document.getElementById("normalButton").addEventListener("click", function(e) {
    e.preventDefault();
    sendGameRequest("medium");
});

document.getElementById("hardButton").addEventListener("click", function(e) {
    e.preventDefault();
    sendGameRequest("hard");
});