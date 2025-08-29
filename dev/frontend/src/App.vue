<template>
  <div id="app">
    <ChatWidget />
  </div>
</template>

<script>
import ChatWidget from "./components/ChatWidget.vue";

export default {
  name: "App",
  components: {
    ChatWidget,
  },
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
