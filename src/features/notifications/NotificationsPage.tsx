import { useTranslation } from 'react-i18next'
import { ApiError } from '@/shared/http/errors'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Skeleton } from '@/shared/ui/Skeleton'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from './hooks'

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const notifications = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const unreadCount =
    notifications.data?.items.filter((item) => !item.read).length ?? 0

  return (
    <section className="wallet-page">
      <header className="notifications-header">
        <h1>{t('notifications.title')}</h1>
        {unreadCount > 0 && (
          <Button
            type="button"
            variant="secondary"
            data-testid="notifications-read-all"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            {t('notifications.markAllRead')}
          </Button>
        )}
      </header>

      {(markRead.isError || markAll.isError) && (
        <ErrorBanner
          message={t('common.error')}
          correlationId={
            (markRead.error instanceof ApiError
              ? markRead.error.correlationId
              : undefined) ??
            (markAll.error instanceof ApiError
              ? markAll.error.correlationId
              : undefined)
          }
        />
      )}

      {notifications.isPending && <Skeleton lines={4} />}
      {notifications.isError && (
        <ErrorBanner
          message={
            notifications.error instanceof Error
              ? notifications.error.message
              : t('common.error')
          }
          correlationId={
            notifications.error instanceof ApiError
              ? notifications.error.correlationId
              : undefined
          }
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => void notifications.refetch()}
            >
              {t('common.retry')}
            </Button>
          }
        />
      )}
      {notifications.data?.items.length === 0 && (
        <EmptyState
          title={t('notifications.empty.title')}
          description={t('notifications.empty.description')}
        />
      )}
      {notifications.data && notifications.data.items.length > 0 && (
        <ul className="notifications-list" data-testid="notifications-list">
          {notifications.data.items.map((item) => (
            <li
              key={item.id}
              className={`notifications-list__item${item.read ? '' : ' notifications-list__item--unread'}`}
              data-testid={`notification-${item.id}`}
            >
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <time>
                  {new Date(item.createdAt).toLocaleString(i18n.language)}
                </time>
              </div>
              {!item.read && (
                <Button
                  type="button"
                  variant="ghost"
                  data-testid="notification-mark-read"
                  disabled={markRead.isPending}
                  onClick={() => markRead.mutate(item.id)}
                >
                  {t('notifications.markRead')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
