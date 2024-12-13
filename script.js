let foods = [];
let playerData = {}; 
let currentFood = null;
let inputsDisabled = false;

function saveToLocalStorage() {
    const container = document.getElementById('players-container');
    const playerCount = container.children.length;

    Array.from(container.children).forEach((row, index) => {
        const playerId = `player${index + 1}`; 
        const name = row.querySelector('.player-label').textContent.trim();
        const score = playerScores[name] || 0;

        playerData[playerId] = { name, score }; 
    });

    const dataToSave = {
        playerCount,
        playerData,
    };

    localStorage.setItem('https://mango-247.github.io/oxalate-quiz/GameData', JSON.stringify(dataToSave));
    //console.log(`Saved data: ${JSON.stringify(dataToSave)}`);
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('https://mango-247.github.io/oxalate-quiz/GameData');
    if (savedData) {
       // console.log(`Loaded data: ${savedData}`);
        const { playerCount, playerData: loadedPlayerData } = JSON.parse(savedData);
        playerData = loadedPlayerData;
        return playerCount;
    }
    return 0;
}

function initializePlayersFromLocalStorage(playerCount) {
    const container = document.getElementById('players-container');
    container.innerHTML = ''; 

    for (let i = 1; i <= playerCount; i++) {
        const playerId = `player${i}`;
        const storedData = playerData[playerId] || { name: `Player ${i}`, score: 0 };

        const newRow = document.createElement('div');
        newRow.classList.add('player-row');
        newRow.style.display = 'flex';
        newRow.style.alignItems = 'center';

        const newLabel = document.createElement('div');
        newLabel.classList.add('player-label');
        newLabel.contentEditable = "true";
        newLabel.textContent = storedData.name;
        applyListenersToLabel(newLabel, playerId);

        const newInput = document.createElement('input');
        newInput.type = 'number';
        newInput.classList.add('guess-input');
        newInput.placeholder = 'Enter guess (mg)';
        newInput.disabled = inputsDisabled;

        const addButton = createButton('+', 'add-button', addPlayerInput);
        const removeButton = createButton('-', 'remove-button', () => {
            newRow.remove();
            updateButtons();
            updateSubmitButtonState();
            syncLeaderboardWithPlayers();
            saveToLocalStorage();
        });

        newInput.addEventListener('input', updateSubmitButtonState);

        newRow.appendChild(newLabel);
        newRow.appendChild(newInput);
        newRow.appendChild(addButton);
        newRow.appendChild(removeButton);
        container.appendChild(newRow);

        playerScores[storedData.name] = storedData.score; 
    }

    updateButtons();
}

function applyListenersToLabel(label, playerId) {
    label.addEventListener('keydown', event => enforceCharacterLimit(event));
    label.addEventListener('input', event => handleNameChange(event, playerId));
}

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

function resetLeaderboard() {
    if (confirm("Are you sure you want to reset the leaderboard?")) {
        Object.keys(playerScores).forEach(player => {
            playerScores[player] = 0; 
        });
        Object.keys(playerData).forEach(playerId => {
            playerData[playerId].score = 0; 
        });
        updateLeaderboard();
        saveToLocalStorage();
        console.log("Leaderboard has been reset.");
    }
}

function enforceCharacterLimit(event, maxLength = 12) {
    const element = event.target;
    const value = element.textContent;
    const key = event.key;

    if (value.length >= maxLength && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault();
    }
}

function handleNameChange(event, playerId) {
    const newName = event.target.textContent.trim();
    const playerInfo = playerData[playerId];
    if (playerInfo) {
        delete playerScores[playerInfo.name];
        playerInfo.name = newName
        playerScores[newName] = playerInfo.score;
        updateLeaderboard();
        saveToLocalStorage();
    }
}

