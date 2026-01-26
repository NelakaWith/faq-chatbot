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
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
