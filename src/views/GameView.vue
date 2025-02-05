<script setup>
import { onMounted, ref, reactive, nextTick } from 'vue';
import GameEnd from '../components/GameEnd.vue';
import GameStart from '../components/GameStart.vue';
// states
const showGameStart = ref(true);
const showGame = ref(false);
const showGameOver = ref(false);
const colors = reactive(["#ff5a5a", // Base color
  "#75c5ff",
  "#ffc15a",
  "#616161",
  "#b90000"]);
const currentColor = ref(1);
const score = ref(0);
const nextScoreStage = ref(10);
const whiteCircle = reactive({});
const trails = reactive([]);
const blackCircle = reactive({});
const whitePoint = reactive({});
const barriers = reactive([])
const particles = reactive([]);
const currentHighscore = ref(localStorage.getItem('highscore') || 0);

let scoreFlag = false;
let canvas = ref(null);
let ctx = ref(null);
let interval = null;
let numberOfBarriers = 3;
let timer = 1;
let timerInterval = null;
let addRemoveTime = Math.floor(Math.random() * (10 - 8 + 1) + 8);
let collisionHappened = false;
onMounted(() => {
  document.querySelector('body').style.backgroundColor = `${colors[(currentColor.value % 5) - 1]}`;
})
function init() {
  showGameOver.value = false;
  showGameStart.value = false;
  setTimeout(() => {
    showGame.value = true;
    setTimeout(() => {
      startGame();
    }, 500);
  }, 500);
}
function startGame() {
  resetGame();

  window.addEventListener('keydown', changePosition);
  ctx = canvas.value.getContext('2d');
  // on load
  Object.assign(blackCircle, new BlackCircle());
  Object.assign(whiteCircle, new WhiteCircle());
  //generate 3 three barriers at the start of the game
  let barrierAngle = 0;
  for (let i = 0; i < numberOfBarriers; i++) {
    barrierAngle = getDegree();
    //each of the barriers should have enough gap between each other
    barriers.push(new RectangleBarrier(120, 120, barrierAngle, 40, 10, Math.round(Math.random()) === 1));
  }
  // generate white point
  let whitePointAngle = 0;
  whitePointAngle = getDegree();
  //each of the barriers should have enough gap between each other
  Object.assign(whitePoint, new WhitePoint(whitePointAngle));
  interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    blackCircle.draw();
    //draw barriers
    barriers.forEach(barrier => {
      barrier.update();
    });
    whitePoint.update();

    if (!collisionHappened) {
      whiteCircle.update();
    }

    //when there's collision happened
    if (collisionHappened) {
      //remove white circle
      trails.splice(0, trails.length);
      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.update();
        if (particle.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          particle.draw();
        }
      });
    }
    //    60 frames per second
  }, 1000 / 60);
  //for remove or adding barriers
  timerInterval = setInterval(() => {
    timer++;
    if (timer === addRemoveTime) {
      let random = Math.random();
      if ((random < 0.7 && barriers.length < 8) || barriers.length <= 3) {
        //create a new barrier
        //each of the barriers should have enough gap between each other
        let barrierAngle = getDegree();
        barriers.push(new RectangleBarrier(120, 120, barrierAngle, 40, 10, Math.round(Math.random()) === 1));
      } else if (random >= 0.7 && barriers.length > 3) {
        clearInterval(barriers[0].updateInterval);
        barriers.pop();
      }
      timer = 0;
      addRemoveTime = Math.floor(Math.random() * (10 - 8 + 1) + 8);
    }
  }, 1000);
}

