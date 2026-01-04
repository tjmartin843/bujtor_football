import axios from 'axios'

// Football-data.org API configuration
// For the free tier, you'll need to register at https://www.football-data.org/client/register
// to get your API key. Replace 'YOUR_API_KEY' with your actual key.
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY || 'YOUR_API_KEY'
const BASE_URL = '/api' // We'll proxy through Vite to avoid CORS issues

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Auth-Token': API_KEY
  }
})

// Premier League competition ID
const PL_ID = 'PL'

// Liverpool FC Team ID in football-data.org
export const LIVERPOOL_ID = 64

// Cache mechanism to avoid hitting rate limits
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached(key) {
  const item = cache.get(key)
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data
  }
  return null
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

// API Functions
export async function getStandings() {
  const cacheKey = 'standings'
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await api.get(`/competitions/${PL_ID}/standings`)
    const data = response.data
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching standings:', error)
    throw error
  }
}

export async function getTeam(teamId) {
  const cacheKey = `team-${teamId}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await api.get(`/teams/${teamId}`)
    const data = response.data
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching team:', error)
    throw error
  }
}

export async function getTeamMatches(teamId, status = null) {
  const cacheKey = `team-matches-${teamId}-${status}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    let url = `/teams/${teamId}/matches`
    if (status) {
      url += `?status=${status}`
    }
    const response = await api.get(url)
    const data = response.data
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching team matches:', error)
    throw error
  }
}

export async function getMatches(status = null, matchday = null) {
  let params = {}
  if (status) params.status = status
  if (matchday) params.matchday = matchday
  
  const cacheKey = `matches-${status}-${matchday}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await api.get(`/competitions/${PL_ID}/matches`, { params })
    const data = response.data
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching matches:', error)
    throw error
  }
}

export async function getTopScorers(limit = 20) {
  const cacheKey = `scorers-${limit}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await api.get(`/competitions/${PL_ID}/scorers`, {
      params: { limit }
    })
    const data = response.data
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching scorers:', error)
    throw error
  }
}

export async function getCompetition() {
  const cacheKey = 'competition'
  const cached = getCached(cacheKey)
  if (cached) return cached

  try {
    const response = await api.get(`/competitions/${PL_ID}`)
    const data = response.data
    setCache(cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching competition:', error)
    throw error
  }
}

// Helper function to get recent form from matches
export function calculateForm(matches, teamId) {
  if (!matches || !matches.length) return []
  
  return matches.slice(0, 5).map(match => {
    const isHome = match.homeTeam.id === teamId
    const homeScore = match.score.fullTime.home
    const awayScore = match.score.fullTime.away
    
    if (homeScore === awayScore) return 'D'
    if (isHome) {
      return homeScore > awayScore ? 'W' : 'L'
    }
    return awayScore > homeScore ? 'W' : 'L'
  }).reverse()
}

// Format date helper
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
