const emojis = [
    "🐱", "🐶", "🐭", "🐹", "🦊", "🐻", "🐼", "🐨", "🐯",
    "🦁", "🐸", "🐵", "🐔", "🐧", "🐙", "🦄", "🐞", "🦋",
    "🐲", "🦖", "🦕", "🦢", "🦩", "🦜", "🐳", "🐬", "🐠",
    "🐡", "🦑", "🦐", "🦞", "🦀"
];

// 게임 상태 변수
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let timeLeft = 60;
let level = 1;
let timerInterval;
let levelStartTime;
let levelStartScore;
let disableClick = false; // 클릭 차단 변수

// 레벨별 카드 배열 설정
const levelConfigs = [
    { rows: 2, cols: 3 }, { rows: 2, cols: 4 }, { rows: 3, cols: 4 },
    { rows: 4, cols: 4 }, { rows: 4, cols: 5 }, { rows: 4, cols: 6 },
    { rows: 4, cols: 7 }, { rows: 6, cols: 5 }, { rows: 6, cols: 6 },
    { rows: 6, cols: 7 }, { rows: 6, cols: 8 } // 최대 난이도
];

// 게임 시작 시 실행되는 함수
document.addEventListener("DOMContentLoaded", startGame);

function startGame() {
    score = 0;
    timeLeft = 60;
    level = 1;
    matchedPairs = 0;

    updateUI();
    startTimer();
    generateCards(getLevelConfig().rows, getLevelConfig().cols);
}

// UI를 업데이트하는 함수
function updateUI() {
    document.getElementById("score").textContent = score;
    document.getElementById("level").textContent = level;
    document.getElementById("timer").textContent = timeLeft;
}

// 타이머를 시작하는 함수
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// 현재 레벨의 카드 배열을 반환하는 함수
function getLevelConfig() {
    return level <= levelConfigs.length ? levelConfigs[level - 1] : { rows: 6, cols: 8 };
}

// 게임 카드를 생성하는 함수
function generateCards(rows, cols) {
    let gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 80px)`;

    let totalCards = rows * cols;
    let cardValues = [];

    // 이모지 쌍을 랜덤하게 추가
    for (let i = 0; i < totalCards / 2; i++) {
        cardValues.push(emojis[i], emojis[i]);
    }
    cardValues.sort(() => Math.random() - 0.5);

    let cardElements = [];
    cardValues.forEach(value => {
        let card = document.createElement("div");
        card.classList.add("card");
        card.dataset.value = value;
        card.textContent = value; // 초기에는 카드 보이기
        gameBoard.appendChild(card);
        cardElements.push(card);
    });

    // 메시지 추가 (카운트다운 포함)
    let message = document.createElement("p");
    message.id = "flip-message";
    message.style.fontSize = "18px";
    message.style.fontWeight = "bold";
    message.style.margin = "10px 0";
    message.style.color = "red";

    let countdown = 3;
    message.textContent = `⏳ ${countdown}초 뒤 카드가 뒤집힙니다...`;
    gameBoard.parentNode.insertBefore(message, gameBoard);

    // 3초 카운트다운 후 카드 뒤집기
    let countdownInterval = setInterval(() => {
        countdown--;
        message.textContent = `⏳ ${countdown}초 뒤 카드가 뒤집힙니다...`;

        if (countdown === 0) {
            clearInterval(countdownInterval);
            message.remove();

            cardElements.forEach(card => {
                card.textContent = "";
                card.addEventListener("click", flipCard);
            });
        }
    }, 1000);
}

// 카드 클릭 이벤트 처리 함수
function flipCard() {
    if (disableClick || flippedCards.length >= 2 || this.classList.contains("matched")) return;

    this.textContent = this.dataset.value;
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        disableClick = true;
        checkMatch();
    }
}

// 카드 일치 여부를 확인하는 함수
function checkMatch() {
    let [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        matchedPairs++;
        score += 10;
        updateUI();

        flippedCards = [];
        disableClick = false;

        // 모든 짝을 맞췄을 경우 → 0.6초 뒤 레벨업
        if (matchedPairs === getLevelConfig().rows * getLevelConfig().cols / 2) {
            setTimeout(levelUp, 600);
        }
    } else {
        setTimeout(() => {
            card1.textContent = "";
            card2.textContent = "";
            flippedCards = [];
            disableClick = false;
        }, 800);
    }
}

// 게임 종료 시 실행되는 함수
function endGame() {
    clearInterval(timerInterval);
    localStorage.setItem("score", score);
    window.location.href = "../pages/gameover.html";
}

// 레벨을 증가시키고 다음 스테이지로 넘어가는 함수
function levelUp() {
    // 레벨 종료 시간 기록
    let levelEndTime = Date.now();

    // levelStartTime이 정상적으로 설정되지 않은 경우 대비
    if (!levelStartTime) {
        levelStartTime = Date.now();
    }

    // 소요시간 계산 (NaN 방지, 음수 방지)
    let elapsedTime = Math.max(0, Math.floor((levelEndTime - levelStartTime) / 1000));

    // 획득 점수 계산 (레벨 1에서는 전체 점수 = 획득 점수)
    let levelScore = (level === 1) ? score : (score - levelStartScore);

    let totalScore = score;

    setTimeout(() => {
        alert(`레벨 ${level + 1}로 넘어갑니다.\n소요시간: ${elapsedTime}초\n획득점수: ${levelScore}\n총 점수: ${totalScore}`);

        level++; // 레벨 증가
        resetGame(); // 다음 레벨로 이동
    }, 300);
}

// 게임을 초기화하고 새로운 카드 배열을 생성하는 함수
function resetGame() {
    matchedPairs = 0;

    // 새로운 레벨 시작 시간 초기화 (NaN 방지)
    levelStartTime = Date.now();
    levelStartScore = score;

    updateUI();
    generateCards(getLevelConfig().rows, getLevelConfig().cols);
}

/* ──────────────────────────────────────────────── */
/* 치트키 기능 */
/* ──────────────────────────────────────────────── */

// 키보드 이벤트 감지 (치트키 설정)
document.addEventListener("keydown", (event) => {
    if (event.shiftKey && event.key === "D") {
        cheatNextLevel();
    } else if (event.shiftKey && event.key === "A") {
        cheatPreviousLevel();
    }
});

// 치트키: 다음 레벨로 이동 (Shift + D)
function cheatNextLevel() {
    alert(`치트 활성화! 레벨 ${level} → ${level + 1}`);
    level++;
    resetGame();
}

// 치트키: 이전 레벨로 이동 (Shift + A)
function cheatPreviousLevel() {
    if (level > 1) {
        alert(`치트 활성화! 레벨 ${level} → ${level - 1}`);
        level--;
        resetGame();
    } else {
        alert("첫 번째 레벨입니다!");
    }
}
