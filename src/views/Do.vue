<script setup>
import { reactive, computed, onMounted } from 'vue';
import DoView from '../components/Do/DoView.vue';

const state = reactive({ 
  viewIndex: 0,

});
const currentView = computed(() => {
  const values = [
    "hey there",
    "my name is Derek",
    "how are you?"
  ];
  return values[state.viewIndex];
});
function cycleViewIndex() {
  state.viewIndex = state.viewIndex < 2 ? state.viewIndex + 1 : 0;
}
</script>

<template>
  <h1 @click="cycleViewIndex">{{currentView}}</h1>
  <DoView :msg="currentView"/>
  <div>
    then list CRUD
  </div>
</template>
