<script setup>
//this component allows the user to select
//an activity to do
//it has three main features:

//1: area with three buttons which allows the user
//to select an activity

//2: area for filtering activity choices and modifying the order
//(normal, reverse) in which the choices appear

//3: area for navigating through the activity choices

import Shuffler from "../utilities/Shuffler";
import { reactive, computed, watch } from "vue";
import SelectedActivity from "./SelectedActivity.vue";
import { useActivityStore } from "../stores/activityStore";

import { mdiRefresh } from "@mdi/js";
import { mdiChevronLeft } from "@mdi/js";
import { mdiChevronRight } from "@mdi/js";
import { mdiFilterVariant } from "@mdi/js";

const activityStore = useActivityStore();

const state = reactive({
  filter: "",
  suggestionIndex: 0,
});

const filteredActivities = computed(() => {
  return filterActivities(Object.values(activityStore.activitiesInView));
});

const suggestions = computed(() => {
  if (filteredActivities.value.length === 0)
    return [{ name: "No more suggestions" }];
  const random = orderByRandom(filteredActivities.value);
  const byStaleness = orderByStaleness(filteredActivities.value);
  const byLeastTime = orderByLeastTime(filteredActivities.value);
  const index = state.suggestionIndex;
  return new Shuffler([
    random[index],
    byStaleness[index],
    byLeastTime[index],
  ]).values();
});

function nextSuggestion() {
  const maxIndex = filteredActivities.value.length - 1;
  if (maxIndex > 0) {
    if (state.suggestionIndex === maxIndex) state.suggestionIndex = 0;
    else state.suggestionIndex += 1;
  } else state.suggestionIndex = 0;
}

function previousSuggestion() {
  const maxIndex = filteredActivities.value.length - 1;
  if (maxIndex > 0) {
    if (state.suggestionIndex === 0) state.suggestionIndex = maxIndex;
    else state.suggestionIndex -= 1;
  } else state.suggestionIndex = 0;
}

watch(
  () => activityStore.activitiesInView,
  () => {
    refreshSuggestions();
  }
);

function refreshSuggestions() {
  state.suggestionIndex = 0;
  state.filter = "";
}

function orderByRandom(activities) {
  return new Shuffler(activities).values();
}

function orderByLeastTime(activities) {
  return activities.sort((a, b) => {
    const aTime = a.history.reduce((sum, entry) => {
      if (!entry.endDate) return sum;
      const { startDate, endDate } = entry;
      return sum + endDate.getTime() - startDate.getTime();
    }, 0);
    const bTime = b.history.reduce((sum, entry) => {
      if (!entry.endDate) return sum;
      const { startDate, endDate } = entry;
      return sum + endDate.getTime() - startDate.getTime();
    }, 0);
    if (aTime === bTime) return 0;
    return aTime < bTime ? -1 : 1;
  });
}

function orderByStaleness(activities) {
  return activities.sort((a, b) => {
    const aSize = a.history.length;
    const { startDate: aStart, endDate: aEnd } =
      a.history["startDate" in a.history[aSize - 1] ? aSize - 1 : aSize - 2];
    if (!(aStart || aEnd)) return -1;
    const bSize = b.history.length;
    const { startDate: bStart, endDate: bEnd } =
      b.history["startDate" in b.history[bSize - 1] ? bSize - 1 : bSize - 2];
    if (!(bStart || bEnd)) return 1;
    const aLatest = aEnd ? aEnd.getTime() : aStart.getTime();
    const bLatest = bEnd ? bEnd.getTime() : bStart.getTime();
    if (aLatest === bLatest) return 0;
    return aLatest < bLatest ? -1 : 1;
  });
}

function filterActivities(activities) {
  const filtered = activities.filter((activity) =>
    activity.name.toLowerCase().includes(state.filter?.toLowerCase())
  );
  state.suggestionIndex = 0;
  return filtered;
}

function selectActivity(id) {
  activityStore.selectActivity(id);
}
</script>

<template>
  <v-card class="activity-view">
    <SelectedActivity />
    <v-card class="options">
      <v-btn
        class="options-button"
        color="#f7f7ff"
        :icon="mdiRefresh"
        @click="refreshSuggestions"
        :disabled="state.suggestionIndex === 0"
      />
      <v-text-field
        :append-inner-icon="mdiFilterVariant"
        v-model="state.filter"
        label="Filter activities"
        bg-color="white"
        clearable
        @click:clear="state.filter = ''"
      />
      <v-card
        :title="`${state.suggestionIndex + 1}/${filteredActivities.length}`"
      >
        <template v-slot:prepend>
          <v-btn
            class="options-button"
            color="#f7f7ff"
            :icon="mdiChevronLeft"
            @click="previousSuggestion"
          />
        </template>
        <template v-slot:append>
          <v-btn
            class="options-button"
            color="#f7f7ff"
            :icon="mdiChevronRight"
            :disabled="filteredActivities.length === 0"
            @click="nextSuggestion"
          />
        </template>
      </v-card>
    </v-card>
    <v-card class="suggestions">
      <v-container fluid>
        <v-row>
          <v-col
            cols="12"
            v-for="(activity, index) in suggestions"
            :key="index"
          >
            <v-btn
              @click="selectActivity(activity?.id)"
              color="#f6e27f"
              :text="activity?.name"
              block
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-card>
</template>

<style scoped>
/* Payne's gray  #495867; */
/* Glaucous      #577399; */
/* Columbia blue #BDD5EA; */
/* Ghost white   #F7F7FF; */
/* Jasmine       #F6E27F; */

div {
  /* width: 100%;
  height: 100%; */
}

.activity-view {
  background-color: #495867;
  width: 100%;
}

.options {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.suggestions {
  background-color: #495867;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
}

.options-button {
  margin: 2px;
}
</style>
