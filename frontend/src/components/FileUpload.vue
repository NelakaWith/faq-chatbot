<script setup>
import { ref } from "vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["file-selected"]);

const fileInput = ref(null);
const dragging = ref(false);

const triggerFileInput = () => {
  if (!props.isLoading) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    emit("file-selected", file);
  }
  // Reset input
  event.target.value = "";
};

const handleDrop = (event) => {
  dragging.value = false;
  if (props.isLoading) return;

  const file = event.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    emit("file-selected", file);
  }
};
</script>

<template>
  <div
    class="file-upload"
    :class="{ 'is-dragging': dragging, 'is-loading': isLoading }"
    @click="triggerFileInput"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      accept="application/pdf"
      style="display: none"
    />

    <div class="upload-content">
      <div class="icon">📄</div>
      <div class="text">
        <span v-if="isLoading">Processing document...</span>
        <span v-else>
          <strong>Click to upload</strong> or drag PDF here
          <div class="subtext">Analyze documents with AI</div>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-upload {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  margin: 12px 12px 12px 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9f9f9;
}

.file-upload:hover:not(.is-loading) {
  border-color: #007bff;
  background: #f0f7ff;
}

.file-upload.is-dragging {
  border-color: #007bff;
  background: #e6f3ff;
  transform: scale(1.02);
}

.file-upload.is-loading {
  cursor: wait;
  opacity: 0.7;
  border-style: solid;
}

.upload-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.icon {
  font-size: 1.5rem;
}

.text {
  text-align: left;
  font-size: 0.9rem;
  color: #555;
}

.subtext {
  font-size: 0.75rem;
  color: #888;
  margin-top: 2px;
}
</style>
