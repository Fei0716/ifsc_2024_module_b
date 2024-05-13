<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header>
<!--    <nav>-->
<!--      <h1>Vue 3 App</h1>-->
<!--      <ul>-->
<!--        <li><RouterLink to="/">Home</RouterLink></li>-->
<!--        <li><RouterLink to="/about">About</RouterLink></li>-->
<!--      </ul>-->
<!--    </nav>-->
  </header>
  <RouterView />

<!--  <footer>Copyright @ 2024 All Rights Reserved</footer>-->
</template>

<style scoped>
  nav{
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  nav ul{
    display:flex;
    gap: 10px;
  }
  li{
    list-style: none;
  }
  nav a{
    color: white;
    text-decoration: none;
  }
</style>
