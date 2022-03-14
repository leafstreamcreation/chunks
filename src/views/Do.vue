<script setup>
import { reactive, computed, onMounted } from "vue";
import { keyBy } from "lodash";
import DoView from "../components/Do/DoView.vue";
import activityService from "../services/Activity.service";

const state = reactive({
  runningActivity: {},
  runStarted: false,
  activityLocked: true,
  cycleIndex: 0,
  activities: [[], [], []],
  editingActivities: false,
  nameInProgress: "",
  selectedId: null,
});
const currentView = computed(() => {
  //values store labels/ url parts for backend calls, etc
  //for each view option: alone, together, nothing
  const values = ["Alone", "Together", "Nothing"];
  return values[state.cycleIndex];
});
const currentActivities = computed(() => {
  const deproxiedActivities = Object.values(
    state.activities[state.cycleIndex]
  ).map((innerProxy) => {
    const { id, name, history, group } = innerProxy;
    const historyDeproxy = Object.values(history).map((innerInnerProxy) => {
      const { startDate, endDate } = innerInnerProxy;
      return { startDate, endDate };
    });
    const activity = { id, name, history: historyDeproxy, group };
    const latestHistory = historyDeproxy[historyDeproxy.length - 1];
    if (latestHistory?.startDate && !latestHistory.endDate) {
      state.runningActivity = activity;
      state.runStarted = true;
    }
    return activity;
  });
  return keyBy(deproxiedActivities, "id");
});

onMounted(async () => {
  const { activitiesByGroup } = await activityService(`index`);
  if (activitiesByGroup.length > 0) {
    if (activitiesByGroup.length !== 3) {
      let nextDataIndex = 0;
      const edgeGroups = [];
      for (let i = 0; i < 3; i++) {
        if (activitiesByGroup[nextDataIndex][0].group === i) {
          edgeGroups.push(activitiesByGroup[nextDataIndex]);
          nextDataIndex += 1;
        } else edgeGroups.push([]);
      }
      state.activities = edgeGroups;
    } else state.activities = [...activitiesByGroup];
  }
});

function cycleViewIndex() {
  state.cycleIndex = state.cycleIndex < 2 ? state.cycleIndex + 1 : 0;
  state.editingActivities = false;
  clearSelected();
}

function updateCurrentActivity(activity) {
  if (state.runStarted && activity !== state.runningActivity)
    addHistoryRecord();
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

async function deleteActivity(id) {
  const { activity } = await activityService(`${id}/delete`, true);
  if (activity) {
    const activityIndex = state.activities[state.cycleIndex].findIndex(
      (v) => v.id === activity.id
    );
    if (
      state.cycleIndex === state.runningActivity.group &&
      activity.id === state.runningActivity.id
    )
      state.runningActivity = {};
    state.activities[state.cycleIndex].splice(activityIndex, 1);
    clearSelected();
  }
}

async function createActivity() {
  const name = state.nameInProgress;
  const group = state.cycleIndex;

  const { activity } = await activityService(`create`, true, { name, group });
  if (activity) state.activities[state.cycleIndex].push(activity);
  clearSelected();
}

async function updateActivity(id) {
  //TODO:
  const name = state.nameInProgress;

  const data = await activityService(`${id}/update`, true, { name });
  console.log("Update name successful: ", data?.url);

  const activityIndex = state.activities[state.cycleIndex].findIndex(
    (v) => v.id === id
  );
  state.activities[state.cycleIndex][activityIndex].name = name;
  if (
    state.cycleIndex === state.runningActivity.group &&
    id === state.runningActivity.id
  )
    state.runningActivity.name = name;
  clearSelected();
}

function changeNewActivityText({ target }) {
  state.nameInProgress = target.value;
}

async function addHistoryRecord() {
  const activity = state.runningActivity;
  const index = state.activities[activity.group].findIndex(
    (v) => v.id === activity.id
  );
  if (!state.runStarted) {
    //TODO:
    const data = await activityService(`${activity.id}/update`, true, {
      startDate: new Date(),
    });
    console.log("Update startTime successful: ", data?.url);
    state.activities[activity.group][index].history.push({
      startDate: new Date(),
    });
    state.runStarted = true;
  } else {
    //TODO:
    const data = await activityService(`${activity.id}/update`, true, {
      endDate: new Date(),
    });
    console.log("Update endTime successful: ", data?.url);
    const interval = state.activities[activity.group][index].history.pop();
    interval.endDate = new Date();
    state.activities[activity.group][index].history.push(interval);
    state.runStarted = false;
  }
}
</script>

<template>
  <div @click="clearSelected">
    <h1 @click="cycleViewIndex">{{ currentView }}</h1>
    <div class="current-activity">
      <div
        v-if="state.runningActivity.name"
        @click="state.activityLocked = !state.activityLocked"
      >
        <h3>{{ state.runningActivity.name }}</h3>
        <button v-if="!state.activityLocked" @click="addHistoryRecord">
          {{ state.runStarted ? "Stop" : "Start" }}
        </button>
      </div>
    </div>
    <DoView
      :activities="currentActivities"
      :runningActivity="state.runningActivity"
      @activitySelected="updateCurrentActivity"
    />
    <div class="activity-crud">
      <h3 @click="state.editingActivities = !state.editingActivities">
        My Activities
      </h3>
      <div v-if="state.editingActivities">
        <div v-for="{ id, name } in currentActivities" :key="id">
          <div v-if="state.selectedId === id" class="activity-index">
            <button @click.stop="deleteActivity(id)">-</button>
            <input
              type="text"
              name="update-name"
              v-model="state.nameInProgress"
              @click.stop=""
              @change="updateActivity(id)"
            />
            <button @click.stop="">Rename</button>
          </div>
          <p v-else @click.stop="selectActivity(id)">{{ name }}</p>
        </div>
        <div class="new-activity">
          <input
            type="text"
            name="name"
            :value="state.selectedId ? '' : state.nameInProgress"
            @input="changeNewActivityText"
          />
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
