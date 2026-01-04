<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  message: {
    type: String,
    default: 'Something went wrong'
  }
})

const emit = defineEmits(['retry'])

function retry() {
  emit('retry')
}
</script>

<template>
  <div class="error-container">
    <div class="error-icon">⚠️</div>
    <h3 class="error-title">Oops!</h3>
    <p class="error-message">{{ message }}</p>
    <button class="btn btn-primary" @click="retry">
      Try Again
    </button>
    <p class="error-hint">
      If you haven't already, make sure to add your Football-Data.org API key to the .env file.
    </p>
  </div>
</template>

<style scoped>
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xxl);
  text-align: center;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.error-title {
  font-size: 1.75rem;
  color: var(--lfc-red);
  margin-bottom: var(--space-sm);
}

.error-message {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: var(--space-lg);
  max-width: 400px;
}

.error-hint {
  margin-top: var(--space-lg);
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 400px;
}
</style>
