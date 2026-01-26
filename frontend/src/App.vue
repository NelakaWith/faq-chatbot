<template>
  <div id="app">
    <ChatWidget />
  </div>
</template>

<script setup>
// Import the main ChatWidget component
// No need to register it in 'components' option when using script setup
import ChatWidget from "./components/ChatWidget.vue";
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
