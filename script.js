const playerSetup = document.getElementById("player-setup");
const playerNamesInput = document.getElementById("player-names");
const createPlayersButton = document.getElementById("create-players");

const playersSection = document.getElementById("players-section");
const playersContainer = document.getElementById("players-container");

const reducePointsButton = document.getElementById("reduce-points");

const eliminatedSection =
    document.getElementById("eliminated-section");

const eliminatedContainer =
    document.getElementById("eliminated-container");

const statusMessage =
    document.getElementById("status-message");

const historySection =
    document.getElementById("history-section");

const historyButton =
    document.getElementById("history-button");

const historyContainer =
    document.getElementById("history-container");

const historyTableWrapper =
    document.getElementById("history-table-wrapper");

const winnerSection =
    document.getElementById("winner-section");

const winnerName =
    document.getElementById("winner-name");

const winnerRounds =
    document.getElementById("winner-rounds");

const resetSection =
    document.getElementById("reset-section");

const resetGameButton =
    document.getElementById("reset-game");


// ========================================
// GAME DATA
// ========================================

let players = [];
let eliminatedPlayers = [];
let currentRound = 0;
let roundHistory = [];
let gameFinished = false;


// ========================================
// CREATE PLAYERS
// ========================================

createPlayersButton.addEventListener(
    "click",
    createPlayers
);


function createPlayers() {

    const namesText =
        playerNamesInput.value.trim();


    if (namesText === "") {

        statusMessage.textContent =
            "Please enter at least one player name.";

        playerNamesInput.focus();

        return;
    }


    const names =
        namesText.split(/\s+/);


    // Check duplicate names
    const uniqueNames =
        new Set(
            names.map(
                name => name.toLowerCase()
            )
        );


    if (
        uniqueNames.size !==
        names.length
    ) {

        statusMessage.textContent =
            "Player names must be unique.";

        playerNamesInput.focus();

        return;
    }


    // Create players
    players = names.map(name => ({
        name: name,
        points: 248
    }));


    // Reset game data
    eliminatedPlayers = [];
    currentRound = 0;
    roundHistory = [];
    gameFinished = false;

    winnerSection.hidden = true;
    reducePointsButton.hidden = false;

    historySection.hidden = true;
    historyContainer.hidden = true;
    historyButton.setAttribute(
        "aria-expanded",
        "false"
    );


    // Change screen
    playerSetup.hidden = true;
    playersSection.hidden = false;
    eliminatedSection.hidden = false;
    resetSection.hidden = false;


    displayPlayers();
    displayEliminatedPlayers();

    saveGame();


    statusMessage.textContent =
        `${players.length} players created. Each player starts with 248 points.`;


    focusFirstPlayerInput();
}


// ========================================
// DISPLAY ACTIVE PLAYERS
// ========================================

function displayPlayers() {

    playersContainer.innerHTML = "";


    players.forEach(
        (player, index) => {

            const playerCard =
                document.createElement("div");

            playerCard.className =
                "player-card";


            // Player name
            const playerName =
                document.createElement("h3");

            playerName.textContent =
                player.name;


            // Current points
            const points =
                document.createElement("p");

            points.textContent =
                player.points;


            // Accessible label
            const label =
                document.createElement("label");

            const inputId =
                `player-points-${index}`;

            label.setAttribute(
                "for",
                inputId
            );

            label.textContent =
                `Points for ${player.name} in this round`;


            // Input
            const input =
                document.createElement("input");

            input.type = "number";
            input.id = inputId;
            input.name = inputId;

            input.min = "0";
            input.step = "1";

            input.value = "";

            input.placeholder =
                "Enter the points";

            input.setAttribute(
                "aria-label",
                `Points for ${player.name} in this round`
            );


            playerCard.appendChild(playerName);
            playerCard.appendChild(points);
            playerCard.appendChild(label);
            playerCard.appendChild(input);

            playersContainer.appendChild(
                playerCard
            );
        }
    );
}


// ========================================
// DISPLAY ELIMINATED PLAYERS
// ========================================

function displayEliminatedPlayers() {

    eliminatedContainer.innerHTML = "";


    if (
        eliminatedPlayers.length === 0
    ) {

        const message =
            document.createElement("p");

        message.textContent =
            "No players eliminated yet.";

        eliminatedContainer.appendChild(
            message
        );

        return;
    }


    eliminatedPlayers.forEach(
        player => {

            const playerCard =
                document.createElement("div");

            playerCard.className =
                "eliminated-player";


            const playerName =
                document.createElement("h3");

            playerName.textContent =
                player.name;


            const rounds =
                document.createElement("p");

            rounds.textContent =
                `Rounds Played: ${player.roundsPlayed}`;


            playerCard.appendChild(
                playerName
            );

            playerCard.appendChild(
                rounds
            );


            eliminatedContainer.appendChild(
                playerCard
            );
        }
    );
}


