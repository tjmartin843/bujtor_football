<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  team: {
    type: Object,
    required: true
  },
  standing: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['select'])

function selectTeam() {
  emit('select', props.team.id)
}
</script>

<template>
  <div class="team-card" @click="selectTeam">
    <div class="team-header">
      <img :src="team.crest" :alt="team.name" class="team-crest" />
      <div class="team-info">
        <h4 class="team-name">{{ team.shortName || team.name }}</h4>
        <span class="team-venue" v-if="team.venue">{{ team.venue }}</span>
      </div>
    </div>
    
    <div class="team-stats" v-if="standing">
      <div class="stat">
        <span class="stat-value">{{ standing.position }}</span>
        <span class="stat-label">Pos</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ standing.points }}</span>
        <span class="stat-label">Pts</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ standing.won }}</span>
        <span class="stat-label">W</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ standing.draw }}</span>
        <span class="stat-label">D</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ standing.lost }}</span>
        <span class="stat-label">L</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.team-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--lfc-red);
  transform: translateY(-2px);
}

.team-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.team-crest {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-size: 1rem;
  margin-bottom: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-venue {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.team-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-xs);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
}
</style>
