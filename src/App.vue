<script setup>
import { ref, onMounted } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navLinks = [
  { path: '/fixtures', label: 'Fixtures', icon: '📅' },
  { path: '/scorers', label: 'Top Scorers', icon: '🥇' }
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const openYouTube = () => {
  window.open('https://www.youtube.com/watch?v=Aq5WXmQQooo', '_blank')
}
</script>

<template>
  <div class="app-wrapper">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content container">
        <RouterLink to="/" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" class="liverbird">
              <path d="M50 5 L60 35 L95 35 L67 55 L78 90 L50 70 L22 90 L33 55 L5 35 L40 35 Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-main">Liverpool FC</span>
            <span class="logo-sub">Stats Dashboard</span>
          </div>
        </RouterLink>

        <nav class="main-nav" :class="{ open: mobileMenuOpen }">
          <a
            class="nav-link"
            href="#"
            @click.prevent="openYouTube(); mobileMenuOpen = false"
          >
            <span class="nav-icon">⚽</span>
            <span class="nav-label">Home</span>
          </a>
          <RouterLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="nav-link"
            :class="{ active: route.path === link.path }"
            @click="mobileMenuOpen = false"
          >
            <span class="nav-icon">{{ link.icon }}</span>
            <span class="nav-label">{{ link.label }}</span>
          </RouterLink>
        </nav>

        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div class="header-accent"></div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <div class="footer-content">
          <p class="footer-text">
            Data provided by <a href="https://www.football-data.org" target="_blank">Football-Data.org</a>
          </p>
          <p class="footer-motto">You'll Never Walk Alone</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: 
    radial-gradient(ellipse at top left, rgba(200, 16, 46, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(200, 16, 46, 0.05) 0%, transparent 50%),
    var(--bg-primary);
}

/* Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
}

.header-accent {
  height: 3px;
  background: linear-gradient(90deg, var(--lfc-red), var(--lfc-gold), var(--lfc-red));
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--text-primary);
}

.logo:hover {
  color: var(--text-primary);
}

.logo-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.liverbird {
  width: 100%;
  height: 100%;
  color: var(--lfc-red);
  filter: drop-shadow(0 0 8px rgba(200, 16, 46, 0.5));
  transition: transform 0.3s ease;
}

.logo:hover .liverbird {
  transform: scale(1.1);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-main {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  line-height: 1;
}

.logo-sub {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

/* Navigation */
.main-nav {
  display: flex;
  gap: var(--space-sm);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

.nav-link.active {
  color: var(--lfc-gold);
  background: rgba(200, 16, 46, 0.2);
}

.nav-icon {
  font-size: 1.1rem;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: var(--space-sm);
  background: transparent;
  border: none;
  cursor: pointer;
}

.mobile-menu-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-primary);
  transition: all 0.3s ease;
}

/* Main Content */
.app-main {
  flex: 1;
  padding: var(--space-xl) 0;
}

/* Footer */
.app-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: var(--space-lg) 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.footer-text a {
  color: var(--lfc-red-light);
}

.footer-motto {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.25rem;
  color: var(--lfc-red);
  letter-spacing: 0.1em;
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .main-nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    padding: var(--space-md);
    gap: var(--space-xs);
    display: none;
  }

  .main-nav.open {
    display: flex;
  }

  .logo-text {
    display: none;
  }

  .footer-content {
    flex-direction: column;
    gap: var(--space-sm);
    text-align: center;
  }
}
</style>
