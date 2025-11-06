const wordList = [
  { word: "CACHORRO", image: "images/dog.jpg" },
  { word: "ELEFANTE", image: "images/elephant.jpg" },
  { word: "FOGUETE", image: "images/rocket.jpg" },
  { word: "CASA", image: "images/house.jpg" },
  { word: "GATO", image: "images/cat.jpg" },
  { word: "BARCO", image: "images/ship.jpg" },
  { word: "PRAIA", image: "images/beach.jpg" },
];

let currentPhase = 1;
let attemptsLeft = 3;
let currentWordData = null;
let lettersToGuess = [];
let availableWords = [];

const gameContainer = document.getElementById("game-container");
const winScreen = document.getElementById("win-screen");
const phaseDisplay = document.getElementById("phase-display");
const attemptsDisplay = document.getElementById("attempts-display");
const imageContainer = document.getElementById("game-image");
const wordContainer = document.getElementById("word-container");
const letterContainer = document.getElementById("letter-container");
const restartButton = document.getElementById("restart-button");

function startGame() {
  currentPhase = 1;
  attemptsLeft = 3;
  availableWords = [...wordList];

  winScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  loadPhase();
}

function loadPhase() {
  wordContainer.innerHTML = "";
  letterContainer.innerHTML = "";
  lettersToGuess = [];

  phaseDisplay.textContent = currentPhase;
  attemptsDisplay.textContent = attemptsLeft;

  const missingLetterCount = currentPhase >= 4 ? 4 : currentPhase;

  const possibleWords = availableWords.filter(
    (w) => w.word.length > missingLetterCount
  );

  if (possibleWords.length === 0) {
    availableWords = [...wordList];

    const newPossibleWords = availableWords.filter(
      (w) => w.word.length > missingLetterCount
    );
    currentWordData =
      newPossibleWords[Math.floor(Math.random() * newPossibleWords.length)];
  } else {
    currentWordData =
      possibleWords[Math.floor(Math.random() * possibleWords.length)];
  }

  const chosenWordIndex = availableWords.findIndex(
    (item) => item.word === currentWordData.word
  );

  if (chosenWordIndex > -1) {
    availableWords.splice(chosenWordIndex, 1);
  }

  const word = currentWordData.word;

  imageContainer.src = currentWordData.image;

  let wordIndices = Array.from(Array(word.length).keys());
  wordIndices = wordIndices.sort(() => Math.random() - 0.5);

  const indicesToHide = wordIndices.slice(0, missingLetterCount);

  const correctLetters = [];
  const decoyLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  for (let i = 0; i < word.length; i++) {
    if (indicesToHide.includes(i)) {
      const letter = word[i];
      correctLetters.push(letter);
      lettersToGuess.push(letter);

      const dropZone = document.createElement("div");
      dropZone.classList.add("drop-zone");
      dropZone.dataset.letter = letter;
      wordContainer.appendChild(dropZone);

      addDropZoneEvents(dropZone);
    } else {
      const filledLetter = document.createElement("div");
      filledLetter.classList.add("letter-filled");
      filledLetter.textContent = word[i];
      wordContainer.appendChild(filledLetter);
    }
  }

  let decoyCount = 3;
  let allLetterCards = [...correctLetters];

  while (decoyCount > 0) {
    const randomLetter =
      decoyLetters[Math.floor(Math.random() * decoyLetters.length)];
    if (!allLetterCards.includes(randomLetter)) {
      allLetterCards.push(randomLetter);
      decoyCount--;
    }
  }

  allLetterCards = allLetterCards.sort(() => Math.random() - 0.5);

  allLetterCards.forEach((letter) => {
    const card = document.createElement("div");
    card.classList.add("letter-card");
    card.textContent = letter;
    card.dataset.letter = letter;
    card.draggable = true;

    addDragCardEvents(card);

    letterContainer.appendChild(card);
  });
}

let draggedCard = null;

function addDragCardEvents(card) {
  card.addEventListener("dragstart", (e) => {
    draggedCard = e.target;
    e.target.classList.add("dragging");
    e.dataTransfer.setData("text/plain", e.target.dataset.letter);
  });

  card.addEventListener("dragend", (e) => {
    draggedCard = null;
    e.target.classList.remove("dragging");
  });
}

function addDropZoneEvents(zone) {
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.target.classList.add("hover");
  });

  zone.addEventListener("dragleave", (e) => {
    e.target.classList.remove("hover");
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.target.classList.remove("hover");

    const droppedLetter = e.dataTransfer.getData("text/plain");
    const correctLetter = e.target.dataset.letter;

    if (droppedLetter === correctLetter) {
      e.target.textContent = correctLetter;
      e.target.classList.add("filled");

      draggedCard.draggable = false;
      draggedCard.style.opacity = "0.3";
      draggedCard.style.cursor = "not-allowed";

      const index = lettersToGuess.indexOf(correctLetter);
      if (index > -1) {
        lettersToGuess.splice(index, 1);
      }

      checkPhaseComplete();
    } else {
      attemptsLeft--;
      attemptsDisplay.textContent = attemptsLeft;

      gameContainer.classList.add("shake");
      setTimeout(() => gameContainer.classList.remove("shake"), 500);

      if (attemptsLeft <= 0) {
        alert("Acabaram suas tentativas! O jogo vai recomeçar.");
        startGame();
      }
    }
  });
}

function checkPhaseComplete() {
  if (lettersToGuess.length === 0) {
    setTimeout(() => {
      alert("Parabéns! Fase completa!");

      currentPhase++;

      if (currentPhase > 7) {
        showWinScreen();
      } else {
        loadPhase();
      }
    }, 1000);
  }
}

function showWinScreen() {
  gameContainer.classList.add("hidden");
  winScreen.classList.remove("hidden");
}

restartButton.addEventListener("click", startGame);

startGame();
