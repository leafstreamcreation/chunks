<script setup>
import { reactive, computed, onMounted } from 'vue';
import { keyBy } from 'lodash';
import DoView from '../components/Do/DoView.vue';

const state = reactive({ 
  runningActivity: {},
  cycleIndex: 0,
  activities: [[]],
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
  const deproxiedActivities = Object.values(state.activities[state.cycleIndex]).map((innerProxy) => {
    const { id, name, history } = innerProxy;
    const historyDeproxy = Object.values(history).map((innerInnerProxy) => {
      const { startDate, endDate } = innerInnerProxy;
      return { startDate, endDate };
    });
    return { id, name, history:historyDeproxy };
  });
  return keyBy(deproxiedActivities, "id");
});

onMounted(() => {
  const start1 = new Date(Date.now() - 60000);
  const end1 = new Date();
  const start2 = new Date(Date.now() - 120000);
  const end2 = start1;
  const response = [
    [{ id: 1, name: "Code Rulebreaker", history: [{ startDate: start1, endDate: end1}] }],
    [{ id: 1, name: "Funnel Chloe", history: [] }],
    [{ id: 1, name: "Sit Outside", history: [{ startDate: start2, endDate: end2 }] }],
  ];
  console.log("Load activities: ", response);
  state.activities = response;
});

function cycleViewIndex() {
  state.cycleIndex = state.cycleIndex < 2 ? state.cycleIndex + 1 : 0;
  state.editingActivities = false;
  clearSelected();
}
function updateCurrentActivity(activity) {
  state.runningActivity = activity !== state.runningActivity ? activity : {};
}
function selectActivity(id) {
  state.selectedId = state.selectedId !== id ? id : null;
  const thisActivity = currentActivities.value[id];
  state.nameInProgress = state.selectedId ? thisActivity.name : "";
}
function clearSelected() {
  state.nameInProgress = "";
  state.selectedId = null;
}
function deleteActivity(id) {
  //TODO:
  console.log("Delete activity of current activity set: ", id);
  const activityIndex = state.activities[state.cycleIndex].findIndex((v) => v.id === id);
  state.activities[state.cycleIndex].splice(activityIndex, 1);
  clearSelected();
}
function createActivity() {
  //TODO:
  console.log("Create activity: ", state.nameInProgress);
  const id = state.activities[state.cycleIndex].length + 1;
  
  const name = state.nameInProgress;
  const history = [];
  state.activities[state.cycleIndex].push({ id, name, history });
  clearSelected();
}
function updateActivity(id) {
  //TODO:
  console.log(`Update activity: ${id} is now ${state.nameInProgress}`);
  const name = state.nameInProgress;

  const activityIndex = state.activities[state.cycleIndex].findIndex((v) => v.id === id);
  state.activities[state.cycleIndex][activityIndex].name = name;
  clearSelected();
}
function changeNewActivityText({target}) {
  state.nameInProgress = target.value;
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
          <input type="text" name="name" :value="state.selectedId ? '' : state.nameInProgress" @input="changeNewActivityText">
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