const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userData = {
        username: usernameInput.value,
        password: passwordInput.value,
    }

    try{
        const response = await fetch('http://localhost:8082/api/auth/login.php', {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('token', result.token);
            alert('Login successfully!');
            window.location.href='/home';

        }else
        {
            alert(result.message||'Login failed.');
        }
    }catch(err){
        console.log('Error:',err);
        alert('An error occurred while logging in.');
    }
})