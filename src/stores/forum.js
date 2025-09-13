import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from './user.js'

export const useForumStore = defineStore('forum', () => {
  const posts = ref([])
  const reports = ref([])
  const userStore = useUserStore()

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/student/post')
      console.log('后端返回的帖子数据:', response.data)
      if (response.data.code === 200 && response.data.msg === 'OK' && response.data.data) {
        posts.value = response.data.data.post_list.map(p => ({
          id: p.id,
          content: p.content,
          user_id: p.user_id,
          likes: p.likes,
          time: p.time,
          reported: false,
          username: p.username || '未知'
        }))
        localStorage.setItem('posts', JSON.stringify(posts.value))
      } else {
        ElMessage.error('获取帖子失败: ' + (response.data.msg || '未知错误'))
        console.error('API 响应错误:', response.data)
      }
    } catch (error) {
      console.error('获取帖子失败:', error)
      ElMessage.error('获取帖子失败，请检查网络或后端服务')
      const storedPosts = localStorage.getItem('posts')
      if (storedPosts) posts.value = JSON.parse(storedPosts)
    }
  }

  const updatePosts = (newPost) => {
    posts.value.push(newPost)
    localStorage.setItem('posts', JSON.stringify(posts.value))
  }

  const deletePost = async (postId) => {
    try {
      console.log(`尝试删除帖子，帖子ID: ${postId}，用户ID: ${userStore.userId}`)
      const response = await axios.delete('/api/student/post', {
        params: {
          post_id: postId,
          user_id: userStore.userId,
        },
      })

      console.log('删除帖子响应:', response.data)

      if (response.data.code === 200 && response.data.msg === 'OK') {
        const index = posts.value.findIndex(p => p.id === postId)
        if (index !== -1) {
          posts.value.splice(index, 1)
          localStorage.setItem('posts', JSON.stringify(posts.value))
          ElMessage.success('帖子删除成功')
        } else {
          console.warn('前端未找到帖子:', postId)
          ElMessage.warning('帖子已删除，但本地缓存未同步')
        }
      } else {
        throw new Error(response.data.msg || '删除帖子失败')
      }
    } catch (error) {
      console.error('删除帖子失败:', error)
      if (error.response?.status === 404) {
        ElMessage.error('帖子不存在或已删除（404 Not Found）')
        const index = posts.value.findIndex(p => p.id === postId)
        if (index !== -1) {
          posts.value.splice(index, 1)
          localStorage.setItem('posts', JSON.stringify(posts.value))
        }
      } else {
        ElMessage.error('删除帖子失败: ' + (error.message || '网络错误'))
      }
    }
  }

  const reportPost = async (postId, reason, userId) => {
    try {
      const response = await axios.post('/api/student/report-post', {
        post_id: postId,
        user_id: userId,
        reason: reason,
      })

      console.log('举报响应:', response.data)

      if (response.data.code === 200 && response.data.msg === 'OK') {
        reports.value.push({
          reportId: response.data.data?.report_id || Date.now(),
          postId,
          reason,
          status: 'pending',
          user_id: userId,
        })
        const post = posts.value.find(p => p.id === postId)
        if (post) post.reported = true
        ElMessage.success('举报已提交，等待管理员审批')
      } else {
        ElMessage.error('举报失败: ' + (response.data.msg || '未知错误'))
      }
    } catch (error) {
      console.error('举报帖子失败:', error)
      ElMessage.error('举报失败，请检查网络或后端服务')
    }
  }

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/student/report-post', {
        params: {
          user_id: userStore.userId,
        },
      })

      console.log('个人举报记录响应:', response.data)

      if (response.data.code === 200 && response.data.msg === 'OK') {
        // 检查返回的数据，如果后端没有提供 user_id，则手动添加
        const reportsWithUserId = response.data.data.report_list.map(report => ({
          ...report,
          user_id: userStore.userId, // 从 userStore 中获取当前用户的 user_id 并添加到每个举报记录中
          reportId: report.report_id, // 统一键名
          postId: report.post_id,     // 统一键名
          status: report.status || 'pending' // 默认 pending
        }))
        reports.value = reportsWithUserId
        console.log('成功获取举报记录:', reports.value)
      } else {
        ElMessage.error('获取举报记录失败: ' + (response.data.msg || '未知错误'))
      }
    } catch (error) {
      console.error('获取举报记录失败:', error)
      ElMessage.error('获取举报记录失败，请检查网络或后端服务')
    }
  }

  const fetchAdminReports = async () => {
    try {
      const response = await axios.get('/api/admin/report', {
        params: {
          user_id: userStore.userId,
        },
      })
      console.log('管理员举报列表响应:', response.data)
      if (response.data.code === 200 && response.data.msg === 'OK') {
        reports.value = response.data.data.report_list.map(r => ({
          reportId: r.report_id,
          postId: r.post_id,
          username: r.username || '未知',
          content: r.content || '无内容',
          reason: r.reason,
          status: r.status || 'pending'
        })).filter(r => r.status === 'pending')
      } else {
        ElMessage.error('获取举报列表失败: ' + (response.data.msg || '未知错误'))
      }
    } catch (error) {
      console.error('获取管理员举报列表失败:', error)
      ElMessage.error('获取失败，请检查网络或后端服务')
      reports.value = reports.value.filter(r => r.status === 'pending')
    }
  }

  const approveOrRejectReport = async (reportId, approval) => {
    try {
      const response = await axios.post('/api/admin/report', {
        user_id: userStore.userId,
        report_id: reportId,
        approval: approval, // 1=拒绝, 2=批准
      });

      console.log('审批响应:', response.data)

      if (response.data.code === 200 && response.data.msg === 'OK') {
        ElMessage.success(approval === 2 ? '举报已批准，帖子已删除' : '举报已拒绝，帖子保留');
        // 立即从本地状态移除已处理的举报并更新帖子状态
        const reportIndex = reports.value.findIndex(r => r.report_id === reportId);
        if (reportIndex !== -1) {
          const report = reports.value[reportIndex];
          reports.value.splice(reportIndex, 1);
          // 如果是批准，更新本地 posts 状态以移除帖子
          if (approval === 1 && report.post_id) {
            const postIndex = posts.value.findIndex(p => p.id === report.post_id);
            if (postIndex !== -1) {
              posts.value.splice(postIndex, 1);
            }
          }
        }
          // 审批成功后，重新获取列表以更新界面
        await fetchAdminReports();
      } else {
        ElMessage.error('审批失败: ' + (response.data.msg || '未知错误'));
      }
    } catch (error) {
      console.error('审批举报失败:', error);
      ElMessage.error('审批失败: ' + (error.message || '网络错误'));
    }
  }

  return { posts, reports, fetchPosts, fetchReports, updatePosts, deletePost, reportPost, fetchAdminReports, approveOrRejectReport }
}, {
  persist: true
})