<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lunar Lander for MVS/370</title>
    <style>
        body { margin: 0; overflow: hidden; }
        canvas { display: block; background: black; }
        #ui {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-family: Arial, sans-serif;
        }
        .boss-screen {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #2e2e2e;
            color: white;
            font-family: monospace;
            padding: 20px;
            box-sizing: border-box;
        }
        .legend {
            position: absolute;
            top: 10px;
            right: 100px; /* Moved further to the right */
            color: white;
            font-family: Arial, sans-serif;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 10px;
            border-radius: 5px;
        }
        .legend p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <div id="ui">
        <div><a href="https://hits.seeyoufarm.com"><img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fmoshix.github.io%2Flunarlander%2F&count_bg=%2379C83D&title_bg=%230A60AE&icon=apacherocketmq.svg&icon_color=%23E7E7E7&title=hits&edge_flat=false"/></a></div>
        <div>Horizontal Speed: <span id="horizontal-speed">0</span></div>
        <div>Vertical Speed: <span id="vertical-speed">0</span></div>
        <div>Height: <span id="height">0</span></div>
        <div>Fuel: <span id="fuel">50</span></div>
        <div>Fuel Consumption: <span id="fuel-consumption">0</span></div>
        <div>Version: 1.28</div> <!-- version number -->
        
    </div>
    <div class="legend" id="legend">
        <p style="color: white;"><strong>Controls:</strong></p>
        <p style="color: orange;">Arrow Up: Thrust</p>
        <p style="color: yellow;">Arrow Left/Right: Lateral</p>
        <p style="color: green;">P: Pause/Unpause</p>
        <p style="color: orange;">B: Boss Key</p>
        <p style="color: purple;">R: Restart Game</p>
        <p style="color: pink;">M: Mute/unmute</p>
        <p style="color: cyan;">No landing on craters</p> 
        <p style="color: red;">Landing speed < 2.5 m/s</p> 
        <p style="color: magenta;">(c) 2024 hotdog studios</p>
    </div>
    <div class="boss-screen" id="bossScreen">
        <pre>#include &lt;stdio.h&gt;

