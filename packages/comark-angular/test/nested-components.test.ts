import { describe, expect, it, vi } from 'vitest'
import { Component, provideZonelessChangeDetection, type Type } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType } from 'comark'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'
import { MarkdownNode } from '../src/components/markdown-node.component.ts'
import { ComponentFixture, TestBed } from '@angular/core/testing'

describe('MarkdownNode nested component rendering', () => {
  let component: MarkdownNode;
  let fixture: ComponentFixture<MarkdownNode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownNode],
    }).compileComponents();

    fixture = TestBed.createComponent(MarkdownNode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('passes nested inputs through Angular input binding', () => {
    const parentNode = ['root', {}] as const
    const renderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
    const components = { Badge }

    fixture.componentRef.setInput('node', parentNode)
    fixture.componentRef.setInput('components', components)
    fixture.componentRef.setInput('renderData', renderData)
    fixture.componentRef.setInput('parent', ['p', {}])

    const componentRef = {
      setInput: vi.fn(),
      changeDetectorRef: {
        detectChanges: vi.fn(),
      },
      location: {
        nativeElement: document.createElement('div'),
      },
    }

    vi.spyOn(component['vcr'], 'createComponent').mockReturnValue(componentRef as any)

    component['renderChildren'](document.createElement('div'), [['badge', {}, 'shown']], renderData)

    expect(componentRef.setInput).toHaveBeenCalledWith('node', ['badge', {}, 'shown'])
    expect(componentRef.setInput).toHaveBeenCalledWith('components', components)
    expect(componentRef.setInput).toHaveBeenCalledWith('renderData', renderData)
    expect(componentRef.setInput).toHaveBeenCalledWith('parent', parentNode)
    expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalledTimes(1)
  })

  it('logs a failed custom component and continues with later siblings', () => {
    const error = new Error('constructor failed')
    const renderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
    const parentEl = document.createElement('div')
    const appendChildSpy = vi.spyOn(component['renderer'], 'appendChild')

    fixture.componentRef.setInput('node', ['root', {}])
    fixture.componentRef.setInput('components', { Badge })
    fixture.componentRef.setInput('renderData', renderData)
    fixture.componentRef.setInput('parent', ['p', {}])

    vi.spyOn(component['vcr'], 'createComponent').mockImplementation(() => {
      throw error
    })

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    component['renderChildren'](parentEl, [['badge', {}, 'gone'], 'still rendered'], renderData)

    expect(consoleError).toHaveBeenCalledWith('Failed to render custom component "badge"', error)

    expect(appendChildSpy).toHaveBeenCalledTimes(1)
    const [calledParent, calledText] = appendChildSpy.mock.calls[0]
    expect(calledParent).toBeInstanceOf(HTMLDivElement)
    expect(calledText).toBeInstanceOf(Text)
    expect(calledText.textContent).toBe('still rendered')

    consoleError.mockRestore()
  })
})

/** Badge — applied via decorator factory so Vitest/oxc need not enable experimentalDecorators. */
class Badge {
  name = 'badge'
}
Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="badge">{{ name }}</span>`,
  inputs: ['name'],
})(Badge)

async function renderMarkdown(
  markdown: string,
  components: Record<string, Type<unknown>> = { badge: Badge as Type<unknown> }
): Promise<string> {
  const document = await parseMarkdown(markdown)

  class App {
    document: MarkdownDocumentType = document
    components = components
  }
  Component({
    selector: 'app-root',
    standalone: true,
    imports: [MarkdownDocument],
    template: `
      <comark-markdown-document
        [value]="document"
        [components]="components"
      />
    `,
  })(App)

  return renderApplication(
    (context) =>
      bootstrapApplication(
        App,
        {
          providers: [provideZonelessChangeDetection()],
        },
        context
      ),
    {
      document: '<!DOCTYPE html><html><head></head><body><app-root></app-root></body></html>',
    }
  )
}

describe('nested components', () => {
  it('renders Badge component name for inline :badge', async () => {
    const html = await renderMarkdown('Hello :badge')

    expect(html).toContain('class="badge"')
    expect(html).toContain('>badge</span>')
  })
  it('renders Badge component name for inline :badge with custom name', async () => {
    const html = await renderMarkdown('Hello :badge{name="Ahad"}')

    expect(html).toContain('class="badge"')
    expect(html).toContain('>Ahad</span>')
  })
})
