import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import views
import Home from './views/Home.vue'
import TeamDetail from './views/TeamDetail.vue'
import Fixtures from './views/Fixtures.vue'
import TopScorers from './views/TopScorers.vue'
import FixtureDetail from './views/FixtureDetail.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/team/:id', name: 'TeamDetail', component: TeamDetail },
  { path: '/fixtures', name: 'Fixtures', component: Fixtures },
  { path: '/fixture/:id', name: 'FixtureDetail', component: FixtureDetail },
  { path: '/scorers', name: 'TopScorers', component: TopScorers }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
