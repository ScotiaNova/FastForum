<template>
  <div class="student-container">
    <h2>学生主页</h2>
    <el-button type="primary" @click="goToPostCreate" style="margin-bottom: 20px;">发布帖子</el-button>
    <el-button type="info" @click="handleReportResults" style="margin-bottom: 20px;">查看举报审批结果</el-button>
    <div v-if="showReportResults" class="report-results">
      <h2>我的举报审批结果</h2>
      <div v-if="myReports.length === 0">暂无举报记录</div>
      <div v-else class="report-list">
        <div v-for="(report, index) in myReports" :key="index" class="report-item">
          <p><strong>帖子 ID:</strong> {{ report.postId }}</p>
          <p><strong>举报原因:</strong> {{ report.reason }}</p>
          <p><strong>审批状态:</strong> {{ report.status === 'pending' ? '待审批' : report.status === 'approved' ? '已拒绝' : '已通过（帖子删除）' }}</p>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="posts.length === 0" class="no-posts">暂无帖子</div>
    <div v-else class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <small>用户名: {{ post.username || '未知' }} [用户id: {{ post.user_id }}]</small>
        <p>{{ post.content }}</p>
        <div class="post-actions">
          <el-button type="primary" size="small" @click="goToPostDetail(post.id)">查看详情</el-button>
          <el-button type="success" size="small" @click="goToPostEdit(post.id)" v-if="post.user_id === user_id">编辑</el-button>
          <el-button type="danger" size="small" @click="deletePost(post.id)" v-if="post.user_id === user_id">删除</el-button>
          <el-button type="warning" size="small" @click="handleReport(post.id)" :disabled="post.reported" v-if="post.user_id !== user_id">
            {{ post.reported ? '已举报' : '举报' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

export default {
  name: 'StudentView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const showReportResults = ref(false);

    const appState = inject('appState');
    if (!appState) throw new Error('appState not provided');
    const { posts, deletePost, reportPost, reports, user_id, fetchReports } = appState;

    const myReports = computed(() => {
      // 过滤出当前用户自己的举报记录
      return reports.value.filter(report => report.user_id === user_id.value);
    });

    const fetchPosts = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/student/post');
        console.log('后端返回的帖子数据:', response.data);
        if (response.data.code === 200 && response.data.msg === 'OK' && response.data.data) {
          posts.value = response.data.data.post_list.map(p => ({
            id: p.id,
            content: p.content,
            user_id: p.user_id,
            reported: false, 
            username: p.username || '未知'
          }));
        } else {
          ElMessage.error('获取帖子失败: ' + (response.data.msg || '未知错误'));
          console.error('API 响应错误:', response.data);
        }
      } catch (error) {
        console.error('获取帖子失败:', error);
        ElMessage.error('获取帖子失败，请检查网络或后端服务');
      } finally {
        loading.value = false;
      }
    };

    const goToPostCreate = () => {
      router.push('/post/create');
    };

    const goToPostDetail = (postId) => {
      router.push(`/post/${postId}`);
    };

    const goToPostEdit = (postId) => {
      if (posts.value.find(p => p.id === postId).user_id === user_id.value) {
        router.push(`/post/edit/${postId}`);
      } else {
        ElMessage.warning('您无权编辑此帖子！');
      }
    };

    const handleReport = (postId) => {
      ElMessageBox.prompt('请输入举报原因', '举报', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入原因',
      }).then(({ value }) => {
        if (value) {
          reportPost(postId, value);
        }
      }).catch(() => {});
    };

    // 修改 handleReportResults 方法，在显示前先请求最新数据
    const handleReportResults = async () => {
      if (!showReportResults.value) {
        await fetchReports();
      }
      showReportResults.value = !showReportResults.value;
    };

    onMounted(() => {
      fetchPosts(); 
    });

    return { loading, posts, goToPostCreate, goToPostDetail, goToPostEdit, deletePost, handleReport, showReportResults, myReports, user_id, handleReportResults };
  },
};
</script>

<style scoped>
.student-container {
  padding: 30px 20px 20px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

h2 {
  color: var(--color-heading);
  margin-bottom: 20px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-item {
  padding: 10px;
  background: var(--color-background);
  border-radius: 4px;
  color: var(--color-heading);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.report-results {
  margin-bottom: 20px;
  padding: 10px;
  background: var(--color-background);
  border-radius: 4px;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.report-item {
  padding: 10px;
  background: var(--color-background-soft);
  border-radius: 4px;
  color: var(--color-heading);
}

.loading, .no-posts {
  text-align: center;
  color: var(--color-heading);
}
</style>