function addPlayerInput() {
    const container = document.getElementById('players-container');
    const currentPlayers = container.children.length;

    if (currentPlayers < 8) {
        const newRow = document.createElement('div');
        newRow.classList.add('player-row');
        newRow.style.display = 'flex';
        newRow.style.alignItems = 'center';

        const playerId = `player${currentPlayers + 1}`;
        const defaultName = `Player ${currentPlayers + 1}`;
        const storedData = { name: defaultName, score: 0 };

        const newLabel = document.createElement('div');
        newLabel.classList.add('player-label');
        newLabel.contentEditable = "true";
        newLabel.textContent = storedData.name;
        applyListenersToLabel(newLabel, playerId);

        const newInput = document.createElement('input');
        newInput.type = 'number';
        newInput.classList.add('guess-input');
        newInput.placeholder = 'Enter guess (mg)';
        newInput.disabled = inputsDisabled;

        const addButton = createButton('+', 'add-button', addPlayerInput);
        const removeButton = createButton('-', 'remove-button', () => {
            newRow.remove();
            updateButtons();
            updateSubmitButtonState();
            syncLeaderboardWithPlayers();
            saveToLocalStorage();
        });

        newInput.addEventListener('input', updateSubmitButtonState);

        newRow.appendChild(newLabel);
        newRow.appendChild(newInput);
        newRow.appendChild(addButton);
        newRow.appendChild(removeButton);
        container.appendChild(newRow);

        playerData[playerId] = storedData;
        playerScores[storedData.name] = storedData.score;
        console.log(`All player data: ${JSON.stringify(playerData)}`)
        console.log(`Stored data: ${JSON.stringify(storedData)}`)
        console.log(`Set name to: ${storedData.score}`)

        updateButtons();
        syncLeaderboardWithPlayers();
        saveToLocalStorage();
    }
}

function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.classList.add(className);
    button.textContent = text;
    button.style.width = '36px'; 
    button.style.height = '36px'; 
    button.style.display = 'flex';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.fontSize = '16px'; 
    button.style.fontWeight = 'bold';
    button.style.border = 'none';
    button.style.borderRadius = '50%'; 
    button.style.backgroundColor = 'red';
    button.style.color = 'white';
    button.style.padding = '0'; 
    button.style.textAlign = 'center';
    button.style.boxSizing = 'border-box';
    button.style.cursor = 'pointer'; 
    button.addEventListener('click', onClick);
    return button;
}

