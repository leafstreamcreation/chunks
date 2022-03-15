<script setup>
import Shuffler from "../../utilities/Shuffler";
import { reactive, computed, watch } from "vue";

const state = reactive({
  filter: "",
  sortReversed: false,
  suggestionIndex: 0,
});

const props = defineProps({
  activities: {
    type: Object,
    required: true,
  },
  runningActivity: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["activitySelected"]);

const filteredActivities = computed(() => {
  return filterActivities(Object.values(props.activities));
});

const randomActivities = computed(() => {
  return orderByRandom(Object.values(props.activities));
});

const activitiesByStaleness = computed(() => {
  return orderByStaleness(Object.values(props.activities));
});

const activitiesByLeastTime = computed(() => {
  return orderByLeastTime(Object.values(props.activities));
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

function reverseOrder() {
  state.sortReversed = !state.sortReversed;
  if (filteredActivities.value.length > 1) {
    const maxIndex = filteredActivities.value.length - 1;
    state.suggestionIndex = maxIndex - state.suggestionIndex;
  }
}

function nextSuggestion() {
  if (filteredActivities.value.length < 2) state.suggestionIndex = 0;
  if (state.sortReversed === true) {
    state.suggestionIndex =
      state.suggestionIndex > 0 ? state.suggestionIndex - 1 : 0;
  } else {
    const maxIndex = filteredActivities.value.length - 1;
    state.suggestionIndex =
      state.suggestionIndex < maxIndex ? state.suggestionIndex + 1 : maxIndex;
  }
}
watch(props, () => {
  refreshSuggestions();
});

function refreshSuggestions() {
  state.suggestionIndex = 0;
  state.filter = "";
  state.sortReversed = false;
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
    const { startDate: aStart, endDate: aEnd } = a.history[ "startDate" in a.history[aSize - 1] ? aSize - 1 : aSize - 2 ];
    if (!(aStart || aEnd)) return -1;
    const bSize = b.history.length;
    const { startDate: bStart, endDate: bEnd } = b.history[ "startDate" in b.history[bSize - 1] ? bSize - 1 : bSize - 2 ];
    if (!(bStart || bEnd)) return 1;
    const aLatest = aEnd ? aEnd.getTime() : aStart.getTime();
    const bLatest = bEnd ? bEnd.getTime() : bStart.getTime();
    if (aLatest === bLatest) return 0;
    return aLatest < bLatest ? -1 : 1;
  });
}

function filterActivities(activities) {
  const filtered = activities.filter((activity) =>
    activity.name.toLowerCase().includes(state.filter.toLowerCase())
  );
  state.suggestionIndex = 0;
  return filtered;
}

function selectActivity(id) {
  const activities = Object.values(props.activities);
  const index = activities.findIndex((v) => v.id === id);
  emit("activitySelected", activities[index] || {});
}
</script>

<template>
  <div class="do-view">
    <div class="options">
      <div class="options-button" @click="reverseOrder">
        {{ state.sortReversed ? "Reverse" : "Normal" }}
      </div>
      <input type="text" v-model="state.filter" placeholder="filter by name" />
      <div class="options-button" @click="refreshSuggestions">Refresh</div>
      <div
        class="options-button"
        :disabled="filteredActivities.length === 0"
        @click="nextSuggestion"
      >
        Next
      </div>
    </div>
    <div class="suggestions">
      <div
        v-for="(activity, index) in suggestions"
        :key="index"
        @click="selectActivity(activity?.id)"
        class="suggestion-item"
      >
        {{ activity?.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.do-view {
  background-color: gold;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.options {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.suggestions {
  background-color: darkgray;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
}
.suggestion-item {
  background-color: white;
  width: 30%;
}

.options-button {
  background-color: blueviolet;
  color: white;
  text-align: center;
  margin: 2px;
  padding: 2px;
}
</style>
