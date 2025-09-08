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
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">发布</el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export default {
  name: 'PostCreateView',
  setup() {
    const router = useRouter();
    const formRef = ref(null);
    const loading = ref(false);
    const form = ref({
      content: '',
    });
    const rules = {
      content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
    };

    const appState = inject('appState');
    if (!appState) throw new Error('appState not provided');
    const { posts, updatePosts, userId } = appState;

    const handleSubmit = async () => {
      try {
        await formRef.value.validate();
        loading.value = true;
        const newPost = {
          id: Date.now(),
          content: form.value.content,
          userId: userId.value,
          reported: false,
        };
        updatePosts(newPost);
        ElMessage.success('帖子发布成功！');
        router.push('/student');
      } catch (error) {
        ElMessage.error('发布失败，请重试');
      } finally {
        loading.value = false;
      }
    };

    const goBack = () => {
      router.push('/student');
    };

    return { formRef, loading, form, rules, handleSubmit, goBack };
  },
};
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