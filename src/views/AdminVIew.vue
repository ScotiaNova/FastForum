<template>
  <div class="admin-container">
    <h2>管理员审批界面</h2>
    <el-button type="primary" @click="fetchAdminReports" style="margin-bottom: 20px;">刷新未审批举报列表</el-button>
    <div v-if="reports.length === 0" class="no-reports">暂无未审批举报</div>
    <div v-else class="reports-list">
      <div v-for="report in reports" :key="report.report_id" class="report-item">
        <p><strong>帖子 ID:</strong> {{ report.post_id }}</p>
        <p><strong>被举报人用户名:</strong> {{ report.username }}</p>
        <p><strong>帖子内容:</strong> {{ report.content }}</p>
        <p><strong>举报原因:</strong> {{ report.reason }}</p>
        <div class="report-actions">
          <el-button type="success" size="small" @click="handleApprove(report.report_id)">批准（删除帖子）</el-button>
          <el-button type="danger" size="small" @click="handleReject(report.report_id)">拒绝（保留帖子）</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, inject } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'AdminView',
  setup() {
    const appState = inject('appState');
    if (!appState) throw new Error('appState not provided');

    // 直接从 appState 中获取 reports 数组和审批方法
    const { reports, fetchAdminReports, approveOrRejectReport } = appState;

    // 页面加载时自动获取未审批的举报列表
    onMounted(() => {
      fetchAdminReports();
    });

    // 批准举报，调用 App.vue 中的方法并传入 report_id 和操作类型 2 (删除)
    const handleApprove = (reportId) => {
      approveOrRejectReport(reportId, 2);
      delete reports[reportId];
    };

    // 拒绝举报，调用 App.vue 中的方法并传入 report_id 和操作类型 1 (保留)
    const handleReject = (reportId) => {
      approveOrRejectReport(reportId, 1);
    };

    // 返回给模板使用的变量和方法
    return { reports, fetchAdminReports, handleApprove, handleReject };
  },
};
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
  padding: 15px;
  background: var(--color-background);
  border-radius: 4px;
  color: var(--color-heading);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-item p {
  margin: 0 0 8px 0;
}

.report-actions {
  margin-top: 10px;
}

.no-reports {
  text-align: center;
  color: var(--color-text);
  margin-top: 20px;
}
</style>