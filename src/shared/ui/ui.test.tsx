import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'
import { ErrorBanner } from './ErrorBanner'
import { Input } from './Input'

describe('shared UI', () => {
  it('aplica a classe base ao botão', () => {
    render(<Button type="button">Continuar</Button>)

    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveClass('btn')
  })

  it('associa o label ao input e propaga alterações', async () => {
    const user = userEvent.setup()
    function InputHarness() {
      const [value, setValue] = useState('')
      return <Input label="Apelido" value={value} onChange={setValue} />
    }

    render(<InputHarness />)

    const input = screen.getByLabelText('Apelido')
    await user.type(input, 'Ana')

    expect(input).toHaveAttribute('id', 'Apelido')
    expect(input).toHaveValue('Ana')
  })

  it('identifica mensagens de erro para tecnologias assistivas', () => {
    render(<ErrorBanner message="Não foi possível continuar." />)

    expect(screen.getByRole('alert')).toHaveClass('error-banner')
  })

  it('exibe estados de carregamento e vazio', async () => {
    const [{ LoadingBlock }, { EmptyState }] = await Promise.all([
      import('./LoadingBlock'),
      import('./EmptyState'),
    ])

    const { container } = render(
      <>
        <LoadingBlock />
        <EmptyState message="Nenhum lançamento." />
      </>,
    )

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…')
    expect(container.querySelector('.empty')).toHaveTextContent(
      'Nenhum lançamento.',
    )
  })
})
