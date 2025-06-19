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

let lang = localStorage.getItem("lang") || "ro";
let langMessages = {};

function loadLangMessages() {
    return fetch(`/front/lang/${lang}.json`)
        .then(res => res.json())
        .then(msgs => { langMessages = msgs; });
}
function t(key) {
    return langMessages[key] || key;
}

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
                <td>${user.is_admin == 1 || user.is_admin === "1" ? t('yes') : t('no')}</td>
                <td>
                    <button class="action-btn promote-btn" ${user.is_admin == 1 || user.is_admin === "1" ? 'disabled' : ''} data-id="${user.id}">${t('make_admin')}</button>
                    <button class="action-btn delete-btn" data-id="${user.id}">${t('delete')}</button>
                </td>
            `;
                tbody.appendChild(tr);
            });
        })
        .catch(() => showMessage(t('error_loading_users'), 'red'));
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
        .catch(() => showMessage(t('error_promote'), 'red'));
}

function deleteUser(id) {
    if (!confirm(t('confirm_delete_user'))) return;
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
        .catch(() => showMessage(t('error_delete'), 'red'));
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
                    <button class="action-btn delete-btn" data-id="${scenario.id}">${t('delete')}</button>
                </td>
            `;
                tbody.appendChild(tr);
            });
        })
        .catch(() => showMessage(t('error_loading_scenarios'), 'red'));
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
        .catch(() => showMessage(t('error_add_scenario'), 'red'));
}