// ========================================
// REDUCE POINTS
// ========================================

reducePointsButton.addEventListener(
    "click",
    reducePoints
);


function reducePoints() {

    if (players.length === 0) {

        statusMessage.textContent =
            "There are no active players.";

        return;
    }


    const inputs =
        playersContainer.querySelectorAll("input");


    const roundEntries = [];


    // ====================================
    // READ ALL INPUTS
    // ====================================

    for (
        let i = 0;
        i < players.length;
        i++
    ) {

        const value =
            inputs[i].value.trim();


        // Empty box = zero
        const points =
            value === ""
                ? 0
                : Number(value);


        // Validate
        if (
            !Number.isInteger(points) ||
            points < 0
        ) {

            statusMessage.textContent =
                `Please enter a valid whole number for ${players[i].name}.`;

            inputs[i].focus();

            return;
        }


        roundEntries.push({
            name: players[i].name,
            entered: points,
            previousPoints: players[i].points
        });
    }


    // ====================================
    // COMPLETE ROUND
    // ====================================

    currentRound++;


    // ====================================
    // DEDUCT POINTS
    // ====================================

    roundEntries.forEach(entry => {

        const player =
            players.find(
                p => p.name === entry.name
            );


        player.points =
            Math.max(
                0,
                player.points - entry.entered
            );


        entry.remaining =
            player.points;
    });


    // ====================================
    // FIND ELIMINATED PLAYERS
    // ====================================

    const newlyEliminated =
        players.filter(
            player =>
                player.points === 0
        );


    // ====================================
    // SAVE ELIMINATION RECORD
    // ====================================

    newlyEliminated.forEach(
        player => {

            eliminatedPlayers.push({

                name: player.name,

                points: 0,

                roundsPlayed:
                    currentRound
            });
        }
    );


    // ====================================
    // CREATE ROUND HISTORY RECORD
    // ====================================

    const historyRecord = {

        round: currentRound,

        players:
            roundEntries.map(
                entry => ({
                    name: entry.name,
                    points: entry.entered,
                    remaining: entry.remaining
                })
            ),

        eliminated:
            newlyEliminated.map(
                player =>
                    player.name
            ),

        winner: null
    };


    // ====================================
    // REMOVE ELIMINATED PLAYERS
    // ====================================

    players =
        players.filter(
            player =>
                player.points > 0
        );


    // ====================================
    // SORT ACTIVE PLAYERS
    // HIGH → LOW
    // ====================================

    players.sort(
        (a, b) =>
            b.points - a.points
    );


    // ====================================
    // WINNER CHECK
    // ====================================

    if (players.length === 1) {

        historyRecord.winner =
            players[0].name;
    }


    // ====================================
    // SAVE HISTORY
    // ====================================

    roundHistory.push(
        historyRecord
    );

    saveGame();


    // ====================================
    // UPDATE SCREEN
    // ====================================

    displayPlayers();

    displayEliminatedPlayers();


    // ====================================
    // SHOW HISTORY BUTTON
    // ====================================

    historySection.hidden = false;


    // ====================================
    // WINNER
    // ====================================

    if (players.length === 1) {

        showWinner();

        displayRoundHistory();

        return;
    }


    // ====================================
    // ANNOUNCEMENT
    // ====================================

    if (
        newlyEliminated.length > 0
    ) {

        const names =
            newlyEliminated
                .map(
                    player =>
                        player.name
                )
                .join(", ");


        statusMessage.textContent =
            `Round ${currentRound} completed. ${names} eliminated.`;

    }
    else {

        statusMessage.textContent =
            `Round ${currentRound} completed.`;
    }


    // ====================================
    // FOCUS
    // ====================================

    focusFirstPlayerInput();
}


// ========================================
// FOCUS FIRST PLAYER
// ========================================

function focusFirstPlayerInput() {

    const firstInput =
        playersContainer.querySelector(
            "input"
        );


    if (firstInput) {

        firstInput.focus();

    }
}


// ========================================
// WINNER
// ========================================

// ========================================
// WINNER
// ========================================

