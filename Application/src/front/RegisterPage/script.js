const form = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (passwordInput.value !== confirmPasswordInput.value) {
        alert('Passwords do not match!');
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
            alert('User registered successfully!');
            window.location.href = '/login';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while registering.');
    }
});

const TRANSLATABLE_IDS = [
    ["page-title", "title-register"],
    ["register-title", "register"],
    ["username-input", "username"],
    ["email-input", "email"],
    ["password-input", "password"],
    ["confirm-password-input", "confirm_password"],
    ["register-btn", "register"],
    ["already-account-text", "already_account"],
    ["login-link", "login"]
];

let lang = localStorage.getItem("lang") || "en";
document.getElementById("lang-select").value = lang;

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

applyTranslations();

document.getElementById("lang-select").addEventListener("change", function() {
    localStorage.setItem("lang", this.value);
    location.reload();
});