const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

menuCloseButton.addEventListener("click", () => menuOpenButton.click());

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = '../NotAuthorizedPage/NotAuthorized.html'
        return;
    }

    function sendGameRequest(difficulty) {
        fetch("http://localhost:8082/backend/path/to/start.php", {
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
                    console.log("Game started:", body);
                    window.location.href = `../GamePage/GamePage.html?difficulty=${difficulty}&game_id=${body.game_id}`;
                } else {
                    alert(body.message || "Eroare necunoscuta.");
                }
            })
            .catch(err => {
                console.error("Eroare:", err);
                alert("A aparut o eroare la trimiterea cererii.");
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