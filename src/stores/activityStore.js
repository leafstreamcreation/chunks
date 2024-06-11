import {defineStore} from 'pinia';

export const useActivityStore = defineStore('activities', () => {
    const selectedId = ref(0);
    const activities = ref([]);
    const currentActivity = computed(() => activities[selectedId])
    function loadActivities() {
      selectedId.value++
    }
  
    return { selectedId, activities, currentActivity, loadActivities }
  })