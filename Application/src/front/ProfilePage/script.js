const token = localStorage.getItem("token");
if(token==null){
    document.getElementById("profile").style.display = "none";
    document.getElementById("logout").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/front/NotAuthorizedPage/NotAuthorized.html";
        return;
    }

    fetchProfileData(token);
    fetchGameHistory(token);
});

function fetchProfileData(token) {
    fetch("http://localhost:8082/api/user/profile.php", {
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.message) throw new Error(data.message);

            document.querySelector(".user-name").textContent = data.username;
            document.querySelector(".rank").textContent = "#" + data.userRank;
            document.querySelector(".points").textContent = data.score + " pts";

            const heroImg = document.getElementById("hero-img");
            if(heroImg && data.hero_img) {
                heroImg.src = data.hero_img;
            }
        })
        .catch(err => {
            console.error("Failed to load profile:", err);
        });
}

function fetchGameHistory(token) {
    fetch("http://localhost:8082/api/user/game_history.php", {
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(res => res.json())
        .then(data => {
            const list = document.querySelector(".list-games");
            list.innerHTML = "";

            if (data.message) {
                const li = document.createElement("li");
                li.textContent = "No games played yet.";
                list.appendChild(li);
                return;
            }

            data.forEach((game, index) => {
                const li = document.createElement("li");
                li.classList.add("game-info");

                li.innerHTML = `
                <span class="col col-number">${index + 1}</span>
                <span class="col col-name">${game.hero_name}</span>
                <span class="col col-difficulty">${game.difficulty}</span>
                <span class="col col-points">${game.score}</span>
            `;

                list.appendChild(li);
            });
        })
        .catch(err => {
            console.error("Failed to load game history:", err);
        });
}