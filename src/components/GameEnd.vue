<script setup>
import { ref } from 'vue';
const props = defineProps(['currentHighscore', 'currentScore']);
const emits = defineEmits(['startGame']);
function startGame() {
  emits('startGame');
}
</script>

<template>
  <section id="game-end-container">
    <h1><span class="text-white d-block">{{props.currentScore}}</span></h1>
    <strong>Best <br>{{props.currentHighscore}}</strong>
    <div class="font-regular">Game <span class="text-white">Over!</span></div>
    <button @click="startGame" class="btn-play">
    </button>
  </section>
</template>

<style scoped>
#game-end-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  justify-content: space-evenly;
  height: 100vh;
  text-align: center;
}
.d-block{
  display: block;
}
.font-regular{
  font-family: 'Roboto-Light';
  font-weight: normal;
  font-size: 3rem;
}
</style>