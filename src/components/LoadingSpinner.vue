<script setup>
import { defineProps } from 'vue'

defineProps({
  message: {
    type: String,
    default: 'Loading...'
  }
})
</script>

<template>
  <div class="loading-container">
    <div class="spinner-wrapper">
      <div class="spinner"></div>
      <div class="spinner-inner"></div>
    </div>
    <p class="loading-text">{{ message }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xxl);
  gap: var(--space-lg);
}

.spinner-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid var(--border-color);
  border-top-color: var(--lfc-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-inner {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 3px solid var(--border-color);
  border-bottom-color: var(--lfc-gold);
  border-radius: 50%;
  animation: spin 0.6s linear infinite reverse;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
