let foods = [];

async function fetchFoods() {
    const response = await fetch('foods.json');
    foods = await response.json();
}

function getRandomFood() {
    const randomIndex = Math.floor(Math.random() * foods.length);
    return foods[randomIndex];
}

function displayFood(food) {
    const foodNameDiv = document.getElementById('food-name');
    foodNameDiv.textContent = food.food;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchFoods().then(() => {
        const rerollButton = document.getElementById('reroll');
        const submitButton = document.getElementById('submit');
        const resultDiv = document.getElementById('result');
        let currentFood = getRandomFood();

        // Display a food on page load
        displayFood(currentFood);

        rerollButton.addEventListener('click', () => {
            resultDiv.textContent = ''; // Clear previous result
            currentFood = getRandomFood();
            displayFood(currentFood);
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
