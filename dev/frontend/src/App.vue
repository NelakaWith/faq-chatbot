<template>
  <div id="app">
    <h1>Chatbot Demo</h1>
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
