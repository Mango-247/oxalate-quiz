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

    // Debugging: Ensure currentFood is valid
    if (!currentFood || typeof currentFood.oxalate !== 'number') {
        console.error("Error: currentFood is null or does not have a valid 'oxalate' property.");
        closestPlayerDiv.textContent = "Error: Food data is unavailable.";
        return;
    }

    console.log("Current Food Oxalate:", currentFood.oxalate);

    inputs.forEach((input, index) => {
        const guess = parseFloat(input.value);

        // Debugging: Log each player's input
        console.log(`Player ${index + 1} guessed: ${guess}`);

        if (!isNaN(guess)) {
            const diff = Math.abs(currentFood.oxalate - guess);
            console.log(`Difference for Player ${index + 1}:`, diff);

            if (diff < closestDiff) {
                closestPlayer = playerLabels[index].textContent;
                closestDiff = diff;
                isTie = false;
            } else if (diff === closestDiff) {
                isTie = true;
            }
        }
    });

    // Debugging: Log final results
    console.log("Closest Player:", closestPlayer);
    console.log("Closest Difference:", closestDiff);
    console.log("Is Tie:", isTie);

    if (isTie) {
        closestPlayerDiv.textContent = "It's a tie!";
    } else if (closestDiff === 0) {
        closestPlayerDiv.textContent = `${closestPlayer} got it right!`;
    } else {
        closestPlayerDiv.textContent = `${closestPlayer} was the closest!`;
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
