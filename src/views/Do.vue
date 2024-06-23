<script setup>
import { onMounted } from "vue";
import ActivitySelectionView from "../components/ActivitySelectionView.vue";
import ActivityManagementPanel from "../components/ActivityManagementPanel.vue";
import CategoryBar from "../components/CategoryBar.vue";
import { useActivityStore } from "../stores/activityStore";

const activityStore = useActivityStore();

onMounted(async () => {
  await activityStore.loadActivities();
});
</script>

<template>
  <!-- category bar -->
  <!-- current activity -->
  <!-- activity selection -->
  <!-- management panel -->
  <v-app class="do-bounds">
    <v-card height="100%" rounded="0">
      <v-layout full-height>
        <CategoryBar />
        <v-main class="do-view">
          <ActivitySelectionView />
          <ActivityManagementPanel />
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

.do-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
