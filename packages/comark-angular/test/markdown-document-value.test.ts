import { describe, expect, it, vi, beforeEach } from 'vitest'
import { parseMarkdown } from 'comark'
import { isMarkdownDocument } from 'comark/utils'
import type { MarkdownDocument } from 'comark'
import { Markdown } from '../src/components/markdown.component.ts'
import { ComponentFixture, TestBed } from '@angular/core/testing'

describe('Markdown value as MarkdownDocument', () => {
  let component: Markdown;
  let fixture: ComponentFixture<Markdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Markdown],
    }).compileComponents();

    fixture = TestBed.createComponent(Markdown);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('assigns a pre-parsed document without calling parse', async () => {
    const document = await parseMarkdown('# Hello **World**')

    fixture.componentRef.setInput('value', document);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(isMarkdownDocument(component.value())).toBe(true)
    expect(component.document).toBe(document)
    expect(component.document!.nodes[0]?.[0]).toBe('h1')
  })

  it('still parses markdown strings', async () => {
    fixture.componentRef.setInput('value', 'Hello **world**');
    fixture.detectChanges();

    await vi.waitFor(() => {
      expect(component.document).not.toBeNull()
    })

    expect(component.document!.nodes[0]?.[0]).toBe('p')
  })

  it('accepts an empty document', async () => {
    const empty: MarkdownDocument = { nodes: [], frontmatter: {}, meta: {} }
    fixture.componentRef.setInput('value', empty);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.document).toBe(empty)
    expect(component.document!.nodes).toEqual([])
  })
})
