<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getStandings, getTeamMatches, LIVERPOOL_ID, calculateForm, formatDate } from '../services/api'
import LeagueTable from '../components/LeagueTable.vue'
import TeamCard from '../components/TeamCard.vue'
import MatchCard from '../components/MatchCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ErrorMessage from '../components/ErrorMessage.vue'

const router = useRouter()

const standings = ref(null)
const liverpoolMatches = ref(null)
const loading = ref(true)
const error = ref(null)

const liverpoolStanding = computed(() => {
  if (!standings.value?.standings?.[0]?.table) return null
  return standings.value.standings[0].table.find(team => team.team.id === LIVERPOOL_ID)
})

const recentMatches = computed(() => {
  if (!liverpoolMatches.value?.matches) return []
  return liverpoolMatches.value.matches
    .filter(m => m.status === 'FINISHED')
    .slice(-5)
    .reverse()
})

const upcomingMatches = computed(() => {
  if (!liverpoolMatches.value?.matches) return []
  return liverpoolMatches.value.matches
    .filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .slice(0, 3)
})

const form = computed(() => {
  if (!liverpoolMatches.value?.matches) return []
  const finished = liverpoolMatches.value.matches.filter(m => m.status === 'FINISHED')
  return calculateForm(finished.slice(-5).reverse(), LIVERPOOL_ID)
})

async function loadData() {
  loading.value = true
  error.value = null
  
  try {
    const [standingsData, matchesData] = await Promise.all([
      getStandings(),
      getTeamMatches(LIVERPOOL_ID)
    ])
    
    standings.value = standingsData
    liverpoolMatches.value = matchesData
  } catch (err) {
    error.value = err.message || 'Failed to load data'
    console.error('Error loading data:', err)
  } finally {
    loading.value = false
  }
}

function goToTeam(teamId) {
  router.push(`/team/${teamId}`)
}

onMounted(loadData)
</script>

<template>
  <div class="home-page container">
    <LoadingSpinner v-if="loading" message="Loading Premier League data..." />
    
    <ErrorMessage v-else-if="error" :message="error" @retry="loadData" />
    
    <template v-else>
      <!-- Hero Section - Liverpool Stats -->
      <section class="hero-section fade-in">
        <div class="hero-content">
          <div class="hero-badge">
            <img 
              :src="liverpoolStanding?.team?.crest" 
              :alt="liverpoolStanding?.team?.name"
              class="team-crest"
            />
          </div>
          <div class="hero-info">
            <h1 class="hero-title">Liverpool FC</h1>
            <p class="hero-subtitle">Premier League {{ standings?.season?.startDate?.split('-')[0] }}/{{ standings?.season?.endDate?.split('-')[0]?.slice(2) }}</p>
          </div>
        </div>
        
        <div class="hero-stats" v-if="liverpoolStanding">
          <div class="stat-item">
            <span class="stat-value">{{ liverpoolStanding.position }}</span>
            <span class="stat-label">Position</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ liverpoolStanding.points }}</span>
            <span class="stat-label">Points</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ liverpoolStanding.playedGames }}</span>
            <span class="stat-label">Played</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ liverpoolStanding.won }}</span>
            <span class="stat-label">Won</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ liverpoolStanding.draw }}</span>
            <span class="stat-label">Drawn</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ liverpoolStanding.lost }}</span>
            <span class="stat-label">Lost</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ liverpoolStanding.goalsFor }}</span>
            <span class="stat-label">Goals For</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ liverpoolStanding.goalsAgainst }}</span>
            <span class="stat-label">Goals Against</span>
          </div>
          <div class="stat-item highlight">
            <span class="stat-value">{{ liverpoolStanding.goalDifference > 0 ? '+' : '' }}{{ liverpoolStanding.goalDifference }}</span>
            <span class="stat-label">Goal Diff</span>
          </div>
        </div>

        <!-- Form Guide -->
        <div class="form-guide" v-if="form.length">
          <span class="form-label">Recent Form:</span>
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
      </section>

      <!-- Main Grid -->
      <div class="main-grid">
        <!-- Matches Section -->
        <div class="matches-section">
          <!-- Recent Results -->
          <section class="section-card">
            <div class="section-header">
              <h2>Recent Results</h2>
            </div>
            <div class="matches-list">
              <MatchCard 
                v-for="match in recentMatches" 
                :key="match.id" 
                :match="match"
                :highlight-team-id="LIVERPOOL_ID"
              />
              <p v-if="!recentMatches.length" class="no-data">No recent matches</p>
            </div>
          </section>

          <!-- Upcoming Fixtures -->
          <section class="section-card">
            <div class="section-header">
              <h2>Upcoming Fixtures</h2>
            </div>
            <div class="matches-list">
              <MatchCard 
                v-for="match in upcomingMatches" 
                :key="match.id" 
                :match="match"
                :highlight-team-id="LIVERPOOL_ID"
              />
              <p v-if="!upcomingMatches.length" class="no-data">No upcoming matches scheduled</p>
            </div>
          </section>
        </div>

        <!-- League Table -->
        <section class="table-section section-card">
          <div class="section-header">
            <h2>Premier League Table</h2>
          </div>
          <LeagueTable 
            v-if="standings?.standings?.[0]?.table"
            :standings="standings.standings[0].table"
            :highlight-team-id="LIVERPOOL_ID"
            @select-team="goToTeam"
          />
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--lfc-red), var(--lfc-gold), var(--lfc-red));
}

.hero-content {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.hero-badge {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.team-crest {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}

.hero-title {
  font-size: 3rem;
  color: var(--lfc-red);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.stat-item.highlight {
  background: rgba(200, 16, 46, 0.15);
  border-color: var(--lfc-red);
}

.stat-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: var(--text-primary);
  line-height: 1;
}

.stat-item.highlight .stat-value {
  color: var(--lfc-gold);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--space-xs);
}

.form-guide {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.form-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.form-badges {
  display: flex;
  gap: var(--space-xs);
}

.form-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  border-radius: var(--radius-sm);
  color: white;
}

.form-badge.win { background: var(--win); }
.form-badge.draw { background: var(--draw); }
.form-badge.loss { background: var(--loss); }

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: var(--space-xl);
}

.matches-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* Section Cards */
.section-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, var(--lfc-red) 0%, var(--lfc-red-dark) 100%);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 3px solid var(--lfc-gold);
}

.section-header h2 {
  font-size: 1.5rem;
  color: white;
}

.matches-list {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.no-data {
  color: var(--text-secondary);
  text-align: center;
  padding: var(--space-lg);
}

/* Responsive */
@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .hero-badge {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 640px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-stats {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .form-guide {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
