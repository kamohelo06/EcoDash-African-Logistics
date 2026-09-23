const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const batteryDisplay = document.querySelector("#battery");
const scoreDisplay = document.querySelector("#score");
const deliveriesDisplay = document.querySelector("#deliveries");
const startScreen = document.querySelector("#startScreen");
const gameOverScreen = document.querySelector("#gameOverScreen");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const finalScoreDisplay = document.querySelector("#finalScore");
const message = document.querySelector("#message");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// ===============================
// PLAYER CLASS
// ===============================

class Player {

    constructor() {
        this.x = 150;
        this.y = 250;

        this.radius = 25;

        this.velocityX = 0;
        this.velocityY = 0;

        this.acceleration = 0.25;
        this.friction = 0.96;
        this.maxSpeed = 6;

        this.angle = 0;

        this.battery = 100;
    }

    update(keys) {

        // Forward movement
        if (keys["ArrowUp"]) {

            this.velocityX += Math.cos(this.angle) * this.acceleration;
            this.velocityY += Math.sin(this.angle) * this.acceleration;

            this.battery -= 0.025;
        }

        // Reverse movement
        if (keys["ArrowDown"]) {

            this.velocityX -= Math.cos(this.angle) * this.acceleration;
            this.velocityY -= Math.sin(this.angle) * this.acceleration;

            this.battery -= 0.035;
        }

        // Rotate left
        if (keys["ArrowLeft"]) {
            this.angle -= 0.07;
        }

        // Rotate right
        if (keys["ArrowRight"]) {
            this.angle += 0.07;
        }

        // Friction
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        // Limit speed
        const speed = Math.sqrt(
            this.velocityX ** 2 + this.velocityY ** 2
        );

        if (speed > this.maxSpeed) {

            this.velocityX =
                (this.velocityX / speed) * this.maxSpeed;

            this.velocityY =
                (this.velocityY / speed) * this.maxSpeed;
        }

        // Move player
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Keep player inside canvas
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

        // Vehicle body
        ctx.fillStyle = "#222";
        ctx.fillRect(-25, -15, 50, 30);

        // Front
        ctx.fillStyle = "#f4c542";
        ctx.fillRect(10, -10, 15, 20);

        // Wheels
        ctx.fillStyle = "#111";

        ctx.fillRect(-18, -20, 10, 8);
        ctx.fillRect(8, -20, 10, 8);

        ctx.fillRect(-18, 12, 10, 8);
        ctx.fillRect(8, 12, 10, 8);

        ctx.restore();
    }
}


// ===============================
// OBSTACLE CLASS
// ===============================

class Obstacle {

    constructor(x, y, width, height) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;
    }

    draw() {

        ctx.fillStyle = "#795548";

        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        ctx.strokeStyle = "#3e2723";
        ctx.strokeRect(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}


// ===============================
// DELIVERY CLASS
// ===============================

class Delivery {

    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.radius = 15;

        this.collected = false;
    }

    draw() {

        if (this.collected) {
            return;
        }

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
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("📦", this.x, this.y + 5);

        ctx.textAlign = "left";
    }
}


// ===============================
// GAME VARIABLES
// ===============================

const keys = {};

let player;

let obstacles = [];

let deliveries = [];

let score = 0;

let deliveryCount = 0;

let gameRunning = false;


// ===============================
// KEYBOARD INPUT
// ===============================

document.addEventListener("keydown", function(event) {

    keys[event.key] = true;

});

document.addEventListener("keyup", function(event) {

    keys[event.key] = false;

});


// ===============================
// COLLISION DETECTION
// ===============================

function circleRectangleCollision(circle, rectangle) {

    const closestX = Math.max(
        rectangle.x,
        Math.min(circle.x, rectangle.x + rectangle.width)
    );

    const closestY = Math.max(
        rectangle.y,
        Math.min(circle.y, rectangle.y + rectangle.height)
    );

    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;

    const distanceSquared =
        distanceX * distanceX +
        distanceY * distanceY;

    return distanceSquared <
        circle.radius * circle.radius;
}


