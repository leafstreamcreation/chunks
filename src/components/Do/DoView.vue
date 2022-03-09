<script setup>
// import Shuffler from "../../utilities/Shuffler";

const props = defineProps({
  activities: {
    type: Object,
    required: true,
  },
  runningActivity: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["activitySelected"]);

function selectActivity() {
  emit("activitySelected", props.activities[1]);
}
</script>

<template>
  <div @click="selectActivity">
    somewhere here we need to be able to view activities: shuffled by time spent
    by least to most recent start and stop activities here
  </div>
</template>

<style scoped>
div {
  background-color: gold;
}
</style>
