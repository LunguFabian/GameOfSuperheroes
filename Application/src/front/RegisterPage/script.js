const TRANSLATABLE_IDS = [
    ["page-title", "title-register"],
    ["register-title", "register"],
    ["username", "username"],
    ["email", "email"],
    ["password", "password"],
    ["confirmPassword", "confirm_password"],
    ["register-btn", "register"],
    ["already-account-text", "already_account"],
    ["login-link", "login"]
];
const form = document.getElementById('registerForm');
const usernameInput = document.getElementById('username-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const confirmPasswordInput = document.getElementById('confirm-password-input');
const langSelect = document.getElementById("lang-select");

let transMessages = {};
let lang = localStorage.getItem("lang") || "en";
document.getElementById("lang-select").value = lang;

langSelect.value = lang;

applyTranslations();

function applyTranslations() {
    fetch(`/front/lang/${lang}.json`)
        .then(res => res.json())
        .then(messages => {
            transMessages=messages;
            TRANSLATABLE_IDS.forEach(([elId, key]) => {
                const el = document.getElementById(elId);
                if (el && messages[key]) {
                    if (el.tagName === "TITLE" || elId === "page-title") {
                        el.textContent = messages[key];
                        document.title = messages[key];
                    } else if (el.tagName === "INPUT") {
                        el.placeholder = messages[key];
                    } else if (elId === "already-account-text") {
                        el.childNodes[0].nodeValue = messages[key] + " ";
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

function showCustomPopup(message, duration = 3000) {
    const popup = document.getElementById('customPopup');
    const msgElem = document.getElementById('customPopupMessage');

    msgElem.textContent = message;
    popup.style.display = 'flex';

    if (duration > 0) {
        setTimeout(() => {
            popup.style.display = 'none';
        }, duration);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

        if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            return;
        }

        console.log(regex.test(passwordInput.value.length) + " " + passwordInput.value);
        if (passwordInput.value.length < 8) {
            showCustomPopup(t("error_password_min8char"));
            return;
        }

        console.log(regex.test(passwordInput.value) + " " + passwordInput.value);
        if (!regex.test(passwordInput.value)) {
            showCustomPopup(t("error_password_8char"));
            return
        }

        if (passwordInput.value !== confirmPasswordInput.value) {
            showCustomPopup(t("error_mismatch_passwords"));
            return;
        }
            const userData = {
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            };

            try {
                const response = await fetch('/api/auth/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const result = await response.json();

                if (response.ok) {
                    showCustomPopup(t("user_registered_success"));
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    showCustomPopup(t("error") + " " + t(result.message));
                }
            } catch (error) {
                showCustomPopup(t("error") + " " + 500);
           }
    });
});

langSelect.addEventListener("change", function () {
    localStorage.setItem("lang", this.value);
    location.reload();
});