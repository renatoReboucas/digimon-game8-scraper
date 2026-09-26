'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import type { FavoritesConsent as FavoritesConsentState } from './lib/favorites-store'

interface FavoritesConsentProps {
  consent: FavoritesConsentState
  requestOpen: boolean
  onAccept: () => void
  onDecline: () => void
  onRequest: () => void
}

export function FavoritesConsent({ consent, requestOpen, onAccept, onDecline, onRequest }: FavoritesConsentProps) {
  const [confirmRevocation, setConfirmRevocation] = useState(false)

  if (consent === 'unknown' || requestOpen) {
    return (
      <section className="favorites-consent" aria-labelledby="favorites-consent-title" aria-live="polite">
        <div className="favorites-consent-copy">
          <h2 id="favorites-consent-title">Salvar favoritos neste navegador?</h2>
          <p>
            Com autorização, salvamos seus favoritos neste navegador para a próxima visita.
            O Vercel Analytics registra navegação separadamente e permanece ativo.
          </p>
        </div>
        <div className="favorites-consent-actions">
          <Button type="button" size="sm" onClick={onAccept}>Permitir salvamento</Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDecline}>Agora não</Button>
        </div>
      </section>
    )
  }

  if (consent === 'granted') {
    return (
      <div className="favorites-consent-status" aria-live="polite">
        <span>Favoritos salvos neste navegador.</span>
        <details className="favorites-consent-manage">
          <summary>Gerenciar</summary>
          <div className="favorites-consent-manage-panel">
            {confirmRevocation ? (
              <>
                <p>Revogar apaga os favoritos salvos neste navegador. Deseja continuar?</p>
                <Button type="button" size="sm" variant="destructive" onClick={onDecline}>
                  Revogar e apagar
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmRevocation(false)}>
                  Manter favoritos
                </Button>
              </>
            ) : (
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmRevocation(true)}>
                Revogar autorização
              </Button>
            )}
          </div>
        </details>
      </div>
    )
  }

  return (
    <div className="favorites-consent-status" aria-live="polite">
      <span>Favoritos desativados neste navegador.</span>
      <Button type="button" size="sm" variant="ghost" onClick={onRequest}>
        Rever permissão
      </Button>
    </div>
  )
}