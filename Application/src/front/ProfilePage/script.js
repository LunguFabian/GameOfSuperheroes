const token = localStorage.getItem("token");
const menuOpenButton = document.querySelector("#menu-open-button");
const TRANSLATABLE_IDS = [["page-title", "profile_title"],
    ["site-title", "title"],
    ["rss-link", "rss"],
    ["rank-link", "rank"],
    ["about-link", "about"],
    ["profile-link", "profile"],
    ["logout-btn", "logout"],
    ["edit-profile-btn", "edit_profile"],
    ["change-hero-btn", "change_hero"],
    ["profile-username-label", "username"],
    ["user-rank-label", "user_rank"],
    ["user-points-label", "user_points"],
    ["game-history-title", "game_history"],
    ["col-number", "number_sign"],
    ["col-hero-name", "hero_name"],
    ["col-difficulty", "difficulty"],
    ["col-points", "points"],
    ["select-hero-title", "select_hero"],
    ["edit-profile-title", "edit_profile"],
    ["change-username-label", "change_username"],
    ["save-username-btn", "change_username"],
    ["change-email-label", "change_email"],
    ["save-email-btn", "change_email"],
    ["change-password-label", "change_password"],
    ["save-password-btn", "change_password"]];
let lang = localStorage.getItem("lang") || "en";
let transMessages = {};

document.getElementById("lang-select").value = lang;
applyTranslations();

/*if (!token || isJwtExpired(token)) {
    window.location.href = "/unauthorized";
}*/

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
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function applyTranslations() {
    fetch(`/front/lang/${lang}.json`)
        .then(res => res.json())
        .then(messages => {
            transMessages=messages;
            TRANSLATABLE_IDS.forEach(([elId, key]) => {
                const el = document.getElementById(elId);
                if (el && messages[key]) {
                    if (el.tagName === "TITLE") {
                        el.textContent = messages[key];
                        document.title = messages[key];
                    } else if (el.tagName === "INPUT") {
                        el.placeholder = messages[key];
                    } else {
                        el.textContent = messages[key];
                    }
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


function fetchProfileData(token) {
    fetch("/api/user/profile.php", {
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
    fetch("/api/user/game_history.php", {
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
                li.textContent = "No games played yet";
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
            console.error("Fail:", err);
        });
}

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

document.addEventListener("DOMContentLoaded", () => {
    fetchProfileData(token);
    fetchGameHistory(token);
});

document.addEventListener("DOMContentLoaded", () => {
    const changeHeroBtn = document.getElementById("change-hero-btn");
    const heroModal = document.getElementById("heroModal");
    const closeBtn = document.querySelector(".close-btn");
    const heroList = document.getElementById("heroList");

    changeHeroBtn.addEventListener("click", async () => {
        heroModal.classList.remove("hidden");
        heroList.innerHTML = "<p>Loading heroes...</p>";

        try {
            const response = await fetch("/api/hero/all_heroes.php", {
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
                        const updateResponse = await fetch("/api/user/hero.php", {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + localStorage.getItem("token")
                            }, body: JSON.stringify({
                                heroId: hero.id
                            })
                        });

                        const result = await updateResponse.json();

                        if (!updateResponse.ok) {
                            showCustomPopup(t("error_change_hero") + result.message);
                            return;
                        }

                        showCustomPopup(t("success_change_hero") + hero.name);

                        const nameElem = document.getElementById("currentHeroName");
                        const imgElem = document.getElementById("currentHeroImg");
                        if (nameElem) nameElem.textContent = hero.name;
                        if (imgElem) imgElem.src = hero.image_url;

                        heroModal.classList.add("hidden");
                        location.reload();
                    } catch (error) {
                        showCustomPopup(t("server_error_change_hero"));
                    }
                });
                heroList.appendChild(heroDiv);
            });
        } catch (error) {
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

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});

document.getElementById("lang-select").addEventListener("change", function () {
    localStorage.setItem("lang", this.value);
    location.reload();
});

document.getElementById('save-username-btn').addEventListener('click', async function () {
    const newUsername = document.getElementById('new-username').value.trim();
    const password = document.getElementById('current-password-username').value;
    const token = localStorage.getItem('token');

    if (!newUsername || !password) {
        showEditProfileMessage(t("fill_username_password"));
        return;
    }

    try {
        const response = await fetch('/api/user/username.php', {
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
            location.reload();
        } else {
            showEditProfileMessage(data.message);
        }
    } catch (error) {
        showEditProfileMessage(t(error.message));
    }
});

document.getElementById('save-email-btn').addEventListener('click', async function () {
    const newEmail = document.getElementById('new-email').value.trim();
    const password = document.getElementById('current-password-email').value;
    const token = localStorage.getItem('token');

    if (!newEmail || !password) {
        showEditProfileMessage(t("fill_email_password"));
        return;
    }

    if (!isValidEmail(newEmail)) {
        showEditProfileMessage(t("fill_email_password"));
        return;
    }

    try {
        const response = await fetch('/api/user/email.php', {
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
        showEditProfileMessage(t(error.message));
    }
});

document.getElementById('save-password-btn').addEventListener('click', async function () {
    const newPassword = document.getElementById('new-password').value;
    const oldPassword = document.getElementById('current-password-password').value;
    const token = localStorage.getItem('token');
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

    if (!newPassword || !oldPassword) {
        showEditProfileMessage(t("fill_passwords"));
        return;
    }

    if (regex.test(newPassword)) {
        showEditProfileMessage(t("password_invalid_pattern"));
        return
    }

    if (newPassword.length < 8) {
        showEditProfileMessage(t("password_too_short"));
        return;
    }

    try {
        const response = await fetch('/api/user/password.php', {
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
        showEditProfileMessage(t(error.message));
    }
});

document.getElementById('logout-btn').addEventListener('click', function (event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/home';
});

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
})
