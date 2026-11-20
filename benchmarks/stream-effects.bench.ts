import { test } from 'vitest'
import { createMarkdownParser } from 'comark'
import type { Node } from 'comark'
import { caret, createStreamRenderer, fade, pace, typewriter } from 'comark/stream'
import type { StreamEffect } from 'comark/stream'
import { chatMarkdown, largeMarkdown, toStreamChunks } from './fixtures.ts'

const FRAME = 16
const MAX_DRAIN_FRAMES = 5000

async function snapshots(markdown: string, count: number): Promise<Node[][]> {
  const parse = createMarkdownParser()
  const out: Node[][] = []
  for (const chunk of toStreamChunks(markdown, count)) {
    out.push((await parse(chunk, { streaming: true })).nodes)
  }
  return out
}

const chatFrames = await snapshots(chatMarkdown, 24)
const largeFrames = await snapshots(largeMarkdown, 60)

const fadeEffects = [fade({ styles: false }), caret()]
const fadeWordStagger = [fade({ styles: false, stagger: 30, pace: { speed: 400 } })]
const typewriterEffects = [typewriter({ styles: false, speed: 400 })]
const paceDrain = [pace({ speed: 4000 }), fade({ styles: false, pace: false }), caret()]

/** Feeds each snapshot one frame apart, then renders frames until no effect has queued work. */
function play(frames: Node[][], effects: readonly StreamEffect[]): void {
  let time = 0
  const stream = createStreamRenderer({ now: () => time })
  for (const nodes of frames) {
    stream.render(nodes, { streaming: true, effects })
    time += FRAME
  }
  const last = frames[frames.length - 1]
  stream.render(last, { streaming: false, effects })
  for (let i = 0; i < MAX_DRAIN_FRAMES && stream.pending(); i++) {
    time += FRAME
    stream.render(last, { streaming: false, effects })
  }
}

play(chatFrames, fadeEffects)
play(largeFrames, paceDrain)

test('stream effects', async ({ bench }) => {
  await bench.compare(
    bench('fade and caret over a chat answer', () => {
      play(chatFrames, fadeEffects)
    }),
    bench('staggered word fade over a large document', () => {
      play(largeFrames, fadeWordStagger)
    }),
    bench('typewriter over a chat answer', () => {
      play(chatFrames, typewriterEffects)
    }),
    bench('pace drain of a large document', () => {
      play(largeFrames, paceDrain)
    })
  )
})
