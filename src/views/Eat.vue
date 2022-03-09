<script setup>
import { reactive } from "vue";

const state = reactive({ title: "UNDER CONSTRUCTION" });
</script>

<template>
  <div class="about">
    <h1>{{ state.title }}</h1>
    <div>Here apply filters</div>
    <div>
      somewhere here view filtered food options: shuffled by most eaten by least
      to most recent start and stop activities here
    </div>
    <div>then list CRUD</div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
