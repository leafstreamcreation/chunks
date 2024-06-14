import { ref, computed } from "vue";
import { defineStore } from "pinia";
import activityService from "../services/Activity.service";

export const useActivityStore = defineStore("activities", () => {
  const selectedId = ref(0);
  const loaderLock = ref(false);
  const activities = ref([]);
  const currentActivity = computed(() => activities.value[selectedId]);
  async function loadActivities() {
    //fetch activities
    if (loaderLock.value === true) return;
    loaderLock.value = true;
    const data = await activityService(`index`);
    if (!data || !data.activitiesByGroup) return;
    const activitiesByGroup = data.activitiesByGroup;
    let loadedActivities = activitiesByGroup;
    if (activitiesByGroup.length !== 3) {
      let nextDataIndex = 0;
      const edgeGroups = [];
      for (let i = 0; i < 3; i++) {
        const dataGroup = activitiesByGroup[nextDataIndex];
        if (dataGroup && dataGroup[0]?.group === i) {
          edgeGroups.push(activitiesByGroup[nextDataIndex]);
          nextDataIndex += 1;
        } else edgeGroups.push([]);
      }
      loadedActivities = edgeGroups;
    }
    loadedActivities.forEach((group) => {
      group.forEach((activity) => {
        activity.history.forEach((entry) => {
          for (const key in entry) {
            entry[key] = new Date(key);
          }
        });
      });
    });
    activities.value = loadedActivities;
    loaderLock.value = false;
  }

  return { selectedId, activities, currentActivity, loadActivities };
});
