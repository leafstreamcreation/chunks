<script setup>
import { reactive, computed } from "vue";
import { useActivityStore } from "../stores/activityStore";

//this component manages the current category selected by the user
//it shows the name of the category
//has controls to navigate the categories
//and has a button to open the activity management
//panel for the current category

const emit = defineEmits(["nextCategory"]);

const activityStore = useActivityStore();

const state = reactive({
  cycleIndex: 0,
  editingActivities: false,
  nameInProgress: "",
  selectedId: null,
  loaderLock: false,
});
const currentView = computed(() => {
  //values store labels/ url parts for backend calls, etc
  //for each view option: alone, together, nothing
  const values = ["Alone", "Together", "Nothing"];
  return values[activityStore.activeCategory];
});
function cycleViewIndex() {
  state.cycleIndex = state.cycleIndex < 2 ? state.cycleIndex + 1 : 0;
  activityStore.selectCategory(state.cycleIndex);
  //modify the activity store
  emit("nextCategory", state.cycleIndex);
}
</script>

<template>
  <div class="title-switcher" @click="cycleViewIndex">
    <h1>{{ currentView }}</h1>
  </div>
</template>

<style scoped>
/* Payne's gray  #495867; */
/* Glaucous      #577399; */
/* Columbia blue #BDD5EA; */
/* Ghost white   #F7F7FF; */
/* Jasmine       #F6E27F; */

.title-switcher {
  text-align: center;
  background-color: #bdd5ea;
  color: black;
  height: 15%;
}
</style>
