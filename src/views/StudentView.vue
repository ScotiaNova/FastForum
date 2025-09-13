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
          <p><small>帖子ID: {{ report.post_id }}</small></p>
          <p><strong>举报原因:</strong> “{{ report.reason }}”</p>
          <p><strong>审批状态: </strong> 
            <span :style="{ color: report.status === 0 ? 'orange' : report.status === 1 ? 'green' : 'red' }">
              {{ report.status === 0 ? '未审批' : report.status === 1 ? '已通过' : '不通过' }}
            </span>
          </p>
          <!-- status 0代表未审批1代表已通过2代表不通过 -->
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="forumStore.posts.length === 0" class="no-posts">暂无帖子</div>
    <div v-else class="posts-list">
      <div v-for="post in forumStore.posts" :key="post.id" class="post-item" style="position: relative;">
        <small style="display: flex; justify-content: space-between;">
  <span>帖子ID: {{ post.id }}   用户id: {{ post.user_id }}</span>
  <span>点赞数: {{ post.likes }}</span>
</small>
        <p>{{ post.content }}</p>
        <div class="post-actions">
          <el-button type="primary" size="small" @click="goToPostDetail(post.id)">查看详情</el-button>
          <el-button type="success" size="small" @click="goToPostEdit(post.id)" v-if="post.user_id === userStore.userId">编辑</el-button>
          <el-button type="danger" size="small" @click="confirmDelete(post.id)" v-if="post.user_id === userStore.userId">删除</el-button>
          <el-button type="warning" size="small" @click="handleReport(post.id)" :disabled="post.reported" v-if="post.user_id !== userStore.userId">
            {{ post.reported ? '已举报' : '举报' }}
          </el-button>
        </div>
        <div style="position: absolute; bottom: 0; right: 0; padding: 5px; font-size: 12px; color: #666;">
          发布时间: {{ post.time.replace('T', ' ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useForumStore } from '../stores/forum.js'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'StudentView',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const showReportResults = ref(false)
    const userStore = useUserStore()
    const forumStore = useForumStore()

    const myReports = computed(() => {
      return forumStore.reports.filter(report => report.user_id === userStore.userId)
    })

    const fetchPosts = async () => {
      loading.value = true
      try {
        await forumStore.fetchPosts()
      } finally {
        loading.value = false
      }
    }

    const goToPostCreate = () => {
      router.push('/post/create')
    }

    const goToPostDetail = (postId) => {
      router.push(`/post/${postId}`)
    }

    const goToPostEdit = (postId) => {
      if (forumStore.posts.find(p => p.id === postId).user_id === userStore.userId) {
        router.push(`/post/edit/${postId}`)
      } else {
        ElMessage.warning('您无权编辑此帖子！')
      }
    }

    const confirmDelete = (postId) => {
      ElMessageBox.confirm(
        '确定删除此帖子吗？操作不可逆。',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          await forumStore.deletePost(postId)
          // deletePost 已包含 ElMessage.success，无需重复
        } catch (error) {
          // deletePost 已处理错误，无需额外处理
        }
      }).catch(() => {
        ElMessage.info('删除已取消')
      })
    }

    const handleReport = (postId) => {
      ElMessageBox.prompt('请输入举报原因', '举报', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入原因',
      }).then(({ value }) => {
        if (value) {
          forumStore.reportPost(postId, value, userStore.userId)
        }
      }).catch(() => {})
    }

    const handleReportResults = async () => {
      if (!showReportResults.value) {
        await forumStore.fetchReports()
      }
      showReportResults.value = !showReportResults.value
    }

    fetchPosts()

    return { loading, forumStore, goToPostCreate, goToPostDetail, goToPostEdit, confirmDelete, handleReport, showReportResults, myReports, userStore, handleReportResults }
  },
}
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