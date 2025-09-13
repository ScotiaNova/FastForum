import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref('')
  const userId = ref(0)
  const userType = ref(0) // 1: 学生, 2: 管理员

  const restoreUser = () => {
    const storedUser = localStorage.getItem('current_user')
    const storedId = localStorage.getItem('user_id')
    const storedType = localStorage.getItem('user_type')
    if (storedUser) {
      currentUser.value = storedUser
    }
    if (storedId) {
      userId.value = parseInt(storedId)
    }
    if (storedType) {
      userType.value = parseInt(storedType)
    }
  }

  const login = (username, id, type) => {
    currentUser.value = username
    userId.value = id
    userType.value = type
    localStorage.setItem('current_user', username)
    localStorage.setItem('user_id', id)
    localStorage.setItem('user_type', type)
  }

  const logout = () => {
    currentUser.value = ''
    userId.value = 0
    userType.value = 0
    localStorage.removeItem('current_user')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_type')
  }

  restoreUser()

  return { currentUser, userId, userType, login, logout, restoreUser }
}, {
  persist: true
})