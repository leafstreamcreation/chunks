<script setup>
import { reactive, computed } from "vue";
import { useActivityStore } from "../stores/activityStore";

import { mdiPlaylistEdit } from "@mdi/js";
import { mdiClose } from "@mdi/js";

//this component manages the current category selected by the user
//it shows the name of the category
//has controls to navigate the categories
//and has a button to open the activity management
//panel for the current category

const props = defineProps({
  leftMenuPressSelected: Boolean,
});

const state = reactive({
  cycleIndex: 0,
});

const activityStore = useActivityStore();

const currentView = computed(() => {
  //values store labels/ url parts for backend calls, etc
  //for each view option: alone, together, nothing
  const values = ["Alone", "Together", "Nothing"];
  return values[activityStore.activeCategory];
});
function cycleViewIndex() {
  state.cycleIndex = state.cycleIndex < 2 ? state.cycleIndex + 1 : 0;
  activityStore.selectCategory(state.cycleIndex);
}
</script>

<template>
  <v-app-bar color="#bdd5ea">
    <v-btn
      :active="props.leftMenuPressSelected"
      :icon="props.leftMenuPressSelected ? mdiClose : mdiPlaylistEdit"
      @click.stop="$emit('left-menu-press')"
    ></v-btn>

    <v-app-bar-title :text="currentView" @click="cycleViewIndex" />
  </v-app-bar>
</template>

<style scoped>
/* Payne's gray  #495867; */
/* Glaucous      #577399; */
/* Columbia blue #BDD5EA; */
/* Ghost white   #F7F7FF; */
/* Jasmine       #F6E27F; */

.title-switcher {
  background-color: #bdd5ea;
  color: black;
}
</style>
