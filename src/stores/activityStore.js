import { ref, computed } from "vue";
import { defineStore } from "pinia";
import activityService from "../services/Activity.service";
import { keyBy } from "lodash";

export const useActivityStore = defineStore("activities", () => {
  const selectedId = ref(0);
  const activeCategory = ref(0);
  const runningActivity = ref({});
  const loaderLock = ref(false);
  const activities = ref([]);

  const currentActivity = computed(
    () => activitiesInView.value[selectedId.value]
  );

  const activitiesInView = computed(() => {
    const deproxiedActivities = Object.values(
      activities.value[activeCategory.value] || {}
    ).map((innerProxy) => {
      const { id, name, history, group } = innerProxy;
      const historyDeproxy = Object.values(history).map((innerInnerProxy) => {
        const { startDate, endDate } = innerInnerProxy;
        return { startDate, endDate };
      });
      const activity = { id, name, history: historyDeproxy, group };
      const latestHistory = historyDeproxy[historyDeproxy.length - 1];
      if (latestHistory?.startDate && !latestHistory.endDate) {
        runningActivity.value = activity;
      }
      return activity;
    });
    return keyBy(deproxiedActivities, "id");
  });

  function selectActivity(activity) {
    currentActivity.value = activity;
  }

  function selectCategory(id) {
    activeCategory.value = id;
  }

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

  async function createActivity(name, group) {
    const data = await activityService(`create`, true, { name, group });
    if (!data) return loadActivities();
    const { activity } = data;
    if (activity) activities.value[group].push(activity);
  }

  async function deleteActivity(id) {
    const data = await activityService(`${id}/delete`, true);
    if (!data) return loadActivities();
    const { activity } = data;
    if (activity) {
      const activityIndex = activities.value[activity.group].findIndex(
        (v) => v.id === activity.id
      );
      if (
        activity.group === runningActivity.value.group &&
        activity.id === runningActivity.value.id
      )
        runningActivity.value = {};
      activities.value[activity.group].splice(activityIndex, 1);
    }
  }

  return {
    selectedId,
    activeCategory,
    activities,
    currentActivity,
    activitiesInView,
    selectActivity,
    selectCategory,
    loadActivities,
    deleteActivity,
    createActivity,
  };
});