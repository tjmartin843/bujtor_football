<script setup>
import { ref, onMounted, computed } from 'vue'
import { getMatches, getCompetition, LIVERPOOL_ID } from '../services/api'
import MatchCard from '../components/MatchCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ErrorMessage from '../components/ErrorMessage.vue'

const matches = ref(null)
const competition = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedMatchday = ref(null)
const filterTeam = ref('all')

const matchdays = computed(() => {
  if (!matches.value?.matches) return []
  const days = [...new Set(matches.value.matches.map(m => m.matchday))].sort((a, b) => a - b)
  return days
})

const currentMatchday = computed(() => {
  return competition.value?.currentSeason?.currentMatchday || 1
})

const filteredMatches = computed(() => {
  if (!matches.value?.matches) return []
  
  let filtered = matches.value.matches

  if (selectedMatchday.value) {
    filtered = filtered.filter(m => m.matchday === selectedMatchday.value)
  }

  if (filterTeam.value === 'liverpool') {
    filtered = filtered.filter(m => 
      m.homeTeam.id === LIVERPOOL_ID || m.awayTeam.id === LIVERPOOL_ID
    )
  }

  return filtered.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
})

const groupedMatches = computed(() => {
  const groups = {}
  filteredMatches.value.forEach(match => {
    const date = new Date(match.utcDate).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(match)
  })
  return groups
})

async function loadData() {
  loading.value = true
  error.value = null
  
  try {
    const [matchesData, competitionData] = await Promise.all([
      getMatches(),
      getCompetition()
    ])
    
    matches.value = matchesData
    competition.value = competitionData
    selectedMatchday.value = currentMatchday.value
  } catch (err) {
    error.value = err.message || 'Failed to load fixtures'
    console.error('Error loading fixtures:', err)
  } finally {
    loading.value = false
  }
}

function goToMatchday(day) {
  selectedMatchday.value = day
}

onMounted(loadData)
</script>

<template>
  <div class="fixtures-page container">
    <header class="page-header fade-in">
      <h1>Premier League Fixtures</h1>
      <p class="page-subtitle" v-if="competition">
        Season {{ competition.currentSeason?.startDate?.split('-')[0] }}/{{ competition.currentSeason?.endDate?.split('-')[0]?.slice(2) }}
      </p>
    </header>

    <LoadingSpinner v-if="loading" message="Loading fixtures..." />
    
    <ErrorMessage v-else-if="error" :message="error" @retry="loadData" />
    
    <template v-else>
      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <label class="filter-label">Team</label>
          <select v-model="filterTeam" class="filter-select">
            <option value="all">All Teams</option>
            <option value="liverpool">Liverpool Only</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Matchday</label>
          <select v-model="selectedMatchday" class="filter-select">
            <option :value="null">All Matchdays</option>
            <option v-for="day in matchdays" :key="day" :value="day">
              Matchday {{ day }} {{ day === currentMatchday ? '(Current)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Matchday Quick Navigation -->
      <div class="matchday-nav" v-if="matchdays.length">
        <button 
          v-for="day in matchdays" 
          :key="day"
          class="matchday-btn"
          :class="{ 
            active: selectedMatchday === day,
            current: day === currentMatchday 
          }"
          @click="goToMatchday(day)"
        >
          {{ day }}
        </button>
      </div>

      <!-- Matches List -->
      <div class="matches-container">
        <div 
          v-for="(dayMatches, date) in groupedMatches" 
          :key="date"
          class="match-day-group"
        >
          <h3 class="date-header">{{ date }}</h3>
          <div class="matches-list">
            <MatchCard 
              v-for="match in dayMatches" 
              :key="match.id" 
              :match="match"
              :highlight-team-id="filterTeam === 'liverpool' ? LIVERPOOL_ID : null"
              show-competition
            />
          </div>
        </div>

        <p v-if="!filteredMatches.length" class="no-data">
          No matches found for the selected filters
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fixtures-page {
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

/* Matchday Navigation */
.matchday-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.matchday-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.matchday-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.matchday-btn.active {
  background: var(--lfc-red);
  border-color: var(--lfc-red);
  color: white;
}

.matchday-btn.current:not(.active) {
  border-color: var(--lfc-gold);
  color: var(--lfc-gold);
}

/* Matches Container */
.matches-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.match-day-group {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.date-header {
  padding: var(--space-md) var(--space-lg);
  background: linear-gradient(135deg, var(--lfc-red) 0%, var(--lfc-red-dark) 100%);
  color: white;
  font-size: 1.25rem;
  border-bottom: 3px solid var(--lfc-gold);
}

.matches-list {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--space-xxl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

/* Responsive */
@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .matchday-nav {
    justify-content: center;
  }
}
</style>
