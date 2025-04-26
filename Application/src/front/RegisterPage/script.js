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