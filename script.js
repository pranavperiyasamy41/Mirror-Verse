// Game variables
let score = 0;
let highScore = 0;
let lives = 3;
let currentNumber = '';
let gameActive = false;
let displayTime = 2000; // Initial display time in milliseconds
let digitCount = 3; // Initial number of digits
let timerInterval;
let timeLeft = 10; // 10 seconds timer
let startTime; // Time when number disappears
let bonusMeterPercent = 0; // Bonus meter percentage

// DOM Elements
const numberDisplay = document.getElementById('number-display');
const userInput = document.getElementById('user-input');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const messageElement = document.getElementById('message');
const livesElement = document.getElementById('lives');
const timerBar = document.getElementById('timer-fill');
const bonusMeterFill = document.getElementById('bonus-meter-fill');
const bonusMeterPercentElement = document.getElementById('bonus-meter-percent');

// Load high score from localStorage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('mirrorMatchHighScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreElement.textContent = highScore;
    }
}

// Save high score to localStorage
function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('mirrorMatchHighScore', highScore.toString());
        highScoreElement.textContent = highScore;
    }
}

// Generate a random number with specified digits
function generateRandomNumber(digits) {
    let min = Math.pow(10, digits - 1);
    let max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Reverse a number (mirror it)
function reverseNumber(number) {
    return parseInt(number.toString().split('').reverse().join(''));
}

// Update timer display
function updateTimer() {
    const percentage = (timeLeft / 10) * 100;
    timerBar.style.transform = `scaleX(${percentage / 100})`;
}

// Update bonus meter display
function updateBonusMeter() {
    bonusMeterFill.style.transform = `scaleY(${bonusMeterPercent / 100})`;
    bonusMeterPercentElement.textContent = `${Math.round(bonusMeterPercent)}%`;
}

// Display number with animation
function displayNumber(number) {
    numberDisplay.textContent = number;
    numberDisplay.classList.remove('mirror');
    
    // Reset timer display to empty
    timeLeft = 10;
    timerBar.style.transform = `scaleX(0)`;
    
    // Occasionally show in mirror mode (20% chance)
    if (Math.random() < 0.2) {
        setTimeout(() => {
            numberDisplay.classList.add('mirror');
        }, displayTime * 0.7);
    }
    
    // Add fade-in animation
    numberDisplay.style.animation = 'fadeIn 0.5s';
    
    // Hide number after displayTime
    setTimeout(() => {
        numberDisplay.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
            numberDisplay.textContent = '';
            numberDisplay.style.animation = '';
            userInput.disabled = false;
            userInput.focus();
            submitBtn.disabled = false;
            
            // Record start time for bonus calculation
            startTime = new Date();
            
            // Start the 10-second answering timer AFTER number disappears
            startAnsweringTimer();
        }, 500);
    }, displayTime);
}

// Start the answering timer (10 seconds after number disappears)
function startAnsweringTimer() {
    // Reset timer
    timeLeft = 10;
    updateTimer();
    
    // Start timer countdown
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 100);
}

// Handle time up (when timer reaches 0)
function timeUp() {
    lives--;
    livesElement.textContent = lives;
    messageElement.textContent = `Time's up! The mirror of ${currentNumber} is ${reverseNumber(currentNumber)}`;
    messageElement.className = 'message wrong';
    
    // Start next round after delay
    setTimeout(() => {
        startRound();
    }, 2000);
}

// Start a new round
function startRound() {
    if (lives <= 0) {
        gameOver();
        return;
    }
    
    // Clear previous state
    userInput.value = '';
    userInput.disabled = true;
    submitBtn.disabled = true;
    messageElement.textContent = '';
    messageElement.className = 'message';
    
    // Stop any existing timer
    clearInterval(timerInterval);
    
    // Generate new number
    currentNumber = generateRandomNumber(digitCount);
    const mirroredNumber = reverseNumber(currentNumber);
    
    // Display the number
    displayNumber(currentNumber);
}

// Check user's answer
function checkAnswer() {
    // Stop the timer
    clearInterval(timerInterval);
    
    const userAnswer = parseInt(userInput.value);
    const correctAnswer = reverseNumber(currentNumber);
    
    if (userAnswer === correctAnswer) {
        // Correct answer
        score++;
        scoreElement.textContent = score;
        messageElement.textContent = 'Correct!';
        messageElement.className = 'message correct';
        
        // Increase difficulty every 3 correct answers
        if (score % 3 === 0) {
            if (digitCount < 8) digitCount++;
            if (displayTime > 500) displayTime -= 100;
        }
        
        // Calculate bonus based on response time
        const endTime = new Date();
        const responseTime = (endTime - startTime) / 1000; // Convert to seconds
        const bonus = calculateBonus(responseTime);
        addBonusToMeter(bonus);
        
        // Start next round after delay
        setTimeout(() => {
            startRound();
        }, 1500);
    } else {
        // Wrong answer
        lives--;
        livesElement.textContent = lives;
        messageElement.textContent = `Wrong! The mirror of ${currentNumber} is ${correctAnswer}`;
        messageElement.className = 'message wrong';
        
        // Start next round after delay
        setTimeout(() => {
            startRound();
        }, 2000);
    }
}

// Game over
function gameOver() {
    gameActive = false;
    userInput.disabled = true;
    submitBtn.disabled = true;
    startBtn.disabled = false;
    startBtn.textContent = 'Play Again';
    
    // Stop timer
    clearInterval(timerInterval);
    
    messageElement.textContent = `Game Over! Your score: ${score}`;
    messageElement.className = 'message wrong';
    
    saveHighScore();
    
    // Reset game state
    digitCount = 3;
    displayTime = 2000;
}

// Calculate bonus based on response time
function calculateBonus(responseTime) {
    if (responseTime <= 1) {
        return 30; // 30% for <= 1 second
    } else if (responseTime <= 3) {
        return 25; // 25% for 2-3 seconds
    } else if (responseTime <= 5) {
        return 20; // 20% for 4-5 seconds
    } else {
        return 10; // 10% for 6-10 seconds
    }
}

// Add bonus to meter and check if player should receive a life
function addBonusToMeter(bonus) {
    bonusMeterPercent += bonus;
    
    // Check if bonus meter is full
    if (bonusMeterPercent >= 100) {
        // Award extra life
        lives++;
        livesElement.textContent = lives;
        bonusMeterPercent = 0; // Reset meter
        messageElement.textContent = 'Bonus! Extra life awarded!';
        messageElement.className = 'message correct';
    }
    
    updateBonusMeter();
}

// Start the game
function startGame() {
    if (gameActive) return;
    
    // Reset game state
    score = 0;
    lives = 3;
    digitCount = 3;
    displayTime = 2000;
    bonusMeterPercent = 0; // Reset bonus meter
    updateBonusMeter(); // Update display
    
    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    startBtn.disabled = true;
    startBtn.textContent = 'Playing...';
    
    // Start the game
    gameActive = true;
    startRound();
}

// Event Listeners
startBtn.addEventListener('click', startGame);

submitBtn.addEventListener('click', () => {
    if (userInput.value.trim() !== '') {
        checkAnswer();
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && userInput.value.trim() !== '' && !submitBtn.disabled) {
        checkAnswer();
    }
});

// Initialize the game
loadHighScore();
