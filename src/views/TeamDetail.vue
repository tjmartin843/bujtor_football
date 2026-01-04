<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTeam, getTeamMatches, getStandings, calculateForm, LIVERPOOL_ID } from '../services/api'
import MatchCard from '../components/MatchCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ErrorMessage from '../components/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()

const team = ref(null)
const matches = ref(null)
const standings = ref(null)
const loading = ref(true)
const error = ref(null)
const activeTab = ref('overview')

const teamId = computed(() => parseInt(route.params.id))

const teamStanding = computed(() => {
  if (!standings.value?.standings?.[0]?.table) return null
  return standings.value.standings[0].table.find(t => t.team.id === teamId.value)
})

const recentMatches = computed(() => {
  if (!matches.value?.matches) return []
  return matches.value.matches
    .filter(m => m.status === 'FINISHED')
    .slice(-10)
    .reverse()
})

const upcomingMatches = computed(() => {
  if (!matches.value?.matches) return []
  return matches.value.matches
    .filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .slice(0, 5)
})

const form = computed(() => {
  if (!matches.value?.matches) return []
  const finished = matches.value.matches.filter(m => m.status === 'FINISHED')
  return calculateForm(finished.slice(-5).reverse(), teamId.value)
})

const isLiverpool = computed(() => teamId.value === LIVERPOOL_ID)

async function loadData() {
  loading.value = true
  error.value = null
  
  try {
    const [teamData, matchesData, standingsData] = await Promise.all([
      getTeam(teamId.value),
      getTeamMatches(teamId.value),
      getStandings()
    ])
    
    team.value = teamData
    matches.value = matchesData
    standings.value = standingsData
  } catch (err) {
    error.value = err.message || 'Failed to load team data'
    console.error('Error loading team data:', err)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

watch(teamId, () => {
  loadData()
})

onMounted(loadData)
</script>

<template>
  <div class="team-detail container">
    <button class="back-btn" @click="goBack">
      ← Back
    </button>

    <LoadingSpinner v-if="loading" message="Loading team data..." />
    
    <ErrorMessage v-else-if="error" :message="error" @retry="loadData" />
    
    <template v-else-if="team">
      <!-- Team Header -->
      <header class="team-header fade-in" :class="{ 'is-liverpool': isLiverpool }">
        <div class="team-badge">
          <img :src="team.crest" :alt="team.name" class="team-crest" />
        </div>
        <div class="team-info">
          <h1 class="team-name">{{ team.name }}</h1>
          <p class="team-founded" v-if="team.founded">Founded {{ team.founded }}</p>
          <p class="team-venue" v-if="team.venue">{{ team.venue }}</p>
        </div>
        
        <div class="team-position" v-if="teamStanding">
          <span class="position-number">{{ teamStanding.position }}</span>
          <span class="position-label">Position</span>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="stats-grid" v-if="teamStanding">
        <div class="stat-card">
          <span class="stat-value">{{ teamStanding.points }}</span>
          <span class="stat-label">Points</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ teamStanding.playedGames }}</span>
          <span class="stat-label">Played</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ teamStanding.won }}</span>
          <span class="stat-label">Won</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ teamStanding.draw }}</span>
          <span class="stat-label">Drawn</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ teamStanding.lost }}</span>
          <span class="stat-label">Lost</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ teamStanding.goalsFor }}</span>
          <span class="stat-label">Goals For</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ teamStanding.goalsAgainst }}</span>
          <span class="stat-label">Goals Against</span>
        </div>
        <div class="stat-card highlight">
          <span class="stat-value">{{ teamStanding.goalDifference > 0 ? '+' : '' }}{{ teamStanding.goalDifference }}</span>
          <span class="stat-label">Goal Diff</span>
        </div>
      </div>

      <!-- Form Guide -->
      <div class="form-section" v-if="form.length">
        <h3>Recent Form</h3>
        <div class="form-badges">
          <span 
            v-for="(result, index) in form" 
            :key="index"
            class="form-badge"
            :class="{
              'win': result === 'W',
              'draw': result === 'D',
              'loss': result === 'L'
            }"
          >
            {{ result }}
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'results' }"
          @click="activeTab = 'results'"
        >
          Recent Results
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'fixtures' }"
          @click="activeTab = 'fixtures'"
        >
          Upcoming Fixtures
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'squad' }"
          @click="activeTab = 'squad'"
        >
          Squad
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Results Tab -->
        <div v-if="activeTab === 'results'" class="matches-grid">
          <MatchCard 
            v-for="match in recentMatches" 
            :key="match.id" 
            :match="match"
            :highlight-team-id="teamId"
          />
          <p v-if="!recentMatches.length" class="no-data">No recent results</p>
        </div>

        <!-- Fixtures Tab -->
        <div v-if="activeTab === 'fixtures'" class="matches-grid">
          <MatchCard 
            v-for="match in upcomingMatches" 
            :key="match.id" 
            :match="match"
            :highlight-team-id="teamId"
          />
          <p v-if="!upcomingMatches.length" class="no-data">No upcoming fixtures</p>
        </div>

        <!-- Squad Tab -->
        <div v-if="activeTab === 'squad'" class="squad-grid">
          <div 
            v-for="player in team.squad" 
            :key="player.id"
            class="player-card"
          >
            <div class="player-position">{{ player.position || 'N/A' }}</div>
            <div class="player-name">{{ player.name }}</div>
            <div class="player-nationality">{{ player.nationality }}</div>
          </div>
          <p v-if="!team.squad?.length" class="no-data">Squad information not available</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.team-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.back-btn {
  align-self: flex-start;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--lfc-red);
}

