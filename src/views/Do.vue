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
  editingActivities: false,
  nameInProgress: "",
  selectedId: null,
});

onMounted(async () => {
  await activityStore.loadActivities();
});

function updateCategory() {
  state.editingActivities = false;
  clearSelected();
}

function updateCurrentActivity(activity) {
  if (state.runStarted && activity !== activityStore.runningActivity)
    addHistoryRecord();
  activityStore.runningActivity =
    activity !== activityStore.runningActivity ? activity : {};
}

function selectActivity(id) {
  state.selectedId = state.selectedId !== id ? id : null;
  const thisActivity = activityStore.activitiesInView[id];
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
  await activityStore.createActivity(
    state.nameInProgress,
    activityStore.activeCategory
  );
  clearSelected();
}

async function updateActivity(id) {
  const activity = await activityStore.renameActivity(id, state.nameInProgress);
  if (activity) clearSelected();
}

function changeNewActivityText({ target }) {
  state.nameInProgress = target.value;
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
  <div class="do-bounds" @click="clearSelected">
    <CategoryBar @nextCategory="updateCategory" />
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
          v-for="{ id, name } in activityStore.activitiesInView"
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
