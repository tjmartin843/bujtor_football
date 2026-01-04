<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTeam, getTeamMatches, getStandings, getMatches, calculateForm, formatDate, formatTime } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ErrorMessage from '../components/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()

function getOrdinalSuffix(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

const match = ref(null)
const homeTeam = ref(null)
const awayTeam = ref(null)
const standings = ref(null)
const homeMatches = ref(null)
const awayMatches = ref(null)
const loading = ref(true)
const error = ref(null)

const matchId = computed(() => parseInt(route.params.id))

const homeStanding = computed(() => {
  if (!standings.value?.standings?.[0]?.table || !match.value) return null
  return standings.value.standings[0].table.find(t => t.team.id === match.value.homeTeam.id)
})

const awayStanding = computed(() => {
  if (!standings.value?.standings?.[0]?.table || !match.value) return null
  return standings.value.standings[0].table.find(t => t.team.id === match.value.awayTeam.id)
})

const homeForm = computed(() => {
  if (!homeMatches.value?.matches || !match.value) return []
  const finished = homeMatches.value.matches.filter(m => m.status === 'FINISHED')
  return calculateForm(finished.slice(-5).reverse(), match.value.homeTeam.id)
})

const awayForm = computed(() => {
  if (!awayMatches.value?.matches || !match.value) return []
  const finished = awayMatches.value.matches.filter(m => m.status === 'FINISHED')
  return calculateForm(finished.slice(-5).reverse(), match.value.awayTeam.id)
})

const groupedHomeSquad = computed(() => groupSquadByPosition(homeTeam.value?.squad))
const groupedAwaySquad = computed(() => groupSquadByPosition(awayTeam.value?.squad))

function groupSquadByPosition(squad) {
  if (!squad) return {}
  const groups = {
    'Goalkeeper': [],
    'Defence': [],
    'Midfield': [],
    'Offence': []
  }
  squad.forEach(player => {
    const pos = player.position || 'Unknown'
    if (groups[pos]) {
      groups[pos].push(player)
    }
  })
  return groups
}

async function loadData() {
  loading.value = true
  error.value = null

  try {
    // First, get all matches to find our specific match
    const matchesData = await getMatches()
    const foundMatch = matchesData.matches.find(m => m.id === matchId.value)

    if (!foundMatch) {
      throw new Error('Match not found')
    }

    match.value = foundMatch

    // Now load team data in parallel
    const [homeTeamData, awayTeamData, standingsData, homeMatchesData, awayMatchesData] = await Promise.all([
      getTeam(foundMatch.homeTeam.id),
      getTeam(foundMatch.awayTeam.id),
      getStandings(),
      getTeamMatches(foundMatch.homeTeam.id),
      getTeamMatches(foundMatch.awayTeam.id)
    ])

    homeTeam.value = homeTeamData
    awayTeam.value = awayTeamData
    standings.value = standingsData
    homeMatches.value = homeMatchesData
    awayMatches.value = awayMatchesData
  } catch (err) {
    error.value = err.message || 'Failed to load fixture data'
    console.error('Error loading fixture data:', err)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function goToTeam(teamId) {
  router.push(`/team/${teamId}`)
}

onMounted(loadData)
</script>

<template>
  <div class="fixture-detail container">
    <button class="back-btn" @click="goBack">
      ← Back
    </button>

    <LoadingSpinner v-if="loading" message="Loading fixture data..." />

    <ErrorMessage v-else-if="error" :message="error" @retry="loadData" />

    <template v-else-if="match">
      <!-- Match Header -->
      <header class="match-header fade-in">
        <div class="match-meta-header">
          <span class="matchday-badge">Matchday {{ match.matchday }}</span>
          <span class="competition">Premier League</span>
        </div>
        <div class="match-datetime">
          <span class="match-date">{{ formatDate(match.utcDate) }}</span>
          <span class="match-time">{{ formatTime(match.utcDate) }}</span>
        </div>
      </header>

      <!-- Team Comparison -->
      <div class="comparison-grid">
        <!-- Home Team Column -->
        <div class="team-column home">
          <div class="team-header-card" @click="goToTeam(match.homeTeam.id)">
            <img :src="match.homeTeam.crest" :alt="match.homeTeam.name" class="team-crest-large" />
            <h2 class="team-title">{{ match.homeTeam.name }}</h2>
            <span class="home-away-badge">HOME</span>
          </div>

          <!-- Position & Points -->
          <div class="position-card" v-if="homeStanding">
            <div class="position-main">
              <span class="position-number">{{ homeStanding.position }}</span>
              <span class="position-suffix">{{ getOrdinalSuffix(homeStanding.position) }}</span>
            </div>
            <div class="points-display">
              <span class="points-value">{{ homeStanding.points }}</span>
              <span class="points-label">pts</span>
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-card" v-if="homeStanding">
            <div class="stat-row">
              <span class="stat-label">Played</span>
              <span class="stat-value">{{ homeStanding.playedGames }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Won</span>
              <span class="stat-value win">{{ homeStanding.won }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Drawn</span>
              <span class="stat-value draw">{{ homeStanding.draw }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Lost</span>
              <span class="stat-value loss">{{ homeStanding.lost }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Goals For</span>
              <span class="stat-value">{{ homeStanding.goalsFor }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Goals Against</span>
              <span class="stat-value">{{ homeStanding.goalsAgainst }}</span>
            </div>
            <div class="stat-row highlight">
              <span class="stat-label">Goal Diff</span>
              <span class="stat-value">{{ homeStanding.goalDifference > 0 ? '+' : '' }}{{ homeStanding.goalDifference }}</span>
            </div>
          </div>

          <!-- Form -->
          <div class="form-card" v-if="homeForm.length">
            <h3>Recent Form</h3>
            <div class="form-badges">
              <span
                v-for="(result, index) in homeForm"
                :key="index"
                class="form-badge"
                :class="result.toLowerCase()"
              >
                {{ result }}
              </span>
            </div>
          </div>

          <!-- Squad -->
          <div class="squad-card" v-if="homeTeam?.squad?.length">
            <h3>Squad</h3>
            <div v-for="(players, position) in groupedHomeSquad" :key="position" class="position-group">
              <template v-if="players.length">
                <h4 class="position-title">{{ position }}</h4>
                <div class="players-list">
                  <div v-for="player in players" :key="player.id" class="player-item">
                    {{ player.name }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- VS Divider -->
        <div class="vs-divider">
          <span class="vs-text">VS</span>
        </div>

        <!-- Away Team Column -->
        <div class="team-column away">
          <div class="team-header-card" @click="goToTeam(match.awayTeam.id)">
            <img :src="match.awayTeam.crest" :alt="match.awayTeam.name" class="team-crest-large" />
            <h2 class="team-title">{{ match.awayTeam.name }}</h2>
            <span class="home-away-badge away">AWAY</span>
          </div>

          <!-- Position & Points -->
          <div class="position-card" v-if="awayStanding">
            <div class="position-main">
              <span class="position-number">{{ awayStanding.position }}</span>
              <span class="position-suffix">{{ getOrdinalSuffix(awayStanding.position) }}</span>
            </div>
            <div class="points-display">
              <span class="points-value">{{ awayStanding.points }}</span>
              <span class="points-label">pts</span>
            </div>
          </div>

          <!-- Stats -->
          <div class="stats-card" v-if="awayStanding">
            <div class="stat-row">
              <span class="stat-label">Played</span>
              <span class="stat-value">{{ awayStanding.playedGames }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Won</span>
              <span class="stat-value win">{{ awayStanding.won }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Drawn</span>
              <span class="stat-value draw">{{ awayStanding.draw }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Lost</span>
              <span class="stat-value loss">{{ awayStanding.lost }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Goals For</span>
              <span class="stat-value">{{ awayStanding.goalsFor }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Goals Against</span>
              <span class="stat-value">{{ awayStanding.goalsAgainst }}</span>
            </div>
            <div class="stat-row highlight">
              <span class="stat-label">Goal Diff</span>
              <span class="stat-value">{{ awayStanding.goalDifference > 0 ? '+' : '' }}{{ awayStanding.goalDifference }}</span>
            </div>
          </div>

          <!-- Form -->
          <div class="form-card" v-if="awayForm.length">
            <h3>Recent Form</h3>
            <div class="form-badges">
              <span
                v-for="(result, index) in awayForm"
                :key="index"
                class="form-badge"
                :class="result.toLowerCase()"
              >
                {{ result }}
              </span>
            </div>
          </div>

          <!-- Squad -->
          <div class="squad-card" v-if="awayTeam?.squad?.length">
            <h3>Squad</h3>
            <div v-for="(players, position) in groupedAwaySquad" :key="position" class="position-group">
              <template v-if="players.length">
                <h4 class="position-title">{{ position }}</h4>
                <div class="players-list">
                  <div v-for="player in players" :key="player.id" class="player-item">
                    {{ player.name }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fixture-detail {
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

/* Match Header */
.match-header {
  text-align: center;
  background: var(--bg-card);
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
}

.match-meta-header {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.matchday-badge {
  background: var(--lfc-red);
  color: white;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.05em;
}

.competition {
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.match-datetime {
  display: flex;
  justify-content: center;
  gap: var(--space-lg);
  font-family: 'Bebas Neue', sans-serif;
}

.match-date {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.match-time {
  font-size: 1.5rem;
  color: var(--lfc-gold);
}

/* Comparison Grid */
.comparison-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-lg);
  align-items: start;
}

/* Team Column */
.team-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Team Header Card */
.team-header-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-card);
  padding: var(--space-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.team-header-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--lfc-red);
  transform: translateY(-2px);
}

.team-crest-large {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: var(--space-md);
}

.team-title {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: var(--space-sm);
}

.home-away-badge {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.home-away-badge.away {
  background: rgba(200, 16, 46, 0.1);
  color: var(--lfc-red);
}

/* Position Card */
.position-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.position-main {
  display: flex;
  align-items: baseline;
}

.position-number {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3rem;
  color: var(--lfc-gold);
  line-height: 1;
}

.position-suffix {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-left: 2px;
}

.points-display {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.points-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: var(--text-primary);
}

.points-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Stats Card */
.stats-card {
  background: var(--bg-card);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row.highlight {
  background: rgba(200, 16, 46, 0.05);
  margin: var(--space-sm) calc(var(--space-lg) * -1);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-sm);
}

.stat-row .stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stat-row .stat-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.25rem;
}

.stat-row .stat-value.win { color: var(--win); }
.stat-row .stat-value.draw { color: var(--draw); }
.stat-row .stat-value.loss { color: var(--loss); }

/* Form Card */
.form-card {
  background: var(--bg-card);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.form-card h3 {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.form-badges {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}

.form-badge {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  border-radius: var(--radius-sm);
  color: white;
}

.form-badge.w { background: var(--win); }
.form-badge.d { background: var(--draw); }
.form-badge.l { background: var(--loss); }

/* Squad Card */
.squad-card {
  background: var(--bg-card);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.squad-card h3 {
  font-size: 1.25rem;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

.position-group {
  margin-bottom: var(--space-md);
}

.position-group:last-child {
  margin-bottom: 0;
}

.position-title {
  font-size: 0.75rem;
  color: var(--lfc-red);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--border-color);
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.player-item {
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding: var(--space-xs) 0;
}

/* VS Divider */
.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) var(--space-md);
}

.vs-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: var(--text-muted);
  background: var(--bg-card);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

/* Responsive */
@media (max-width: 900px) {
  .comparison-grid {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
  }

  .vs-divider {
    padding: var(--space-md);
  }

  .vs-text {
    font-size: 1.5rem;
  }

  .team-crest-large {
    width: 80px;
    height: 80px;
  }

  .team-title {
    font-size: 1.25rem;
  }
}
</style>
