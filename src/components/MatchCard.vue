<script setup>
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate, formatTime } from '../services/api'

const router = useRouter()

const props = defineProps({
  match: {
    type: Object,
    required: true
  },
  highlightTeamId: {
    type: Number,
    default: null
  },
  showCompetition: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const isFinished = computed(() => props.match.status === 'FINISHED')
const isLive = computed(() => props.match.status === 'IN_PLAY' || props.match.status === 'PAUSED')
const isScheduled = computed(() => props.match.status === 'SCHEDULED' || props.match.status === 'TIMED')

const homeScore = computed(() => props.match.score?.fullTime?.home ?? '-')
const awayScore = computed(() => props.match.score?.fullTime?.away ?? '-')

const matchResult = computed(() => {
  if (!isFinished.value || !props.highlightTeamId) return null
  
  const isHome = props.match.homeTeam.id === props.highlightTeamId
  const home = props.match.score.fullTime.home
  const away = props.match.score.fullTime.away
  
  if (home === away) return 'draw'
  if (isHome) return home > away ? 'win' : 'loss'
  return away > home ? 'win' : 'loss'
})

const isHomeHighlighted = computed(() =>
  props.highlightTeamId && props.match.homeTeam.id === props.highlightTeamId
)

const isAwayHighlighted = computed(() =>
  props.highlightTeamId && props.match.awayTeam.id === props.highlightTeamId
)

const isClickable = computed(() => props.clickable && isScheduled.value)

function handleClick() {
  if (isClickable.value) {
    router.push(`/fixture/${props.match.id}`)
  }
}
</script>

<template>
  <div
    class="match-card"
    :class="{
      'finished': isFinished,
      'live': isLive,
      'scheduled': isScheduled,
      'clickable': isClickable,
      [`result-${matchResult}`]: matchResult
    }"
    @click="handleClick"
  >
    <!-- Match Info -->
    <div class="match-meta">
      <span class="match-date">{{ formatDate(match.utcDate) }}</span>
      <span class="match-time" v-if="isScheduled">{{ formatTime(match.utcDate) }}</span>
      <span class="match-status live-badge" v-if="isLive">LIVE</span>
      <span class="match-status" v-else-if="isFinished">FT</span>
      <span class="matchday" v-if="match.matchday">MD {{ match.matchday }}</span>
    </div>

    <!-- Teams and Score -->
    <div class="match-content">
      <!-- Home Team -->
      <div class="team home-team" :class="{ highlighted: isHomeHighlighted }">
        <img :src="match.homeTeam.crest" :alt="match.homeTeam.name" class="team-crest" />
        <span class="team-name">{{ match.homeTeam.shortName || match.homeTeam.name }}</span>
      </div>

      <!-- Score -->
      <div class="score-container">
        <div class="score" v-if="isFinished || isLive">
          <span class="score-home" :class="{ winner: homeScore > awayScore }">{{ homeScore }}</span>
          <span class="score-separator">-</span>
          <span class="score-away" :class="{ winner: awayScore > homeScore }">{{ awayScore }}</span>
        </div>
        <div class="vs" v-else>
          <span>VS</span>
        </div>
      </div>

      <!-- Away Team -->
      <div class="team away-team" :class="{ highlighted: isAwayHighlighted }">
        <span class="team-name">{{ match.awayTeam.shortName || match.awayTeam.name }}</span>
        <img :src="match.awayTeam.crest" :alt="match.awayTeam.name" class="team-crest" />
      </div>
    </div>

    <!-- Result Indicator -->
    <div class="result-indicator" v-if="matchResult">
      <span class="result-badge" :class="matchResult">
        {{ matchResult === 'win' ? 'W' : matchResult === 'draw' ? 'D' : 'L' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.match-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  position: relative;
}

.match-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-light);
}

.match-card.clickable {
  cursor: pointer;
}

.match-card.clickable:hover {
  border-color: var(--lfc-red);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(200, 16, 46, 0.15);
}

.match-card.live {
  border-color: var(--lfc-red);
  box-shadow: 0 0 10px rgba(200, 16, 46, 0.2);
}

.match-card.result-win {
  border-left: 3px solid var(--win);
}

.match-card.result-draw {
  border-left: 3px solid var(--draw);
}

.match-card.result-loss {
  border-left: 3px solid var(--loss);
}

/* Match Meta */
.match-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.match-date {
  flex: 1;
}

.match-time {
  color: var(--text-secondary);
}

.match-status {
  padding: 2px 6px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.match-status.live-badge {
  background: var(--lfc-red);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.matchday {
  padding: 2px 6px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
}

/* Match Content */
.match-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-md);
}

/* Teams */
.team {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.home-team {
  justify-content: flex-start;
}

.away-team {
  justify-content: flex-end;
}

.team.highlighted .team-name {
  color: var(--lfc-gold);
  font-weight: 600;
}

.team-crest {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
}

.team-name {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Score */
.score-container {
  min-width: 80px;
  display: flex;
  justify-content: center;
}

.score {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
}

.score-home, .score-away {
  min-width: 24px;
  text-align: center;
}

.score-home.winner, .score-away.winner {
  color: var(--lfc-gold);
}

.score-separator {
  color: var(--text-muted);
}

.vs {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

/* Result Indicator */
.result-indicator {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
}

.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
  color: white;
}

.result-badge.win { background: var(--win); }
.result-badge.draw { background: var(--draw); }
.result-badge.loss { background: var(--loss); }

/* Responsive */
@media (max-width: 480px) {
  .team-name {
    font-size: 0.8rem;
    max-width: 80px;
  }
  
  .team-crest {
    width: 24px;
    height: 24px;
  }
  
  .score {
    font-size: 1.25rem;
  }
}
</style>
