import { http } from '@/shared/http/client'
import type { Notification } from './types'

export function fetchNotifications() {
  return http.get<{ items: Notification[] }>('/notifications')
}

export function markNotificationRead(id: string) {
  return http.post<void>(`/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return http.post<void>('/notifications/read-all')
}
