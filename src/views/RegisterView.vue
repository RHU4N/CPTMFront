<template>
  <div class="info-shell">
    <header class="info-header">
      <span class="brand">CPTM</span>
    </header>
    <main class="info-main">
      <div class="info-card">
        <div class="info-icon">🔐</div>
        <h1 class="info-title">Acesso restrito</h1>
        <p class="info-text">
          O cadastro de novos usuários é realizado exclusivamente pelo
          <strong>Administrador do sistema</strong>.
        </p>
        <p class="info-text">
          Entre em contato com o administrador para solicitar seu acesso.
        </p>
        <RouterLink class="back-btn" :to="{ name: 'login' }">Voltar ao login</RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.info-shell {
  min-height: 100svh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.info-header {
  background: #ea191f;
  color: white;
  padding: 16px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.info-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  padding: 40px 32px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.info-icon {
  font-size: 2.5rem;
}

.info-title {
  margin: 0;
  font-size: 1.4rem;
  color: #222;
}

.info-text {
  margin: 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.6;
}

.back-btn {
  margin-top: 8px;
  padding: 12px 28px;
  border-radius: 6px;
  background: #ea191f;
  color: white;
  font-weight: bold;
  text-decoration: none;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.9;
}
</style>