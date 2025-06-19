document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '../NotAuthorizedPage/NotAuthorized.html'
        return;
    }

    loadLangMessages(applyTranslations);

    function sendGameRequest(difficulty) {
        fetch("http://localhost:8082/api/game/start.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ difficulty: difficulty })
        })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200) {
                    const params = new URLSearchParams(window.location.search);
                    const lang = params.get('lang') || 'en';
                    window.location.href = `../game?difficulty=${difficulty}&game_id=${body.game_id}&lang=${lang}`;
                } else {
                    alert(body.message || "Eroare necunoscuta.");
                }
            })
            .catch(err => {
                console.error("Eroare:", err);
                alert("A apărut o eroare la trimiterea cererii.");
            });
    }
    document.getElementById("easyButton").addEventListener("click", function(e) {
        e.preventDefault();
        console.log("e");
        sendGameRequest("easy");
    });

    document.getElementById("normalButton").addEventListener("click", function(e) {
        e.preventDefault();
        console.log("m");
        sendGameRequest("medium");
    });

    document.getElementById("hardButton").addEventListener("click", function(e) {
        e.preventDefault();
        console.log("h");
        sendGameRequest("hard");
    });
});

function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || 'en';
}

const lang = getLangFromUrl();
let langMessages = {};

function t(key) {
    return langMessages[key] || key;
}

function loadLangMessages(cb) {
    fetch(`/front/lang/${lang}.json`)
        .then(res => res.json())
        .then(msgs => {
            langMessages = msgs;
            if(cb) cb();
        });
}

function applyTranslations() {
    const elements = [
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

    elements.forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (id === "page-title" && langMessages[key]) {
            document.title = langMessages[key];
        } else if (el && langMessages[key]) {
            el.textContent = langMessages[key];
        }
    });
}

