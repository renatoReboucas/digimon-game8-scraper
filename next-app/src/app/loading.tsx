import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="shell" aria-busy="true">
      <p className="sr-only" role="status">Carregando o catálogo de Digimon.</p>
      <header className="hero loading-heading" aria-hidden="true">
        <Skeleton className="skeleton-eyebrow" />
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-subtitle" />
        <Skeleton className="skeleton-search" />
      </header>
      <section className="digimon-list loading-grid" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <Card className="loading-card" key={index}>
            <div className="skeleton-card-heading">
              <Skeleton className="skeleton-image" />
              <div className="skeleton-copy">
                <Skeleton className="skeleton-line short" />
                <Skeleton className="skeleton-line" />
                <Skeleton className="skeleton-line medium" />
              </div>
            </div>
            <div className="skeleton-metadata">
              <Skeleton className="skeleton-line" />
              <Skeleton className="skeleton-line" />
              <Skeleton className="skeleton-line medium" />
            </div>
          </Card>
        ))}
      </section>
    </main>
  )
}