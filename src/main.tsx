import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App.tsx'

async function prepare() {
  const mswFlag = import.meta.env.VITE_ENABLE_MSW
  const enableMsw =
    mswFlag === 'true' ||
    (mswFlag !== 'false' &&
      (import.meta.env.DEV || import.meta.env.BASE_URL !== '/'))
  if (enableMsw) {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    })
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
