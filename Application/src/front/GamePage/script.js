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

