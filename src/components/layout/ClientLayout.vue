<script setup lang="ts">
import ClientNavbar from './ClientNavbar.vue'
</script>

<template>
  <div class="client-theme min-h-screen bg-app-bg">
    <ClientNavbar />
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <router-view />
    </main>
  </div>
</template>
