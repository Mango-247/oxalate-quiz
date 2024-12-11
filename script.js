let foods = [];

async function fetchFoods() {
    const response = await fetch('foods.json');
    foods = await response.json();
}

function getRandomFood() {
    const randomIndex = Math.floor(Math.random() * foods.length);
    return foods[randomIndex];
}

document.addEventListener('DOMContentLoaded', () => {
    fetchFoods().then(() => {
        const rerollButton = document.getElementById('reroll');
        const submitButton = document.getElementById('submit');
        const foodNameDiv = document.getElementById('food-name');
        const resultDiv = document.getElementById('result');
        let currentFood = null;

        rerollButton.addEventListener('click', () => {
            resultDiv.textContent = ''; // Clear previous result
            const food = getRandomFood();
            currentFood = food;
            foodNameDiv.textContent = food.food;
        });

        submitButton.addEventListener('click', () => {
            const guessInput = document.getElementById('guess-input');
            if (currentFood) {
                const userGuess = guessInput.value;
                resultDiv.textContent = `Actual content: ${currentFood.oxalate} mg`;
            } else {
                resultDiv.textContent = 'Please reroll a food first!';
            }
        });
    });
});

