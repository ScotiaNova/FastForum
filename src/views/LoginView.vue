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
import { ref, defineComponent, inject } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'LoginView',
  setup() {
    const form = ref({
      username: '',
      password: ''
    });
    const loading = ref(false);
    const router = useRouter();
    const appState = inject('appState');
    const { login, user_id, user_type } = appState; // 注入 user_id 和 user_type

    const handleLogin = async () => {
      if (!form.value.username || !form.value.password) {
        ElMessage.warning('请输入用户名和密码');
        return;
      }

      loading.value = true;

      try {
        // 后端 API 请求
        const response = await axios.post('/api/user/login', {
          username: form.value.username,
          password: form.value.password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('后端响应:', response.data); // 调试

        // 检查响应
        if (response.data.code === 200 && response.data.msg === 'OK') {
          const userData = response.data.data;
          if (userData) {
            ElMessage.success('登录成功！');
            login(form.value.username); // 更新全局状态
            user_id.value = userData.user_id; // 同步到 appState.user_id
            user_type.value = userData.user_type; // 同步到 appState.user_type

            // 将用户ID和类型存储到 localStorage
            localStorage.setItem('user_id', userData.user_id);
            localStorage.setItem('user_type', userData.user_type);

            console.log('登录后 user_id:', user_id.value); // 调试

            // 根据用户类型跳转
            if (userData.user_type === 2) {
              router.push('/admin');
            } else if (userData.user_type === 1) {
              router.push('/student');
            } else {
              ElMessage.warning('未知用户类型');
              router.push('/student');
            }
          } else {
            ElMessage.error('登录数据为空');
          }
        } else {
          ElMessage.error(response.data.msg || '登录失败');
        }
      } catch (error) {
        console.error('登录错误:', error);
        ElMessage.error('网络错误或后端不可达: ' + (error.message || '未知错误'));

        // 备用模拟登录（仅开发测试) [接入后端后无用]
        if (form.value.username && form.value.password) {
          if (form.value.username === 'admin' && form.value.password === '123456') {
            ElMessage.success('模拟管理员登录成功！');
            login(form.value.username);
            window.user_id = 1001; // 同步 window.user_id
            window.user_type = 2; // 同步 window.user_type
            router.push('/admin');
          } else if (form.value.username === 'student' && form.value.password === '123456') {
            ElMessage.success('模拟学生登录成功！');
            login(form.value.username);
            window.user_id = 1002; // 同步 window.user_id
            window.user_type = 1; // 同步 window.user_type
            router.push('/student');
          } else {
            ElMessage.error('用户名或密码错误');
          }
        }
      } finally {
        loading.value = false; // 始终关闭加载
      }
    };

    const goBack = () => {
      router.push('/');
    };

    return { form, loading, handleLogin, goBack };
  }
});
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