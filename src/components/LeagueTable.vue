<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  standings: {
    type: Array,
    required: true
  },
  highlightTeamId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['select-team'])

function selectTeam(teamId) {
  emit('select-team', teamId)
}

function isHighlighted(team) {
  return props.highlightTeamId && team.team.id === props.highlightTeamId
}
</script>

<template>
  <div class="league-table-wrapper">
    <table class="league-table">
      <thead>
        <tr>
          <th class="pos-col">#</th>
          <th class="team-col">Team</th>
          <th class="stat-col">P</th>
          <th class="stat-col">W</th>
          <th class="stat-col">D</th>
          <th class="stat-col">L</th>
          <th class="stat-col hide-mobile">GF</th>
          <th class="stat-col hide-mobile">GA</th>
          <th class="stat-col">GD</th>
          <th class="stat-col points-col">Pts</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="team in standings" 
          :key="team.team.id"
          :class="{ 
            'highlighted': isHighlighted(team),
            'champions-league': team.position <= 4,
            'europa-league': team.position === 5,
            'relegation': team.position >= 18
          }"
          @click="selectTeam(team.team.id)"
        >
          <td class="pos-col">
            <span class="position" :class="{
              'top-4': team.position <= 4,
              'europa': team.position === 5,
              'relegation': team.position >= 18
            }">
              {{ team.position }}
            </span>
          </td>
          <td class="team-col">
            <div class="team-info">
              <img :src="team.team.crest" :alt="team.team.name" class="team-crest" />
              <span class="team-name">{{ team.team.shortName || team.team.name }}</span>
            </div>
          </td>
          <td class="stat-col">{{ team.playedGames }}</td>
          <td class="stat-col">{{ team.won }}</td>
          <td class="stat-col">{{ team.draw }}</td>
          <td class="stat-col">{{ team.lost }}</td>
          <td class="stat-col hide-mobile">{{ team.goalsFor }}</td>
          <td class="stat-col hide-mobile">{{ team.goalsAgainst }}</td>
          <td class="stat-col">
            <span :class="{ 
              'positive': team.goalDifference > 0, 
              'negative': team.goalDifference < 0 
            }">
              {{ team.goalDifference > 0 ? '+' : '' }}{{ team.goalDifference }}
            </span>
          </td>
          <td class="stat-col points-col">
            <span class="points">{{ team.points }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Legend -->
    <div class="table-legend">
      <div class="legend-item">
        <span class="legend-dot top-4"></span>
        <span>Champions League</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot europa"></span>
        <span>Europa League</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot relegation"></span>
        <span>Relegation</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.league-table-wrapper {
  overflow-x: auto;
}

.league-table {
  width: 100%;
  border-collapse: collapse;
}

.league-table th {
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  text-transform: uppercase;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
}

.league-table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-color);
}

.league-table tbody tr {
  cursor: pointer;
  transition: background 0.2s ease;
}

.league-table tbody tr:hover {
  background: var(--bg-secondary);
}

.league-table tbody tr.highlighted {
  background: rgba(200, 16, 46, 0.15);
}

.league-table tbody tr.highlighted:hover {
  background: rgba(200, 16, 46, 0.25);
}

.pos-col {
  width: 45px;
  text-align: center;
}

.position {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
}

.position.top-4 {
  background: rgba(0, 150, 136, 0.2);
  color: #00C853;
}

.position.europa {
  background: rgba(255, 152, 0, 0.2);
  color: #FFB300;
}

.position.relegation {
  background: rgba(244, 67, 54, 0.2);
  color: #FF5252;
}

.team-col {
  min-width: 150px;
}

.team-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.team-crest {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.team-name {
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.stat-col {
  width: 40px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.points-col {
  width: 50px;
}

.points {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.positive {
  color: var(--win);
}

.negative {
  color: var(--loss);
}

/* Legend */
.table-legend {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-md);
  border-top: 1px solid var(--border-color);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-dot.top-4 {
  background: #00C853;
}

.legend-dot.europa {
  background: #FFB300;
}

.legend-dot.relegation {
  background: #FF5252;
}

/* Responsive */
@media (max-width: 768px) {
  .hide-mobile {
    display: none;
  }
  
  .team-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .table-legend {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
}
</style>
