<script setup>
//this component manages the list of activities for the current category
//it has a list of activities for the category,
//a field to add new activities to the category,

import { reactive } from "vue";
import { useActivityStore } from "../stores/activityStore";

//and controls to edit and delete selected activities in the category
const activityStore = useActivityStore();

const state = reactive({
  editingActivities: false,
  nameInProgress: "",
  selectedId: null,
});

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
</script>

<template>
  <div class="management-panel" @click="clearSelected">
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
          <button>Rename</button>
        </div>
        <p v-else @click.stop="selectActivity(id)">{{ name }}</p>
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

.activity-index {
  display: flex;
  justify-content: center;
}

.new-activity {
  display: flex;
  justify-content: center;
}
.activity-list {
  height: 50%;
  overflow-y: scroll;
}

.list-item {
  height: 30px;
  background-color: #f6e27f;
  display: flex;
  justify-content: center;
}

h1,
h3 {
  text-align: center;
  color: black;
}

.text-div {
  height: 30px;
  display: flex;
  flex-direction: row;
}
</style>
