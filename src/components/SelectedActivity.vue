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
  <v-card
    v-if="activityStore.runningActivity?.name"
    :title="activityStore.runningActivity?.name"
    class="current-activity"
    @click="state.activityLocked = !state.activityLocked"
  >
    <v-btn
      v-if="!state.activityLocked"
      @click="addHistoryRecord"
      :text="activityStore.runStarted ? 'Stop' : 'Start'"
    />
  </v-card>
</template>

<style scoped>
/* Payne's gray  #495867; */
/* Glaucous      #577399; */
/* Columbia blue #BDD5EA; */
/* Ghost white   #F7F7FF; */
/* Jasmine       #F6E27F; */

.current-activity {
  background-color: #f6e27f;
}
</style>
