const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const batteryDisplay = document.querySelector("#battery");
const batteryFill = document.querySelector("#batteryFill");
const scoreDisplay = document.querySelector("#score");
const highScoreDisplay = document.querySelector("#highScore");
const deliveriesDisplay = document.querySelector("#deliveries");
const distanceDisplay = document.querySelector("#distance");
const energyDisplay = document.querySelector("#energy");
const efficiencyDisplay = document.querySelector("#efficiency");
const startScreen = document.querySelector("#startScreen");
const gameOverScreen = document.querySelector("#gameOverScreen");
const pauseScreen = document.querySelector("#pauseScreen");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const resumeButton = document.querySelector("#resumeButton");
const finalScoreDisplay = document.querySelector("#finalScore");
const message = document.querySelector("#message");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


class Player {
    constructor() {
        this.x = 150;
        this.y = canvas.height / 2;
        this.radius = 25;

        this.velocityX = 0;
        this.velocityY = 0;

        this.acceleration = 0.25;
        this.friction = 0.96;
        this.maxSpeed = 6;

        this.angle = 0;

        this.battery = 100;
        this.distance = 0;
        this.energyUsed = 0;
    }

    update(keys) {
        if (keys["ArrowUp"]) {
            this.velocityX += Math.cos(this.angle) * this.acceleration;
            this.velocityY += Math.sin(this.angle) * this.acceleration;

            this.battery -= 0.025;
            this.energyUsed += 0.025;
        }

        if (keys["ArrowDown"]) {
            this.velocityX -= Math.cos(this.angle) * this.acceleration;
            this.velocityY -= Math.sin(this.angle) * this.acceleration;

            this.battery -= 0.035;
            this.energyUsed += 0.035;
        }

        if (keys["ArrowLeft"]) {
            this.angle -= 0.07;
        }

        if (keys["ArrowRight"]) {
            this.angle += 0.07;
        }

        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        const speed = Math.sqrt(
            this.velocityX ** 2 +
            this.velocityY ** 2
        );

        if (speed > this.maxSpeed) {
            this.velocityX =
                (this.velocityX / speed) * this.maxSpeed;

            this.velocityY =
                (this.velocityY / speed) * this.maxSpeed;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.distance += speed * 0.01;

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.velocityX *= -0.5;
        }

        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.velocityX *= -0.5;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocityY *= -0.5;
        }

        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.velocityY *= -0.5;
        }

        if (this.battery < 0) {
            this.battery = 0;
        }
    }

    draw() {
        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = "#222";
        ctx.fillRect(-25, -15, 50, 30);

        ctx.fillStyle = "#f4c542";
        ctx.fillRect(5, -10, 20, 20);

        ctx.fillStyle = "#111";

        ctx.fillRect(-18, -20, 10, 8);
        ctx.fillRect(8, -20, 10, 8);
        ctx.fillRect(-18, 12, 10, 8);
        ctx.fillRect(8, 12, 10, 8);

        ctx.restore();
    }
}


