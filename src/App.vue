<template>
  <div id="app">
    <header class="top-bar">
      <div class="top-bar-content">
        <div class="left-section">
          <img width="240px" src="https://novascotia.oss-cn-hangzhou.aliyuncs.com/fastforum.png"></img>
        </div>
        <div class="right-section">
          <span v-if="userStore.userId > 0" class="welcome-text">你好，<strong>{{ userStore.currentUser }}</strong>. [id: {{ userStore.userId }}]</span>
          <el-button color="#626aef" v-if="userStore.userId > 0" class="btn-logout" @click="handleLogout">登出</el-button>
          <el-button color="#626aef" v-else class="btn-login" @click="goToLogin" style="margin-right: 10px;">登录</el-button>
          <el-button color="#626aef" plain v-if="!(userStore.userId > 0)" class="btn-register" @click="goToRegister">注册</el-button>
        </div>
      </div>
    </header>
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user.js'
import { useForumStore } from './stores/forum.js'
import { onMounted } from 'vue'

const router = useRouter()
const userStore = useUserStore()
const forumStore = useForumStore()

const goToLogin = () => {
  router.push('/login');
};

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  userStore.restoreUser()
  forumStore.fetchPosts()
})
</script>

<style>

body {
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  background-color: var(--color-background);
}

.top-bar {
  background-color: var(--color-background);
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 30px;
}

.top-bar-content {
  width: 80%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.site-name {
  font-size: 20px;
  font-weight: bold;
  color: var(--vt-c-indigo);
}

.right-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.welcome-text {
  color: #626aef;
  margin-right: 10px;
}

.btn-login,
.btn-register,
.btn-logout {
  padding: 8px 20px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.btn-logout:hover {
  background: #ddd;
}
</style>