function BlackCircle() {
  this.x = 250;
  this.y = 250;
  this.radius = 150;
  this.color = 'black';
  this.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = '10';
    ctx.stroke();
  }
}
function WhiteCircle() {
  this.isInside = Math.round(Math.random() * 1) === 1;
  this.distanceFromCenter = this.isInside ? blackCircle.radius - 20 : blackCircle.radius + 20; // Distance from the center of the black circle, slightly outside or inside
  this.angle = 0;
  this.radius = 10;
  this.color = 'white';
  this.speed = 15;
  this.switchFlag = false;
  this.switchSpeed = 4;
  this.switchTarget = 0;
  this.draw = function () {
    // Draw trail with gaps
    const gapAngle = 10; // Degree gap between trail circles
    trails.forEach((pos, index) => {
      // check for path switching
      if (pos.switchFlag) {
        if (pos.distanceFromCenter != pos.switchTarget) {
          pos.distanceFromCenter < pos.switchTarget ? pos.distanceFromCenter += this.switchSpeed : pos.distanceFromCenter -= this.switchSpeed;
        } else {
          pos.switchFlag = false;
          pos.switchTarget = 0;
        }
      }
      let radius = index == 3 ? 2 : 3;
      ctx.save();
      ctx.translate(blackCircle.x, blackCircle.y);
      ctx.rotate((this.angle + index * gapAngle) * Math.PI / 180);
      ctx.beginPath();
      ctx.arc(pos.distanceFromCenter, 0, `${radius}`, 0, 2 * Math.PI);
      // ctx.fillStyle = `rgba(255, 255, 255, ${1/(index + 1)})`;
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.restore();
    });

    // for switch position to inside or outside of the circle and creating smooth switch effect
    if (this.switchFlag) {
      // if haven't reach the target position
      if (this.distanceFromCenter !== this.switchTarget) {
        this.distanceFromCenter < this.switchTarget ? this.distanceFromCenter += this.switchSpeed : this.distanceFromCenter -= this.switchSpeed;
      } else {
        this.switchFlag = false;
        this.switchTarget = 0;
      }
    }
    ctx.save();
    ctx.translate(blackCircle.x, blackCircle.y);
    ctx.rotate(this.angle * Math.PI / 180);
    ctx.beginPath();
    ctx.arc(this.distanceFromCenter, 0, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  };
  this.update = function () {
    this.angle -= 0.1 * this.speed;
    if (Math.abs(this.angle) >= 360) {
      this.angle = 0;
    }
    checkPointCollision();
    checkBarrierCollision();
    // Update trail positions
    if (trails.length === 4 && !trails[0].switchFlag) {
      trails.shift(); // Remove the oldest position
    }
    if (!trails.find((t) => t.switchFlag))
      trails.push({ distanceFromCenter: this.distanceFromCenter, switchFlag: this.switchFlag, switchTarget: this.switchTarget });
    this.draw();
  }
}
function RectangleBarrier(x, y, angle, barrierHeight, barrierWidth, isInward) {
  this.x = x;
  this.y = y;
  this.currentHeight = 0;
  this.currentWidth = 0;
  this.height = barrierHeight;
  this.width = barrierWidth;
  this.angle = angle;
  this.color = 'black';
  this.isInward = isInward;
  this.isUpdating = false;
  this.updateInterval = null;
  this.updateIntervalTime = Math.floor(Math.random() * (10 - 5 + 1) + 5);//to apply update to this barrier after some time
  this.isUpdating = false;
  this.draw = function () {
    // for scale up transition
    if (this.currentHeight < this.height) {
      this.currentHeight += this.height / 10;
    }
    if (this.currentWidth < this.width) {
      this.currentWidth += this.width / 10;
    }
    ctx.save();
    //rotate the rectangle based on the center of the black circle
    ctx.translate(blackCircle.x, blackCircle.y);
    ctx.rotate(this.angle * Math.PI / 180);
    // transfer rotation to the edge of the black circle
    ctx.translate(blackCircle.radius, 0);
    this.isInward ? ctx.rotate(-Math.PI / 2) : ctx.rotate(Math.PI / 2); // Rotate to make the barrier face outward
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height, this.currentWidth, this.currentHeight); // Adjusted to make the bottom face towards the center
    ctx.restore();
  };
  this.update = function () {
    if (!this.isUpdating) {
      this.isUpdating = true;
      this.updateInterval = setInterval(() => {
        let option = Math.round(Math.random()) < 0.8 ? 0 : 1;// 0 for update switch the barrier to inward or outward, 1 for removing the barrier
        if (option === 0) {
          console.log('updateInwardOutward');
          if (hasEnoughGap(this.angle)) {
            this.isInward = !this.isInward;
          }
        } else {
          let newAngle = getDegree();
          // remove the barrier and add it to another position
          this.currentHeight = 0;
          this.currentWidth = 0;
          // to make sure the new barrier is not too close to the white circle
          this.angle = newAngle;
        }
      }, this.updateIntervalTime * 1000);
    }
    this.draw();
  }
}
function WhitePoint(angle) {
  this.isInside = Math.round(Math.random() * 1) === 1;
  this.distanceFromCenter = this.isInside ? blackCircle.radius - 20 : blackCircle.radius + 20; // Distance from the center of the black circle, slightly outside or inside
  this.width = 15;
  this.height = 15;
  this.angle = angle; // Initial angle around the black circle
  this.rotationAngle = 0; // Rotation of the white point around its own center
  this.color = 'white';
  this.draw = function () {
    ctx.save();
    // Translate to the center of the black circle
    ctx.translate(blackCircle.x, blackCircle.y);
    // Rotate to the correct angle position around the black circle
    ctx.rotate(this.angle * Math.PI / 180);
    // Move out to the white point's position around the black circle
    ctx.translate(this.distanceFromCenter, 0);
    // Rotate the white point around its own center
    ctx.rotate(this.rotationAngle * Math.PI / 180);
    // Draw the white point centered on its origin
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  };

  this.update = function () {
    this.rotationAngle += 1; // Update the rotation angle to animate the white point
    this.draw();
  };
}
function CollisionParticle(x, y) {
  this.x = x;
  this.y = y;
  this.angle = Math.random() * 2 * Math.PI;
  this.speed = Math.random() * 5 + 2;
  this.size = Math.random() * 5 + 2;
  this.alpha = 1;
  this.update = function () {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.alpha -= 0.02;
  };
  this.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  };
}
function getDegree() {
  const maxAttempts = 100; // Maximum number of attempts to find a valid degree
  let attempt = 0;
  let d = 0;
  const minAngleDifference = 30; // Minimum angle difference required between elements
  const relaxedMinAngleDifference = 15; // Relaxed minimum angle difference

  outerLoop: do {
    d = Math.random() * 361;
    attempt++;

    // Check if too close to the moving white circle
    if (getAngleDifference(d, 360 - Math.abs(Math.round(whiteCircle.angle))) < minAngleDifference) {
      continue;
    }
    // Check if too close to the moving white point
    if (d !== whitePoint.angle && getAngleDifference(d, whitePoint.angle) < minAngleDifference) {
      continue;
    }
    // Check against all barriers
    for (let b of barriers) {
      if (d !== b.angle && getAngleDifference(d, b.angle) < minAngleDifference) {
        continue outerLoop; // Continue the outer loop
      }
    }
    // If no continue was hit, then d is valid
    break;
  } while (attempt < maxAttempts);

  // If max attempts reached, try with a relaxed condition
  if (attempt >= maxAttempts) {
    console.warn('Max attempts reached. Using relaxed condition for degree.');
    outerLoop: do {
      d = Math.random() * 361;
      attempt++;

      // Check if too close to the moving white circle with relaxed condition
      if (getAngleDifference(d, 360 - Math.abs(Math.round(whiteCircle.angle))) < relaxedMinAngleDifference) {
        continue;
      }
      // Check if too close to the moving white point with relaxed condition
      if (d !== whitePoint.angle && getAngleDifference(d, whitePoint.angle) < relaxedMinAngleDifference) {
        continue;
      }
      // Check against all barriers with relaxed condition
      for (let b of barriers) {
        if (d !== b.angle && getAngleDifference(d, b.angle) < relaxedMinAngleDifference) {
          continue outerLoop; // Continue the outer loop
        }
      }
      // If no continue was hit, then d is valid
      break;
    } while (attempt < maxAttempts * 2); // Allow double the attempts for the relaxed condition

    if (attempt >= maxAttempts * 2) {
      console.warn('Even relaxed condition reached max attempts. Using last tried degree:', d);
    }
  }

  return d;
}