class Obstacle {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw() {
        if (this.type === "pothole") {
            ctx.fillStyle = "#333";

            ctx.beginPath();

            ctx.ellipse(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2,
                this.height / 2,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        else if (this.type === "tree") {
            ctx.fillStyle = "#5d4037";

            ctx.fillRect(
                this.x,
                this.y,
                this.width,
                this.height
            );

            ctx.fillStyle = "#356b35";

            ctx.beginPath();

            ctx.arc(
                this.x + this.width / 2,
                this.y,
                35,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        else if (this.type === "construction") {
            ctx.fillStyle = "#e67e22";

            ctx.fillRect(
                this.x,
                this.y,
                this.width,
                this.height
            );

            ctx.fillStyle = "#fff";
            ctx.font = "20px Arial";

            ctx.fillText(
                "⚠",
                this.x + this.width / 2 - 10,
                this.y + this.height / 2 + 7
            );
        }

        else if (this.type === "river") {
            ctx.fillStyle = "#3185a8";

            ctx.fillRect(
                this.x,
                this.y,
                this.width,
                this.height
            );

            ctx.strokeStyle = "#8ed1e8";
            ctx.lineWidth = 2;

            for (
                let y = this.y + 10;
                y < this.y + this.height;
                y += 15
            ) {
                ctx.beginPath();

                ctx.moveTo(
                    this.x + 10,
                    y
                );

                ctx.lineTo(
                    this.x + this.width - 10,
                    y
                );

                ctx.stroke();
            }
        }

        else if (this.type === "wildlife") {
            ctx.fillStyle = "rgba(139,90,43,0.65)";

            ctx.fillRect(
                this.x,
                this.y,
                this.width,
                this.height
            );

            ctx.strokeStyle = "#5d4037";
            ctx.lineWidth = 3;

            ctx.strokeRect(
                this.x,
                this.y,
                this.width,
                this.height
            );

            ctx.font = "32px Arial";
            ctx.textAlign = "center";

            ctx.fillText(
                "🐘",
                this.x + this.width / 2,
                this.y + this.height / 2 + 11
            );

            ctx.textAlign = "left";
        }
    }
}


class Delivery {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.collected = false;
    }

    draw() {
        if (this.collected) return;

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#f4c542";
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "📦",
            this.x,
            this.y + 6
        );

        ctx.textAlign = "left";
    }
}


class SolarZone {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw() {
        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2
        );

        if (loadShedding) {
            ctx.fillStyle = "rgba(120,120,120,0.35)";
            ctx.strokeStyle = "#555";
        } else {
            ctx.fillStyle = "rgba(255,220,50,0.35)";
            ctx.strokeStyle = "#f4c542";
        }

        ctx.fill();

        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = "#111";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";

        if (loadShedding) {
            ctx.fillText(
                "⚡ OFFLINE",
                this.x,
                this.y + 5
            );
        } else {
            ctx.fillText(
                "☀ SOLAR",
                this.x,
                this.y + 5
            );
        }

        ctx.textAlign = "left";
    }
}


const keys = {};

let player;

let obstacles = [];
let deliveries = [];
let solarZones = [];
let dustParticles = [];

let score = 0;
let deliveryCount = 0;

let gameRunning = false;
let gamePaused = false;

let weatherTime = 0;

let windX = 0;
let windY = 0;

let loadShedding = false;
let loadSheddingTimer = 0;

let raining = true;

let collisionCooldown = 0;


/* DUST PARTICLES */

class DustParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.velocityX =
            (Math.random() - 0.5) * 1.5;

        this.velocityY =
            (Math.random() - 0.5) * 1.5;

        this.size =
            4 + Math.random() * 5;

        this.life = 1;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        this.size += 0.15;

