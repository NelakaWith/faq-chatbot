<template>
  <div id="app">
    <ChatWidget />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from "vue";

// Lazy load the ChatWidget component
const ChatWidget = defineAsyncComponent(() => import("./components/ChatWidget.vue"));
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #0f172a; /* Dark background */
}
body {
  margin: 0;
  background-color: #0f172a; /* Dark background */
  color: #e0e0e0; /* Light text for dark theme */
  height: 100vh;
}
</style>
