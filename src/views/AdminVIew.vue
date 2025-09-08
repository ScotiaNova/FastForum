<template>
  <div class="admin-container">
    <h2>管理员审批界面</h2>
    <div v-if="pendingReports.length === 0" class="no-reports">暂无未审批举报</div>
    <div v-else class="reports-list">
      <div v-for="(report, index) in pendingReports" :key="index" class="report-item">
        <p><strong>帖子 ID:</strong> {{ report.postId }}</p>
        <p><strong>举报原因:</strong> {{ report.reason }}</p>
        <p><strong>举报者 ID:</strong> {{ report.reporterId }}</p>
        <div class="report-actions">
          <el-button type="success" size="small" @click="handleApprove(index)">批准（删除帖子）</el-button>
          <el-button type="danger" size="small" @click="handleReject(index)">拒绝（保留帖子）</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject, watch } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'AdminView',
  setup() {
    const appState = inject('appState');
    if (!appState) throw new Error('appState not provided or missing methods');

    // 调试：检查 appState 是否包含 approveReport 和 rejectReport
    console.log('Injected appState:', appState);

    const { reports, approveReport, rejectReport } = appState;

    const pendingReports = ref([]);

    onMounted(() => {
      console.log('Mounted AdminView, reports:', reports.value);
      updatePendingReports();
    });

    const updatePendingReports = () => {
      pendingReports.value = reports.value.filter(report => report.status === 'pending');
    };

    watch(() => reports.value, () => {
      updatePendingReports();
    }, { deep: true });

    const handleApprove = (index) => {
      console.log('Approving report at index:', index);
      if (typeof approveReport === 'function') {
        approveReport(index);
      } else {
        console.error('approveReport is not a function:', approveReport);
      }
      updatePendingReports();
    };

    const handleReject = (index) => {
      console.log('Rejecting report at index:', index);
      if (typeof rejectReport === 'function') {
        rejectReport(index);
      } else {
        console.error('rejectReport is not a function:', rejectReport);
      }
      updatePendingReports();
    };

    return { pendingReports, handleApprove, handleReject };
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