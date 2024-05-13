<script setup>
import{onMounted,ref,reactive} from 'vue';
// states
const score = ref(0);
const whiteCircle = reactive({
  x: 350,
  y: 350,
  cx: 250,
  cy: 250,
  radius: 20,
  speed: 0.2 ,
  angle: 0,
  color: 'white',
});

let whiteRectangle = { x: 0, y: 0 ,size: 20 , cx: 250 , cy: 250 , angle: 0}; // Initialize the white rectangle

onMounted(()=> {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var angle = 0;

  setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlackCircle();
    drawWhiteCircle();
    drawWhiteRectangle();
    drawRectangleBarriers();

    const dx = whiteCircle.x + whiteCircle.cx - whiteRectangle.x;
    const dy = whiteCircle.y + whiteCircle.cy - whiteRectangle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
     if (whiteRectangle.angle === whiteCircle.angle  && whiteRectangle.cx == whiteCircle.cx && whiteRectangle.cy == whiteCircle.cy) {
      score.value++; // Increase the score
      generateWhiteRectangle(); // Generate a new white point
    }
  }, 1000 / 60);

  function drawRectangleBarriers() {
    const numBarriers = 3;
    const barrierWidth = 20; // Width
    const barrierHeight = 50; // Height
    const circleRadius = 200; // Radius
    const cx = 350;
    const cy = 350;
    for (let i = 0; i < numBarriers; i++) {
      const angle = (i * 2 * Math.PI) / numBarriers;
      const x = cx + circleRadius * Math.cos(angle); // x-coordinate of the barrier
      const y = cy + circleRadius * Math.sin(angle); // y-coordinate of the barrier
      ctx.beginPath();
      ctx.rect(x - barrierWidth / 2, y - barrierHeight / 2, barrierWidth, barrierHeight);
      ctx.fillStyle = 'black';
      ctx.fill();
    }
  }
  //drawing Black Circle
  function drawBlackCircle(){
    ctx.beginPath();
    ctx.arc(350, 350, 200, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.lineWidth= '10';
    ctx.stroke();
  }
  //drawing White Circle
  function drawWhiteCircle(){
    ctx.beginPath();
    ctx.arc(whiteCircle.x + whiteCircle.cx * Math.cos(- angle), whiteCircle.y + whiteCircle.cy * Math.sin(-angle), 20, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    whiteCircle.angle = angle;
    angle += 0.1 * whiteCircle.speed;
  }
  // change position
  window.addEventListener('keydown', changePosition);
  function changePosition(e){
    e.preventDefault();
    if(e.code  === 'Space'){
      const jumpAudio = new Audio('src/assets/sounds/jump.mp3');
      jumpAudio.play();
      if(whiteCircle.cx == 250){
        whiteCircle.cx = 150;
        whiteCircle.cy = 150;
      }
      else{
        whiteCircle.cx = 250;
        whiteCircle.cy = 250;
      }
    }
  }
  function generateWhiteRectangle() {
    const circleRadius = Math.random() < 0.5 ? 150 : 250;
    const cx = 350;
    const cy = 350;
    const angle = Math.random() * 2 * Math.PI;
    whiteRectangle.angle = angle;
    whiteRectangle.cx = circleRadius;
    whiteRectangle.cy = circleRadius;
    whiteRectangle.x = cx + circleRadius * Math.cos(angle); // x-coordinate
    whiteRectangle.y = cy + circleRadius * Math.sin(angle); // y-coordinate
  }
  function drawWhiteRectangle() {
    ctx.beginPath();
    ctx.rect(whiteRectangle.x - whiteRectangle.size / 2, whiteRectangle.y - whiteRectangle.size  / 2, whiteRectangle.size , whiteRectangle.size );
    ctx.fillStyle = 'white';
    ctx.fill();
  }
  generateWhiteRectangle();
});

</script>

<template>
  <h1 id="score">{{score}}</h1>
    <canvas width="700" height="700" id="canvas">
    </canvas>
</template>

<style scoped>
  #score{
    color: white;
    text-align: end ;
    font-size: 3rem;
  }
  #canvas{
    margin: 0 auto;
    display: flex;
    justify-content: center;
  }
</style>