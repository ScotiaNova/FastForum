<template>
  <div class="post-detail-container">
    <h2>帖子详情</h2>
    <el-button color="#626aef" plain @click="goBack" style="margin-bottom: 20px;">返回</el-button>
    <div v-if="post" class="post-detail">
      <p><strong>帖子ID:</strong> {{ post.id }}</p>
      <p><strong>用户ID:</strong> {{ post.user_id }}</p>
      <p><strong>状态:</strong> {{ post.reported ? '被举报' : '正常' }}</p>
      <p><strong>内容: </strong> {{ post.content }}</p>
    </div>
    <div v-else class="no-post">帖子不存在</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForumStore } from '../stores/forum.js'
import { ElMessage } from 'element-plus'

export default {
  name: 'PostDetailView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const forumStore = useForumStore()
    const post = ref(null)

    onMounted(() => {
      const postId = parseInt(route.params.id)
      post.value = forumStore.posts.find(p => p.id === postId)
      if (!post.value) {
        ElMessage.warning('未找到该帖子')
      }
    })

    const goBack = () => {
      router.push('/student')
    }

    return { post, goBack }
  },
}
</script>

<style scoped>
.post-detail-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

h2 {
  text-align: center;
  color: var(--color-heading);
  margin-bottom: 20px;
}

.post-detail {
  padding: 15px;
  background: var(--color-background);
  border-radius: 4px;
  color: var(--color-heading);
}

.no-post {
  text-align: center;
  color: var(--color-heading);
}
</style>