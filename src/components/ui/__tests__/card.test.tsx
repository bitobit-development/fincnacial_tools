import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card'

describe('Card Component', () => {
  describe('Card', () => {
    it('renders card container', () => {
      render(<Card data-testid="card">Card Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveTextContent('Card Content')
    })

    it('applies default styling', () => {
      render(<Card data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-xl')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('bg-card')
      expect(card).toHaveClass('text-card-foreground')
      expect(card).toHaveClass('shadow')
    })

    it('accepts custom className', () => {
      render(<Card className="custom-card" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-card')
      expect(card).toHaveClass('rounded-xl') // should still have base classes
    })

    it('forwards ref correctly', () => {
      const ref = vi.fn()
      render(<Card ref={ref}>Content</Card>)
      expect(ref).toHaveBeenCalled()
    })

    it('accepts standard HTML div attributes', () => {
      render(
        <Card data-testid="card" role="region" aria-label="Test Card">
          Content
        </Card>
      )
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('role', 'region')
      expect(card).toHaveAttribute('aria-label', 'Test Card')
    })
  })

  describe('CardHeader', () => {
    it('renders card header', () => {
      render(<CardHeader data-testid="header">Header Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveTextContent('Header Content')
    })

    it('applies default styling', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('space-y-1.5')
      expect(header).toHaveClass('p-6')
    })

    it('accepts custom className', () => {
      render(
        <CardHeader className="custom-header" data-testid="header">
          Header
        </CardHeader>
      )
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
      expect(header).toHaveClass('flex') // should still have base classes
    })
  })

  describe('CardTitle', () => {
    it('renders card title', () => {
      render(<CardTitle data-testid="title">Card Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Card Title')
    })

    it('applies default styling', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('tracking-tight')
    })

    it('accepts custom className', () => {
      render(
        <CardTitle className="custom-title" data-testid="title">
          Title
        </CardTitle>
      )
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('custom-title')
      expect(title).toHaveClass('font-semibold')
    })
  })

  describe('CardDescription', () => {
    it('renders card description', () => {
      render(
        <CardDescription data-testid="description">
          This is a description
        </CardDescription>
      )
      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('This is a description')
    })

    it('applies default styling', () => {
      render(<CardDescription data-testid="description">Desc</CardDescription>)
      const description = screen.getByTestId('description')
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-muted-foreground')
    })

    it('accepts custom className', () => {
      render(
        <CardDescription className="custom-desc" data-testid="description">
          Desc
        </CardDescription>
      )
      const description = screen.getByTestId('description')
      expect(description).toHaveClass('custom-desc')
      expect(description).toHaveClass('text-sm')
    })
  })

  describe('CardContent', () => {
    it('renders card content', () => {
      render(<CardContent data-testid="content">Main Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Main Content')
    })

    it('applies default styling', () => {
      render(<CardContent data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('p-6')
      expect(content).toHaveClass('pt-0')
    })

    it('accepts custom className', () => {
      render(
        <CardContent className="custom-content" data-testid="content">
          Content
        </CardContent>
      )
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
      expect(content).toHaveClass('p-6')
    })
  })

  describe('CardFooter', () => {
    it('renders card footer', () => {
      render(<CardFooter data-testid="footer">Footer Content</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveTextContent('Footer Content')
    })

    it('applies default styling', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('p-6')
      expect(footer).toHaveClass('pt-0')
    })

    it('accepts custom className', () => {
      render(
        <CardFooter className="custom-footer" data-testid="footer">
          Footer
        </CardFooter>
      )
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
      expect(footer).toHaveClass('flex')
    })
  })

  describe('Composition Patterns', () => {
    it('renders full card with all components', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Full Card Title</CardTitle>
            <CardDescription>Full card description</CardDescription>
          </CardHeader>
          <CardContent>This is the main content area</CardContent>
          <CardFooter>Footer actions here</CardFooter>
        </Card>
      )

      expect(screen.getByTestId('full-card')).toBeInTheDocument()
      expect(screen.getByText('Full Card Title')).toBeInTheDocument()
      expect(screen.getByText('Full card description')).toBeInTheDocument()
      expect(screen.getByText('This is the main content area')).toBeInTheDocument()
      expect(screen.getByText('Footer actions here')).toBeInTheDocument()
    })

    it('renders card without header', () => {
      render(
        <Card data-testid="no-header-card">
          <CardContent>Content without header</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      expect(screen.getByTestId('no-header-card')).toBeInTheDocument()
      expect(screen.getByText('Content without header')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('renders card without footer', () => {
      render(
        <Card data-testid="no-footer-card">
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content without footer</CardContent>
        </Card>
      )

      expect(screen.getByTestId('no-footer-card')).toBeInTheDocument()
      expect(screen.getByText('Title Only')).toBeInTheDocument()
      expect(screen.getByText('Content without footer')).toBeInTheDocument()
    })

    it('renders card with only content', () => {
      render(
        <Card data-testid="content-only-card">
          <CardContent>Just content, nothing else</CardContent>
        </Card>
      )

      expect(screen.getByTestId('content-only-card')).toBeInTheDocument()
      expect(screen.getByText('Just content, nothing else')).toBeInTheDocument()
    })

    it('renders nested elements correctly', () => {
      render(
        <Card data-testid="nested-card">
          <CardHeader>
            <CardTitle>
              <span>Title with</span> <strong>nested elements</strong>
            </CardTitle>
            <CardDescription>
              Description with <em>emphasis</em>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Paragraph in content</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('nested elements')).toBeInTheDocument()
      expect(screen.getByText('emphasis')).toBeInTheDocument()
      expect(screen.getByText('List item 1')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('maintains proper DOM structure', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      const card = container.firstChild as HTMLElement
      expect(card.tagName).toBe('DIV')
      expect(card.children.length).toBe(2) // Header and Content
    })

    it('supports ARIA attributes', () => {
      render(
        <Card
          data-testid="aria-card"
          role="article"
          aria-labelledby="card-title"
        >
          <CardHeader>
            <CardTitle id="card-title">Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>Accessible content</CardContent>
        </Card>
      )

      const card = screen.getByTestId('aria-card')
      expect(card).toHaveAttribute('role', 'article')
      expect(card).toHaveAttribute('aria-labelledby', 'card-title')
    })
  })
})