int main() {
    int i;
    for (i = 0; i &lt; 10; i++) {
        printf("I love my boss so much! \n");
    }
    return 0;
}</pre>
    </div>
    <script>
        // Lunar lander for MVS 3.8 and anything else
        // copyright 2024 by moshix
        // v 0.1 humble beginnings
        // v 0.2 add metrics
        // v 0.3 earth
        // v 0.4 mcdonalds
        // v 0.5 crash detection
        // v 0.6 sound!
        // v 0.7 plume
        // v 0.8 lateral flying
        // v 0.9 Boss key, pause and restart
        // v 1.0 first half-way usable game
        // v 1.01 crash detection fix and version update
        // v 1.02 earth and sun (with no gravity pull)
        // v 1.03 speed detection at landing
        // v 1.04 mountains 
        // v 1.05 stars in background about 120
        // v 1.06 change physics and lateral movement
        // v 1.07 Controls legend on the right and altitude bar far right
        // v 1.08 mountain crash zones and double altitude start
        // v 1.09 updated fuel, mountain appearance, and UI enhancements
        // v 1.10 3D-like lunar surface and further UI adjustments
        // v 1.11 removed arches, improved 3D surface, fixed sound, less pointy mountains
        // v 1.12 fix game physics
        // v 1.13 fix game restart and crash detection
        // v 1.14 handle restart logic better (still sound not working...)
        // v 1.15 crash sound
        // v 1.16 change svg of lander upon crash
        // v 1.17 enable eagle has landed sound upon successful landing
        // v 1.18 web visit counter seeyoufarm
	// v 1.19 craters!
	// v 1.20 asteroids!
        // v 1.21 powered descent Houston checklist go/nogo
	// v 1.22 random starting vertical height for asteroid
	// v 1.23 no asteroid collision once landed (it's annoying)
	// v 1.23.1 visual fixing 
	// v 1.24 go/no-go checklist audio and points system
	// v 1.25 mute all game sounds
	// v 1.26 lunar gravity fix
	// v 1.27 command module orbiting
	// v 1.28 command correct orbiting

        const versionNumber = "1.28";

        // Set up the canvas and drawing context
        const canvas = document.getElementById('gameCanvas');
        const context = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Load the lander, plume, and earth images with error handling
        const landerImg = new Image();
        const plumeImg = new Image();
        const earthImg = new Image();

        landerImg.onload = () => console.log('lander.svg loaded successfully.');
        landerImg.onerror = () => console.error('Error loading lander.svg.');
        landerImg.src = 'lander.svg';

        plumeImg.onload = () => console.log('plume.svg loaded successfully.');
        plumeImg.onerror = () => console.error('Error loading plume.svg.');
        plumeImg.src = 'plume.svg';

        earthImg.onload = () => console.log('earth.svg loaded successfully.');
        earthImg.onerror = () => console.error('Error loading earth.svg.');
        earthImg.src = 'earth.svg';

        const crashedLanderImg = new Image();
        crashedLanderImg.onload = () => console.log('crashed.svg loaded successfully.');
        crashedLanderImg.onerror = () => console.error('Error loading crashed.svg.');
        crashedLanderImg.src = 'crashed.svg';

	const asteroidImg = new Image();
	asteroidImg.onload = () => console.log('asteroid.svg loaded successfully.');
	asteroidImg.onerror = () => console.error('Error loading asteroid.svg.');
	asteroidImg.src = 'asteroid.svg';

	    
        // Load the rocket sound with error handling
        const rocketSound = new Audio('rocket.mp3');
        let rocketSoundLoaded = false;

        rocketSound.oncanplaythrough = () => {
            if (!rocketSoundLoaded) {
                console.log('rocket.mp3 loaded successfully.');
                rocketSoundLoaded = true;
            }
        };
        rocketSound.onerror = () => console.error('Error loading rocket.mp3.');

        let isRocketSoundPlaying = false; // To track if the sound is currently playing

       // Load the crash sound with error handling
       const crashSound = new Audio('crash.mp3');
      let crashSoundLoaded = false;
  
       crashSound.oncanplaythrough = () => {
           if (!crashSoundLoaded) {
               console.log('crash.mp3 loaded successfully.');
               crashSoundLoaded = true;
           }
       };
       crashSound.onerror = () => console.error('Error loading crash.mp3.');


        // load eagle has landed with error handling
        const eaglelanded = new Audio('eaglelanded.mp3');
        let eaglelandedsoundLoaded = false;
        eaglelanded.oncanplaythrough = () => {
            if (!eaglelandedsoundLoaded) {
                console.log('eagle landed mp3 loaded successfully.');
                eaglelandedsoundLoaded = true;
            }
        };
        eaglelanded.onerror = () => console.error('Error loading eagle landed mp3');


	// Load the gonogo sound with error handling
	const gonogoSound = new Audio('gonogo.mp3');
	let gonogoSoundLoaded = false;

	gonogoSound.oncanplaythrough = () => {
 	   if (!gonogoSoundLoaded) {
   	     console.log('gonogo.mp3 loaded successfully.');
    	    gonogoSoundLoaded = true;
	    }
	};
