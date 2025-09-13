<template>
  <div class="home">
    <h1>欢迎来到 FastForum</h1>
    <p>这是论坛的首页</p>
    <Green msg="目前是游客状态，请登录。" />
  </div>
</template>

<script>
import Green from '../components/Green.vue'

export default {
  name: 'HomeView',
  components: {
    Green
  }
}
</script>

<style scoped>
.home {
  padding: 2rem;
  text-align: center;
}
</style>