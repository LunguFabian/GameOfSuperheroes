const TRANSLATABLE_IDS = [
    ["page-title", "player_rank_title"],
    ["site-title", "title"],
    ["rss-link", "rss"],
    ["rank-link", "rank"],
    ["about-link", "about"],
    ["profile-link", "profile"],
    ["logout-btn", "logout"],
    ["player-rank-title", "player_rank_title"],
    ["col-number", "number_sign"],
    ["col-username", "username"],
    ["col-points", "points"]
];
const token = localStorage.getItem("token");
const playerList = document.getElementById('player-list');
const menuOpenButton = document.querySelector("#menu-open-button");

let lang = localStorage.getItem("lang") || "en";
document.getElementById("lang-select").value = lang;
applyTranslations();

if (token == null) {
    document.getElementById("profile").style.display = "none";
    document.getElementById("logout").style.display = "none";
}

document.addEventListener("DOMContentLoaded", async function () {
    playerList.innerHTML = '<li>Loading...</li>';

    try {
        const response = await fetch('/api/user/leaderboard.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            playerList.innerHTML = `<li>Could not load ranking (${response.status})</li>`;
            return;
        }

        const ranking = await response.json();

        if (!Array.isArray(ranking) || ranking.length === 0) {
            playerList.innerHTML = '<li>No ranking found!</li>';
            return;
        }

        playerList.innerHTML = '';
        ranking.forEach((player, idx) => {
            playerList.innerHTML += `
                <li class="game-info">
                    <span class="col col-number">${idx + 1}</span>
                    <span class="col col-name">${player.username}</span>
                    <span class="col col-points">${player.score}</span>
                </li>
            `;
        });
    } catch (err) {
        playerList.innerHTML = '<li>Error 500</li>';
    }
});

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});
document.getElementById("lang-select").addEventListener("change", function () {
    localStorage.setItem("lang", this.value);
    location.reload();
});

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
});

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