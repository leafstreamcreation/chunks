<script setup>
//this component manages the list of activities for the current category
//it has a list of activities for the category,
//a field to add new activities to the category,

import { reactive, watch } from "vue";
import { useActivityStore } from "../stores/activityStore";

import { mdiMinusThick } from "@mdi/js";

//and controls to edit and delete selected activities in the category
const activityStore = useActivityStore();

const state = reactive({
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
  await activityStore.renameActivity(id, state.nameInProgress);
  clearSelected();
}
</script>

<template>
  <v-card class="management-panel" title="Manage" @click.stop="clearSelected">
    <v-card class="new-activity text-v-card">
      <v-text-field
        v-model="state.nameInProgress"
        bg-color="white"
        clearable
        @click.stop=""
      />
      <v-btn
        :text="state.selectedId ? 'Rename' : 'Add'"
        @click.stop="
          () => {
            state.selectedId
              ? updateActivity(state.selectedId)
              : createActivity();
          }
        "
      />
    </v-card>
    <v-list class="activity-list">
      <v-list-item
        v-for="{ id, name } in activityStore.activitiesInView"
        :key="id"
        class="list-item"
      >
        <v-card
          :title="name"
          @click.stop="
            () => {
              state.selectedId === id ? clearSelected() : selectActivity(id);
            }
          "
        >
          <template v-slot:append v-if="state.selectedId === id">
            <v-btn :icon="mdiMinusThick" @click.stop="deleteActivity(id)" />
          </template>
        </v-card>
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
  background-color: #f6e27f;
}

h1,
h3 {
  text-align: center;
  color: black;
}
</style>
