<template>
  <div id="app">
    <header class="top-bar">
      <div class="top-bar-content">
        <div class="left">
          <img src="./assets/logo.svg" width="40" height="40">
          <span class="title">FastForum</span>
        </div>
        <div class="right">
          <span v-if="isLoggedIn" class="welcome-text">你好，<strong>{{ currentUser }}</strong>. [id: {{ user_id }}]</span>
          <button v-if="isLoggedIn" class="btn" @click="logout">登出</button>
          <button v-else class="btn" @click="goToLogin">登录</button>
          <button v-if="!isLoggedIn" class="btn" @click="goToRegister">注册</button>
        </div>
      </div>
    </header>
    <router-view />
  </div>
</template>

<script>
import { ref, provide } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'App',
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(false);
    const currentUser = ref('');

    const user_id = ref(0);
    const user_type = ref(0);

    const posts = ref([]);
    
    // 初始化举报记录为空数组，数据将从后端获取
    const reports = ref([]);

    const login = (username) => {
      isLoggedIn.value = true;
      currentUser.value = username;
    };

    const logout = () => {
      isLoggedIn.value = false;
      currentUser.value = '';
      user_id.value = 0;
      user_type.value = 0;
      router.push('/');
    };

    const goToLogin = () => {
      router.push('/login');
    };

    const goToRegister = () => {
      router.push('/register');
    };

    const updatePosts = (newPost) => {
      posts.value.push(newPost);
    };

    // 接口：删除帖子
    const deletePost = async (postId) => {
      try {
        console.log(`尝试删除帖子，帖子ID: ${postId}，用户ID: ${user_id.value}`);
        const response = await axios.delete('/api/student/post', {
          params: {
            post_id: postId,
            user_id: user_id.value,
          },
        });

        if (response.data.code === 200 && response.data.msg === 'OK') {
          const postIndex = posts.value.findIndex(p => p.id === postId);
          if (postIndex !== -1) {
            posts.value.splice(postIndex, 1);
          }
          ElMessage.success('帖子删除成功！');
        } else {
          ElMessage.error('删除失败: ' + (response.data.msg || '未知错误'));
        }
      } catch (error) {
        console.error('删除帖子失败:', error);
        ElMessage.error('删除失败，请检查网络或后端服务');
      }
    };
    
    // 接口：举报帖子
    const reportPost = async (postId, reason) => {
      try {
        const response = await axios.post('/api/student/report-post', {
          post_id: postId,
          user_id: user_id.value,
          reason: reason,
        });

        if (response.data.code === 200 && response.data.msg === 'OK') {
          const post = posts.value.find(p => p.id === postId);
          if (post) post.reported = true;
          ElMessage.success('举报已提交，等待管理员审批');
        } else {
          ElMessage.error('举报失败: ' + (response.data.msg || '未知错误'));
        }
      } catch (error) {
        console.error('举报帖子失败:', error);
        ElMessage.error('举报失败，请检查网络或后端服务');
      }
    };

    // 接口：查看举报审批
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/student/report-post', {
          params: {
            user_id: user_id.value,
          },
        });

        if (response.data.code === 200 && response.data.msg === 'OK') {
          // 检查返回的数据，如果后端没有提供 user_id，则手动添加
          const reportsWithUserId = response.data.data.report_list.map(report => ({
            ...report,
            user_id: user_id.value, // 从 appState 中获取当前用户的 user_id 并添加到每个举报记录中
          }));
          reports.value = reportsWithUserId;
          console.log('成功获取举报记录:', reports.value);
        } else {
          ElMessage.error('获取举报记录失败: ' + (response.data.msg || '未知错误'));
        }
      } catch (error) {
        console.error('获取举报记录失败:', error);
        ElMessage.error('获取举报记录失败，请检查网络或后端服务');
      }
    };

    // 接口：管理员获取所有未审批的举报帖子
    const fetchAdminReports = async () => {
        try {
            const response = await axios.get('/api/admin/report', {
              params: {
                user_id: user_id.value,
              },
        });
            if (response.data.code === 200 && response.data.msg === 'OK') {
                // 后端返回的数据已经包含了所有未审批的举报
                reports.value = response.data.data.report_list;
                console.log('成功获取管理员举报列表:', reports.value);
            } else {
                ElMessage.error('获取举报列表失败: ' + (response.data.msg || '未知错误'));
            }
        } catch (error) {
            console.error('获取管理员举报列表失败:', error);
            ElMessage.error('获取失败，请检查网络或后端服务');
        }
    };
    
    // 接口：管理员审批举报
    const approveOrRejectReport = async (reportId, approval) => {
        try {
            const response = await axios.post('/api/admin/report', {
                user_id: user_id.value,
                report_id: reportId,
                approval: approval,
            });
            if (response.data.code === 200 && response.data.msg === 'OK') {
              ElMessage.success(approval === 2 ? '举报已批准，帖子已删除' : '举报已拒绝，帖子保留');
              // 立即从本地状态移除已处理的举报并更新帖子状态
              const reportIndex = reports.value.findIndex(r => r.report_id === reportId);
              if (reportIndex !== -1) {
                const report = reports.value[reportIndex];
                reports.value.splice(reportIndex, 1);
                // 如果是批准，更新本地 posts 状态以移除帖子
                if (approval === 1 && report.post_id) {
                  const postIndex = posts.value.findIndex(p => p.id === report.post_id);
                  if (postIndex !== -1) {
                    posts.value.splice(postIndex, 1);
                  }
                }
              }
                // 审批成功后，重新获取列表以更新界面
              await fetchAdminReports();
            } else {
                ElMessage.error('审批失败: ' + (response.data.msg || '未知错误'));
            }
        } catch (error) {
            console.error('审批举报失败:', error);
            ElMessage.error('审批失败，请检查网络或后端服务');
        }
    };

    // 在 provide 中添加新方法
    provide('appState', { login, logout, isLoggedIn, currentUser, posts, updatePosts, user_id, user_type, deletePost, reportPost, reports, fetchReports, fetchAdminReports, approveOrRejectReport });

    return { router, isLoggedIn, currentUser, user_id, login, logout, goToLogin, goToRegister };
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

/* 顶部栏 */
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

/* top栏居左 */
.left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 标题FastForum */
.title {
  font-size: 20px;
  font-weight: bold;
  color: #34495E;
}

/* top栏居右 */
.right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.welcome-text {
  color: var(--vt-c-indigo);
  margin-right: 10px;
}

/* 登录按钮 */
.btn {
  padding: 8px 20px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: white;
  color: var(--vt-c-indigo);
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #ddd;
}

/* 换行符 */
p {
  white-space: pre-line;
}
</style>