// ===============================
// CANVAS
// ===============================

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");


// ===============================
// USER INTERFACE
// ===============================

const batteryDisplay =
    document.querySelector("#battery");

const batteryFill =
    document.querySelector("#batteryFill");

const scoreDisplay =
    document.querySelector("#score");

const highScoreDisplay =
    document.querySelector("#highScore");

const deliveriesDisplay =
    document.querySelector("#deliveries");

const distanceDisplay =
    document.querySelector("#distance");

const energyDisplay =
    document.querySelector("#energy");

const efficiencyDisplay =
    document.querySelector("#efficiency");

const startScreen =
    document.querySelector("#startScreen");

const gameOverScreen =
    document.querySelector("#gameOverScreen");

const pauseScreen =
    document.querySelector("#pauseScreen");

const startButton =
    document.querySelector("#startButton");

const restartButton =
    document.querySelector("#restartButton");

const resumeButton =
    document.querySelector("#resumeButton");

const finalScoreDisplay =
    document.querySelector("#finalScore");

const message =
    document.querySelector("#message");


// ===============================
// CANVAS SIZE
// ===============================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ===============================
// PLAYER CLASS
// ===============================

class Player {

    constructor() {

        this.x = 150;

        this.y =
            canvas.height / 2;

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

        // -----------------------
        // FORWARD
        // -----------------------

        if (keys["ArrowUp"]) {

            this.velocityX +=
                Math.cos(this.angle) *
                this.acceleration;

            this.velocityY +=
                Math.sin(this.angle) *
                this.acceleration;

            this.battery -= 0.025;

            this.energyUsed += 0.025;
        }


        // -----------------------
        // REVERSE
        // -----------------------

        if (keys["ArrowDown"]) {

            this.velocityX -=
                Math.cos(this.angle) *
                this.acceleration;

            this.velocityY -=
                Math.sin(this.angle) *
                this.acceleration;

            this.battery -= 0.035;

            this.energyUsed += 0.035;
        }


        // -----------------------
        // TURN LEFT
        // -----------------------

        if (keys["ArrowLeft"]) {

            this.angle -= 0.07;
        }


        // -----------------------
        // TURN RIGHT
        // -----------------------

        if (keys["ArrowRight"]) {

            this.angle += 0.07;
        }


        // -----------------------
        // FRICTION
        // -----------------------

        this.velocityX *=
            this.friction;

        this.velocityY *=
            this.friction;


        // -----------------------
        // SPEED
        // -----------------------

        const speed =
            Math.sqrt(

                this.velocityX ** 2 +

                this.velocityY ** 2
            );


        // Maximum speed

        if (
            speed >
            this.maxSpeed
        ) {

            this.velocityX =
                (
                    this.velocityX /
                    speed
                ) *
                this.maxSpeed;

            this.velocityY =
                (
                    this.velocityY /
                    speed
                ) *
                this.maxSpeed;
        }


        // -----------------------
        // MOVE VEHICLE
        // -----------------------

        this.x +=
            this.velocityX;

        this.y +=
            this.velocityY;


        // -----------------------
        // DISTANCE
        // -----------------------

        this.distance +=
            speed * 0.01;


        // -----------------------
        // SCREEN BOUNDARIES
        // -----------------------

        if (
            this.x -
            this.radius <
            0
        ) {

            this.x =
                this.radius;

            this.velocityX *=
                -0.5;
        }


        if (
            this.x +
            this.radius >
            canvas.width
        ) {

            this.x =
                canvas.width -
                this.radius;

            this.velocityX *=
                -0.5;
        }


        if (
            this.y -
            this.radius <
            0
        ) {

            this.y =
                this.radius;

            this.velocityY *=
                -0.5;
        }


        if (
            this.y +
            this.radius >
            canvas.height
        ) {

            this.y =
                canvas.height -
                this.radius;

            this.velocityY *=
                -0.5;
        }


        // Battery cannot be negative

        if (
            this.battery < 0
        ) {

            this.battery = 0;
        }
    }


