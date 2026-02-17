import { Comark } from 'comark/react'
import Alert from './components/Alert'

const markdown = `
# Hello *World*

::alert{type="info"}
This is an alert!
::
`

export default function App() {
  return (
    <Comark
      markdown={markdown}
      components={{ Alert }}
    />
  )
}
