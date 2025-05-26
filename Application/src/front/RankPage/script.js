const players = [
    { username: "IronMan", games: 12, points: 980 },
    { username: "SpiderMan", games: 15, points: 870 },
    { username: "CaptainMarvel", games: 9, points: 920 },
    { username: "Hulk", games: 18, points: 860 },
    { username: "Thor", games: 10, points: 900 },
    { username: "BlackWidow", games: 13, points: 890 },
];

const playerList = document.getElementById("player-list");

players
    .sort((a, b) => b.points - a.points)
    .forEach((player, index) => {
        const li = document.createElement("li");
        li.className = "game-info";
        li.innerHTML = `
      <span class="col col-number">${index + 1}</span>
      <span class="col col-name">${player.username}</span>
      <span class="col col-difficulty">${player.games}</span>
      <span class="col col-points">${player.points}</span>
    `;
        playerList.appendChild(li);
    });

// Responsive menu toggle
const menuOpen = document.getElementById("menu-open-button");
const menuClose = document.getElementById("menu-close-button");
const navMenu = document.querySelector(".nav-menu");

menuOpen.addEventListener("click", () => navMenu.classList.add("show"));
menuClose.addEventListener("click", () => navMenu.classList.remove("show"));
