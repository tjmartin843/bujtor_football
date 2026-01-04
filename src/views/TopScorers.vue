<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getTopScorers, LIVERPOOL_ID } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ErrorMessage from '../components/ErrorMessage.vue'

const router = useRouter()

const scorersData = ref(null)
const loading = ref(true)
const error = ref(null)
const filterTeam = ref('all')

const scorers = computed(() => {
  if (!scorersData.value?.scorers) return []
  
  if (filterTeam.value === 'liverpool') {
    return scorersData.value.scorers.filter(s => s.team.id === LIVERPOOL_ID)
  }
  
  return scorersData.value.scorers
})

async function loadData() {
  loading.value = true
  error.value = null
  
  try {
    scorersData.value = await getTopScorers(50)
  } catch (err) {
    error.value = err.message || 'Failed to load top scorers'
    console.error('Error loading scorers:', err)
  } finally {
    loading.value = false
  }
}

function goToTeam(teamId) {
  router.push(`/team/${teamId}`)
}

function isLiverpoolPlayer(scorer) {
  return scorer.team.id === LIVERPOOL_ID
}

onMounted(loadData)
</script>

<template>
  <div class="scorers-page container">
    <header class="page-header fade-in">
      <h1>Top Scorers</h1>
      <p class="page-subtitle" v-if="scorersData">
        Premier League {{ scorersData.season?.startDate?.split('-')[0] }}/{{ scorersData.season?.endDate?.split('-')[0]?.slice(2) }}
      </p>
    </header>

    <LoadingSpinner v-if="loading" message="Loading top scorers..." />
    
    <ErrorMessage v-else-if="error" :message="error" @retry="loadData" />
    
    <template v-else>
      <!-- Filter -->
      <div class="filters-bar">
        <div class="filter-group">
          <label class="filter-label">Show</label>
          <select v-model="filterTeam" class="filter-select">
            <option value="all">All Players</option>
            <option value="liverpool">Liverpool Only</option>
          </select>
        </div>
      </div>

      <!-- Top 3 Cards -->
      <div class="top-scorers-cards" v-if="scorers.length >= 3">
        <div class="cards-grid">
          <div 
            v-for="(scorer, index) in scorers.slice(0, 3)" 
            :key="scorer.player.id"
            class="scorer-card"
            :class="{ 'gold': index === 0, 'silver': index === 1, 'bronze': index === 2 }"
          >
            <div class="card-rank">{{ index + 1 }}</div>
            <img :src="scorer.team.crest" :alt="scorer.team.name" class="card-crest" />
            <div class="card-name">{{ scorer.player.name }}</div>
            <div class="card-team">{{ scorer.team.shortName || scorer.team.name }}</div>
            <div class="card-goals">
              <span class="goals-number">{{ scorer.goals }}</span>
              <span class="goals-label">Goals</span>
            </div>
            <div class="card-stats">
              <span>{{ scorer.assists || 0 }} assists</span>
              <span>{{ scorer.playedMatches }} games</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scorers Table -->
      <div class="scorers-container">
        <table class="scorers-table">
          <thead>
            <tr>
              <th class="rank-col">#</th>
              <th class="player-col">Player</th>
              <th class="team-col">Team</th>
              <th class="stat-col">Goals</th>
              <th class="stat-col">Assists</th>
              <th class="stat-col">Penalties</th>
              <th class="stat-col">Played</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(scorer, index) in scorers" 
              :key="scorer.player.id"
              :class="{ highlighted: isLiverpoolPlayer(scorer) }"
            >
              <td class="rank-col">
                <span class="rank" :class="{ 
                  'gold': index === 0, 
                  'silver': index === 1, 
                  'bronze': index === 2 
                }">
                  {{ index + 1 }}
                </span>
              </td>
              <td class="player-col">
                <div class="player-info">
                  <span class="player-name">{{ scorer.player.name }}</span>
                  <span class="player-nationality">{{ scorer.player.nationality }}</span>
                </div>
              </td>
              <td class="team-col">
                <div class="team-info" @click="goToTeam(scorer.team.id)">
                  <img :src="scorer.team.crest" :alt="scorer.team.name" class="team-crest" />
                  <span class="team-name">{{ scorer.team.shortName || scorer.team.name }}</span>
                </div>
              </td>
              <td class="stat-col">
                <span class="stat-value goals">{{ scorer.goals }}</span>
              </td>
              <td class="stat-col">
                <span class="stat-value">{{ scorer.assists || 0 }}</span>
              </td>
              <td class="stat-col">
                <span class="stat-value">{{ scorer.penalties || 0 }}</span>
              </td>
              <td class="stat-col">
                <span class="stat-value">{{ scorer.playedMatches }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="!scorers.length" class="no-data">
          No scorers found for the selected filter
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scorers-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.page-header {
  text-align: center;
  padding: var(--space-lg) 0;
}

.page-header h1 {
  color: var(--lfc-red);
  margin-bottom: var(--space-xs);
}

.page-subtitle {
  color: var(--text-secondary);
}

/* Filters */
.filters-bar {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.filter-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select {
  min-width: 180px;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
}

.filter-select:focus {
  border-color: var(--lfc-red);
  outline: none;
}

/* Top Scorers Cards */
.top-scorers-cards {
  margin-bottom: var(--space-md);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.scorer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  position: relative;
}

.scorer-card.gold {
  border-color: #FFD700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
  order: 0;
}

.scorer-card.silver {
  border-color: #C0C0C0;
  order: -1;
}

.scorer-card.bronze {
  border-color: #CD7F32;
  order: 1;
}

.card-rank {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 50%;
}

.scorer-card.gold .card-rank {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-color: #FFD700;
  color: #000;
}

.scorer-card.silver .card-rank {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  border-color: #C0C0C0;
  color: #000;
}

.scorer-card.bronze .card-rank {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
  border-color: #CD7F32;
  color: #fff;
}

.card-crest {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: var(--space-md);
}

.card-name {
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: var(--space-xs);
}

.card-team {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.card-goals {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.goals-number {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3rem;
  color: var(--lfc-gold);
  line-height: 1;
}

.goals-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.card-stats {
  display: flex;
  gap: var(--space-md);
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Scorers Table */
.scorers-container {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.scorers-table {
  width: 100%;
  border-collapse: collapse;
}

.scorers-table th {
  padding: var(--space-md) var(--space-lg);
  text-align: left;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: linear-gradient(135deg, var(--lfc-red) 0%, var(--lfc-red-dark) 100%);
  color: white;
  border-bottom: 3px solid var(--lfc-gold);
}

.scorers-table td {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-color);
}

.scorers-table tbody tr {
  transition: background 0.2s ease;
}

.scorers-table tbody tr:hover {
  background: var(--bg-secondary);
}

.scorers-table tbody tr.highlighted {
  background: rgba(200, 16, 46, 0.1);
}

.rank-col {
  width: 60px;
  text-align: center;
}

.rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  background: var(--bg-secondary);
  border-radius: 50%;
}

.rank.gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
}

.rank.silver {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  color: #000;
}

.rank.bronze {
  background: linear-gradient(135deg, #CD7F32, #8B4513);
  color: #fff;
}

.player-col {
  min-width: 200px;
}

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 600;
}

.player-nationality {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.team-col {
  min-width: 150px;
}

.team-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  transition: color 0.2s ease;
}

.team-info:hover {
  color: var(--lfc-gold);
}

.team-crest {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.team-name {
  font-size: 0.9rem;
}

.stat-col {
  width: 80px;
  text-align: center;
}

.stat-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.25rem;
}

.stat-value.goals {
  color: var(--lfc-gold);
  font-size: 1.5rem;
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--space-xxl);
}

/* Responsive */
@media (max-width: 900px) {
  .scorers-table {
    font-size: 0.85rem;
  }
  
  .scorers-table th,
  .scorers-table td {
    padding: var(--space-sm);
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .scorer-card.gold,
  .scorer-card.silver,
  .scorer-card.bronze {
    order: unset;
  }
}

@media (max-width: 640px) {
  .scorers-container {
    overflow-x: auto;
  }
  
  .scorers-table {
    min-width: 600px;
  }
}
</style>
