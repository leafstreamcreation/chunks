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
  <v-app>
    <v-card height="100%" rounded="0">
      <v-layout full-height>
        <CategoryBar />
        <v-main class="do-view">
          <v-container fluid>
            <v-row>
              <v-col cols="12">
                <ActivitySelectionView />
              </v-col>
              <v-col cols="12">
                <ActivityManagementPanel />
              </v-col>
            </v-row>
          </v-container>
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
