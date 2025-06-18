const textBox = document.getElementById('storyText');
const continueBtn = document.getElementById('continueBtn');
const quizBox = document.getElementById('quiz');
const nextBtn = document.getElementById('nextBtn');
const inputAnswer = document.getElementById('input-answer');
const multipleOptions = document.getElementById('multiple-options');
const answerOptions = document.querySelectorAll('.quiz-option');
const popup = document.getElementById('gameOverPopup');

let difficultyGame;
let i = 0;
const params = new URLSearchParams(window.location.search);
const gameId = params.get("game_id");
const token = localStorage.getItem("token");

let storyParts = [];
let currentPart = 0;
let currentQuestionIndex = 0;
let questions = [];
let selectedAnswer = null;

popup.style.display = 'none';
quizBox.style.display = 'none';

function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || 'en';
}
const lang = getLangFromUrl();
let langMessages = {};

function t(key) {
    return langMessages[key] || key;
}

function loadLangMessages(cb) {
    fetch(`/front/lang/${lang}.json`)
        .then(res => res.json())
        .then(msgs => {
            langMessages = msgs;
            if (cb) cb();
        });
}

function applyTranslations() {
    const elements = [
        ["page-title", "game_page_title"],
        ["game-title", "superheroes_game_title"],
        ["continueBtn", "continue"],
        ["question-label", "question"],
        ["option-1", "answer_1"],
        ["option-2", "answer_2"],
        ["option-3", "answer_3"],
        ["option-4", "answer_4"],
        ["textAnswer", "input_placeholder", true],
        ["nextBtn", "next"],
        ["gameover-title", "game_over"],
        ["score-label", "your_score"],
        ["redirect-label", "redirect"],
        ["seconds-label", "seconds"],
        ["playAgainBtn", "play_again"]
    ];

    elements.forEach(([id, key, isPlaceholder]) => {
        const el = document.getElementById(id);
        if (id === "page-title" && langMessages[key]) {
            document.title = langMessages[key];
        } else if (el && langMessages[key]) {
            if (isPlaceholder) {
                el.placeholder = langMessages[key];
            } else {
                el.textContent = langMessages[key];
            }
        }
    });
}

function initGameLogic() {
    fetch(`http://localhost:8082/api/game/game.php?id=${gameId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            if (!data || !data.scenario || !data.questions) {
                alert(t("game_data_error") || "Eroare la primirea datelor jocului.");
                return;
            }

            storyParts = Object.values(data.scenario);
            questions = data.questions;
            typeStory(storyParts[currentPart]);
            configureDifficultyUI(data.difficulty);
            difficultyGame = data.difficulty;
        })
        .catch(err => {
            console.error("Eroare la fetch:", err);
            alert(t("game_load_error") || "Nu s-a putut incarca jocul.");
        });
}

function configureDifficultyUI(difficulty) {
    const option3 = document.getElementById("option-3");
    const option4 = document.getElementById("option-4");
    const multipleOptions = document.getElementById("multiple-options");
    const inputAnswer = document.getElementById("input-answer");

    document.getElementById("difficultyDisplay").textContent = "Dificultate: " + difficulty;

    if (difficulty === "easy") {
        if (option3) option3.style.display = "none";
        if (option4) option4.style.display = "none";
        if (multipleOptions) multipleOptions.style.display = "block";
        if (inputAnswer) inputAnswer.style.display = "none";
    } else if (difficulty === "medium") {
        if (option3) option3.style.display = "block";
        if (option4) option4.style.display = "block";
        if (multipleOptions) multipleOptions.style.display = "block";
        if (inputAnswer) inputAnswer.style.display = "none";
    } else if (difficulty === "hard") {
        if (multipleOptions) multipleOptions.style.display = "none";
        if (inputAnswer) inputAnswer.style.display = "block";
    }
}

function typeStory(text) {
    let i = 0;
    textBox.textContent = '';
    function typeChar() {
        if (i < text.length) {
            textBox.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, 20);
        } else {
            continueBtn.style.display = 'inline-block';
        }
    }
    typeChar();
}

continueBtn.addEventListener('click', () => {
    continueBtn.style.display = 'none';
    textBox.style.display = 'none';
    quizBox.style.display = 'block';

    if (currentQuestionIndex < questions.length) {
        populateQuiz(currentQuestionIndex);
    } else {
        currentPart++;

        if (currentPart === 3) {
            continueBtn.textContent = t("finish") || "Finish";
        }

        if (currentPart < storyParts.length) {
            textBox.style.display = 'block';
            typeStory(storyParts[currentPart]);
        } else {
            fetch(`http://localhost:8082/api/user/score_rank.php?id=${gameId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    document.getElementById('quiz').style.display = 'none';
                    let score = data.added_score;
                    showGameOverPopup(score);
                })
                .catch(err => {
                    alert(t("score_update_error") || "A aparut o eroare la actualizarea scorului.");
                });
        }
    }
});

function populateQuiz(index) {
    const question = questions[index];
    const questionParagraph = document.querySelector('#quiz p');
    questionParagraph.innerHTML = `<strong>${t("question") || "Întrebare"} ${index + 1}:</strong> ${question.text}`;

    if (question.options) {
        const options = question.options;
        answerOptions.forEach((opt, i) => {
            opt.textContent = options[i] || '';
            opt.style.display = options[i] ? 'block' : 'none';
        });
    }
}

answerOptions.forEach(option => {
    option.addEventListener('click', () => {
        answerOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedAnswer = option.textContent;
    });
});

nextBtn.addEventListener('click', () => {
    const question = questions[currentQuestionIndex];
    let answer;

    if (difficultyGame === 'hard') {
        answer = document.getElementById("textAnswer").value;
    } else {
        answer = selectedAnswer;
    }

    if (!answer) {
        alert(t("select_or_enter_answer") || "Selecteaza sau introdu un raspuns!");
        return;
    }

    fetch('http://localhost:8082/api/game/answer.php', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            game_id: gameId,
            question_id: question.id,
            answer: answer
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.is_correct) {
                alert(t("correct") + " " + (t("current_score") || "Scor curent:") + " " + data.score);
            } else {
                alert(t("wrong") || "❌ Gresit!");
            }

            currentPart++;
            currentQuestionIndex++;

            if (currentPart < storyParts.length) {
                typeStory(storyParts[currentPart]);
            }

            quizBox.style.display = 'none';
            textBox.style.display = 'block';
            textBox.textContent = '';
            selectedAnswer = null;
            document.getElementById("textAnswer").value = '';
            answerOptions.forEach(opt => opt.classList.remove('selected'));
        })
        .catch(err => {
            alert(t("answer_check_error") || "A aparut o eroare la verificarea raspunsului.");
        });
});

function showGameOverPopup(finalScore) {
    const scoreElem = document.getElementById('finalScore');
    const timerElem = document.getElementById('popupTimer');
    const playAgainBtn = document.getElementById('playAgainBtn');
    let timeLeft = 15;

    scoreElem.textContent = finalScore;
    popup.style.display = 'flex';

    timerElem.textContent = timeLeft;
    const interval = setInterval(() => {
        timeLeft--;
        timerElem.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            window.location.href = "/home";
        }
    }, 1000);

    playAgainBtn.onclick = () => {
        clearInterval(interval);
        window.location.href = `/difficulty?lang=${lang}`;
    };
}

document.addEventListener("DOMContentLoaded", function () {
    loadLangMessages(() => {
        applyTranslations();
        initGameLogic();
    });
});