        this.life -= 0.025;
    }

    draw() {
        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(160,120,70,${this.life})`;

        ctx.fill();
    }
}


function createDust() {
    const speed = Math.sqrt(
        player.velocityX ** 2 +
        player.velocityY ** 2
    );

    if (speed > 1) {
        const dustX =
            player.x -
            Math.cos(player.angle) * 28;

        const dustY =
            player.y -
            Math.sin(player.angle) * 28;

        dustParticles.push(
            new DustParticle(
                dustX,
                dustY
            )
        );
    }
}


function updateDust() {
    for (
        let i = dustParticles.length - 1;
        i >= 0;
        i--
    ) {
        dustParticles[i].update();

        if (dustParticles[i].life <= 0) {
            dustParticles.splice(i, 1);
        }
    }
}


function drawDust() {
    dustParticles.forEach(
        function(particle) {
            particle.draw();
        }
    );
}


/* SOUND */

let audioContext = null;

function playSound(
    frequency,
    duration,
    type = "sine"
) {
    if (!audioContext) {
        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.value = 0.08;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


/* KEYBOARD */

document.addEventListener(
    "keydown",
    function(event) {
        keys[event.key] = true;

        if (
            event.key.toLowerCase() === "p" &&
            gameRunning
        ) {
            gamePaused = !gamePaused;

            if (gamePaused) {
                pauseScreen
                    .classList
                    .remove("hidden");

                message.textContent =
                    "⏸ Game Paused";
            } else {
                pauseScreen
                    .classList
                    .add("hidden");

                message.textContent =
                    "Game resumed";
            }
        }
    }
);


document.addEventListener(
    "keyup",
    function(event) {
        keys[event.key] = false;
    }
);


function circleRectangleCollision(
    circle,
    rectangle
) {
    const closestX = Math.max(
        rectangle.x,
        Math.min(
            circle.x,
            rectangle.x +
            rectangle.width
        )
    );

    const closestY = Math.max(
        rectangle.y,
        Math.min(
            circle.y,
            rectangle.y +
            rectangle.height
        )
    );

    const distanceX =
        circle.x - closestX;

    const distanceY =
        circle.y - closestY;

    const distanceSquared =
        distanceX * distanceX +
        distanceY * distanceY;

    return (
        distanceSquared <
        circle.radius * circle.radius
    );
}


function checkDeliveries() {
    deliveries.forEach(
        function(delivery) {
            if (delivery.collected) {
                return;
            }

            const dx =
                player.x - delivery.x;

            const dy =
                player.y - delivery.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <
                player.radius +
                delivery.radius
            ) {
                delivery.collected = true;

                deliveryCount++;
                score += 100;

                playSound(
                    700,
                    0.15,
                    "sine"
                );

                createNewDelivery();

                message.textContent =
                    "📦 Supply delivered! +100 points";
            }
        }
    );
}


function createNewDelivery() {
    let x;
    let y;
    let validPosition = false;

    while (!validPosition) {
        x =
            100 +
            Math.random() *
            Math.max(
                100,
                canvas.width - 200
            );

        y =
            150 +
            Math.random() *
            Math.max(
                100,
                canvas.height - 250
            );

        validPosition =
            !obstacles.some(
                function(obstacle) {
                    return (
                        x >
                        obstacle.x - 40 &&

                        x <
                        obstacle.x +
                        obstacle.width +
                        40 &&

                        y >
                        obstacle.y - 40 &&

                        y <
                        obstacle.y +
                        obstacle.height +
                        40
                    );
                }
            );
    }

    deliveries.push(
        new Delivery(x, y)
    );
}


function checkObstacles() {
    if (collisionCooldown > 0) {
        collisionCooldown--;
        return;
    }

    obstacles.forEach(
        function(obstacle) {
            if (
                circleRectangleCollision(
                    player,
                    obstacle
                )
            ) {
                player.velocityX *= -0.7;
                player.velocityY *= -0.7;

                playSound(
                    150,
                    0.2,
                    "square"
                );

                score =
                    Math.max(
                        0,
                        score - 10
                    );

                if (
                    obstacle.type ===
                    "pothole"
                ) {
                    player.battery -= 2;

                    message.textContent =
                        "🕳️ Pothole hit! -10 points, -2% battery";
                }

                else if (
                    obstacle.type ===
                    "river"
                ) {
                    player.battery -= 3;

                    message.textContent =
                        "🌊 Flood area! -10 points, -3% battery";
                }

                else if (
                    obstacle.type ===
                    "construction"
                ) {
                    message.textContent =
                        "🚧 Construction zone! -10 points";
                }

                else if (
                    obstacle.type ===
                    "tree"
                ) {
                    player.battery -= 1;

                    message.textContent =
                        "🌳 Fallen tree! -10 points, -1% battery";
                }

                else if (
                    obstacle.type ===
                    "wildlife"
                ) {
                    score =
                        Math.max(
                            0,
                            score - 10
                        );

                    player.battery -= 4;

                    message.textContent =
                        "🐘 Wildlife crossing! -20 points, -4% battery";
                }

                collisionCooldown = 45;
            }
        }
    );
}


function checkSolarZones() {
    solarZones.forEach(
        function(zone) {
            const dx =
                player.x - zone.x;

            const dy =
                player.y - zone.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );

            if (
                distance <
                zone.radius
            ) {
                if (loadShedding) {
                    message.textContent =
                        "⚡ Load-shedding! Charging station offline.";
                } else {
                    player.battery += 0.15;

                    if (player.battery > 100) {
                        player.battery = 100;
                    }

                    message.textContent =
                        "☀ Solar Microgrid charging...";
                }
            }
        }
    );
}


function updateLoadShedding() {
    loadSheddingTimer++;

    if (loadSheddingTimer >= 600) {
        loadShedding =
            !loadShedding;

        loadSheddingTimer = 0;

        if (loadShedding) {
            message.textContent =
                "⚡ Load-shedding active! Solar charging is offline.";
        } else {
            message.textContent =
                "☀ Power restored! Solar charging is available.";
        }
    }
}


function updateEnvironment() {
    weatherTime += 0.01;

    windX =
        Math.sin(weatherTime) *
        0.015;

    windY =
        Math.cos(weatherTime) *
        0.01;

    player.velocityX += windX;
    player.velocityY += windY;
}


function drawEnvironment() {
    ctx.fillStyle = "#d9b36c";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "#777";

    ctx.fillRect(
        0,
        canvas.height / 2 - 70,
        canvas.width,
        140
    );

    ctx.strokeStyle = "#f5f5f5";
    ctx.lineWidth = 4;

    ctx.setLineDash([30, 30]);

    ctx.beginPath();

    ctx.moveTo(
        0,
        canvas.height / 2
    );

    ctx.lineTo(
        canvas.width,
        canvas.height / 2
    );

    ctx.stroke();

    ctx.setLineDash([]);

    for (
        let x = 80;
        x < canvas.width;
        x += 220
    ) {
        drawTree(
            x,
            canvas.height - 120
        );
    }

    ctx.fillStyle =
        "rgba(255,255,255,0.8)";

    ctx.font = "14px Arial";

    ctx.fillText(
        "💨 Wind affecting vehicle movement",
        20,
        canvas.height - 20
    );

    ctx.font = "bold 16px Arial";

    if (loadShedding) {
        ctx.fillStyle = "#b71c1c";

        ctx.fillText(
            "⚡ LOAD-SHEDDING: CHARGING OFFLINE",
            20,
            canvas.height - 45
        );
    } else {
        ctx.fillStyle = "#1b5e20";

        ctx.fillText(
            "☀ POWER AVAILABLE",
            20,
            canvas.height - 45
        );
    }
}


function drawTree(x, y) {
    ctx.fillStyle = "#5d4037";

    ctx.fillRect(
        x - 8,
        y - 70,
        16,
        70
    );

    ctx.beginPath();

    ctx.arc(
        x,
        y - 80,
        45,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#356b35";

    ctx.fill();
}


function drawWeather() {
    if (!raining) {
        return;
    }

    const rainAmount = 60;

    ctx.strokeStyle =
        "rgba(180,220,255,0.55)";

    ctx.lineWidth = 2;

    for (
        let i = 0;
        i < rainAmount;
        i++
    ) {
        const x =
            (
                i * 97 +
                weatherTime * 100
            ) %
            canvas.width;

        const y =
            (
                i * 53 +
                weatherTime * 180
            ) %
            canvas.height;

        ctx.beginPath();

        ctx.moveTo(x, y);

        ctx.lineTo(
            x - 6,
            y + 18
        );

        ctx.stroke();
    }

    ctx.fillStyle =
        "rgba(70,90,110,0.22)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";

    ctx.fillText(
        "🌧 HEAVY RAIN - REDUCED VISIBILITY",
        20,
        120
    );
}


function updateUI() {
    batteryDisplay.textContent =
        Math.floor(player.battery) +
        "%";

    batteryFill.style.width =
        player.battery + "%";

    if (player.battery > 50) {
        batteryFill.style.background =
            "#4caf50";
    }

    else if (player.battery > 20) {
        batteryFill.style.background =
            "#ff9800";
    }

    else {
        batteryFill.style.background =
            "#f44336";
    }

    scoreDisplay.textContent = score;

    const highScore =
        Number(
            localStorage.getItem(
                "ecoDashHighScore"
            )
        ) || 0;

    highScoreDisplay.textContent =
        Math.max(
            highScore,
            score
        );

    deliveriesDisplay.textContent =
        deliveryCount;

    distanceDisplay.textContent =
        player.distance.toFixed(2) +
        " km";

    energyDisplay.textContent =
        player.energyUsed.toFixed(2);

    let efficiency = 0;

    if (player.energyUsed > 0) {
        efficiency =
            player.distance /
            player.energyUsed;
    }

    efficiencyDisplay.textContent =
        efficiency.toFixed(2);
}


function startGame() {
    player = new Player();

    obstacles = [];
    deliveries = [];
    solarZones = [];
    dustParticles = [];

    score = 0;
    deliveryCount = 0;

    gameRunning = true;
    gamePaused = false;

    collisionCooldown = 0;

    loadShedding = false;
    loadSheddingTimer = 0;

    pauseScreen
        .classList
        .add("hidden");

    obstacles.push(
        new Obstacle(
            350,
            210,
            80,
            40,
            "pothole"
        )
    );

    obstacles.push(
        new Obstacle(
            700,
            300,
            90,
            45,
            "pothole"
        )
    );

    obstacles.push(
        new Obstacle(
            900,
            190,
            120,
            35,
            "tree"
        )
    );

    obstacles.push(
        new Obstacle(
            500,
            430,
            100,
            60,
            "construction"
        )
    );

    obstacles.push(
        new Obstacle(
            1050,
            300,
            150,
            70,
            "river"
        )
    );

    obstacles.push(
        new Obstacle(
            750,
            canvas.height / 2 - 30,
            70,
            60,
            "wildlife"
        )
    );

    solarZones.push(
        new SolarZone(
            250,
            canvas.height / 2 - 150,
            55
        )
    );

    solarZones.push(
        new SolarZone(
            canvas.width - 180,
            canvas.height / 2 + 150,
            55
        )
    );

    createNewDelivery();
    createNewDelivery();

    startScreen
        .classList
        .add("hidden");

    gameOverScreen
        .classList
        .add("hidden");

    message.textContent =
        "Deliver supplies and recharge at solar microgrids. Press P to pause.";

    updateUI();
}


function gameOver() {
    gameRunning = false;

    playSound(
        100,
        0.5,
        "sawtooth"
    );

    saveHighScore();

    finalScoreDisplay.textContent =
        score;

    gameOverScreen
        .classList
        .remove("hidden");
}


function saveHighScore() {
    const oldHighScore =
        Number(
            localStorage.getItem(
                "ecoDashHighScore"
            )
        ) || 0;

    if (score > oldHighScore) {
        localStorage.setItem(
            "ecoDashHighScore",
            score
        );
    }
}


function drawGameObjects() {
    solarZones.forEach(
        function(zone) {
            zone.draw();
        }
    );

    deliveries.forEach(
        function(delivery) {
            delivery.draw();
        }
    );

    obstacles.forEach(
        function(obstacle) {
            obstacle.draw();
        }
    );

    player.draw();
}


function animate() {
    drawEnvironment();

    if (gameRunning) {
        if (!gamePaused) {
            player.update(keys);

            createDust();
            updateDust();

            updateEnvironment();

            updateLoadShedding();

            checkObstacles();

            checkSolarZones();

            checkDeliveries();

            updateUI();

            if (player.battery <= 0) {
                gameOver();
            }
        }

        drawDust();

        drawGameObjects();

        drawWeather();
    }

    requestAnimationFrame(
        animate
    );
}


startButton.addEventListener(
    "click",
    function() {
        startGame();
    }
);


restartButton.addEventListener(
    "click",
    function() {
        startGame();
    }
);


resumeButton.addEventListener(
    "click",
    function() {
        gamePaused = false;

        pauseScreen
            .classList
            .add("hidden");

        message.textContent =
            "Game resumed";
    }
);


animate();