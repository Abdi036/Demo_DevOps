const choiceButtons = document.querySelectorAll(".choice-btn");
const resetBtn = document.getElementById("resetBtn");
const helpBtn = document.getElementById("helpBtn");
const rulesPopup = document.getElementById("rulesPopup");
const closePopupBtn = document.getElementById("closePopupBtn");
const roundResult = document.getElementById("roundResult");
const pickedChoices = document.getElementById("pickedChoices");
const playerScoreEl = document.getElementById("playerScore");
const computerScoreEl = document.getElementById("computerScore");

const choices = ["rock", "paper", "scissors"];
const choiceEmoji = {
  rock: "🪨 Rock",
  paper: "📄 Paper",
  scissors: "✂️ Scissors",
};

let playerScore = 0;
let computerScore = 0;

choiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const playerChoice = button.dataset.choice;
    playRound(playerChoice);
  });
});

resetBtn.addEventListener("click", resetState);
helpBtn.addEventListener("click", openPopup);
closePopupBtn.addEventListener("click", closePopup);
rulesPopup.addEventListener("click", (event) => {
  if (event.target === rulesPopup) {
    closePopup();
  }
});

function openPopup() {
  rulesPopup.classList.remove("hidden");
}

function closePopup() {
  rulesPopup.classList.add("hidden");
}

function getComputerChoice() {
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

function getWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) {
    return "draw";
  }

  if (
    (playerChoice === "rock" && computerChoice === "scissors") ||
    (playerChoice === "paper" && computerChoice === "rock") ||
    (playerChoice === "scissors" && computerChoice === "paper")
  ) {
    return "player";
  }

  return "computer";
}

function playRound(playerChoice) {
  const computerChoice = getComputerChoice();
  const winner = getWinner(playerChoice, computerChoice);

  pickedChoices.textContent = `You: ${choiceEmoji[playerChoice]} | Computer: ${choiceEmoji[computerChoice]}`;

  if (winner === "draw") {
    roundResult.textContent = "It is a draw.";
    return;
  }

  if (winner === "player") {
    playerScore += 1;
    roundResult.textContent = "You win this round.";
  } else {
    computerScore += 1;
    roundResult.textContent = "Computer wins this round.";
  }

  updateScore();
}

function updateScore() {
  playerScoreEl.textContent = String(playerScore);
  computerScoreEl.textContent = String(computerScore);
}

function resetState() {
  playerScore = 0;
  computerScore = 0;
  updateScore();
  roundResult.textContent = "Score reset. Pick an option to play.";
  pickedChoices.textContent = "You: - | Computer: -";
}
