<script setup>
//this component manages the list of activities for the current category
//it has a list of activities for the category,
//a field to add new activities to the category,

import { reactive, watch } from "vue";
import { useActivityStore } from "../stores/activityStore";

//and controls to edit and delete selected activities in the category
const activityStore = useActivityStore();

const state = reactive({
  editingActivities: false,
  nameInProgress: "",
  selectedId: null,
});

watch(
  () => activityStore.activeCategory,
  () => {
    state.editingActivities = false;
    clearSelected();
  }
);

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

function toggleEditing() {
  state.editingActivities = !state.editingActivities;
  clearSelected();
}
</script>

<template>
  <v-card class="management-panel" title="Manage" @click="toggleEditing">
    <v-card v-if="state.editingActivities" class="new-activity text-div">
      <v-text-field
        :model-value="state.selectedId ? '' : state.nameInProgress"
        label="New Activity"
        bg-color="white"
        clearable
        @click.stop=""
      />
      <v-btn text="Add" @click.stop="createActivity" />
    </v-card>
    <v-list v-if="state.editingActivities" class="activity-list">
      <v-list-item
        v-for="{ id, name } in activityStore.activitiesInView"
        :key="id"
        class="list-item"
      >
        <div v-if="state.selectedId === id" class="activity-index text-div">
          <v-btn label="-" @click.stop="deleteActivity(id)" />
          <v-text-field v-model="state.nameInProgress" @click.stop="" />
          <v-btn label="Rename" @click.stop="updateActivity(id)" />
        </div>
        <p v-else @click.stop="selectActivity(id)">{{ name }}</p>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<style scoped>
/* Payne's gray  #495867; */
/* Glaucous      #577399; */
/* Columbia blue #BDD5EA; */
/* Ghost white   #F7F7FF; */
/* Jasmine       #F6E27F; */
.management-panel {
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
