<script setup>
import { onMounted, reactive } from "vue";
import ActivitySelectionView from "../components/ActivitySelectionView.vue";
import ActivityManagementPanel from "../components/ActivityManagementPanel.vue";
import CategoryBar from "../components/CategoryBar.vue";
import { useActivityStore } from "../stores/activityStore";

const activityStore = useActivityStore();

const state = reactive({
  managementPanelOpen: false,
});

onMounted(async () => {
  await activityStore.loadActivities();
});
</script>

<template>
  <!-- category bar -->
  <!-- current activity -->
  <!-- activity selection -->
  <!-- management panel -->
  <v-app>
    <v-card height="100%" rounded="0">
      <v-layout full-height>
        <CategoryBar
          :leftMenuPressSelected="state.managementPanelOpen"
          @left-menu-press="
            () => {
              state.managementPanelOpen = !state.managementPanelOpen;
            }
          "
        />
        <v-navigation-drawer
          v-model="state.managementPanelOpen"
          location="bottom"
          disable-route-watcher
        >
          <ActivityManagementPanel />
        </v-navigation-drawer>
        <v-main class="do-view">
          <ActivitySelectionView />
        </v-main>
      </v-layout>
    </v-card>
  </v-app>
</template>

<style scoped>
/* Payne's gray  #495867; */
/* Glaucous      #577399; */
/* Columbia blue #BDD5EA; */
/* Ghost white   #F7F7FF; */
/* Jasmine       #F6E27F; */
</style>
