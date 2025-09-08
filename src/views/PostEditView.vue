<template>
  <div class="post-edit-container">
    <h2>编辑帖子</h2>
    <el-button @click="goBack" style="margin-bottom: 20px;">返回</el-button>
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
        <el-button type="primary" native-type="submit" :loading="loading">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export default {
  name: 'PostEditView',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const appState = inject('appState');
    if (!appState) throw new Error('appState not provided');
    const { posts } = appState;

    const formRef = ref(null);
    const loading = ref(false);
    const form = ref({
      content: '',
    });
    const rules = {
      content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
    };

    onMounted(() => {
      const postId = parseInt(route.params.id);
      const post = posts.value.find(p => p.id === postId);
      if (post) {
        form.value.content = post.content;
      } else {
        ElMessage.warning('未找到该帖子');
        router.push('/student');
      }
    });

    const handleSubmit = async () => {
      try {
        await formRef.value.validate();
        loading.value = true;
        const postId = parseInt(route.params.id);
        const postIndex = posts.value.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          posts.value[postIndex].content = form.value.content;
          ElMessage.success('帖子更新成功！');
          router.push('/student');
        }
      } catch (error) {
        ElMessage.error('更新失败，请重试');
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
.post-edit-container {
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