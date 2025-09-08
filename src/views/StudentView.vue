<template>
  <div class="student-container">
    <h2>学生主页</h2>
    <el-button type="primary" @click="goToPostCreate" style="margin-bottom: 20px;">发布帖子</el-button>
    <el-button type="info" @click="showReportResults = !showReportResults" style="margin-bottom: 20px;">查看举报审批结果</el-button>
    <div v-if="showReportResults" class="report-results">
      <h3>我的举报审批结果</h3>
      <div v-if="myReports.length === 0">暂无举报记录</div>
      <div v-else class="report-list">
        <div v-for="(report, index) in myReports" :key="index" class="report-item">
          <p><strong>帖子 ID:</strong> {{ report.postId }}</p>
          <p><strong>举报原因:</strong> {{ report.reason }}</p>
          <p><strong>审批状态:</strong> {{ report.status === 'pending' ? '待审批' : report.status === 'approved' ? '已通过（帖子删除）' : '已拒绝' }}</p>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="posts.length === 0" class="no-posts">暂无帖子</div>
    <div v-else class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-item">
        <p>{{ post.content }}</p>
        <small>用户 ID: {{ post.userId }}</small>
        <div class="post-actions">
          <el-button type="primary" size="small" @click="goToPostDetail(post.id)">查看详情</el-button>
          <el-button type="success" size="small" @click="goToPostEdit(post.id)">编辑</el-button>
          <el-button type="danger" size="small" @click="deletePost(post.id)">删除</el-button>
          <el-button type="warning" size="small" @click="handleReport(post.id)" :disabled="post.reported">
            {{ post.reported ? '已举报' : '举报' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus'; // 导入 ElMessageBox

export default {
  name: 'StudentView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const showReportResults = ref(false);

    const appState = inject('appState');
    if (!appState) throw new Error('appState not provided');
    const { posts, deletePost, reportPost, reports, userId } = appState;

    const myReports = ref([]); // 当前用户举报记录

    const goToPostCreate = () => {
      router.push('/post/create');
    };

    const goToPostDetail = (postId) => {
      router.push(`/post/${postId}`);
    };

    const goToPostEdit = (postId) => {
      router.push(`/post/edit/${postId}`);
    };

    const handleReport = (postId) => {
      ElMessageBox.prompt('请输入举报原因', '举报', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入原因',
      }).then(({ value }) => {
        if (value) {
          reportPost(postId, value);
          ElMessage.success('举报已提交');
        }
      }).catch(() => {});
    };

    onMounted(() => {
      loading.value = false;
      myReports.value = reports.value.filter(report => report.reporterId === userId.value);
    });

    return { loading, posts, goToPostCreate, goToPostDetail, goToPostEdit, deletePost, handleReport, showReportResults, myReports };
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