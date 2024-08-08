<script setup>
  import { ref } from 'vue';
  const props = defineProps(['currentHighscore']);
  const emits = defineEmits(['startGame']);
  function startGame() {
    emits('startGame');
  }
</script>

<template>
    <section id="game-start-container">
        <h1>Tricky <span class="text-white d-block">Ring</span></h1>
        <strong>Best <br>{{props.currentHighscore}}</strong>
        <button @click="startGame" class="btn-play">
        </button>
    </section>
</template>

<style scoped>
  #game-start-container{
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

</style>