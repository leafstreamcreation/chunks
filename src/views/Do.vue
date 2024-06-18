<script setup>
import { reactive, onMounted } from "vue";
import ActivitySelectionView from "../components/ActivitySelectionView.vue";
import ActivityManagementPanel from "../components/ActivityManagementPanel.vue";
import CategoryBar from "../components/CategoryBar.vue";
import { useActivityStore } from "../stores/activityStore";

const activityStore = useActivityStore();

const state = reactive({
  runStarted: false,
  activityLocked: true,
});

onMounted(async () => {
  await activityStore.loadActivities();
});

function updateCurrentActivity(activity) {
  if (state.runStarted && activity !== activityStore.runningActivity)
    addHistoryRecord();
  activityStore.runningActivity =
    activity !== activityStore.runningActivity ? activity : {};
}

async function addHistoryRecord() {
  await activityStore.addHistoryRecord();
}
</script>

<template>
  <!-- category bar -->
  <!-- current activity -->
  <!-- activity selection -->
  <!-- management panel -->
  <div class="do-bounds">
    <CategoryBar />
    <div class="current-activity">
      <div
        v-if="activityStore.runningActivity?.name"
        @click="state.activityLocked = !state.activityLocked"
      >
        <h3>{{ activityStore.runningActivity?.name }}</h3>
        <button v-if="!state.activityLocked" @click="addHistoryRecord">
          {{ activityStore.runStarted ? "Stop" : "Start" }}
        </button>
      </div>
    </div>
    <ActivitySelectionView
      :activities="activityStore.activitiesInView || {}"
      :runningActivity="activityStore.runningActivity"
      @activitySelected="updateCurrentActivity"
    />
    <ActivityManagementPanel />
  </div>
</template>

<style scoped>
/* Payne's gray  #495867; */
/* Glaucous      #577399; */
/* Columbia blue #BDD5EA; */
/* Ghost white   #F7F7FF; */
/* Jasmine       #F6E27F; */

h1,
h3 {
  text-align: center;
  color: black;
}

div {
  width: 100%;
  height: 100%;
}

.do-bounds {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-switcher {
  background-color: #bdd5ea;
  color: black;
  height: 15%;
}
.current-activity {
  background-color: #f6e27f;
  height: 20%;
}
</style>
