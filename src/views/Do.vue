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
  loaderLock: false,
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

onMounted(loadActivities);

async function loadActivities() {
  if (state.loaderLock === true) return;
  state.loaderLock = true;
  const data = await activityService(`index`);
  if (!data || !data.activitiesByGroup) return;
  const activitiesByGroup = data.activitiesByGroup;
  let loadedActivities = activitiesByGroup;
  if (activitiesByGroup.length !== 3) {
    let nextDataIndex = 0;
    const edgeGroups = [];
    for (let i = 0; i < 3; i++) {
      const dataGroup = activitiesByGroup[nextDataIndex];
      if (dataGroup && dataGroup[0]?.group === i) {
        edgeGroups.push(activitiesByGroup[nextDataIndex]);
        nextDataIndex += 1;
      } else edgeGroups.push([]);
    }
    loadedActivities = edgeGroups;
  }
  loadedActivities.forEach((group) => {
    group.forEach((activity) => {
      activity.history.forEach((entry) => {
        for (const key in entry) {
          entry[key] = new Date(key);
        }
      });
    });
  });
  state.activities = loadedActivities;
  state.loaderLock = false;
}

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
  const data = await activityService(`${id}/delete`, true);
  if (!data) return loadActivities();
  const { activity } = data;
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

  const data = await activityService(`create`, true, { name, group });
  if (!data) return loadActivities();
  const { activity } = data;
  if (activity) state.activities[state.cycleIndex].push(activity);
  clearSelected();
}

async function updateActivity(id) {
  const name = state.nameInProgress;

  const data = await activityService(`${id}/update`, true, { name });
  if (!data) return loadActivities();
  const { activity } = data;
  if (activity) {
    const activityIndex = state.activities[state.cycleIndex].findIndex(
      (v) => v.id === activity.id
    );
    state.activities[state.cycleIndex][activityIndex].name = activity.name;
    if (
      state.cycleIndex === state.runningActivity.group &&
      id === state.runningActivity.id
    )
      state.runningActivity.name = activity.name;
    clearSelected();
  }
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
    const data = await activityService(
      `${activity.id}/update`,
      true,
      {
        startDate: new Date().toISOString(),
      }
    );
    if (!data) return loadActivities();
    const { activity: updatedActivity } = data;
    const latestIndex = updatedActivity.history.length - 1;
    if (updatedActivity) {
      const date = updatedActivity[latestIndex].startDate;
      state.activities[activity.group][index][latestIndex].startDate =
        new Date(date);
      state.runStarted = true;
    }
  } else {
    const data = await activityService(
      `${activity.id}/update`,
      true,
      {
        endDate: new Date().toISOString(),
      }
    );
    if (!data) return loadActivities();
    const { activity: updatedActivity } = data;
    const latestIndex = updatedActivity.history.length - 1;
    if (updatedActivity) {
      const date = updatedActivity[latestIndex].endDate;
      state.activities[activity.group][index][latestIndex].endDate = new Date(
        date
      );
      state.activities[activity.group][index].history.push({});
      state.runStarted = false;
    }
  }
}
</script>

<template>
  <div class="do-bounds" @click="clearSelected">
    <div class="title-switcher" @click="cycleViewIndex">
      <h1>{{ currentView }}</h1>
    </div>
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
    <div class="management-panel">
      <h3 @click="state.editingActivities = !state.editingActivities">
        Manage
      </h3>
      <div v-if="state.editingActivities">
        <div class="new-activity text-div">
          <input
            type="text"
            name="name"
            :value="state.selectedId ? '' : state.nameInProgress"
            @input="changeNewActivityText"
          />
          <button @click.stop="createActivity">Add</button>
        </div>
        <div v-for="{ id, name } in currentActivities" :key="id" class="list-item">
          <div v-if="state.selectedId === id" class="activity-index text-div">
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
      </div>
    </div>
  </div>
</template>

<style scoped>
h1, h3 {
  text-align: center;
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
  background-color: aquamarine;
  height: 20%;
}

.current-activity {
  background-color: chocolate;
  height: 15%;
}

.management-panel {
  height: 30%;
  background-color: darkolivegreen;
  color: white;
  overflow-y: scroll;
}

.text-div {
  height: 30px;
  display: flex;
  flex-direction: row;
}

.list-item {
  height: 30px;
  display: flex;
  justify-content: center;
}

.activity-index {
  display: flex;
  justify-content: center;
}

.new-activity {
  display:flex;
  justify-content: center;
}
</style>
