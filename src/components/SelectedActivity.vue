<script setup>
//this component manages the lates activity selected
//it shows the current selected activity
//and controls to start and stop recording history
//for the activity
import { reactive } from "vue";
import { useActivityStore } from "../stores/activityStore";

const activityStore = useActivityStore();

const state = reactive({
  runStarted: false,
  activityLocked: true,
});

async function addHistoryRecord() {
  await activityStore.addHistoryRecord();
}
</script>

<template>
  <div class="current-activity">
    <div
      v-if="activityStore.runningActivity?.name"
      @click="state.activityLocked = !state.activityLocked"
    >
      <h3>{{ activityStore.runningActivity?.name }}</h3>
      <v-btn
        v-if="!state.activityLocked"
        @click="addHistoryRecord"
        :text="activityStore.runStarted ? 'Stop' : 'Start'"
      />
    </div>
  </div>
</template>

<style scoped>
/* Payne's gray  #495867; */
/* Glaucous      #577399; */
/* Columbia blue #BDD5EA; */
/* Ghost white   #F7F7FF; */
/* Jasmine       #F6E27F; */

.current-activity {
  background-color: #f6e27f;
  height: 20%;
}
</style>
