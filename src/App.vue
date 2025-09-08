<template>
  <div id="app">
    <header class="top-bar">
      <div class="top-bar-content">
        <div class="left-section">
          <img alt="Vue logo" src="./assets/logo.svg" class="logo">
          <span class="site-name">FastForum</span>
        </div>
        <div class="right-section">
          <span v-if="isLoggedIn" class="welcome-text">你好，<strong>{{ currentUser }}</strong>.</span>
          <button v-if="isLoggedIn" class="btn-logout" @click="logout">登出</button>
          <button v-else class="btn-login" @click="goToLogin">登录</button>
          <button v-if="!isLoggedIn" class="btn-register" @click="goToRegister">注册</button>
        </div>
      </div>
    </header>
    <router-view />
  </div>
</template>

<script>
import { ref, provide } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(false);
    const currentUser = ref('');
    const posts = ref([
      { id: 1, content: '第一篇帖子', userId: 1, reported: false },
      { id: 2, content: '第二篇帖子', userId: 2, reported: false },
    ]);
    const userId = ref(0);
    const reports = ref([]); // 模拟举报列表

    const login = (username) => {
      isLoggedIn.value = true;
      currentUser.value = username;
      userId.value = username === 'student' ? 1 : 0;
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('role', username === 'admin' ? 'admin' : 'student');
    };

    const logout = () => {
      isLoggedIn.value = false;
      currentUser.value = '';
      userId.value = 0;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      router.push('/login');
    };

    const goToLogin = () => {
      router.push('/login');
    };

    const goToRegister = () => {
      console.log('跳转到注册页面');
    };

    const updatePosts = (newPost) => {
      posts.value.push(newPost);
    };

    const deletePost = (postId) => {
      posts.value = posts.value.filter(post => post.id !== postId);
    };

    const reportPost = (postId, reason) => {
      const post = posts.value.find(post => post.id === postId);
      if (post) {
        post.reported = true;
        reports.value.push({
          postId,
          reason: reason || '违禁内容',
          status: 'pending',
          reporterId: userId.value,
        });
      }
    };

    const approveReport = (reportIndex) => {
      console.log('Approving report at index:', reportIndex);
      if (reportIndex >= 0 && reportIndex < reports.value.length) {
        reports.value[reportIndex].status = 'approved';
        const postId = reports.value[reportIndex].postId;
        deletePost(postId);
        console.log('Post deleted, updated reports:', reports.value);
      }
    };

    const rejectReport = (reportIndex) => {
      console.log('Rejecting report at index:', reportIndex);
      if (reportIndex >= 0 && reportIndex < reports.value.length) {
        reports.value[reportIndex].status = 'rejected';
        const post = posts.value.find(p => p.id === reports.value[reportIndex].postId);
        if (post) post.reported = false;
        console.log('Report rejected, updated reports:', reports.value);
      }
    };

    provide('appState', { login, logout, isLoggedIn, currentUser, posts, updatePosts, userId, deletePost, reportPost, reports, approveReport, rejectReport });

    return { router, isLoggedIn, currentUser, login, logout, goToLogin, goToRegister };
  },
};
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
  background-color: #9f9f9f;
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 30px;
}

.top-bar-content {
  width: 60%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 40px;
  height: 40px;
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
  color: var(--vt-c-indigo);
  margin-right: 10px;
}

.btn-login,
.btn-register,
.btn-logout {
  padding: 8px 20px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: white;
  color: var(--vt-c-indigo);
  cursor: pointer;
  font-size: 14px;
}

.btn-logout:hover {
  background: #ddd;
}
</style>