    draw() {

        ctx.save();


        // Move drawing position
        // to player position

        ctx.translate(
            this.x,
            this.y
        );


        // Rotate vehicle

        ctx.rotate(
            this.angle
        );


        // -----------------------
        // VEHICLE BODY
        // -----------------------

        ctx.fillStyle =
            "#222";

        ctx.fillRect(
            -25,
            -15,
            50,
            30
        );


        // -----------------------
        // SOLAR PANEL
        // -----------------------

        ctx.fillStyle =
            "#f4c542";

        ctx.fillRect(
            5,
            -10,
            20,
            20
        );


        // -----------------------
        // WHEELS
        // -----------------------

        ctx.fillStyle =
            "#111";

        ctx.fillRect(
            -18,
            -20,
            10,
            8
        );

        ctx.fillRect(
            8,
            -20,
            10,
            8
        );

        ctx.fillRect(
            -18,
            12,
            10,
            8
        );

        ctx.fillRect(
            8,
            12,
            10,
            8
        );


        ctx.restore();
    }
}


// ===============================
// OBSTACLE CLASS
// ===============================

class Obstacle {

    constructor(
        x,
        y,
        width,
        height,
        type
    ) {

        this.x = x;

        this.y = y;

        this.width =
            width;

        this.height =
            height;

        this.type =
            type;
    }


    draw() {


        // =======================
        // POTHOLE
        // =======================

        if (
            this.type ===
            "pothole"
        ) {

            ctx.fillStyle =
                "#333";

            ctx.beginPath();

            ctx.ellipse(

                this.x +
                this.width / 2,

                this.y +
                this.height / 2,

                this.width / 2,

                this.height / 2,

                0,

                0,

                Math.PI * 2
            );

            ctx.fill();
        }


        // =======================
        // FALLEN TREE
        // =======================

        else if (
            this.type ===
            "tree"
        ) {

            ctx.fillStyle =
                "#5d4037";

            ctx.fillRect(

                this.x,

                this.y,

                this.width,

                this.height
            );


            ctx.fillStyle =
                "#356b35";

            ctx.beginPath();

            ctx.arc(

                this.x +
                this.width / 2,

                this.y,

                35,

                0,

                Math.PI * 2
            );

            ctx.fill();
        }


        // =======================
        // CONSTRUCTION
        // =======================

        else if (
            this.type ===
            "construction"
        ) {

            ctx.fillStyle =
                "#e67e22";

            ctx.fillRect(

                this.x,

                this.y,

                this.width,

                this.height
            );


            ctx.fillStyle =
                "#fff";

            ctx.font =
                "20px Arial";

            ctx.fillText(

                "⚠",

                this.x +
                this.width / 2 -
                10,

                this.y +
                this.height / 2 +
                7
            );
        }


        // =======================
        // RIVER / FLOOD
        // =======================

        else if (
            this.type ===
            "river"
        ) {

            ctx.fillStyle =
                "#3185a8";

            ctx.fillRect(

                this.x,

                this.y,

                this.width,

                this.height
            );


            ctx.strokeStyle =
                "#8ed1e8";

            ctx.lineWidth =
                2;


            for (

                let y =
                    this.y + 10;

                y <
                this.y +
                this.height;

                y += 15

            ) {

                ctx.beginPath();

                ctx.moveTo(

                    this.x + 10,

                    y
                );

                ctx.lineTo(

                    this.x +
                    this.width -
                    10,

                    y
                );

                ctx.stroke();
            }
        }


        // =======================
        // WILDLIFE
        // =======================

        else if (
            this.type ===
            "wildlife"
        ) {

            ctx.fillStyle =
                "rgba(139,90,43,0.65)";

            ctx.fillRect(

                this.x,

                this.y,

                this.width,

                this.height
            );


            ctx.strokeStyle =
                "#5d4037";

            ctx.lineWidth =
                3;

            ctx.strokeRect(

                this.x,

                this.y,

                this.width,

                this.height
            );


            ctx.font =
                "32px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(

                "🐘",

                this.x +
                this.width / 2,

                this.y +
                this.height / 2 +
                11
            );


            ctx.textAlign =
                "left";
        }
    }
}