// ===============================
// DELIVERY COLLISION
// ===============================

function checkDeliveries() {

    deliveries.forEach(function(delivery) {

        if (delivery.collected) {
            return;
        }

        const dx = player.x - delivery.x;
        const dy = player.y - delivery.y;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        if (distance <
            player.radius + delivery.radius) {

            delivery.collected = true;

            score += 100;

            deliveryCount++;

            createNewDelivery();
        }
    });
}


// ===============================
// CREATE DELIVERY
// ===============================

function createNewDelivery() {

    let x;
    let y;

    do {

        x = 100 + Math.random() *
            (canvas.width - 200);

        y = 150 + Math.random() *
            (canvas.height - 250);

    } while (
        obstacles.some(function(obstacle) {

            return (
                x > obstacle.x - 30 &&
                x < obstacle.x +
                    obstacle.width + 30 &&

                y > obstacle.y - 30 &&
                y < obstacle.y +
                    obstacle.height + 30
            );

        })
    );

    deliveries.push(
        new Delivery(x, y)
    );
}


// ===============================
// CHECK OBSTACLES
// ===============================

function checkObstacles() {

    obstacles.forEach(function(obstacle) {

        if (
            circleRectangleCollision(
                player,
                obstacle
            )
        ) {

            player.velocityX *= -0.5;
            player.velocityY *= -0.5;

            score = Math.max(
                0,
                score - 10
            );
        }

    });
}


// ===============================
// DRAW ENVIRONMENT
// ===============================

function drawEnvironment() {

    // Ground
    ctx.fillStyle = "#d9b36c";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Road
    ctx.fillStyle = "#777";

    ctx.fillRect(
        0,
        canvas.height / 2 - 70,
        canvas.width,
        140
    );


    // Road markings
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


    // Acacia-style trees
    for (let x = 80; x < canvas.width; x += 220) {

        drawTree(
            x,
            canvas.height - 120
        );
    }
}


// ===============================
// TREE
// ===============================

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


// ===============================
// UI UPDATE
// ===============================

function updateUI() {

    batteryDisplay.textContent =
        Math.floor(player.battery) + "%";

    scoreDisplay.textContent =
        score;

    deliveriesDisplay.textContent =
        deliveryCount;
}


// ===============================
// START GAME
// ===============================

function startGame() {

    player = new Player();

    obstacles = [];

    deliveries = [];

    score = 0;

    deliveryCount = 0;

    gameRunning = true;


    // Obstacles
    obstacles.push(
        new Obstacle(350, 180, 100, 50)
    );

    obstacles.push(
        new Obstacle(650, 450, 120, 60)
    );

    obstacles.push(
        new Obstacle(950, 220, 90, 80)
    );


    // First delivery
    createNewDelivery();


    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    message.textContent =
        "Use ↑ ↓ to move and ← → to turn";
}


// ===============================
// GAME OVER
// ===============================

function gameOver() {

    gameRunning = false;

    finalScoreDisplay.textContent =
        score;

    gameOverScreen.classList.remove(
        "hidden"
    );
}


// ===============================
// LOCAL STORAGE
// ===============================

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


// ===============================
// GAME LOOP
// ===============================

function animate() {

    drawEnvironment();

    if (gameRunning) {

        player.update(keys);

        checkObstacles();

        checkDeliveries();

        deliveries.forEach(function(delivery) {
            delivery.draw();
        });

        obstacles.forEach(function(obstacle) {
            obstacle.draw();
        });

        player.draw();

        updateUI();

        if (player.battery <= 0) {

            saveHighScore();

            gameOver();
        }
    }

    requestAnimationFrame(animate);
}


// ===============================
// BUTTONS
// ===============================

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


// Start animation
animate();