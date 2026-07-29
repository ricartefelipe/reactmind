import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorBanner } from '@/shared/ui/ErrorBanner'
import { Input } from '@/shared/ui/Input'
import { LoadingBlock } from '@/shared/ui/LoadingBlock'
import {
  useBeneficiaries,
  useCreateBeneficiary,
  useDeleteBeneficiary,
} from './hooks'

export function BeneficiariesPage() {
  const [name, setName] = useState('')
  const [pixKey, setPixKey] = useState('')
  const beneficiaries = useBeneficiaries()
  const createBeneficiary = useCreateBeneficiary()
  const deleteBeneficiary = useDeleteBeneficiary()
  const canSubmit =
    name.trim().length > 0 && pixKey.trim().length > 0 && !createBeneficiary.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    createBeneficiary.mutate(
      { name, pixKey },
      {
        onSuccess: () => {
          setName('')
          setPixKey('')
        },
      },
    )
  }

  return (
    <section className="wallet-page">
      <h1>Favorecidos</h1>

      <form onSubmit={handleSubmit}>
        <Input label="Nome" value={name} onChange={setName} />
        <Input label="Chave PIX" value={pixKey} onChange={setPixKey} />
        <Button type="submit" disabled={!canSubmit}>
          {createBeneficiary.isPending ? 'Adicionando…' : 'Adicionar favorecido'}
        </Button>
      </form>

      {createBeneficiary.isError && (
        <ErrorBanner message="Não foi possível adicionar o favorecido." />
      )}
      {deleteBeneficiary.isError && (
        <ErrorBanner message="Não foi possível remover o favorecido." />
      )}
      {beneficiaries.isPending && (
        <LoadingBlock label="Carregando favorecidos…" />
      )}
      {beneficiaries.isError && (
        <ErrorBanner message="Não foi possível carregar os favorecidos." />
      )}
      {beneficiaries.data?.items?.length === 0 && (
        <EmptyState message="Nenhum favorecido cadastrado." />
      )}
      {beneficiaries.data?.items && beneficiaries.data.items.length > 0 && (
        <ul className="transaction-list">
          {beneficiaries.data.items.map((beneficiary) => (
            <li key={beneficiary.id}>
              <div>
                <strong>{beneficiary.name}</strong>
                <span>{beneficiary.pixKey}</span>
              </div>
              <Button
                type="button"
                aria-label={`Remover ${beneficiary.name}`}
                disabled={
                  deleteBeneficiary.isPending &&
                  deleteBeneficiary.variables === beneficiary.id
                }
                onClick={() => deleteBeneficiary.mutate(beneficiary.id)}
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
