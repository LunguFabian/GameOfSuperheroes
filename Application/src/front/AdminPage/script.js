function parseJwt(token) {
    if (!token) return {};
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('token');
const payload = token ? parseJwt(token) : {};
if (!token || !payload.is_admin) {
    window.location.href = "/unauthorized";
}


const USERS_API_URL = '/api/admin/users.php';
const SCENARIOS_API_URL = '/api/admin/scenarios.php';
const QUESTIONS_API_URL = '/api/admin/questions.php';

function showMessage(msg, color = 'green') {
    const msgDiv = document.getElementById('message');
    msgDiv.textContent = msg;
    msgDiv.style.color = color;
    setTimeout(() => { msgDiv.textContent = ''; }, 3500);
}


function fetchUsers() {
    fetch(USERS_API_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(res => res.json())
        .then(users => {
            const tbody = document.querySelector('#usersTable tbody');
            tbody.innerHTML = '';
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.score}</td>
                <td>${user.userRank}</td>
                <td>${user.is_admin == 1 || user.is_admin === "1" ? 'Da' : 'Nu'}</td>
                <td>
                    <button class="action-btn promote-btn" ${user.is_admin == 1 || user.is_admin === "1" ? 'disabled' : ''} data-id="${user.id}">Fă admin</button>
                    <button class="action-btn delete-btn" data-id="${user.id}">Șterge</button>
                </td>
            `;
                tbody.appendChild(tr);
            });
        })
        .catch(() => showMessage('Eroare la încărcarea utilizatorilor!', 'red'));
}

function promoteUser(id) {
    fetch(USERS_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ id })
    })
        .then(res => res.json().then(data => ({status: res.status, data})))
        .then(({status, data}) => {
            if (status === 200) {
                showMessage(data.message);
                fetchUsers();
            } else {
                showMessage(data.message, 'red');
            }
        })
        .catch(() => showMessage('Eroare la promovare!', 'red'));
}

function deleteUser(id) {
    if (!confirm('Ești sigur că vrei să ștergi acest utilizator?')) return;
    fetch(USERS_API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ id })
    })
        .then(res => res.json().then(data => ({status: res.status, data})))
        .then(({status, data}) => {
            if (status === 200) {
                showMessage(data.message);
                fetchUsers();
            } else {
                showMessage(data.message, 'red');
            }
        })
        .catch(() => showMessage('Eroare la ștergere!', 'red'));
}

function fetchScenarios() {
    fetch(SCENARIOS_API_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(res => res.json())
        .then(scenarios => {
            const tbody = document.querySelector('#scenariosTable tbody');
            tbody.innerHTML = '';
            scenarios.forEach(scenario => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${scenario.id}</td>
                <td>${scenario.part1}</td>
                <td>${scenario.part2}</td>
                <td>${scenario.part3}</td>
                <td>${scenario.part4}</td>
                <td>${scenario.language}</td>
                <td>
                    <button class="action-btn delete-btn" data-id="${scenario.id}">Șterge</button>
                </td>
            `;
                tbody.appendChild(tr);
            });
        })
        .catch(() => showMessage('Eroare la încărcarea scenariilor!', 'red'));
}

function addScenario(formData) {
    fetch(SCENARIOS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(formData)
    })
        .then(res => res.json().then(data => ({status: res.status, data})))
        .then(({status, data}) => {
            if (status === 200) {
                showMessage(data.message);
                fetchScenarios();
                document.getElementById('addScenarioForm').reset();
            } else {
                showMessage(data.message, 'red');
            }
        })
        .catch(() => showMessage('Eroare la adăugarea scenariului!', 'red'));
}

function deleteScenario(id) {
    if (!confirm('Ești sigur că vrei să ștergi acest scenariu?')) return;
    fetch(SCENARIOS_API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ id })
    })
        .then(res => res.json().then(data => ({status: res.status, data})))
        .then(({status, data}) => {
            if (status === 200) {
                showMessage(data.message);
                fetchScenarios();
            } else {
                showMessage(data.message, 'red');
            }
        })
        .catch(() => showMessage('Eroare la ștergerea scenariului!', 'red'));
}

