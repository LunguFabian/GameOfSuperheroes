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
            if (heroImg && data.hero_img) {
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

document.addEventListener("DOMContentLoaded", () => {
    const changeHeroBtn = document.getElementById("change-hero-btn");
    const heroModal = document.getElementById("heroModal");
    const closeBtn = document.querySelector(".close-btn");
    const heroList = document.getElementById("heroList");

    changeHeroBtn.addEventListener("click", async () => {
        heroModal.classList.remove("hidden");
        heroList.innerHTML = "<p>Loading heroes...</p>";

        try {
            const response = await fetch("http://localhost:8082/api/hero/all_heroes.php", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            });

            if (!response.ok) throw new Error("Failed to fetch heroes");

            const data = await response.json();
            const heroes = data.heroes;

            if (!heroes || heroes.length === 0) {
                heroList.innerHTML = "<p>No heroes available.</p>";
                return;
            }

            heroList.innerHTML = "";
            heroes.forEach(hero => {
                const heroDiv = document.createElement("div");
                heroDiv.classList.add("hero-option");

                heroDiv.innerHTML = `
        <img src="${hero.image_url}" alt="${hero.name}" class="hero-little-img">
        <span class="hero-name">${hero.name}</span>
    `;

                heroDiv.addEventListener("click", async () => {
                    try {
                        const updateResponse = await fetch("http://localhost:8082/api/user/hero.php", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + localStorage.getItem("token")
                            },
                            body: JSON.stringify({
                                heroId: hero.id
                            })
                        });

                        const result = await updateResponse.json();

                        if (!updateResponse.ok) {
                            alert("Eroare la schimbarea eroului: " + result.message);
                            return;
                        }

                        alert("Erou actualizat cu succes: " + hero.name);

                        const nameElem = document.getElementById("currentHeroName");
                        const imgElem = document.getElementById("currentHeroImg");
                        if (nameElem) nameElem.textContent = hero.name;
                        if (imgElem) imgElem.src = hero.image_url;

                        heroModal.classList.add("hidden");
                        location.reload();
                    } catch (error) {
                        console.error("Eroare la update:", error);
                        alert("A apărut o eroare la schimbarea eroului.");
                    }
                });

                heroList.appendChild(heroDiv);
            });

        } catch (error) {
            console.error("Error fetching heroes:", error);
            heroList.innerHTML = "<p style='color: red;'>Error loading heroes.</p>";
        }
    });

    closeBtn.addEventListener("click", () => {
        heroModal.classList.add("hidden");
    });

    heroModal.addEventListener("click", (e) => {
        if (e.target === heroModal) {
            heroModal.classList.add("hidden");
        }
    });
});

document.getElementById('editProfileModal').classList.add('hidden');
document.addEventListener('DOMContentLoaded', function () {

    const editProfileBtn = document.querySelector('.profile-button');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeEditProfileModal = document.getElementById('closeEditProfileModal');

    editProfileBtn.addEventListener('click', function () {
        editProfileModal.classList.remove('hidden');
    });

    closeEditProfileModal.addEventListener('click', function () {
        editProfileModal.classList.add('hidden');
    });
});


document.getElementById('save-username-btn').addEventListener('click', async function () {
    const newUsername = document.getElementById('new-username').value.trim();
    const password = document.getElementById('current-password-username').value;
    const token = localStorage.getItem('token');

    if (!token) {
        showEditProfileMessage("Nu esti autentificat(a)!");
        return;
    }

    if (!newUsername || !password) {
        showEditProfileMessage("Completează noul username și parola curentă!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8082/api/user/username.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                newUsername: newUsername,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            showEditProfileMessage(data.message, response.ok);
            document.getElementById('editProfileModal').classList.add('hidden');
        } else {
            showEditProfileMessage(data.message);
        }
    } catch (error) {
        showEditProfileMessage(error.message);
    }
});

document.getElementById('save-email-btn').addEventListener('click', async function () {
    const newEmail = document.getElementById('new-email').value.trim();
    const password = document.getElementById('current-password-email').value;
    const token = localStorage.getItem('token');

    if (!token) {
        showEditProfileMessage("Nu esti autentificat(a)!");
        return;
    }

    if (!newEmail || !password) {
        showEditProfileMessage("Completeaza noul email și parola curenta!");
        return;
    }

    if (!isValidEmail(newEmail)) {
        showEditProfileMessage("Emailul nu este valid!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8082/api/user/email.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                newEmail: newEmail,
                password: password
            })
        });

        const data = await response.json();

        showEditProfileMessage(data.message, response.ok);
        if (response.ok) {
            setTimeout(() => {
                document.getElementById('editProfileModal').classList.add('hidden');
            }, 2000);
        }
    } catch (error) {
        showEditProfileMessage("Eroare la conectarea cu serverul!");
    }
});

document.getElementById('save-password-btn').addEventListener('click', async function () {
    const newPassword = document.getElementById('new-password').value;
    const oldPassword = document.getElementById('current-password-password').value;
    const token = localStorage.getItem('token');

    if (!token) {
        showEditProfileMessage("Nu esti autentificat(a)!");
        return;
    }

    if (!newPassword || !oldPassword) {
        showEditProfileMessage("Completează noua parolă și parola curentă!");
        return;
    }

    if (newPassword.length < 8) {
        showEditProfileMessage("Parola nouă trebuie să aibă cel puțin 8 caractere!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8082/api/user/password.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                newPassword: newPassword,
                oldPassword: oldPassword
            })
        });

        const data = await response.json();

        showEditProfileMessage(data.message, response.ok);
        if (response.ok) {
            setTimeout(() => {
                document.getElementById('editProfileModal').classList.add('hidden');
            }, 1200);
        }
    } catch (error) {
        showEditProfileMessage("Eroare la conectarea cu serverul!");
    }
});

function showEditProfileMessage(msg, isSuccess = false) {
    const msgDiv = document.getElementById('edit-profile-message');
    msgDiv.textContent = msg;
    msgDiv.className = 'edit-profile-message' + (isSuccess ? ' success' : '');
    msgDiv.style.display = 'block';
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 3500);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

const menuOpenButton = document.querySelector("#menu-open-button");
console.log("aici");
menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})

if(token==null) {
    document.getElementById("profile").style.display = "none";
    document.getElementById("logout").style.display = "none";
}

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});

