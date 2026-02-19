import comarkEmoji from './emoji'
import comarkHighlight from './highlight'
import comarkToc from './toc'
import comarkSummary from './summary'

export const essentials = [
  comarkEmoji(),
  comarkHighlight(),
  comarkToc(),
  comarkSummary('<!-- more -->'),
]