function hasEnoughGap(d) {
  console.log(d, whitePoint.angle, 360 - Math.abs(Math.round(whiteCircle.angle)));
  //should not spawn too close to the moving white circle
  if (getAngleDifference(d, 360 - Math.abs(Math.round(whiteCircle.angle))) < 35) {
    return false;
  }
  //  should not spawn too close to the moving white point
  if (d != whitePoint.angle && getAngleDifference(d, whitePoint.angle) < 35) {
    return false;
  }
  if (barriers.length === 0) {
    return true;
  }
  for (let b of barriers) {
    //should have difference at least 35 degrees
    if (d != b.angle && getAngleDifference(d, b.angle) < 35) {
      return false;
    }
  }
  return true;
}
function getAngleDifference(a, b) {
  return Math.abs(a - b) > 180 ? 360 - Math.abs(a - b) : Math.abs(a - b);
}
function checkPointCollision() {
  let whiteCircleAngle = 360 - Math.abs(Math.round(whiteCircle.angle));
  let whitePointAngle = Math.abs(Math.round(whitePoint.angle));
  if (Math.abs(whiteCircleAngle - whitePointAngle) <= 2 && whitePoint.isInside == whiteCircle.isInside) {
    score.value++;

    // if exceed the currentHighscore, update the highscore
    if (score.value > currentHighscore.value) {
      currentHighscore.value = score.value;
      localStorage.setItem('highscore', score.value);
    }
    if (score.value === nextScoreStage.value) {
      // switch backgroundColor;
      currentColor.value++;
      switchColor();
      nextScoreStage.value += 10;
      whiteCircle.speed += whiteCircle.speed * 0.2;

    }
    if (!scoreFlag) {
      scoreFlag = true;
      const scoreAudio = new Audio('src/assets/sounds/score.mp3');
      scoreAudio.play();
      setTimeout(() => {
        scoreFlag = false;
      }, 200);
    }
    whitePoint.isInside = !whitePoint.isInside;
    whitePoint.distanceFromCenter = whitePoint.isInside ? blackCircle.radius - 20 : blackCircle.radius + 20;
    whitePoint.angle = getDegree();
  }
}
function switchColor() {
  document.querySelector('body').style.backgroundColor = `${colors[(currentColor.value % 5) - 1]}`;
}
function checkBarrierCollision() {
  for (let barrier of barriers) {
    let whiteCircleAngle = 360 - Math.abs(Math.round(whiteCircle.angle));
    let barrierAngle = Math.abs(Math.round(barrier.angle));
    if (Math.abs(whiteCircleAngle - barrierAngle) <= 2 && barrier.isInward == whiteCircle.isInside) {
      const collisionAudio = new Audio('src/assets/sounds/impact.mp3');
      collisionAudio.play();

      // Create particles on collision
      createParticles(blackCircle.x + Math.cos(whiteCircle.angle * Math.PI / 180) * whiteCircle.distanceFromCenter,
        blackCircle.y + Math.sin(whiteCircle.angle * Math.PI / 180) * whiteCircle.distanceFromCenter);
      collisionHappened = true;
      setTimeout(() => {
        stopGame();
      }, 1000);
    }
  }
}
function createParticles(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push(new CollisionParticle(x, y));
  }
}
function stopGame() {
  window.removeEventListener('keydown', changePosition);
  clearInterval(interval);
  clearInterval(timerInterval);
  barriers.forEach(b => {
    clearInterval(b.updateInterval);
  });
  showGame.value = false;
  collisionHappened = false;
  setTimeout(() => {
    showGameOver.value = true;
  }, 500);
  window.parent.postMessage({
    event_type: "game_run_end",
    score: score.value,
  });
}
function resetGame() {
  clearInterval(timerInterval);
  timer = 0;
  score.value = 0;
  nextScoreStage.value = 10;
  barriers.splice(0, barriers.length);
  trails.splice(0, trails.length);
}
// change position
function changePosition(e) {
  e.preventDefault();
  if (e.code === 'Space') {
    whiteCircle.switchFlag = true;

    whiteCircle.isInside = !whiteCircle.isInside;
    whiteCircle.switchTarget = whiteCircle.isInside ? blackCircle.radius - 20 : blackCircle.radius + 20;

    trails.forEach(trail => {
      trail.switchFlag = true;
      trail.switchTarget = whiteCircle.switchTarget;
    });
    const jumpAudio = new Audio('src/assets/sounds/jump.mp3');
    jumpAudio.play();
  }
}
</script>

<template :style="{'--primary-color': colors[(currentColor%5) - 1] }">
  <Transition name="game" mode="out-in" appear>
    <GameStart v-show="showGameStart" :currentHighscore="currentHighscore" @start-game="init"
      :style="{ '--primary-color': colors[(currentColor % 5) - 1] }" />
  </Transition>
  <Transition name="game" mode="out-in" appear>
    <GameEnd v-show="showGameOver" :currentHighscore="currentHighscore" :currentScore="score" @start-game="init" />
  </Transition>
  <Transition name="game" mode="out-in" appear>
    <section v-show="showGame">
      <h1 id="score">{{ score }}</h1>
      <canvas width="500" height="500" id="canvas" ref="canvas">
      </canvas>
    </section>
  </Transition>



</template>

<style>
#score {
  color: white;
  text-align: end;
  font-size: 3rem;
  width: 500px;
  margin: 12px auto 0;
}

#canvas {
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.game-enter-active,
.game-leave-active {
  transition: all 0.5s ease-in-out
}

.game-enter-from {
  transform: translateY(100%);
}

.game-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.game-enter-to,
.game-leave-from {
  transform: translateY(0);

}
</style>