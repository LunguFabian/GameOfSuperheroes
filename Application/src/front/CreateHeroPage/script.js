document.getElementById("hero-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const selectedHero = document.querySelector('input[name="hero"]:checked');

    const resultDiv = document.getElementById("selected-hero");

    if (selectedHero) {
        resultDiv.textContent = `You have selected: ${selectedHero.value}`;
    } else {
        resultDiv.textContent = "Please select a hero!";
        resultDiv.style.color = "red";
    }
});