gonogoSound.onerror = () => console.error('Error loading gonogo.mp3.');
        
	// load command module orbiting svg and sound
	// ied is command module objects 
	const iedGraphic = new Image();
        iedGraphic.src = 'ied.svg'; // Path to hamburger
        
        iedGraphic.onload = function() {
                    console.log('IED loaded');
        };
        
        iedGraphic.onerror = function() {
                    console.error('Error loading IED  graphic');
        };
        let iedWidth = 50 * 1.0; 
        let iedHeight = 50 * 1.0;
        let iedX, iedY;
        let iedSpeed = 2.5;
        let iedDirection = 1; // 1 for right, -1 for left
        let iedActive = false;
        let lastIedTime = 0;
        const iedMinInterval = 9000; // Minimum interval in milliseconds (30 seconds)





        // mute false or true
	let mute = true; // sound is on by default
	
	    
        // ------------ Define game constants --------------------
        const gravity = 0.040; // moon gravity should be 0.05....
        const thrustPower = -0.19; // changed from 0.15
        const lateralThrustPower = 0.10; // Thrust for lateral movement
        const fuelConsumptionRate = 0.37; // 
        const initialFuel = 45; // starting fuel, half the previous amount
        const landerSize = 0.380;
        let fuel = initialFuel;
        let landed = false;
        let paused = false;
        let showingBossScreen = false;
        let message = "";
        let landingMetrics = "";
	let rocketSoundTimeout;
	let points = 0;
	let npoints = 0;

	let asteroid = null;
	let asteroidSpawnTimeout;


        // Earth position, set once per game start
        let earthPosition = { x: 0, y: 0 };

        // Boss screen element
        const bossScreenElement = document.getElementById('bossScreen');
        const legendElement = document.getElementById('legend');

        // Initialize the lander object with properties
        let lander = {
            x: canvas.width / 2,
            y: 200, // Starting at double the previous starting altitude
            vx: 0,
            vy: 0,
            rotation: 0,
            thrusting: false,
            crashed: false // New property to track crash state
        };

        // Lunar surface properties, including mountain areas
        let lunarSurface = [];
        const surfaceHeight = 30; // Height of the gray moon area was 100
        let mountainZones = []; // Store the ranges of mountain zones

        // Starfield data
        const stars = [];

        // Create a simple lunar surface with gently sloping hills and at least 50% flat surfaces
        function createLunarSurface() {
            lunarSurface = [];
            let x = 0;
            let totalWidth = 0;
            let flatSurfaceWidth = 0;
        
            while (x < canvas.width) {
                const width = Math.random() * 50 + 50;
                let height = Math.random() * 50 + 10; // Gentle hills
                let nextHeight = Math.random() * 50 + 10;
        
                if (Math.random() < 0.5) { // 50% chance for flat surface
                    height = nextHeight = 0;
                    flatSurfaceWidth += width;
                }
        
                lunarSurface.push({ x, width, height, nextHeight });
                x += width;
                totalWidth += width;
            }
        
            // Ensure at least 50% of the surface is flat
            if (flatSurfaceWidth < totalWidth / 2) {
                createLunarSurface();
            }
        }

	// Function to spawn an asteroid at a random time
	function spawnAsteroid() {
	    if (!asteroid) { // Only spawn a new asteroid if there isn't one already
	        const startX = Math.random() < 0.5 ? 0 : canvas.width;
	        const startY = Math.random() * (canvas.height / 2);
	        const targetX = startX === 0 ? canvas.width : 0;
	        const targetY = canvas.height;
	
	        asteroid = {
	            x: startX,
	            y: startY,
	            vx: (targetX - startX) / canvas.height * 2,
	            vy: 2, // Asteroid speed
	            width: 50,
	            height: 50
	        };
	    }
	
	    // Schedule the next asteroid spawn
	    asteroidSpawnTimeout = setTimeout(spawnAsteroid, Math.random() * 9000 + 3000);
	}


	    // Function to move the asteroid
	function moveAsteroid() {
	    if (asteroid) {
	        asteroid.x += asteroid.vx;
	        asteroid.y += asteroid.vy;  
	
	        // Check for collision with the lander
	        if ( !landed && 
	            asteroid.x < lander.x + landerImg.width * landerSize / 2 &&
	            asteroid.x + asteroid.width > lander.x - landerImg.width * landerSize / 2 &&
	            asteroid.y < lander.y + landerImg.height * landerSize / 2 &&
	            asteroid.y + asteroid.height > lander.y - landerImg.height * landerSize / 2
	        ) {
	   	    lander.crashed = true;
                    if (crashSoundLoaded && mute) {
                        crashSound.volume = 0.4;
                        crashSound.play();
                    }
	            landed = true;
		     points = 0;	
	            //asteroid = null; // Remove the asteroid
	        }
	
	        // Remove the asteroid if it goes out of bounds
	        if (asteroid.y > canvas.height) {
	            asteroid = null;
	        }
	    }
	}
	
	// Function to draw the asteroid
	function drawAsteroid() {
	    if (asteroid) {
	        context.drawImage(asteroidImg, asteroid.x, asteroid.y, asteroid.width, asteroid.height);
	    }
	}


	    // Reload the lander image to reset its state
	   function reloadImages() {
    		landerImg.src = 'lander.svg';
    		//crashedImg.src = 'crashed.svg';
    		asteroidImg.src = 'asteroid.svg';
	   }

	    // Helper function to check if an image is loaded
	   function isImageLoaded(img) {
    	     return img.complete && img.naturalHeight !== 0;
            }		


	    // Draw the lunar surface on the canvas with gently sloping hills and flat surfaces
           function drawLunarSurface() {
               context.fillStyle = 'gray';
               context.beginPath();
               context.moveTo(0, canvas.height - surfaceHeight);
           
               lunarSurface.forEach((segment) => {
                   const peakY = canvas.height - surfaceHeight - segment.height;
                   const nextPeakY = canvas.height - surfaceHeight - segment.nextHeight;
                   const nextX = segment.x + segment.width;
           
                   context.lineTo(segment.x, peakY);
                   context.quadraticCurveTo(segment.x + segment.width / 2, peakY, nextX, nextPeakY);
               });
           
               context.lineTo(canvas.width, canvas.height);
               context.lineTo(0, canvas.height);
               context.closePath();
               context.fill();
           }
           
           // Get the height of the lunar surface at a specific x position
           function getTerrainHeightAt(x) {
               for (let i = 0; i < lunarSurface.length - 1; i++) {
                   const segment = lunarSurface[i];
                   const nextSegment = lunarSurface[i + 1];
                   
                   if (x >= segment.x && x <= segment.x + segment.width) {
                       // Linear interpolation to find the y position
                       const t = (x - segment.x) / segment.width;
                       return segment.height * (1 - t) + nextSegment.height * t;
                   }
               }
               return 0; // Default height if out of bounds
           }
           
           
           
                   // Create static stars in the background
                   function createStars() {
                           conditionalGonogo(); // each time we start let's randomly play go/no-go checklist 
           		for (let i = 0; i < 120; i++) {
                           stars.push({
                               x: Math.random() * canvas.width,
                               y: Math.random() * (canvas.height - surfaceHeight),
                               radius: Math.random() * 1.5,
                           });
                       }
                   }
           
            // Draw stars in the background
            function drawStars() {
                context.fillStyle = 'white';
                stars.forEach((star) => {
                    context.beginPath();
                    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                    context.fill();
                });
            }
    
        // Draw Earth at the stored position
        function drawEarth() {
            const earthWidth = 150; // Double the size of the previous width
            const earthHeight = 150; // Double the size of the previous height
            context.drawImage(earthImg, earthPosition.x, earthPosition.y, earthWidth, earthHeight);
        }

        // Set Earth position randomly above the surface of the moon
        function setEarthPosition() {
            const earthWidth = 100;
            const earthHeight = 200;
            const minX = 350; // Minimum X position to avoid the metrics area
            const maxX = canvas.width - earthWidth - 100; // Avoid the right edge
            const minY = 50; // Minimum Y position to avoid the controls area
            const maxY = canvas.height - surfaceHeight - earthHeight - 50; // Above the lunar surface
            earthPosition.x = Math.random() * (maxX - minX) + minX;
            earthPosition.y = Math.random() * (maxY - minY) + minY;
        }

        // Draw the lander and its plume if thrusting
        // show crashed.svg if crashed 
        function drawLander() {
            context.save();
            context.translate(lander.x, lander.y);
            context.rotate(lander.rotation);
            context.scale(landerSize * 0.8, landerSize * 0.8); // scale it down 20%

            // Draw the appropriate lander image
            if (lander.crashed) {
                context.scale(landerSize * 2.7, landerSize * 2.7); // Scale the crashed lander image 
                context.drawImage(crashedLanderImg, -crashedLanderImg.width, -crashedLanderImg.height);
            } else {
                context.drawImage(landerImg, -landerImg.width / 2, -landerImg.height / 2);
            }

            // Draw the plume more to the left under the lander if thrusting
            if (lander.thrusting && fuel > 0 && !lander.crashed) {
                const plumeScale = 0.15; // Increased by 50%
                context.save();
                context.translate(-30, landerImg.height / 2); // Further to the left
                context.scale(plumeScale, plumeScale);
                context.drawImage(plumeImg, -plumeImg.width / 2, 0);
                context.restore();
            }

            context.restore();
        }


        // Update the lander's position and velocity
        function updateLander() {
            if (lander.thrusting && fuel > 0) {
                lander.vy += thrustPower * Math.cos(lander.rotation);
                lander.vx += lateralThrustPower * Math.sin(lander.rotation);
                fuel -= fuelConsumptionRate;
            }
            lander.vy += gravity;
            lander.y += lander.vy;
            lander.x += lander.vx;

            // Ensure the lander stays within canvas bounds
            if (lander.x < 0) lander.x = 0;
            if (lander.x > canvas.width) lander.x = canvas.width;

            // Check if the lander has landed on the lunar surface
            const groundY = canvas.height - surfaceHeight;
            if (lander.y > groundY) {
                lander.y = groundY;

                // Store the metrics at the time of landing, so they don't overwrite
                const landingVerticalSpeed = lander.vy;
                const landingHorizontalSpeed = lander.vx;
                const landingFuelRemaining = Math.abs(fuel);
		    
		// points is ( max landing speed of 2.5 - real landing speed ) * fuel remaining -- absolute values   
		npoints = ~~(((2.5 -  Math.abs(landingVerticalSpeed)) *  (landingFuelRemaining+1) * 100));    
                points = Math.abs(npoints);
		    
                if (!landed) {
                    landed = true;
		// Determine the terrain height at the lander's x position
              const terrainHeight = getTerrainHeightAt(lander.x);
              const landerTerrainY = canvas.height - surfaceHeight - terrainHeight;

             // Determine if the lander is on a hill
              const isOnHill = terrainHeight > 0;

                    // Check for crash based on vertical and horizontal speeds or if landed in a mountain zone
                    if (lander.y > landerTerrainY || isOnHill) {
                        message = "You crashed into a lunar crater"
                        lander.crashed = true;
			points = 0;    
                        if (crashSoundLoaded && mute) {
                            crashSound.volume = 0.4;
                            crashSound.play();
                          }
                    } else if (Math.abs(landingVerticalSpeed) > 2.6 || Math.abs(landingHorizontalSpeed) > 2) {
                        message = "You crashed because of vertical or lateral speed"
                        lander.crashed = true;
			points = 0;    
                        if (crashSoundLoaded && mute) {
                                crashSound.volume = 0.4;
                                crashSound.play();
                         }
                    } else {
                        message = "  Successful Landing!";
                        if (eaglelandedsoundLoaded && mute) {
                            eaglelanded.volume = 0.2;
                            eaglelanded.play();
                          }
                    }


                
                    landingMetrics = `
                        Horizontal Speed: ${landingHorizontalSpeed.toFixed(2)} m/s\n
                        Vertical Speed: ${landingVerticalSpeed.toFixed(2)} m/s\n
                        Fuel Remaining: ${landingFuelRemaining.toFixed(2)} units \n
			Points: ${points}
                    `;
                }

                // Stop the lander's movement 
                lander.vx = 0;
                lander.vy = 0;
            }

            // Update UI elements with the latest data
            document.getElementById('horizontal-speed').textContent = lander.vx.toFixed(2);
            document.getElementById('vertical-speed').textContent = landed ? '0.00' : lander.vy.toFixed(2);
            document.getElementById('height').textContent = (groundY - lander.y).toFixed(2);
            document.getElementById('fuel').textContent = fuel.toFixed(2);
            document.getElementById('fuel-consumption').textContent = lander.thrusting ? fuelConsumptionRate.toFixed(2) : '0';
        }

        // Draw the landing result message and metrics
        function drawMessage() {
            if (message) {
                context.fillStyle = message === "Successful Landing!" ? 'yellow' : 'orange';
                context.font = '30px Arial';
                context.textAlign = 'center';
                context.fillText(message, canvas.width / 2 - 25, canvas.height / 2);

                context.font = '20px Arial';
                context.textAlign = 'left';
                // Split the landing metrics into separate lines and left-align
                const metricsLines = landingMetrics.trim().split('\n');
                metricsLines.forEach((line, index) => {
                    context.fillText(line.trim(), canvas.width / 2 - 150, canvas.height / 2 + 40 + index * 30);
                });
            }

            // Show "Paused" message if the game is paused
            if (paused && !showingBossScreen) {
                context.fillStyle = 'white';
                context.font = '30px Arial';
                context.textAlign = 'center';
                context.fillText("Paused", canvas.width / 2, canvas.height / 2 - 50);
            }
        
            // Show "muted" message if the game is muted
            if (!mute && !showingBossScreen) {
                context.fillStyle = 'white';
                context.font = '30px Arial';
                context.textAlign = 'center';
                context.fillText("Muted", canvas.width / 2, canvas.height / 2 - 280);
            }

         if (mute && !showingBossScreen) {
                context.fillStyle = 'white';
                context.font = '30px Arial';
                context.textAlign = 'center';
                context.fillText("     ", canvas.width / 2, canvas.height / 2 - 280);
            }

        }

        //@@@@@command module stuff @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // IED handling (orbiting command module)
        
        function activateIed() {
        
            const currentTime = Date.now();
            if (currentTime - lastIedTime >= iedMinInterval) {
                iedActive = true;
                lastIedTime = currentTime; // Update last activation time
                iedY = canvas.height / 8; // Set Y position quarter
                if (Math.random() < 0.5) {
                    iedX = -iedWidth; // Start from the left
                    iedDirection = 1;
                } else {
                    iedX = canvas.width; // Start from the right
                    iedDirection = 1;
                }
            }
        }


          // graphics related to animating command module orbiting
          function moveIed() {
              if (iedActive) {
                  iedX += iedSpeed * iedDirection;
                  if (iedX > canvas.width || iedX < -iedWidth) {
                      iedActive = false; // Deactivate the ied
                  }
              }
          }
          
          
          // 
          function drawIed() {
              if (iedActive) {
                  //console.log('Drawing ied  at:', iedX, iedY, iedWidth, iedHeight);
                  context.drawImage(iedGraphic, iedX, iedY, iedWidth, iedHeight);
              }
          }
         // Function to play sound with limited duration
         function playSoundWithLimit(audioElement, duration) {
             audioElement.pause();
             audioElement.currentTime = 0; // Reset to start
             audioElement.play().then(() => {
                 setTimeout(() => {
                     audioElement.pause();
                     audioElement.currentTime = 0; // Reset to start
                 }, duration);
             }).catch((error) => {
                 console.error('Error playing audio:', error);
             });
         }

        // Draw the descent indicator on the right side
        function drawDescentIndicator() {
            const indicatorX = canvas.width - 50;
            const indicatorTop = 50;
            const indicatorBottom = canvas.height - 150;
            const indicatorHeight = indicatorBottom - indicatorTop;

            // Draw the line
            context.strokeStyle = 'white';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(indicatorX, indicatorTop);
            context.lineTo(indicatorX, indicatorBottom);
            context.stroke();

            // Draw the red dot representing the lander's position
            const landerPosition = Math.min(Math.max((lander.y / (canvas.height - surfaceHeight)) * indicatorHeight, 0), indicatorHeight);
            context.fillStyle = 'red';
            context.beginPath();
            context.arc(indicatorX, indicatorTop + landerPosition, 5, 0, Math.PI * 2);
            context.fill();
        }

        // Clear the canvas and redraw all elements
        function draw() {
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (showingBossScreen) {
                bossScreenElement.style.display = 'block';
            } else {
                bossScreenElement.style.display = 'none';
                drawStars();
                drawEarth();
                drawLunarSurface();
                drawLander();
		drawAsteroid(); // Draw the asteroid
                drawMessage();
		drawIed(); // draw the command module
                drawDescentIndicator();
            }
        }

        // Main game loop to update and render the game state
        function gameLoop() {
            if (!paused && !showingBossScreen) {
                updateLander();
		spawnAsteroid(); // Start spawning asteroids    
		drawIed();
		activateIed();
	        moveAsteroid();
	        moveIed();       // animate the command module
            }
            draw();
            requestAnimationFrame(gameLoop);
        }

        // Handle keyboard input for controlling the game
        document.addEventListener('keydown', (e) => {
            if (showingBossScreen) {
                // Allow exiting boss screen
                if (e.key === 'B' || e.key === 'b') {
                    showingBossScreen = false;
                    paused = false;
                }
                return;
            }

            if (!landed && !paused) {
                switch (e.key) {
                    case 'ArrowUp':
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        // Play the rocket sound for 0.3 seconds if not already playing
                        if (!isRocketSoundPlaying && rocketSoundLoaded && mute) {
                            isRocketSoundPlaying = true;
                            rocketSound.currentTime = 0; // Restart the sound
                            rocketSound.volume = 0.9;
                            rocketSound.play();
                            rocketSoundTimeout = setTimeout(() => {
                                rocketSound.pause();
                                isRocketSoundPlaying = false;
                            }, 1000); // Stop after 0.4 seconds
                        }

                        lander.thrusting = true;

                        // Handle lateral movement
                        if (e.key === 'ArrowLeft') {
                            lander.vx -= lateralThrustPower;
                        } else if (e.key === 'ArrowRight') {
                            lander.vx += lateralThrustPower;
                        }

                        break;
                }
            }

            switch (e.key) {
	        case 'M':
		case 'm':
		    mute = !mute;
		    // console.log('Mute status: ',mute);
		    break;			
                case 'P':
                case 'p':
                    paused = !paused;
                    break;
                case 'R':
                case 'r':
                    restartGame();
                    break;
                case 'B':
                case 'b':
                    showingBossScreen = !showingBossScreen;
                    paused = showingBossScreen; // Pause the game while showing the boss screen
                    break;
            }
        });

        // Stop thrusting when the arrow key is released
        document.addEventListener('keyup', () => {
            lander.thrusting = false; // Lander stops thrusting when key is released
        });

	    
        function conditionalGonogo(){
           // Conditionally play the gonogo sound 1 in 4 times
    	   if (gonogoSoundLoaded && Math.random() < 1/4 && mute) {
        	gonogoSound.play();
	   }
	}

	    
        // Restart the game
        function restartGame() {
            conditionalGonogo()
	    fuel = initialFuel;
            landed = false;
            message = "";
            landingMetrics = "";
            paused = false;
            lander = {
                x: canvas.width / 2,
                y: 100, // altitude over moon surface
                vx: 0,
                vy: 0,
                rotation: 0,
                thrusting: false
            };
		
	     // Reset the lander image to its initial state
    	    reloadImages();
            lunarSurface = [];
            mountainZones = [];
            createLunarSurface();
	    activateIed();  // activate the command module 
	    drawIed();
	    moveIed();
	    }		    


           // Initialize the game and start the main loop
            setEarthPosition(); // Set a new random position for Earth
	    spawnAsteroid(); // Start spawning asteroids
	    activateIed();       // draw the command module

           createStars();
           createLunarSurface();
           setEarthPosition(); // Set initial position for Earth
	   drawIed();
	   iedActive = true;
           gameLoop();
    </script>
</body>
</html>
