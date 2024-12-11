function addPlayerInput() {
    const container = document.getElementById('players-container');
    const currentPlayers = container.children.length;

    if (currentPlayers < 8) {
        const newRow = document.createElement('div');
        newRow.classList.add('player-row');

        const newLabel = document.createElement('div');
        newLabel.classList.add('player-label');
        newLabel.contentEditable = "true";
        newLabel.textContent = `P${currentPlayers + 1}`;
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

        if (index === playerRows.length - 1) {
            // Show buttons only for the last input
            addButton.style.display = playerRows.length < 8 ? 'inline-block' : 'none';
            removeButton.style.display = playerRows.length > 1 ? 'inline-block' : 'none';
        } else {
            // Hide buttons for other rows
            addButton.style.display = 'none';
            removeButton.style.display = 'none';
        }
    });
}