function showWinner() {

    if (players.length !== 1) {
        return;
    }

    const winner = players[0];

    // Mark game as finished
    gameFinished = true;

    // Hide active players
    playersSection.hidden = true;

    // Hide Reduce Points
    reducePointsButton.hidden = true;

    // Show Winner section
    winnerSection.hidden = false;

    // Winner name
    winnerName.textContent =
        winner.name;

    // Winner rounds
    winnerRounds.textContent =
        `Rounds Played: ${currentRound}`;

    // Make trophy GIF replay
    const trophy =
        document.getElementById("winner-trophy");

    if (trophy) {
        const originalSource =
            trophy.src.split("?")[0];

        trophy.src =
            `${originalSource}?play=${Date.now()}`;
    }

    // Save FINAL game state
    saveGame();

    // Screen reader announcement
    statusMessage.textContent =
        `${winner.name} has won the game. ` +
        `Winner played ${currentRound} rounds.`;
}


// ========================================
// ROUND HISTORY BUTTON
// ========================================

historyButton.addEventListener(
    "click",
    toggleRoundHistory
);


function toggleRoundHistory() {

    if (historyContainer.hidden) {

        displayRoundHistory();

        historyContainer.hidden = false;

        historyButton.setAttribute(
            "aria-expanded",
            "true"
        );

        statusMessage.textContent =
            "Round history opened.";

    }
    else {

        historyContainer.hidden = true;

        historyButton.setAttribute(
            "aria-expanded",
            "false"
        );

        statusMessage.textContent =
            "Round history closed.";
    }
}


// ========================================
// DISPLAY ROUND HISTORY
// ========================================

function displayRoundHistory() {

    historyTableWrapper.innerHTML = "";


    if (roundHistory.length === 0) {

        const message =
            document.createElement("p");

        message.textContent =
            "No rounds have been completed yet.";

        historyTableWrapper.appendChild(
            message
        );

        return;
    }


    // ====================================
    // GET ALL PLAYER NAMES
    // ====================================

    const allPlayerNames = [];


    // Active players
    players.forEach(player => {

        if (
            !allPlayerNames.includes(
                player.name
            )
        ) {

            allPlayerNames.push(
                player.name
            );
        }
    });


    // Eliminated players
    eliminatedPlayers.forEach(player => {

        if (
            !allPlayerNames.includes(
                player.name
            )
        ) {

            allPlayerNames.push(
                player.name
            );
        }
    });


    // Players recorded in history
    roundHistory.forEach(round => {

        round.players.forEach(player => {

            if (
                !allPlayerNames.includes(
                    player.name
                )
            ) {

                allPlayerNames.push(
                    player.name
                );
            }
        });
    });


    // ====================================
    // CREATE TABLE
    // ====================================

    const table =
        document.createElement("table");

    table.className =
        "round-history-table";


    const caption =
        document.createElement("caption");

    caption.textContent =
        "Round History";

    table.appendChild(caption);


    // ====================================
    // HEADER
    // ====================================

    const thead =
        document.createElement("thead");

    const headerRow =
        document.createElement("tr");


    const roundHeader =
        document.createElement("th");

    roundHeader.scope = "col";

    roundHeader.textContent =
        "Round";

    headerRow.appendChild(
        roundHeader
    );


    allPlayerNames.forEach(name => {

        const header =
            document.createElement("th");

        header.scope = "col";

        header.textContent =
            name;

        headerRow.appendChild(
            header
        );
    });


    const statusHeader =
        document.createElement("th");

    statusHeader.scope = "col";

    statusHeader.textContent =
        "Status";

    headerRow.appendChild(
        statusHeader
    );


    thead.appendChild(headerRow);

    table.appendChild(thead);


    // ====================================
    // BODY
    // ====================================

    const tbody =
        document.createElement("tbody");


    roundHistory.forEach(round => {

        const row =
            document.createElement("tr");


        // Round number
        const roundCell =
            document.createElement("th");

        roundCell.scope = "row";

        roundCell.textContent =
            round.round;

        row.appendChild(
            roundCell
        );


        // Player values
        allPlayerNames.forEach(name => {

            const cell =
                document.createElement("td");


            const playerRecord =
                round.players.find(
                    player =>
                        player.name === name
                );


            if (playerRecord) {

                cell.textContent =
                    playerRecord.points;

            }
            else {

                // Player was already eliminated
                cell.textContent =
                    "—";
            }


            row.appendChild(cell);
        });


        // Status
        const statusCell =
            document.createElement("td");


        const statusParts = [];


        if (
            round.eliminated.length > 0
        ) {

            statusParts.push(
                `${round.eliminated.join(", ")} eliminated`
            );
        }


        if (round.winner) {

            statusParts.push(
                `${round.winner} winner`
            );
        }


        statusCell.textContent =
            statusParts.length > 0
                ? statusParts.join(" / ")
                : "—";


        row.appendChild(
            statusCell
        );


        tbody.appendChild(row);
    });


    table.appendChild(tbody);


    historyTableWrapper.appendChild(
        table
    );
}


