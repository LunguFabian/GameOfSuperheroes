const form = document.getElementById('registerForm');
const usernameInput = document.getElementById('username-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const confirmPasswordInput = document.getElementById('confirm-password-input');
const langSelect = document.getElementById("lang-select");

let lang = localStorage.getItem("lang") || "en";
langSelect.value = lang;

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

function applyTranslations() {
    fetch(`/front/lang/${lang}.json`)
        .then(res => res.json())
        .then(messages => {
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
    applyTranslations();

    langSelect.addEventListener("change", function () {
        localStorage.setItem("lang", this.value);
        location.reload();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error('One or more form fields are missing from the DOM!');
            return;
        }


            if (passwordInput.value !== confirmPasswordInput.value) {
                showCustomPopup('Passwords do not match!');
                return;
            }

            const userData = {
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            };

            try {
                const response = await fetch('http://localhost:8082/api/auth/register.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const result = await response.json();

                if (response.ok) {
                    showCustomPopup('User registered successfully!');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    showCustomPopup('Error: ' + (result.message || 'Registration failed.'));
                }
            } catch (error) {
                console.error('Error:', error);
                showCustomPopup('An error occurred while registering.');
            }
    });
});