// ===============================
// DELIVERY CLASS
// ===============================

class Delivery {

    constructor(
        x,
        y
    ) {

        this.x = x;

        this.y = y;

        this.radius =
            18;

        this.collected =
            false;
    }


    draw() {

        if (
            this.collected
        ) {

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


        ctx.fillStyle =
            "#f4c542";

        ctx.fill();


        ctx.strokeStyle =
            "#000";

        ctx.stroke();


        ctx.fillStyle =
            "#000";

        ctx.font =
            "16px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(

            "📦",

            this.x,

            this.y + 6
        );


        ctx.textAlign =
            "left";
    }
}


// ===============================
// SOLAR CHARGING ZONE
// ===============================

class SolarZone {

    constructor(
        x,
        y,
        radius
    ) {

        this.x = x;

        this.y = y;

        this.radius =
            radius;
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


        // Load-shedding appearance

        if (
            loadShedding
        ) {

            ctx.fillStyle =
                "rgba(120,120,120,0.35)";

            ctx.strokeStyle =
                "#555";

        } else {

            ctx.fillStyle =
                "rgba(255,220,50,0.35)";

            ctx.strokeStyle =
                "#f4c542";
        }


        ctx.fill();

        ctx.lineWidth =
            4;

        ctx.stroke();


        ctx.fillStyle =
            "#111";

        ctx.font =
            "16px Arial";

        ctx.textAlign =
            "center";


        if (
            loadShedding
        ) {

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


        ctx.textAlign =
            "left";
    }
}


// ===============================
// GAME VARIABLES
// ===============================

const keys = {};

let player;

let obstacles = [];

let deliveries = [];

let solarZones = [];

let score = 0;

let deliveryCount = 0;

let gameRunning =
    false;

let gamePaused =
    false;

let weatherTime =
    0;

let windX =
    0;

let windY =
    0;

let loadShedding =
    false;

let loadSheddingTimer =
    0;

let raining =
    true;

let collisionCooldown =
    0;


// ===============================
// SOUND SYSTEM
// ===============================

let audioContext =
    null;


function playSound(
    frequency,
    duration,
    type = "sine"
) {

    // Create audio context
    // after user starts interacting

    if (
        !audioContext
    ) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }


    const oscillator =
        audioContext
            .createOscillator();


    const gain =
        audioContext
            .createGain();


    oscillator.type =
        type;


    oscillator.frequency.value =
        frequency;


    gain.gain.value =
        0.08;


    oscillator.connect(
        gain
    );


    gain.connect(
        audioContext.destination
    );


    oscillator.start();


    gain.gain
        .exponentialRampToValueAtTime(

            0.001,

            audioContext.currentTime +
            duration
        );


    oscillator.stop(

        audioContext.currentTime +
        duration
    );
}


// ===============================
// KEYBOARD INPUT
// ===============================

document.addEventListener(

    "keydown",

    function(event) {

        keys[event.key] =
            true;


        // Pause using P

        if (

            event.key
                .toLowerCase() ===
                "p" &&

            gameRunning

        ) {

            gamePaused =
                !gamePaused;


            if (
                gamePaused
            ) {

                pauseScreen
                    .classList
                    .remove(
                        "hidden"
                    );

                message.textContent =
                    "⏸ Game Paused";

            } else {

                pauseScreen
                    .classList
                    .add(
                        "hidden"
                    );

                message.textContent =
                    "Game resumed";
            }
        }
    }
);


document.addEventListener(

    "keyup",

    function(event) {

        keys[event.key] =
            false;
    }
);


// ===============================
// COLLISION DETECTION
// ===============================

