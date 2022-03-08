<script setup>
import { reactive, computed, onMounted } from 'vue';
import DoView from '../components/Do/DoView.vue';

const state = reactive({ 
  runningActivity: {},
  cycleIndex: 0,
  activities: [],
  editingActivities: false,
  nameInProgress: "",
  selectedId: null,
});
const currentView = computed(() => {
  //values store labels/ url parts for backend calls, etc
  //for each view option: alone, together, nothing
  const values = [
    "Alone",
    "Together",
    "Nothing",
  ];
  return values[state.cycleIndex];
});
const currentActivities = computed(() => {
  return state.activities[state.cycleIndex] || [];
});

onMounted(() => {
  const start1 = new Date(Date.now() - 60000);
  const end1 = new Date();
  const start2 = new Date(Date.now() - 120000);
  const end2 = start1;
  const response = [
    [{ id: 1, name: "Code Rulebreaker", history: [{start1, end1}] }],
    [{ id: 1, name: "Funnel Chloe", history: [] }],
    [{ id: 1, name: "Sit Outside", history: [{start2, end2}] }],
  ];
  console.log("Load activities: ", response);
  state.activities = response;
});

function cycleViewIndex() {
  state.cycleIndex = state.cycleIndex < 2 ? state.cycleIndex + 1 : 0;
}
function updateCurrentActivity(activity) {
  state.runningActivity = activity !== state.runningActivity ? activity : {};
}
function selectActivity(id) {
  state.selectedId = state.selectedId !== id ? id : null;
  const [ thisActivity ] = currentActivities.value.filter((activity) => activity.id === id);
  state.nameInProgress = thisActivity.name;
}
function clearSelected() {
  state.nameInProgress = "";
  state.selectedId = null;
}
function deleteActivity(id) {
  console.log("Delete activity of current activity set: ", id);
  clearSelected();
}
function createActivity() {
  console.log("Create activity: ", state.nameInProgress);
  clearSelected();
}
function updateActivity(id) {
  console.log(`Update activity: ${id} is now ${state.nameInProgress}`);
  clearSelected();
}
</script>

<template>
  <div @click="clearSelected">
    <h1 @click="cycleViewIndex">{{currentView}}</h1>
    <div class="current-activity">
      <h3>Selected activity:</h3>
      <p v-if="state.runningActivity">{{state.runningActivity?.name}}</p>
    </div>
    <DoView :activities="currentActivities" :runningActivity="state.runningActivity" @activitySelected="updateCurrentActivity"/>
    <div class="activity-crud">
      <h3 @click="state.editingActivities = !state.editingActivities">My Activities</h3>
      <div v-if="state.editingActivities">
        <div v-for="{id, name} in currentActivities" :key="id">
          <div v-if="state.selectedId === id" class="activity-index">
            <button @click.stop="deleteActivity(id)">-</button>
            <input type="text" name="update-name" v-model="state.nameInProgress" @click.stop="" @change="updateActivity(id)">
            <button @click.stop="">Rename</button>
          </div>
          <p v-else @click.stop="selectActivity(id)">{{name}}</p>
        </div>
        <div class="new-activity">
          <input type="text" name="name" v-model="state.nameInProgress">
          <button @click.stop="createActivity">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  background-color: aquamarine;
}

.current-activity {
  font-size: 1.2rem;
  background-color: chocolate;
}

.activity-crud {
  background-color: darkolivegreen;
  color: white;
}

.activity-index {
  display: flex;
  flex-direction: row;
}

.new-activity {
  display: flex;
  flex-direction: row;
}

</style>