// ========================================
// SAVE GAME
// ========================================

function saveGame() {

    const gameState = {
        players: players,
        eliminatedPlayers: eliminatedPlayers,
        currentRound: currentRound,
        roundHistory: roundHistory,
        gameFinished: gameFinished
    };

    localStorage.setItem(
        "rummyPointsGame",
        JSON.stringify(gameState)
    );
}


// ========================================
// LOAD GAME
// ========================================

function loadGame() {

    const savedGame =
        localStorage.getItem(
            "rummyPointsGame"
        );


    if (!savedGame) {
        return;
    }


    try {

        const gameState =
            JSON.parse(savedGame);


        players =
            gameState.players || [];


        eliminatedPlayers =
            gameState.eliminatedPlayers || [];


        currentRound =
            gameState.currentRound || 0;


        roundHistory =
            gameState.roundHistory || [];


        gameFinished =
            gameState.gameFinished || false;


        // --------------------------------
        // No saved game
        // --------------------------------

        if (
            players.length === 0 &&
            eliminatedPlayers.length === 0
        ) {

            return;
        }


        // --------------------------------
        // Hide Welcome Screen
        // --------------------------------

        playerSetup.hidden = true;
        resetSection.hidden = false;


        // --------------------------------
        // Restore Eliminated Players
        // --------------------------------

        eliminatedSection.hidden = false;

        displayEliminatedPlayers();


        // --------------------------------
        // RESTORE FINISHED GAME
        // --------------------------------

        if (
            gameFinished &&
            players.length === 1
        ) {

            // Show the Winner Stage
            showWinner();

            // Show history button
            historySection.hidden = false;

            // Do not show active players
            playersSection.hidden = true;

            // Rebuild history if needed
            displayRoundHistory();

            statusMessage.textContent =
                `${players[0].name} has won the game. ` +
                `Winner played ${currentRound} rounds.`;

            return;
        }


        // --------------------------------
        // RESTORE NORMAL GAME
        // --------------------------------

        playersSection.hidden =
            players.length === 0;


        // History button
        if (currentRound > 0) {

            historySection.hidden = false;

        }
        else {

            historySection.hidden = true;
        }


        // Winner hidden
        winnerSection.hidden = true;


        // Reduce Points visible
        reducePointsButton.hidden = false;


        // Display players
        displayPlayers();


        // Screen reader message
        statusMessage.textContent =
            `Game restored. Round ${currentRound}.`;


    }
    catch (error) {

        console.error(
            "Could not restore game:",
            error
        );


        localStorage.removeItem(
            "rummyPointsGame"
        );
    }
}


// ========================================
// RESET GAME
// ========================================

resetGameButton.addEventListener(
    "click",
    resetGame
);


function resetGame() {

    const confirmed =
        window.confirm(
            "Are you sure you want to reset the game? All players, points, eliminated players, and round history will be deleted."
        );


    if (!confirmed) {

        statusMessage.textContent =
            "Reset cancelled.";

        return;
    }


    // Clear game data
    players = [];
    eliminatedPlayers = [];
    currentRound = 0;
    roundHistory = [];
    gameFinished = false;


    // Clear saved game
    localStorage.removeItem(
        "rummyPointsGame"
    );


    // Reset player name input
    playerNamesInput.value = "";


    // Hide game sections
    playersSection.hidden = true;
    eliminatedSection.hidden = true;
    winnerSection.hidden = true;
    resetSection.hidden = true;

    historySection.hidden = true;
    historyContainer.hidden = true;

    reducePointsButton.hidden = false;


    historyButton.setAttribute(
        "aria-expanded",
        "false"
    );


    // Show Welcome screen
    playerSetup.hidden = false;


    // Clear displayed content
    playersContainer.innerHTML = "";

    eliminatedContainer.innerHTML = "";

    historyTableWrapper.innerHTML = "";


    // Screen reader announcement
    statusMessage.textContent =
        "Game has been reset. Welcome screen is ready.";


    // Move focus to player names
    playerNamesInput.focus();
}


// ========================================
// RESTORE GAME WHEN PAGE OPENS
// ========================================

loadGame();