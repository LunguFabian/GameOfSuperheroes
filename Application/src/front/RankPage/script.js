document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token");
    if(token == null){
        document.getElementById("profile").style.display = "none";
        document.getElementById("logout").style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '<li>Loading...</li>';

    try {
       const response = await fetch('http://localhost:8082/api/user/leaderboard.php', {
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
        console.log(err.message);
        playerList.innerHTML = '<li>Eroare la conectarea cu serverul!</li>';
    }

    const menuOpenButton = document.querySelector("#menu-open-button");
    menuOpenButton.addEventListener("click", () => {
        document.body.classList.toggle("show-mobile-menu");
    })
});
