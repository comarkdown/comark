import { ComarkClient } from '@comark/react/components/ComarkClient'
import Alert from './components/Alert'
import Live from './Live'

const markdown = `
# Hello *World*

::alert{type="info"}
This is an alert!
::
`

export default function App() {
  return (
    <>
      <ComarkClient components={{ Alert }}>{markdown}</ComarkClient>
      <hr className="my-8" />
      <Live />
    </>
  )
}
