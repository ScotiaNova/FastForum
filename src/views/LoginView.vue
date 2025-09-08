<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录 FastForum</h2>
      
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">
            登录
          </el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false
    }
  },
  setup() {
    const router = useRouter();
    const appState = inject('appState'); // 注入 appState

    if (!appState) {
      console.error('appState is not provided');
      throw new Error('Dependency injection failed');
    }

    const { login } = appState;

    return { router, login };
  },
  methods: {
    async handleLogin() {
      if (!this.form.username || !this.form.password) {
        this.$message.warning('请输入用户名和密码');
        return;
      }

      this.loading = true;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (this.form.username === 'admin' && this.form.password === '123456') {
          this.$message.success('管理员登录成功！');
          this.login(this.form.username); // 更新全局状态
          localStorage.setItem('token', 'fake-token');
          localStorage.setItem('role', 'admin');
          this.$router.push('/admin');
        } else if (this.form.username === 'student' && this.form.password === '123456') {
          this.$message.success('学生登录成功！');
          this.login(this.form.username); // 更新全局状态
          localStorage.setItem('token', 'fake-token');
          localStorage.setItem('role', 'student');
          this.$router.push('/student');
        } else {
          this.$message.error('用户名或密码错误');
        }
      } catch (error) {
        this.$message.error('登录失败，请重试');
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 60px);
  background-color: var(--color-background);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--color-heading);
}
</style>