function deleteScenario(id) {
    if (!confirm(t('confirm_delete_scenario'))) return;
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
        .catch(() => showMessage(t('error_delete_scenario'), 'red'));
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
                    <button class="action-btn delete-btn" data-id="${q.id}">${t('delete')}</button>
                </td>
            `;
                tbody.appendChild(tr);
            });
        })
        .catch(() => showMessage(t('error_loading_questions'), 'red'));
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
                renderQuestionOptions();
            } else {
                showMessage(data.message, 'red');
            }
        })
        .catch(() => showMessage(t('error_add_question'), 'red'));
}

function deleteQuestion(id) {
    if (!confirm(t('confirm_delete_question'))) return;
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
        .catch(() => showMessage(t('error_delete_question'), 'red'));
}

function renderQuestionOptions() {
    const difficulty = document.getElementById('difficultySelect').value;
    const optionsDiv = document.getElementById('question-options');
    optionsDiv.innerHTML = '';

    if (difficulty === 'easy') {
        optionsDiv.innerHTML = `
            <div class="form-row">
                <label>${t('option1')}<input type="text" name="option1" required></label>
                <label>${t('option2')}<input type="text" name="option2" required></label>
            </div>
            <div class="form-row">
                <label>${t('which_is_correct')}
                    <select name="correct_option" required>
                        <option value="1">${t('option1')}</option>
                        <option value="2">${t('option2')}</option>
                    </select>
                </label>
            </div>
        `;
    } else if (difficulty === 'medium') {
        optionsDiv.innerHTML = `
            <div class="form-row">
                <label>${t('option1')}<input type="text" name="option1" required></label>
                <label>${t('option2')}<input type="text" name="option2" required></label>
            </div>
            <div class="form-row">
                <label>${t('option3')}<input type="text" name="option3" required></label>
                <label>${t('option4')}<input type="text" name="option4" required></label>
            </div>
            <div class="form-row">
                <label>${t('which_is_correct')}
                    <select name="correct_option" required>
                        <option value="1">${t('option1')}</option>
                        <option value="2">${t('option2')}</option>
                        <option value="3">${t('option3')}</option>
                        <option value="4">${t('option4')}</option>
                    </select>
                </label>
            </div>
        `;
    } else if (difficulty === 'hard') {
        optionsDiv.innerHTML = `
            <div class="form-row">
                <label>${t('answer')}<input type="text" name="option1" required></label>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadLangMessages().then(() => {

        const TRANSLATABLE_IDS = [
            ["page-title", "admin"],
            ["users-title", "users"],
            ["th-id", "id"],
            ["th-username", "username"],
            ["th-email", "email"],
            ["th-score", "score"],
            ["th-rank", "rank"],
            ["th-admin", "admin_label"],
            ["th-actions-users", "actions"],
            ["scenarios-title", "scenarios"],
            ["label-part1", "part1"],
            ["label-part2", "part2"],
            ["label-part3", "part3"],
            ["label-part4", "part4"],
            ["label-language-scenarios", "language"],
            ["option-choose-language", "choose_language"],
            ["add-scenario-btn", "add_scenario"],
            ["th-scenario-id", "id"],
            ["th-part1", "part1"],
            ["th-part2", "part2"],
            ["th-part3", "part3"],
            ["th-part4", "part4"],
            ["th-scenario-language", "language"],
            ["th-actions-scenarios", "actions"],
            ["questions-title", "questions"],
            ["label-question-text", "question_text"],
            ["label-difficulty", "difficulty"],
            ["option-choose-difficulty", "choose"],
            ["option-easy", "easy"],
            ["option-medium", "medium"],
            ["option-hard", "hard"],
            ["label-language-questions", "language"],
            ["add-question-btn", "add_question"],
            ["th-question-id", "id"],
            ["th-question-text", "text"],
            ["th-question-difficulty", "difficulty"],
            ["th-question-options", "options"],
            ["th-question-correct", "correct"],
            ["th-question-language", "language"],
            ["th-actions-questions", "actions"]
        ];

        TRANSLATABLE_IDS.forEach(([elId, key]) => {
            const el = document.getElementById(elId);
            if (el && langMessages[key]) {
                if (el.tagName === "TITLE") {
                    el.textContent = langMessages[key];
                    document.title = langMessages[key];
                } else if (el.tagName === "LABEL") {
                    let children = Array.from(el.childNodes);
                    for (let c of children) {
                        if (c.nodeType === 3) {
                            c.nodeValue = langMessages[key] + (c.nodeValue.match(/:$/) ? ':' : '');
                            break;
                        }
                    }
                } else if (el.tagName === "OPTION" || el.tagName === "BUTTON" || el.tagName === "TH" || el.tagName === "H1") {
                    el.textContent = langMessages[key];
                } else {
                    el.textContent = langMessages[key];
                }
            }
        });

        document.getElementById("lang-select").addEventListener("change", function () {
            localStorage.setItem("lang", this.value);
            location.reload();
        });

        if (!token) {
            showMessage(t('not_authenticated'), 'red');
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
                showMessage(t('fill_all_fields'), 'red');
                return;
            }
            addScenario(formData);
        });

        document.getElementById('difficultySelect').addEventListener('change', renderQuestionOptions);
        renderQuestionOptions();

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
                    showMessage(t('fill_answer'), 'red');
                    return;
                }
            } else if (difficulty === 'easy') {
                formData.option1 = form.option1.value.trim();
                formData.option2 = form.option2.value.trim();
                formData.correct_option = form.correct_option.value;
                if (!formData.option1 || !formData.option2 || !formData.correct_option) {
                    showMessage(t('fill_all_fields'), 'red');
                    return;
                }
            } else if (difficulty === 'medium') {
                formData.option1 = form.option1.value.trim();
                formData.option2 = form.option2.value.trim();
                formData.option3 = form.option3.value.trim();
                formData.option4 = form.option4.value.trim();
                formData.correct_option = form.correct_option.value;
                if (!formData.option1 || !formData.option2 || !formData.option3 || !formData.option4 || !formData.correct_option) {
                    showMessage(t('fill_all_fields'), 'red');
                    return;
                }
            } else {
                showMessage(t('choose_difficulty'), 'red');
                return;
            }
            addQuestion(formData);
        });
    });
});