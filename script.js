let foods = [];
let currentFood = null;
let inputsDisabled = false;

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
    const quantity = document.getElementById('quantity');
    quantity.textContent = `Quantity: ${food.quantity}`;
}

function lockInputs() {
    const inputs = document.querySelectorAll('.guess-input');
    inputs.forEach(input => input.disabled = true);
    inputsDisabled = true;
}

function unlockInputs() {
    const inputs = document.querySelectorAll('.guess-input');
    inputs.forEach(input => input.disabled = false);
    inputsDisabled = false;
}

function updateSubmitButtonState() {
    const inputs = document.querySelectorAll('.guess-input');
    const submitButton = document.getElementById('submit');
    const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
    submitButton.disabled = !allFilled;
}

function enforceCharacterLimit(event, maxLength = 8) {
    const element = event.target;
    const value = element.textContent;
    const key = event.key;

    if (value.length >= maxLength && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault();
    }
}

function addPlayerInput() {
    const container = document.getElementById('players-container');
    const currentPlayers = container.children.length;

    if (currentPlayers < 8) {
        const newRow = document.createElement('div');
        newRow.classList.add('player-row');

        const newLabel = document.createElement('div');
        newLabel.classList.add('player-label');
        newLabel.contentEditable = "true";
        newLabel.textContent = `Player ${currentPlayers + 1}`;
        newLabel.addEventListener('keydown', event => enforceCharacterLimit(event));

        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.classList.add('guess-input');
        newInput.placeholder = 'Enter oxalate content (mg)';
        newInput.disabled = inputsDisabled;

        const addButton = document.createElement('button');
        addButton.classList.add('add-button');
        addButton.textContent = '+';

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.textContent = '-';

        addButton.addEventListener('click', addPlayerInput);
        removeButton.addEventListener('click', () => {
            newRow.remove();
            updateButtons();
            updateSubmitButtonState();
        });

        newInput.addEventListener('input', updateSubmitButtonState);

        newRow.appendChild(newLabel);
        newRow.appendChild(newInput);
        newRow.appendChild(addButton);
        newRow.appendChild(removeButton);
        container.appendChild(newRow);

        updateButtons();
    }
}

function updateButtons() {
    const container = document.getElementById('players-container');
    const playerRows = container.children;

    Array.from(playerRows).forEach((row, index) => {
        const addButton = row.querySelector('.add-button');
        const removeButton = row.querySelector('.remove-button');
        console.log(index)
        if (index === playerRows.length - 1) {
            addButton.style.display = playerRows.length < 8 ? 'inline-block' : 'none';
            removeButton.style.display = playerRows.length > 1 ? 'inline-block' : 'none';
        } else {

            addButton.style.display = 'none';
            if (removeButton) {
                removeButton.style.display = 'none';
            }
        }
    });
}

function findClosestPlayer() {
    const inputs = document.querySelectorAll('.guess-input');
    const playerLabels = document.querySelectorAll('.player-label');
    const closestPlayerDiv = document.getElementById('closest-player');

    let closestPlayer = null;
    let closestDiff = Infinity;
    let isTie = false;

    // Debug: Check the current food's oxalate value
    if (!currentFood || typeof currentFood.oxalate !== 'number') {
        console.error("Error: currentFood is not properly initialized or does not have a valid 'oxalate' property.");
        closestPlayerDiv.textContent = "Error: No food data available!";
        return;
    }
    console.log("Current Food Oxalate:", currentFood.oxalate);

    // Debug: Log all player inputs and labels
    console.log("Player Inputs and Labels:");

    inputs.forEach((input, index) => {
        const guess = parseFloat(input.value);
        const label = playerLabels[index]?.textContent || `Player ${index + 1}`;
        console.log(`Player ${index + 1}: Guess=${guess}, Label=${label}`);

        if (!isNaN(guess)) {
            const diff = Math.abs(currentFood.oxalate - guess);
            if (diff < closestDiff) {
                closestPlayer = label;
                closestDiff = diff;
                isTie = false;
            } else if (diff === closestDiff) {
                isTie = true;
            }
        } else {
            console.warn(`Invalid guess by Player ${index + 1}:`, input.value);
        }
    });

    // Handle results based on the findings
    if (!closestPlayer && inputs.length > 0) {
        closestPlayerDiv.textContent = "No valid guesses made!";
        console.warn("No valid guesses were submitted.");
    } else if (isTie) {
        closestPlayerDiv.textContent = "It's a tie!";
        console.log("Result: Tie between players.");
    } else if (closestDiff === 0) {
        closestPlayerDiv.textContent = `${closestPlayer} got it right!`;
        console.log("Result: Exact match by", closestPlayer);
    } else if (closestPlayer) {
        closestPlayerDiv.textContent = `${closestPlayer} was the closest!`;
        console.log("Result: Closest player is", closestPlayer, "with difference of", closestDiff);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    fetchFoods().then(() => {
        const rerollButton = document.getElementById('reroll');
        const submitButton = document.getElementById('submit');
        const resultDiv = document.getElementById('result');
        const input = document.querySelector('.guess-input');
        const firstPlayerLabel = document.querySelector('.player-label');

        currentFood = getRandomFood();
        displayFood(currentFood);

        firstPlayerLabel.addEventListener('keydown', event => enforceCharacterLimit(event));

        rerollButton.addEventListener('click', () => {
            resultDiv.textContent = '';
            document.getElementById('closest-player').textContent = '';
            currentFood = getRandomFood();
            displayFood(currentFood);
            unlockInputs();
            const inputs = document.querySelectorAll('.guess-input');
            inputs.forEach(input => input.value = '');
        });

        submitButton.addEventListener('click', () => {
            lockInputs();
            resultDiv.textContent = `Actual content: ${currentFood.oxalate} mg`;
            findClosestPlayer();
            submitButton.disabled = true; 
        });

        input.addEventListener('input', updateSubmitButtonState);

        document.querySelector('.add-button').addEventListener('click', addPlayerInput);

        updateSubmitButtonState();
    });
});