function circleRectangleCollision(
    circle,
    rectangle
) {

    const closestX =
        Math.max(

            rectangle.x,

            Math.min(

                circle.x,

                rectangle.x +
                rectangle.width
            )
        );


    const closestY =
        Math.max(

            rectangle.y,

            Math.min(

                circle.y,

                rectangle.y +
                rectangle.height
            )
        );


    const distanceX =
        circle.x -
        closestX;


    const distanceY =
        circle.y -
        closestY;


    const distanceSquared =

        distanceX *
        distanceX +

        distanceY *
        distanceY;


    return (

        distanceSquared <

        circle.radius *
        circle.radius
    );
}


// ===============================
// CHECK DELIVERIES
// ===============================

function checkDeliveries() {

    deliveries.forEach(

        function(delivery) {

            if (
                delivery.collected
            ) {

                return;
            }


            const dx =

                player.x -
                delivery.x;


            const dy =

                player.y -
                delivery.y;


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

                delivery.collected =
                    true;


                deliveryCount++;


                score += 100;


                // ===================
                // DELIVERY SOUND
                // ===================

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


// ===============================
// CREATE DELIVERY
// ===============================

function createNewDelivery() {

    let x;

    let y;

    let validPosition =
        false;


    while (
        !validPosition
    ) {

        x =

            100 +

            Math.random() *

            Math.max(

                100,

                canvas.width -
                200
            );


        y =

            150 +

            Math.random() *

            Math.max(

                100,

                canvas.height -
                250
            );


        validPosition =

            !obstacles.some(

                function(
                    obstacle
                ) {

                    return (

                        x >
                        obstacle.x -
                        40 &&


                        x <
                        obstacle.x +
                        obstacle.width +
                        40 &&


                        y >
                        obstacle.y -
                        40 &&


                        y <
                        obstacle.y +
                        obstacle.height +
                        40
                    );
                }
            );
    }


    deliveries.push(

        new Delivery(
            x,
            y
        )
    );
}


// ===============================
// CHECK OBSTACLES
// ===============================

function checkObstacles() {


    // Collision cooldown

    if (
        collisionCooldown >
        0
    ) {

        collisionCooldown--;

        return;
    }


    obstacles.forEach(

        function(
            obstacle
        ) {


            if (

                circleRectangleCollision(

                    player,

                    obstacle
                )

            ) {


                // -------------------
                // BOUNCE BACK
                // -------------------

                player.velocityX *=
                    -0.7;

                player.velocityY *=
                    -0.7;


                // -------------------
                // COLLISION SOUND
                // -------------------

                playSound(
                    150,
                    0.2,
                    "square"
                );


                // -------------------
                // NORMAL PENALTY
                // -------------------

                score =

                    Math.max(

                        0,

                        score - 10
                    );


                // ===================
                // POTHOLE
                // ===================

                if (

                    obstacle.type ===
                    "pothole"

                ) {

                    player.battery -=
                        2;


                    message.textContent =

                        "🕳️ Pothole hit! -10 points, -2% battery";
                }


                // ===================
                // RIVER
                // ===================

                else if (

                    obstacle.type ===
                    "river"

                ) {

                    player.battery -=
                        3;


                    message.textContent =

                        "🌊 Flood area! -10 points, -3% battery";
                }


                // ===================
                // CONSTRUCTION
                // ===================

                else if (

                    obstacle.type ===
                    "construction"

                ) {

                    message.textContent =

                        "🚧 Construction zone! -10 points";
                }


                // ===================
                // TREE
                // ===================

                else if (

                    obstacle.type ===
                    "tree"

                ) {

                    player.battery -=
                        1;


                    message.textContent =

                        "🌳 Fallen tree! -10 points, -1% battery";
                }


                // ===================
                // WILDLIFE
                // ===================

                else if (

                    obstacle.type ===
                    "wildlife"

                ) {

                    // Extra 10 points
                    // Total wildlife
                    // penalty = 20

                    score =

                        Math.max(

                            0,

                            score - 10
                        );


                    player.battery -=
                        4;


                    message.textContent =

                        "🐘 Wildlife crossing! -20 points, -4% battery";
                }


                // Wait before another
                // collision penalty

                collisionCooldown =
                    45;
            }
        }
    );
}


// ===============================
// SOLAR CHARGING
// ===============================

function checkSolarZones() {

    solarZones.forEach(

        function(zone) {


            const dx =

                player.x -
                zone.x;


            const dy =

                player.y -
                zone.y;


            const distance =

                Math.sqrt(

                    dx * dx +

                    dy * dy
                );


            if (

                distance <
                zone.radius

            ) {


                // -------------------
                // LOAD SHEDDING
                // -------------------

                if (
                    loadShedding
                ) {

                    message.textContent =

                        "⚡ Load-shedding! Charging station offline.";

                } else {


                    // -------------------
                    // CHARGE BATTERY
                    // -------------------

                    player.battery +=
                        0.15;


                    if (

                        player.battery >
                        100

                    ) {

                        player.battery =
                            100;
                    }


                    message.textContent =

                        "☀ Solar Microgrid charging...";
                }
            }
        }
    );
}


// ===============================
// LOAD SHEDDING
// ===============================

function updateLoadShedding() {


    loadSheddingTimer++;


    // Approximately
    // every 10 seconds

    if (

        loadSheddingTimer >=
        600

    ) {

        loadShedding =
            !loadShedding;


        loadSheddingTimer =
            0;


        if (
            loadShedding
        ) {

            message.textContent =

                "⚡ Load-shedding active! Solar charging is offline.";

        } else {

            message.textContent =

                "☀ Power restored! Solar charging is available.";
        }
    }
}


// ===============================
// ENVIRONMENT PHYSICS
// ===============================

function updateEnvironment() {


    weatherTime +=
        0.01;


    // Wind changes
    // direction

    windX =

        Math.sin(
            weatherTime
        ) *

        0.015;


    windY =

        Math.cos(
            weatherTime
        ) *

        0.01;


    // Wind affects vehicle

    player.velocityX +=
        windX;

    player.velocityY +=
        windY;
}


// ===============================
// DRAW ENVIRONMENT
// ===============================

function drawEnvironment() {


    // =======================
    // AFRICAN LANDSCAPE
    // =======================

    ctx.fillStyle =
        "#d9b36c";

    ctx.fillRect(

        0,
        0,

        canvas.width,

        canvas.height
    );


    // =======================
    // ROAD
    // =======================

    ctx.fillStyle =
        "#777";

    ctx.fillRect(

        0,

        canvas.height / 2 -
        70,

        canvas.width,

        140
    );


    // =======================
    // ROAD LINES
    // =======================

    ctx.strokeStyle =
        "#f5f5f5";

    ctx.lineWidth =
        4;

    ctx.setLineDash(
        [30, 30]
    );

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

    ctx.setLineDash(
        []
    );


    // =======================
    // BACKGROUND TREES
    // =======================

    for (

        let x = 80;

        x <
        canvas.width;

        x += 220

    ) {

        drawTree(

            x,

            canvas.height -
            120
        );
    }


    // =======================
    // WIND STATUS
    // =======================

    ctx.fillStyle =
        "rgba(255,255,255,0.8)";

    ctx.font =
        "14px Arial";

    ctx.fillText(

        "💨 Wind affecting vehicle movement",

        20,

        canvas.height -
        20
    );


    // =======================
    // POWER STATUS
    // =======================

    ctx.font =
        "bold 16px Arial";


    if (
        loadShedding
    ) {

        ctx.fillStyle =
            "#b71c1c";

        ctx.fillText(

            "⚡ LOAD-SHEDDING: CHARGING OFFLINE",

            20,

            canvas.height -
            45
        );

    } else {

        ctx.fillStyle =
            "#1b5e20";

        ctx.fillText(

            "☀ POWER AVAILABLE",

            20,

            canvas.height -
            45
        );
    }
}


// ===============================
// BACKGROUND TREE
// ===============================

function drawTree(
    x,
    y
) {

    ctx.fillStyle =
        "#5d4037";


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


    ctx.fillStyle =
        "#356b35";


    ctx.fill();
}


// ===============================
// WEATHER
// ===============================

function drawWeather() {


    if (
        !raining
    ) {

        return;
    }


    const rainAmount =
        60;


    ctx.strokeStyle =
        "rgba(180,220,255,0.55)";


    ctx.lineWidth =
        2;


    // =======================
    // RAIN DROPS
    // =======================

    for (

        let i = 0;

        i <
        rainAmount;

        i++

    ) {


        const x =

            (
                i * 97 +

                weatherTime *
                100
            )

            %

            canvas.width;


        const y =

            (
                i * 53 +

                weatherTime *
                180
            )

            %

            canvas.height;


        ctx.beginPath();


        ctx.moveTo(
            x,
            y
        );


        ctx.lineTo(

            x - 6,

            y + 18
        );


        ctx.stroke();
    }


    // =======================
    // REDUCED VISIBILITY
    // =======================

    ctx.fillStyle =
        "rgba(70,90,110,0.22)";


    ctx.fillRect(

        0,
        0,

        canvas.width,

        canvas.height
    );


    // =======================
    // WEATHER MESSAGE
    // =======================

    ctx.fillStyle =
        "white";


    ctx.font =
        "bold 16px Arial";


    ctx.fillText(

        "🌧 HEAVY RAIN - REDUCED VISIBILITY",

        20,

        120
    );
}


// ===============================
// USER INTERFACE
// ===============================

function updateUI() {


    // =======================
    // BATTERY TEXT
    // =======================

    batteryDisplay.textContent =

        Math.floor(
            player.battery
        ) +

        "%";


    // =======================
    // BATTERY BAR
    // =======================

    batteryFill.style.width =

        player.battery +
        "%";


    // Battery colour

    if (

        player.battery >
        50

    ) {

        batteryFill
            .style
            .background =

            "#4caf50";

    }

    else if (

        player.battery >
        20

    ) {

        batteryFill
            .style
            .background =

            "#ff9800";

    }

    else {

        batteryFill
            .style
            .background =

            "#f44336";
    }


    // =======================
    // SCORE
    // =======================

    scoreDisplay.textContent =
        score;


    // =======================
    // HIGH SCORE
    // =======================

    const highScore =

        Number(

            localStorage
                .getItem(
                    "ecoDashHighScore"
                )

        ) || 0;


    highScoreDisplay.textContent =

        Math.max(

            highScore,

            score
        );


    // =======================
    // DELIVERIES
    // =======================

    deliveriesDisplay.textContent =
        deliveryCount;


    // =======================
    // DISTANCE
    // =======================

    distanceDisplay.textContent =

        player.distance
            .toFixed(2) +

        " km";


    // =======================
    // ENERGY
    // =======================

    energyDisplay.textContent =

        player.energyUsed
            .toFixed(2);


    // =======================
    // EFFICIENCY
    // =======================

    let efficiency =
        0;


    if (

        player.energyUsed >
        0

    ) {

        efficiency =

            player.distance /

            player.energyUsed;
    }


    efficiencyDisplay.textContent =

        efficiency
            .toFixed(2);
}


// ===============================
// START GAME
// ===============================

function startGame() {


    // New player

    player =
        new Player();


    // Clear previous objects

    obstacles =
        [];

    deliveries =
        [];

    solarZones =
        [];


    // Reset score

    score =
        0;


    deliveryCount =
        0;


    // Game states

    gameRunning =
        true;

    gamePaused =
        false;


    collisionCooldown =
        0;


    // Start with electricity

    loadShedding =
        false;


    loadSheddingTimer =
        0;


    pauseScreen
        .classList
        .add(
            "hidden"
        );


    // =======================
    // POTHOLE 1
    // =======================

    obstacles.push(

        new Obstacle(

            350,

            210,

            80,

            40,

            "pothole"
        )
    );


    // =======================
    // POTHOLE 2
    // =======================

    obstacles.push(

        new Obstacle(

            700,

            300,

            90,

            45,

            "pothole"
        )
    );


    // =======================
    // FALLEN TREE
    // =======================

    obstacles.push(

        new Obstacle(

            900,

            190,

            120,

            35,

            "tree"
        )
    );


    // =======================
    // CONSTRUCTION
    // =======================

    obstacles.push(

        new Obstacle(

            500,

            430,

            100,

            60,

            "construction"
        )
    );


    // =======================
    // FLOODED ROAD
    // =======================

    obstacles.push(

        new Obstacle(

            1050,

            300,

            150,

            70,

            "river"
        )
    );


    // =======================
    // WILDLIFE
    // =======================

    obstacles.push(

        new Obstacle(

            750,

            canvas.height /
            2 -
            30,

            70,

            60,

            "wildlife"
        )
    );


    // =======================
    // SOLAR STATION 1
    // =======================

    solarZones.push(

        new SolarZone(

            250,

            canvas.height /
            2 -
            150,

            55
        )
    );


    // =======================
    // SOLAR STATION 2
    // =======================

    solarZones.push(

        new SolarZone(

            canvas.width -
            180,

            canvas.height /
            2 +
            150,

            55
        )
    );


    // =======================
    // DELIVERIES
    // =======================

    createNewDelivery();

    createNewDelivery();


    // Hide start screen

    startScreen
        .classList
        .add(
            "hidden"
        );


    // Hide game-over screen

    gameOverScreen
        .classList
        .add(
            "hidden"
        );


    message.textContent =

        "Deliver supplies and recharge at solar microgrids. Press P to pause.";


    updateUI();
}


// ===============================
// GAME OVER
// ===============================

function gameOver() {


    gameRunning =
        false;


    // =======================
    // GAME OVER SOUND
    // =======================

    playSound(
        100,
        0.5,
        "sawtooth"
    );


    // Save high score

    saveHighScore();


    // Final score

    finalScoreDisplay
        .textContent =

        score;


    // Show game over screen

    gameOverScreen
        .classList
        .remove(
            "hidden"
        );
}


// ===============================
// SAVE HIGH SCORE
// ===============================

function saveHighScore() {


    const oldHighScore =

        Number(

            localStorage
                .getItem(
                    "ecoDashHighScore"
                )

        ) || 0;


    if (

        score >
        oldHighScore

    ) {

        localStorage
            .setItem(

                "ecoDashHighScore",

                score
            );
    }
}


// ===============================
// DRAW GAME OBJECTS
// ===============================

function drawGameObjects() {


    // Solar zones

    solarZones.forEach(

        function(zone) {

            zone.draw();
        }
    );


    // Deliveries

    deliveries.forEach(

        function(delivery) {

            delivery.draw();
        }
    );


    // Obstacles

    obstacles.forEach(

        function(obstacle) {

            obstacle.draw();
        }
    );


    // Player

    player.draw();
}


// ===============================
// MAIN GAME LOOP
// ===============================

function animate() {


    // Draw background

    drawEnvironment();


    if (
        gameRunning
    ) {


        // Update only if
        // game is not paused

        if (
            !gamePaused
        ) {


            // Player physics

            player.update(
                keys
            );


            // Wind

            updateEnvironment();


            // Load-shedding

            updateLoadShedding();


            // Obstacles

            checkObstacles();


            // Solar charging

            checkSolarZones();


            // Deliveries

            checkDeliveries();


            // Update HUD

            updateUI();


            // ===================
            // GAME OVER
            // ===================

            if (

                player.battery <=
                0

            ) {

                gameOver();
            }
        }


        // Draw objects

        drawGameObjects();


        // Draw rain

        drawWeather();
    }


    requestAnimationFrame(
        animate
    );
}


// ===============================
// BUTTONS
// ===============================


// Start game

startButton.addEventListener(

    "click",

    function() {

        startGame();
    }
);


// Restart game

restartButton.addEventListener(

    "click",

    function() {

        startGame();
    }
);


// Resume game

resumeButton.addEventListener(

    "click",

    function() {

        gamePaused =
            false;


        pauseScreen
            .classList
            .add(
                "hidden"
            );


        message.textContent =
            "Game resumed";
    }
);


// ===============================
// START ANIMATION
// ===============================

animate();