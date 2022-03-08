<script setup>
defineProps({
  activities: {
    type: [Object],
    required: true
  },
  runningActivity: {
      type: Object,
      required: true
  }
});
defineEmits(['activitySelected']);
</script>

<template>
  <div @click="$emit('activitySelected', activities[0])">
  somewhere here we need to be able to view activities:
      shuffled
      by time spent
      by least to most recent

      start and stop activities here
  </div>
</template>

<style scoped>
div {
    background-color: gold;
}
</style>