function updateButtons() {
    const container = document.getElementById('players-container');
    const playerRows = container.children;

    Array.from(playerRows).forEach((row, index) => {
        const addButton = row.querySelector('.add-button');
        const removeButton = row.querySelector('.remove-button');
        console.log(index)
        if (index === playerRows.length - 1) {
            if (addButton) {
                addButton.style.display = playerRows.length < 8 ? 'inline-block' : 'none';
            }
            if (removeButton) {
                removeButton.style.display = playerRows.length > 1 ? 'inline-block' : 'none';
            }
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

    const cleanOxalate = parseFloat(String(currentFood.oxalate).replace(/[^\d.-]/g, ''));

    inputs.forEach((input, index) => {
        const guess = parseFloat(input.value);
        if (!isNaN(guess)) {
            const diff = Math.abs(cleanOxalate - guess);
            if (diff < closestDiff) {
                closestPlayer = playerLabels[index].textContent;
                closestDiff = diff;
                isTie = false;
            } else if (diff === closestDiff) {
                isTie = true;
            }
        }
    });

    if (isTie) {
        closestPlayerDiv.textContent = "It's a tie!";
    } else if (closestDiff === 0) {
        closestPlayerDiv.textContent = `${closestPlayer} got it right!`;
    } else {
        closestPlayerDiv.textContent = `${closestPlayer} was the closest!`;
    }
}

let playerScores = {}; 

function initializeLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    const playerLabels = document.querySelectorAll('.player-label');
    playerLabels.forEach(playerLabel => {
        const playerName = playerLabel.textContent.trim();
        playerScores[playerName] = 0; 
    });
    updateLeaderboard();
}

function updateLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    const container = document.getElementById('players-container');
    const playerCount = container.children.length; 

    leaderboardDiv.innerHTML = ''; 

    Object.keys(playerData).forEach(playerId => {
        const playerInfo = playerData[playerId];
        playerScores[playerInfo.name] = playerInfo.score; 
    });

    Object.entries(playerScores)
        .sort(([, a], [, b]) => b - a) 
        .slice(0, playerCount) 
        .forEach(([player, score]) => {
            const entry = document.createElement('div');
            entry.style.display = 'flex';
            entry.style.justifyContent = 'space-between';
            entry.style.padding = '5px 10px';

            const nameDiv = document.createElement('div');
            nameDiv.textContent = player;

            const scoreDiv = document.createElement('div');
            scoreDiv.textContent = `${score} ${score === 1 ? 'point' : 'points'}`;

            entry.appendChild(nameDiv);
            entry.appendChild(scoreDiv);
            leaderboardDiv.appendChild(entry);
        });

}

function awardPoints() {
    const inputs = document.querySelectorAll('.guess-input');
    const playerLabels = document.querySelectorAll('.player-label');

    let closestPlayers = [];
    let closestDiff = Infinity;

    const cleanOxalate = parseFloat(String(currentFood.oxalate).replace(/[^\d.-]/g, ''));

    inputs.forEach((input, index) => {
        const guess = parseFloat(input.value);
        if (!isNaN(guess)) {
            const diff = Math.abs(cleanOxalate - guess);

            if (diff < closestDiff) {

                closestPlayers = [playerLabels[index].textContent.trim()];
                closestDiff = diff;
            } else if (diff === closestDiff) {

                closestPlayers.push(playerLabels[index].textContent.trim());
            }
        }
    });

    if (closestDiff === 0) {

        closestPlayers.forEach(player => {
            console.log("Adding 2 points to", player);
            playerScores[player] = (playerScores[player] || 0) + 2;

            for (const playerId in playerData) {
                if (playerData[playerId].name === player) {
                    playerData[playerId].score = playerScores[player];
                    break;
                }
            }
        });
    } else {

        closestPlayers.forEach(player => {
            console.log("Adding 1 point to", player);
            playerScores[player] = (playerScores[player] || 0) + 1;

            for (const playerId in playerData) {
                if (playerData[playerId].name === player) {
                    playerData[playerId].score = playerScores[player];
                    break;
                }
            }
        });
    }

    updateLeaderboard();
    saveToLocalStorage(); 
}

function syncLeaderboardWithPlayers() {
    const playerRows = document.querySelectorAll('.player-row');
    const updatedPlayerScores = {}; 

    playerRows.forEach((row, index) => {
        const playerId = `player${index + 1}`;
        const playerName = row.querySelector('.player-label').textContent.trim();

        let score = playerScores[playerName] || 0;

        playerData[playerId] = { name: playerName, score: score };
        updatedPlayerScores[playerName] = score;
    });

    playerScores = updatedPlayerScores; 
    console.log(`Updating scores to ${JSON.stringify(updatedPlayerScores)}`)
    console.log(`Playerdata is now: ${playerData}`)
    updateLeaderboard();
    saveToLocalStorage();
}

document.addEventListener('DOMContentLoaded', () => {
    const player1Label = document.querySelector('.player-label');
    const player1Id = 'player1';
    player1Label.addEventListener('keydown', event => enforceCharacterLimit(event));
    player1Label.addEventListener('input', event => handleNameChange(event, player1Id));

    fetchFoods().then(() => {
        const rerollButton = document.getElementById('reroll');
        const submitButton = document.getElementById('submit');
        const resetButton = document.getElementById('reset');
        const resultDiv = document.getElementById('result');
        const input = document.querySelector('.guess-input');

        currentFood = getRandomFood();
        displayFood(currentFood);

        const playerCount = loadFromLocalStorage(); 
        if (playerCount > 0) {
            initializePlayersFromLocalStorage(playerCount);
        } else {
            addPlayerInput(); 
        }

        initializeLeaderboard();

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
            resultDiv.textContent = `Actual content: ${currentFood.oxalate}`;
            findClosestPlayer();
            awardPoints();
            submitButton.disabled = true;
            saveToLocalStorage(); 
        });

        resetButton.addEventListener('click', () => {
            resetLeaderboard();
        });

        input.addEventListener('input', updateSubmitButtonState);

        document.querySelector('.add-button').addEventListener('click', () => {
            syncLeaderboardWithPlayers();
            saveToLocalStorage(); 
        });

        updateSubmitButtonState();
        updateLeaderboard();
    });
});
