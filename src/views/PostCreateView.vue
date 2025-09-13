<template>
  <div class="post-create-container">
    <h2>发布新帖子</h2>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" @submit.prevent="handleSubmit">
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          placeholder="请输入帖子内容"
          :rows="4"
          :maxlength="500"
        />
      </el-form-item>
      <el-form-item>
        <el-button color="#626aef" type="primary" native-type="submit" :loading="loading">发布</el-button>
        <el-button color="#626aef" plain @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useForumStore } from '../stores/forum.js'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export default {
  name: 'PostCreateView',
  setup() {
    const router = useRouter()
    const formRef = ref(null)
    const loading = ref(false)
    const form = ref({
      content: '',
    })
    const rules = {
      content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
    }

    const userStore = useUserStore()
    const forumStore = useForumStore()

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        if (!userStore.userId || typeof userStore.userId !== 'number') {
          console.log('用户 ID 无效:', userStore.userId)
          ElMessage.error('用户 ID 无效，请重新登录')
          return
        }
        loading.value = true

        console.log('发送参数:', { content: form.value.content, user_id: userStore.userId })

        const response = await axios.post('/api/student/post', {
          content: form.value.content,
          user_id: userStore.userId,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        console.log('发帖响应:', response.data)

        if (response.data.code === 200 && response.data.msg === 'OK') {
          const newPost = {
            id: Date.now(),
            content: form.value.content,
            username: userStore.currentUser,
            user_id: userStore.userId,
            reported: false,
          }
          forumStore.updatePosts(newPost)
          ElMessage.success('帖子发布成功！')
          console.log('帖子发布成功，对应用户ID为:', newPost.user_id, '帖子时间ID为:', newPost.id)
          form.value.content = ''
          router.push('/student')
        } else if (response.data.code === 200000) {
          ElMessage.error(`参数错误: ${response.data.msg}`)
        } else {
          ElMessage.error(response.data.msg || '发布失败')
        }
      } catch (error) {
        console.error('发帖错误:', error)
        ElMessage.error('发布失败，请重试: ' + (error.message || '网络错误'))
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.push('/student')
    }

    return { formRef, loading, form, rules, handleSubmit, goBack }
  },
}
</script>

<style scoped>
.post-create-container {
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
</style>