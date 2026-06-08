// App State
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = []; // stores indices of selected options
let totalQuestions = 0;
let questions = [];

// Timer state
let timerInterval = null;
let secondsElapsed = 0;

// Confetti animation variables
let confettiActive = false;
let confettiPieces = [];
const confettiColors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const reviewScreen = document.getElementById('review-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const reviewBtn = document.getElementById('review-btn');
const backToResultsBtn = document.getElementById('back-to-results-btn');

const currentQNumEl = document.getElementById('current-q-num');
const totalQNumEl = document.getElementById('total-q-num');
const timerValEl = document.getElementById('timer-val');
const progressBar = document.getElementById('progress-bar');
const questionContentArea = document.getElementById('question-content-area');
const questionTextEl = document.getElementById('question-text');
const optionsGrid = document.getElementById('options-grid');
const questionImageBox = document.getElementById('question-image-box');
const questionImg = document.getElementById('question-img');

// Results elements
const circularProgressVal = document.getElementById('circular-progress-val');
const percentageText = document.getElementById('percentage-text');
const rewardBadge = document.getElementById('reward-badge');
const correctCountEl = document.getElementById('correct-count');
const incorrectCountEl = document.getElementById('incorrect-count');
const timeSpentEl = document.getElementById('time-spent');

// Review elements
const reviewList = document.getElementById('review-list');

// Initialize Quiz Data
document.addEventListener('DOMContentLoaded', () => {
  if (typeof quizQuestions !== 'undefined') {
    questions = quizQuestions;
    totalQuestions = questions.length;
    totalQNumEl.textContent = totalQuestions;
  } else {
    console.error("Quiz questions data not found!");
  }
  
  // Set up Event Listeners
  startBtn.addEventListener('click', startQuiz);
  nextBtn.addEventListener('click', nextQuestion);
  restartBtn.addEventListener('click', restartQuiz);
  reviewBtn.addEventListener('click', showReview);
  backToResultsBtn.addEventListener('click', backToResults);
});

// Switch screens helper
function showScreen(screen) {
  [startScreen, quizScreen, resultsScreen, reviewScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

// Timer helpers
function startTimer() {
  secondsElapsed = 0;
  timerValEl.textContent = "00:00";
  timerValEl.parentElement.classList.remove('warning');
  
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    timerValEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Add warning styling if total time takes too long (e.g. > 15 mins)
    if (secondsElapsed > 900) {
      timerValEl.parentElement.classList.add('warning');
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Start Quiz logic
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  
  showScreen(quizScreen);
  startTimer();
  loadQuestion(currentQuestionIndex);
}

// Load Question
function loadQuestion(index) {
  nextBtn.style.display = 'none';
  const q = questions[index];
  
  // Fade out content first
  questionContentArea.classList.remove('fade-in');
  questionContentArea.classList.add('fade-out');
  
  setTimeout(() => {
    // Update progress HUD
    currentQNumEl.textContent = index + 1;
    const progressPercent = ((index + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Render question text
    questionTextEl.textContent = q.question;
    
    // Render diagram/image if present
    if (q.image) {
      questionImg.src = q.image;
      questionImageBox.style.display = 'flex';
    } else {
      questionImageBox.style.display = 'none';
      questionImg.src = '';
    }
    
    // Check if options contain images to toggle grid layout
    const hasImageOptions = q.options.some(opt => opt.image);
    if (hasImageOptions) {
      optionsGrid.classList.add('image-grid');
    } else {
      optionsGrid.classList.remove('image-grid');
    }
    
    // Render options grid
    optionsGrid.innerHTML = '';
    
    const labels = ['ก', 'ข', 'ค', 'ง'];
    q.options.forEach((opt, oIdx) => {
      const optionBtn = document.createElement('button');
      optionBtn.className = 'option-btn';
      optionBtn.setAttribute('aria-label', `ตัวเลือก ${labels[oIdx]}: ${opt.text || 'ภาพประกอบ'}`);
      
      let contentHtml = `
        <div class="option-content">
          <span class="option-label">${labels[oIdx]}</span>
          <span class="option-text">${opt.text}</span>
      `;
      
      if (opt.image) {
        contentHtml += `<img src="${opt.image}" class="option-image" alt="ตัวเลือก ${labels[oIdx]}">`;
      }
      
      contentHtml += `</div>`;
      optionBtn.innerHTML = contentHtml;
      
      optionBtn.addEventListener('click', () => selectOption(oIdx));
      optionsGrid.appendChild(optionBtn);
    });
    
    // Fade back in
    questionContentArea.classList.remove('fade-out');
    questionContentArea.classList.add('fade-in');
    
    setTimeout(() => {
      questionContentArea.classList.remove('fade-in');
    }, 250);
  }, 200);
}

// Select Option
function selectOption(selectedIdx) {
  const q = questions[currentQuestionIndex];
  userAnswers.push(selectedIdx);
  
  // Disable all options
  const optionBtns = optionsGrid.querySelectorAll('.option-btn');
  optionBtns.forEach(btn => btn.disabled = true);
  
  const isCorrect = (selectedIdx === q.correctAnswer);
  
  // Update score
  if (isCorrect) {
    score++;
  }
  
  // Style correct and incorrect options
  optionBtns.forEach((btn, oIdx) => {
    if (oIdx === q.correctAnswer) {
      btn.classList.add('correct');
      // Add checkmark icon
      const icon = document.createElement('div');
      icon.className = 'feedback-icon correct';
      icon.innerHTML = '✓';
      btn.querySelector('.option-content').appendChild(icon);
    } else if (oIdx === selectedIdx && !isCorrect) {
      btn.classList.add('incorrect');
      // Add cross icon
      const icon = document.createElement('div');
      icon.className = 'feedback-icon incorrect';
      icon.innerHTML = '✗';
      btn.querySelector('.option-content').appendChild(icon);
    }
  });
  
  // Show next button (or Finish button if it's the last question)
  if (currentQuestionIndex < totalQuestions - 1) {
    nextBtn.textContent = 'ข้อถัดไป ➔';
  } else {
    nextBtn.textContent = 'ดูผลคะแนน 🏆';
  }
  nextBtn.style.display = 'inline-flex';
}

// Next Question / Finish Quiz
function nextQuestion() {
  if (currentQuestionIndex < totalQuestions - 1) {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
  } else {
    finishQuiz();
  }
}

// Finish Quiz & Show Results
function finishQuiz() {
  stopTimer();
  showScreen(resultsScreen);
  
  // Calculations
  const incorrectCount = totalQuestions - score;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Render text stats
  correctCountEl.textContent = score;
  incorrectCountEl.textContent = incorrectCount;
  
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  timeSpentEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  // Trigger circular progress ring animation
  setTimeout(() => {
    animateCircularProgress(percentage);
  }, 100);
  
  // Badge and Confetti depending on score
  if (percentage >= 90) {
    rewardBadge.textContent = '🏅 เหรียญทองเกียรติยศ';
    rewardBadge.className = 'badge badge-gold';
    startConfetti();
  } else if (percentage >= 70) {
    rewardBadge.textContent = '🥈 เหรียญเงินดีเด่น';
    rewardBadge.className = 'badge badge-silver';
    startConfetti();
  } else if (percentage >= 50) {
    rewardBadge.textContent = '🥉 เหรียญทองแดงผ่านเกณฑ์';
    rewardBadge.className = 'badge badge-bronze';
  } else {
    rewardBadge.textContent = '💡 พยายามอีกนิดนะ';
    rewardBadge.className = 'badge btn-secondary';
  }
}

// Animate Circular Progress SVG
function animateCircularProgress(percent) {
  // SVG Circumference is 502.4 (2 * PI * 80)
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (percent / 100) * circumference;
  circularProgressVal.style.strokeDashoffset = offset;
  
  // Increment percentage counter text
  let currentVal = 0;
  const counterInterval = setInterval(() => {
    if (currentVal >= percent) {
      clearInterval(counterInterval);
      percentageText.textContent = `${percent}%`;
    } else {
      currentVal++;
      percentageText.textContent = `${currentVal}%`;
    }
  }, 15);
}

// Restart Quiz
function restartQuiz() {
  stopConfetti();
  startQuiz();
}

// Show Review
function showReview() {
  stopConfetti();
  showScreen(reviewScreen);
  
  reviewList.innerHTML = '';
  const labels = ['ก', 'ข', 'ค', 'ง'];
  
  questions.forEach((q, qIdx) => {
    const userAnsIdx = userAnswers[qIdx];
    const isCorrect = (userAnsIdx === q.correctAnswer);
    
    const reviewItem = document.createElement('div');
    reviewItem.className = `review-item ${isCorrect ? 'item-correct' : 'item-incorrect'}`;
    
    let htmlContent = `
      <div class="review-q-header">
        <span class="review-q-num">ข้อที่ ${qIdx + 1}</span>
        <span class="review-q-text">${q.question.replace(/^จากภาพใช้ตอบข้อที่\s*\d+\-\d+\n/, '')}</span>
        <span class="review-q-status ${isCorrect ? 'correct' : 'incorrect'}">
          ${isCorrect ? '✓ ถูกต้อง' : '✗ ผิด'}
        </span>
      </div>
    `;
    
    if (q.image) {
      htmlContent += `
        <div class="question-image-container" style="max-width: 250px; margin: 10px 0;">
          <img src="${q.image}" alt="ภาพประกอบข้อ ${qIdx + 1}">
        </div>
      `;
    }
    
    htmlContent += `<div class="review-options">`;
    
    q.options.forEach((opt, oIdx) => {
      let optClass = 'review-option';
      let statusIcon = '';
      
      if (oIdx === q.correctAnswer) {
        optClass += ' correct';
        statusIcon = ' (✓ เฉลยที่ถูกต้อง)';
      } else if (oIdx === userAnsIdx && !isCorrect) {
        optClass += ' selected-incorrect';
        statusIcon = ' (✗ คุณตอบข้อนี้)';
      }
      
      htmlContent += `
        <div class="${optClass}">
          <strong>${labels[oIdx]}.</strong> 
          <span>${opt.text}</span>
      `;
      
      if (opt.image) {
        htmlContent += `<img src="${opt.image}" class="option-image" style="max-width: 80px; max-height: 50px;" alt="ตัวเลือก">`;
      }
      
      htmlContent += `<span>${statusIcon}</span>`;
      htmlContent += `</div>`;
    });
    
    htmlContent += `</div></div>`;
    reviewItem.innerHTML = htmlContent;
    reviewList.appendChild(reviewItem);
  });
}

function backToResults() {
  showScreen(resultsScreen);
  // Re-trigger circular animation
  const percentage = Math.round((score / totalQuestions) * 100);
  animateCircularProgress(percentage);
}

// Confetti System
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

function startConfetti() {
  confettiActive = true;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  confettiPieces = [];
  
  // Create 150 confetti pieces
  for (let i = 0; i < 150; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speed: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2
    });
  }
  
  window.addEventListener('resize', resizeConfettiCanvas);
  requestAnimationFrame(updateConfetti);
}

function resizeConfettiCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function updateConfetti() {
  if (!confettiActive) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  let piecesStillFalling = false;
  
  confettiPieces.forEach(p => {
    p.y += p.speed;
    p.rotation += p.rotationSpeed;
    
    // Draw piece
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
    
    // Reset piece to top if it goes off bottom
    if (p.y > canvas.height) {
      p.y = -20;
      p.x = Math.random() * canvas.width;
    }
    
    piecesStillFalling = true;
  });
  
  if (piecesStillFalling) {
    requestAnimationFrame(updateConfetti);
  }
}

function stopConfetti() {
  confettiActive = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  window.removeEventListener('resize', resizeConfettiCanvas);
}
