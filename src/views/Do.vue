<script setup>
import { reactive, computed, onMounted } from "vue";
import { keyBy } from "lodash";
import ActivitySelectionView from "../components/ActivitySelectionView.vue";
import ActivityManagementPanel from "../components/ActivityManagementPanel.vue";
import CategoryBar from "../components/CategoryBar.vue";
import { useActivityStore } from "../stores/activityStore";

const activityStore = useActivityStore();

const state = reactive({
  runningActivity: {},
  runStarted: false,
  activityLocked: true,
  categoryIndex: 0,
  activities: [[], [], []],
  editingActivities: false,
  nameInProgress: "",
  selectedId: null,
});
const currentActivities = computed(() => {
  const deproxiedActivities = Object.values(
    state.activities[state.categoryIndex]
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
  await activityStore.loadActivities();
  state.activities = activityStore.activities;
});

function updateCategory(newIndex) {
  state.categoryIndex = newIndex;
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
  await activityStore.deleteActivity(id);
  clearSelected();
}

async function createActivity() {
  await activityStore.createActivity(state.nameInProgress, state.categoryIndex);
  clearSelected();
}

async function updateActivity(id) {
  const name = state.nameInProgress;

  const data = await activityService(`${id}/update`, true, { name });
  if (!data) return loadActivities();
  const { activity } = data;
  if (activity) {
    const activityIndex = state.activities[state.categoryIndex].findIndex(
      (v) => v.id === activity.id
    );
    state.activities[state.categoryIndex][activityIndex].name = activity.name;
    if (
      state.categoryIndex === state.runningActivity.group &&
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
    const data = await activityService(`${activity.id}/update`, true, {
      startDate: new Date().toISOString(),
    });
    if (!data) return loadActivities();
    const { activity: updatedActivity } = data;
    const latestIndex = updatedActivity.history.length - 1;
    if (updatedActivity) {
      const date = updatedActivity.history[latestIndex].startDate;
      state.activities[activity.group][index].history[latestIndex].startDate =
        new Date(date);
      state.runStarted = true;
    }
  } else {
    const data = await activityService(`${activity.id}/update`, true, {
      endDate: new Date().toISOString(),
    });
    if (!data) return loadActivities();
    const { activity: updatedActivity } = data;
    const latestIndex = updatedActivity.history.length - 2;
    if (updatedActivity) {
      const date = updatedActivity.history[latestIndex].endDate;
      state.activities[activity.group][index].history[latestIndex].endDate =
        new Date(date);
      state.activities[activity.group][index].history.push({});
      state.runStarted = false;
    }
  }
}
</script>

<template>
  <!-- category bar -->
  <!-- current activity -->
  <!-- activity selection -->
  <!-- management panel -->
  <div class="do-bounds" @click="clearSelected">
    <CategoryBar @nextCategory="updateCategory" />
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
    <ActivitySelectionView
      :activities="currentActivities"
      :runningActivity="state.runningActivity"
      @activitySelected="updateCurrentActivity"
    />
    <div class="management-panel">
      <h3
        :class="
          state.editingActivities
            ? 'management-title-collapsed'
            : 'management-title'
        "
        @click="state.editingActivities = !state.editingActivities"
      >
        Manage
      </h3>
      <div v-if="state.editingActivities" class="new-activity text-div">
        <input
          type="text"
          name="name"
          :value="state.selectedId ? '' : state.nameInProgress"
          @input="changeNewActivityText"
        />
        <button @click.stop="createActivity">Add</button>
      </div>
      <div v-if="state.editingActivities" class="activity-list">
        <div
          v-for="{ id, name } in currentActivities"
          :key="id"
          class="list-item"
        >
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

.management-panel {
  height: 30%;
  background-color: #577399;
  color: black;
}

.management-title {
  height: 100%;
  background-color: #bdd5ea;
}

.management-title-collapsed {
  background-color: #bdd5ea;
}

.activity-list {
  height: 50%;
  overflow-y: scroll;
}

.text-div {
  height: 30px;
  display: flex;
  flex-direction: row;
}

.list-item {
  height: 30px;
  background-color: #f6e27f;
  display: flex;
  justify-content: center;
}

.activity-index {
  display: flex;
  justify-content: center;
}

.new-activity {
  display: flex;
  justify-content: center;
}
</style>
