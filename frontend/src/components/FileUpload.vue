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
/* Dark Theme Compatible Styles */
.file-upload {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  margin: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  overflow: hidden;
}

.file-upload:hover:not(.is-loading) {
  border-color: var(--accent-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-upload.is-dragging {
  border-color: var(--accent-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.file-upload.is-loading {
  cursor: wait;
  opacity: 0.8;
  background: rgba(0, 0, 0, 0.2);
}

.upload-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  pointer-events: none; /* Let clicks pass through to container */
}

.icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  transition: transform 0.3s ease;
}

.file-upload:hover .icon {
  transform: scale(1.1) rotate(-5deg);
}

.text {
  text-align: left;
  font-size: 0.95rem;
  color: var(--text-secondary, #cbd5e1);
}

.text strong {
  color: var(--accent-primary, #3b82f6);
}

.subtext {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 4px;
}
</style>