function fetchQuestions() {
    fetch(QUESTIONS_API_URL, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(res => res.json())
        .then(questions => {
            const tbody = document.querySelector('#questionsTable tbody');
            tbody.innerHTML = '';
            questions.forEach(q => {
                const options = [q.option1, q.option2, q.option3, q.option4].filter(x => !!x).join('<br>');
                let corecta = '';
                if (q.difficulty === 'easy' || q.difficulty === 'medium') {
                    corecta = q[`option${q.correct_option}`];
                } else if(q.difficulty === 'hard') {
                    corecta = q.option1;
                }
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td>${q.id}</td>
                <td>${q.question_text}</td>
                <td>${q.difficulty}</td>
                <td>${options}</td>
                <td>${corecta || '-'}</td>
                <td>${q.language}</td>
                <td>
                    <button class="action-btn delete-btn" data-id="${q.id}">Șterge</button>
                </td>
            `;
                tbody.appendChild(tr);
            });
        })
        .catch(() => showMessage('Eroare la încărcarea întrebărilor!', 'red'));
}

function addQuestion(formData) {
    fetch(QUESTIONS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(formData)
    })
        .then(res => res.json().then(data => ({status: res.status, data})))
        .then(({status, data}) => {
            if (status === 200) {
                showMessage(data.message);
                fetchQuestions();
                document.getElementById('addQuestionForm').reset();
                renderQuestionOptions(); // reset opțiuni la dificultate implicită
            } else {
                showMessage(data.message, 'red');
            }
        })
        .catch(() => showMessage('Eroare la adăugarea întrebării!', 'red'));
}

function deleteQuestion(id) {
    if (!confirm('Ești sigur că vrei să ștergi această întrebare?')) return;
    fetch(QUESTIONS_API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ id })
    })
        .then(res => res.json().then(data => ({status: res.status, data})))
        .then(({status, data}) => {
            if (status === 200) {
                showMessage(data.message);
                fetchQuestions();
            } else {
                showMessage(data.message, 'red');
            }
        })
        .catch(() => showMessage('Eroare la ștergerea întrebării!', 'red'));
}


function renderQuestionOptions() {
    const difficulty = document.getElementById('difficultySelect').value;
    const optionsDiv = document.getElementById('question-options');
    optionsDiv.innerHTML = '';

    if (difficulty === 'easy') {
        optionsDiv.innerHTML = `
            <div class="form-row">
                <label>Opțiunea 1:<input type="text" name="option1" required></label>
                <label>Opțiunea 2:<input type="text" name="option2" required></label>
            </div>
            <div class="form-row">
                <label>Care este opțiunea corectă?
                    <select name="correct_option" required>
                        <option value="1">Opțiunea 1</option>
                        <option value="2">Opțiunea 2</option>
                    </select>
                </label>
            </div>
        `;
    } else if (difficulty === 'medium') {
        optionsDiv.innerHTML = `
            <div class="form-row">
                <label>Opțiunea 1:<input type="text" name="option1" required></label>
                <label>Opțiunea 2:<input type="text" name="option2" required></label>
            </div>
            <div class="form-row">
                <label>Opțiunea 3:<input type="text" name="option3" required></label>
                <label>Opțiunea 4:<input type="text" name="option4" required></label>
            </div>
            <div class="form-row">
                <label>Care este opțiunea corectă?
                    <select name="correct_option" required>
                        <option value="1">Opțiunea 1</option>
                        <option value="2">Opțiunea 2</option>
                        <option value="3">Opțiunea 3</option>
                        <option value="4">Opțiunea 4</option>
                    </select>
                </label>
            </div>
        `;
    } else if (difficulty === 'hard') {
        optionsDiv.innerHTML = `
            <div class="form-row">
                <label>Răspuns:<input type="text" name="option1" required></label>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        showMessage('Nu ești autentificat!', 'red');
        return;
    }
    fetchUsers();
    fetchScenarios();
    fetchQuestions();

    document.querySelector('#usersTable tbody').addEventListener('click', (e) => {
        if (e.target.classList.contains('promote-btn')) {
            const id = e.target.getAttribute('data-id');
            promoteUser(Number(id));
        } else if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            deleteUser(Number(id));
        }
    });

    document.querySelector('#scenariosTable tbody').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            deleteScenario(Number(id));
        }
    });

    document.querySelector('#questionsTable tbody').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            deleteQuestion(Number(id));
        }
    });

    document.getElementById('addScenarioForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = {
            part1: form.part1.value.trim(),
            part2: form.part2.value.trim(),
            part3: form.part3.value.trim(),
            part4: form.part4.value.trim(),
            language: form.language.value
        };
        if (!formData.part1 || !formData.part2 || !formData.part3 || !formData.part4 || !formData.language) {
            showMessage('Completează toate câmpurile!', 'red');
            return;
        }
        addScenario(formData);
    });

    document.getElementById('difficultySelect').addEventListener('change', renderQuestionOptions);
    renderQuestionOptions(); // la inițializare

    document.getElementById('addQuestionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const difficulty = form.difficulty.value;
        const language = form.language.value;
        const question_text = form.question_text.value.trim();

        let formData = { difficulty, question_text, language };

        if (difficulty === 'hard') {
            formData.option1 = form.option1.value.trim();
            if (!formData.option1) {
                showMessage('Completează răspunsul!', 'red');
                return;
            }
        } else if (difficulty === 'easy') {
            formData.option1 = form.option1.value.trim();
            formData.option2 = form.option2.value.trim();
            formData.correct_option = form.correct_option.value;
            if (!formData.option1 || !formData.option2 || !formData.correct_option) {
                showMessage('Completează toate câmpurile!', 'red');
                return;
            }
        } else if (difficulty === 'medium') {
            formData.option1 = form.option1.value.trim();
            formData.option2 = form.option2.value.trim();
            formData.option3 = form.option3.value.trim();
            formData.option4 = form.option4.value.trim();
            formData.correct_option = form.correct_option.value;
            if (!formData.option1 || !formData.option2 || !formData.option3 || !formData.option4 || !formData.correct_option) {
                showMessage('Completează toate câmpurile!', 'red');
                return;
            }
        } else {
            showMessage('Alege dificultatea!', 'red');
            return;
        }
        addQuestion(formData);
    });
});