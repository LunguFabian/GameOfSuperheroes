const storyText = `textextextextextextextextexttextextextextextextextextexttextextextextextextextextexttextextextextextextextextexttextextextextextextextextexttextextextextextextextextext`;

let i = 0;
const textBox = document.getElementById('storyText');
const continueBtn = document.getElementById('continueBtn');
const quizBox = document.getElementById('quiz');
const nextBtn = document.getElementById('nextBtn');
const answerOptions = document.querySelectorAll('.quiz-option');
const params = new URLSearchParams(window.location.search);
const difficulty = params.get("difficulty");

document.getElementById("difficultyDisplay").textContent = "Dificultate: " + difficulty;

window.onload = () => {
    typeStory();

    const inputAnswer = document.getElementById('input-answer');
    const multipleOptions = document.getElementById('multiple-options');
    const thirdOption = document.getElementById('third-option');

    if (difficulty === "easy") {
        thirdOption.style.display = "none";
        multipleOptions.style.display = "block";
        inputAnswer.style.display = "none";
    } else if (difficulty === "normal") {
        thirdOption.style.display = "block";
        multipleOptions.style.display = "block";
        inputAnswer.style.display = "none";
    } else if (difficulty === "hard") {
        multipleOptions.style.display = "none";
        inputAnswer.style.display = "block";
    }
};

function typeStory() {
    if (i < storyText.length) {
        textBox.textContent += storyText.charAt(i);
        i++;
        if(i%40===0) textBox.textContent += '\n';
        setTimeout(typeStory, 40);
    } else {
        continueBtn.style.display = 'inline-block';
    }
}

document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && i < storyText.length) {
        e.preventDefault();
        textBox.textContent = storyText;
        i = storyText.length;
        continueBtn.style.display = 'inline-block';
    }
});

continueBtn.addEventListener('click', () => {
    textBox.style.display = 'none';
    continueBtn.style.display = 'none';
    quizBox.style.display = 'block';
});

answerOptions.forEach(option => {
    option.addEventListener('click', () => {
        answerOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedAnswer = option.textContent;
    });
});

nextBtn.addEventListener('click', () => {
    quizBox.style.display = 'none';
    textBox.style.display = 'block';
    textBox.textContent = '';
    i = 0;
    selectedAnswer = null;
    answerOptions.forEach(opt => opt.classList.remove('selected'));
    typeStory();
});

const params = new URLSearchParams(window.location.search);
const gameId = params.get("game_id");
const difficulty = params.get("difficulty");
const token = localStorage.getItem("token");

document.getElementById("difficultyDisplay").textContent = "Dificultate: " + difficulty;

let storyParts = [];
let currentPart = 0;
let questions = [];
let selectedAnswer = null;

const textBox = document.getElementById('storyText');
const continueBtn = document.getElementById('continueBtn');
const quizBox = document.getElementById('quiz');
const nextBtn = document.getElementById('nextBtn');
const inputAnswer = document.getElementById('input-answer');
const multipleOptions = document.getElementById('multiple-options');
const answerOptions = document.querySelectorAll('.quiz-option');

window.onload = () => {
    fetch(`http://localhost:8082/api/game/game.php?id=${gameId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            if (!data || !data.scenario || !data.questions) {
                alert("Eroare la primirea datelor jocului.");
                return;
            }

            storyParts = Object.values(data.scenario);
            questions = data.questions;

            typeStory(storyParts[currentPart]);

            configureDifficultyUI(data.difficulty);
        })
        .catch(err => {
            console.error("Eroare la fetch:", err);
            alert("Nu s-a putut incarca jocul.");
        });
};

function configureDifficultyUI(difficulty) {
    if (difficulty === "easy") {
        document.getElementById("third-option").style.display = "none";
        multipleOptions.style.display = "block";
        inputAnswer.style.display = "none";
    } else if (difficulty === "medium") {
        document.getElementById("third-option").style.display = "block";
        multipleOptions.style.display = "block";
        inputAnswer.style.display = "none";
    } else if (difficulty === "hard") {
        multipleOptions.style.display = "none";
        inputAnswer.style.display = "block";
    }
}

function typeStory(text) {
    let i = 0;
    textBox.textContent = '';

    function typeChar() {
        if (i < text.length) {
            textBox.textContent += text.charAt(i);
            if (i % 40 === 0) textBox.textContent += '\n';
            i++;
            setTimeout(typeChar, 40);
        } else {
            continueBtn.style.display = 'inline-block';
        }
    }

    typeChar();
}

document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && currentPart < storyParts.length) {
        e.preventDefault();
        textBox.textContent = storyParts[currentPart];
        continueBtn.style.display = 'inline-block';
    }
});

continueBtn.addEventListener('click', () => {
    continueBtn.style.display = 'none';
    textBox.style.display = 'none';
    quizBox.style.display = 'block';

    populateQuiz(currentPart);
});

function populateQuiz(index) {
    const question = questions[index];
    document.querySelector('#quiz p strong').textContent = `intrebare ${index + 1}:`;

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
    currentPart++;
    if (currentPart >= storyParts.length) {
        alert("Joc terminat!");
        return;
    }

    quizBox.style.display = 'none';
    textBox.style.display = 'block';
    textBox.textContent = '';
    selectedAnswer = null;

    answerOptions.forEach(opt => opt.classList.remove('selected'));
    typeStory(storyParts[currentPart]);
});

nextBtn.addEventListener('click', () => {
    const question = questions[currentPart];
    const answer = difficulty === "hard"
        ? document.getElementById("textAnswer").value
        : selectedAnswer;

    if (!answer) {
        alert("Selecteaza sau introdu un raspuns!");
        return;
    }

    fetch('http://localhost:8082/api/game/answer.php', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
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
                alert("✔️ Corect! Scor curent: " + data.score);
            } else {
                alert("❌ Gresit! Scor curent: " + data.score);
            }

            currentPart++;
            if (currentPart >= storyParts.length) {
                alert("Ai terminat jocul! Scor final: " + data.score);
                // redirect? window.location.href = "FinalPage.html";
                return;
            }

            quizBox.style.display = 'none';
            textBox.style.display = 'block';
            textBox.textContent = '';
            selectedAnswer = null;
            document.getElementById("textAnswer").value = '';
            answerOptions.forEach(opt => opt.classList.remove('selected'));
            typeStory(storyParts[currentPart]);
        })
        .catch(err => {
            console.error("Eroare la verificare:", err);
            alert("A aparut o eroare la verificarea raspunsului.");
        });
});


