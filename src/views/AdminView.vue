<template>
  <div class="admin-container">
    <h2>管理员审批界面</h2>
    <el-button type="primary" @click="forumStore.fetchAdminReports" style="margin-bottom: 20px;">刷新未审批举报列表</el-button>
    <div v-if="forumStore.reports.length === 0" class="no-reports">暂无未审批举报</div>
    <div v-else class="reports-list">
      <div v-for="report in forumStore.reports" :key="report.postId" class="report-item">
        <p><strong>帖子 ID:</strong> {{ report.postId }}</p>
        <p><strong>被举报人用户名:</strong> {{ report.username }}</p>
        <p><strong>帖子内容:</strong> {{ report.content }}</p>
        <p><strong>举报原因:</strong> {{ report.reason }}</p>
        <div class="report-actions">
          <el-button type="success" size="small" @click="forumStore.approveOrRejectReport(report.reportId, 2)">批准（删除帖子）</el-button>
          <el-button type="danger" size="small" @click="forumStore.approveOrRejectReport(report.reportId, 1)">拒绝（保留帖子）</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useForumStore } from '../stores/forum.js'

export default {
  name: 'AdminView',
  setup() {
    const forumStore = useForumStore()
    forumStore.fetchAdminReports()
    return { forumStore }
  },
}
</script>

<style scoped>
.admin-container {
  padding: 30px 20px 20px;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

h2 {
  color: var(--color-heading);
  margin-bottom: 20px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.report-item {
  padding: 10px;
  background: var(--color-background);
  border-radius: 4px;
  color: var(--color-heading);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.report-actions {
  display: flex;
  gap: 10px;
}

.no-reports {
  text-align: center;
  color: var(--color-heading);
}
</style>