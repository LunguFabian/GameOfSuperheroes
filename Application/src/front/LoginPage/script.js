const TRANSLATABLE_IDS = [
    ["page-title", "login_form_title"],
    ["login-title", "login"],
    ["username-input", "username"],
    ["password-input", "password"],
    ["login-btn", "login"],
    ["not-registered-text", "not_registered"],
    ["create-account-link", "create_account"]
];
const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
let lang = localStorage.getItem("lang") || "en";

applyTranslations();

function showCustomPopup(message, duration = 5000) {
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
                    } else if (elId === "not-registered-text") {
                        el.childNodes[0].nodeValue = messages[key] + " ";
                    } else {
                        el.textContent = messages[key];
                    }
                }
            });
        });
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userData = {
        username: usernameInput.value,
        password: passwordInput.value,
    }

    try{
        const response = await fetch('/api/auth/login.php', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            window.location.href='/home';

        }else
        {
            showCustomPopup(result.message||'Login failed');
        }
    }catch(err){
        console.log('Error:',err);
        showCustomPopup('An error occurred while logging in');
    }
})


document.getElementById("lang-select").addEventListener("change", function() {
    localStorage.setItem("lang", this.value);
    location.reload();
});

document.getElementById("lang-select").value = lang;