/* Team Header */
.team-header {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
  background: var(--bg-card);
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.team-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--border-light);
}

.team-header.is-liverpool::before {
  background: linear-gradient(90deg, var(--lfc-red), var(--lfc-gold), var(--lfc-red));
}

.team-badge {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.team-crest {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 2.5rem;
  margin-bottom: var(--space-sm);
}

.team-founded, .team-venue {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.team-position {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  min-width: 100px;
}

.position-number {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3rem;
  color: var(--lfc-gold);
  line-height: 1;
}

.position-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--space-md);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.stat-card.highlight {
  background: rgba(200, 16, 46, 0.1);
  border-color: var(--lfc-red);
}

.stat-card .stat-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: var(--text-primary);
  line-height: 1;
}

.stat-card.highlight .stat-value {
  color: var(--lfc-gold);
}

.stat-card .stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-top: var(--space-xs);
}

/* Form Section */
.form-section {
  background: var(--bg-card);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.form-section h3 {
  margin-bottom: var(--space-md);
  color: var(--text-secondary);
  font-size: 1.25rem;
}

.form-badges {
  display: flex;
  gap: var(--space-sm);
}

.form-badge {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.25rem;
  border-radius: var(--radius-sm);
  color: white;
}

.form-badge.win { background: var(--win); }
.form-badge.draw { background: var(--draw); }
.form-badge.loss { background: var(--loss); }

/* Tabs */
.tabs {
  display: flex;
  gap: var(--space-sm);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--space-sm);
}

.tab-btn {
  padding: var(--space-sm) var(--space-lg);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

.tab-btn.active {
  color: var(--lfc-gold);
  background: var(--bg-card);
  border-bottom: 2px solid var(--lfc-red);
  margin-bottom: -2px;
}

/* Tab Content */
.tab-content {
  background: var(--bg-card);
  border-radius: 0 var(--radius-lg) var(--radius-lg) var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid var(--border-color);
  border-top: none;
}

.matches-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.squad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
}

.player-card {
  background: var(--bg-secondary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.player-position {
  font-size: 0.75rem;
  color: var(--lfc-red);
  text-transform: uppercase;
  margin-bottom: var(--space-xs);
}

.player-name {
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.player-nationality {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.no-data {
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-xl);
}

/* Responsive */
@media (max-width: 768px) {
  .team-header {
    flex-direction: column;
    text-align: center;
  }
  
  .team-badge {
    width: 80px;
    height: 80px;
  }
  
  .team-name {
    font-size: 1.75rem;
  }
  
  .tabs {
    overflow-x: auto;
  }
}
</style>
