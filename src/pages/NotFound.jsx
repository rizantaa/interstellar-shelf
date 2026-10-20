import { Link } from 'react-router-dom'
import { Container } from '../components/layout/Container.jsx'
import { Button } from '../components/ui/Button.jsx'

export function NotFound({
  title = 'Page not found',
  description = 'The page you are looking for does not exist or has been moved.',
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl font-semibold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button as={Link} to="/">
          Back to catalog
        </Button>
        <Button as={Link} to="/saved" variant="outline">
          View saved
        </Button>
      </div>
    </Container>
  )
}
