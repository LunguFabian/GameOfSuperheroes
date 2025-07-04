const TRANSLATABLE_IDS = [
    ["page-title", "game_title"],
    ["game-title", "subtitle"],
    ["continueBtn", "continue"],
    ["question-label", "question"],
    ["option-1", "answer1"],
    ["option-2", "answer2"],
    ["option-3", "answer3"],
    ["option-4", "answer4"],
    ["textAnswer", "answer_placeholder"],
    ["nextBtn", "next"],
    ["gameover-title", "game_over"],
    ["score-label", "your_score"],
    ["redirect-label", "redirect_in"],
    ["seconds-label", "seconds"],
    ["playAgainBtn", "play_again"]
];
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
let lang = getLangFromUrl();
let transMessages = {};

popup.style.display = 'none';
quizBox.style.display = 'none';

if (!token || isJwtExpired(token) || gameId==null) {
   window.location.href = "/unauthorized";
}

applyTranslations();

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

function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || 'en';
}

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
                    } else if (elId === "textAnswer") {
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
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function configureDifficultyUI(difficulty) {
    const thirdOption = document.getElementById("third-option");
    const fourthOption = document.getElementById("fourth-option");

    fetch(`/front/lang/${lang}.json`)
        .then(res => res.json())
        .then(messages => {
            document.getElementById("difficultyDisplay").textContent = t("difficulty") + ": " + messages[difficulty];
        });

    if (difficulty === "easy") {
        if (thirdOption) thirdOption.style.display = "none";
        if (fourthOption) fourthOption.style.display = "none";
        multipleOptions.style.display = "block";
        inputAnswer.style.display = "none";
    } else if (difficulty === "medium") {
        if (thirdOption) thirdOption.style.display = "block";
        if (fourthOption) fourthOption.style.display = "block";
        multipleOptions.style.display = "block";
        inputAnswer.style.display = "none";
    } else if (difficulty === "hard") {
        multipleOptions.style.display = "none";
        inputAnswer.style.display = "block";
    }
}

function typeStory(text) {
    let i = -1;
    textBox.textContent = ' ';
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
function populateQuiz(index) {
    const question = questions[index];
    const questionParagraph = document.querySelector('#quiz p');
    questionParagraph.innerHTML = `<strong>${t("question")} ${index + 1}:</strong> ${question.text}`;

    if (question.options) {
        const options = question.options;
        answerOptions.forEach((opt, i) => {
            opt.textContent = options[i] || '';
            opt.style.display = options[i] ? 'block' : 'none';
        });
    }
}

function setCharacterImages(villainImgUrl, heroImgUrl) {
    const heroImage = document.getElementById('heroImage');
    const villainImage = document.getElementById('villainImage');
    heroImage.src = heroImgUrl;
    villainImage.src = villainImgUrl;
}

answerOptions.forEach(option => {
    option.addEventListener('click', () => {
        answerOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedAnswer = option.textContent;
    });
});

document.addEventListener("DOMContentLoaded", () => {
    fetch(`/api/game/game.php?id=${gameId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            if (!data || !data.scenario || !data.questions) {
                showCustomPopup(t("error"));
                return;
            }
            storyParts = Object.values(data.scenario);
            questions = data.questions;
            typeStory(storyParts[currentPart]);
            configureDifficultyUI(data.difficulty);
            setCharacterImages(data.villain_image, data.hero_image);
            difficultyGame = data.difficulty;
        })
        .catch(err => {
            console.error(t("error_500"), err);
        });
});

continueBtn.addEventListener('click', () => {
    continueBtn.style.display = 'none';
    textBox.style.display = 'none';
    quizBox.style.display = 'block';

    if (currentQuestionIndex < questions.length) {
        populateQuiz(currentQuestionIndex);
    } else {
        currentPart++;

        if (currentPart === 3) {
            continueBtn.textContent = t("final");
        }

        if (currentPart < storyParts.length) {
            textBox.style.display = 'block';
            typeStory(storyParts[currentPart]);
        } else {
            fetch(`/api/user/score_rank.php?id=${gameId}`, {
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
                    showCustomPopup(t(err.message));
                });
        }
    }
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
        showCustomPopup(t("select_or_type_answer"));
        return;
    }

    fetch('/api/game/answer.php', {
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
                showCustomPopup(t("correct_answer_with_score") + data.score, 5000);
            } else {
                showCustomPopup(t("wrong_answer"));
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
            showCustomPopup(t(err.message));
        });
});