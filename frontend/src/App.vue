<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1>Sistema de Engenharia</h1>
        <nav>
          <router-link to="/funcionarios" class="nav-link" exact> Funcionários </router-link>
          <router-link to="/contratos" class="nav-link"> Contratos </router-link>
        </nav>
      </div>
    </header>
    <main>
      <RouterView />
    </main>
    <ToastContainer />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: #fafafa;
}

.app-header {
  background: white;
  border-bottom: 1px solid #eee;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.app-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 4px;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.router-link-exact-active {
  background: #e3f2fd;
  color: #1976d2;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
</style>
