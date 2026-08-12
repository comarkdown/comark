/**
 * Alternate scroll mode (DEC private mode 1007).
 *
 * While the alternate screen is up, a terminal in this mode turns the wheel
 * into cursor up/down instead of scrolling its own scrollback — which is what
 * lets an app scroll with the wheel without capturing the mouse.
 *
 * The gallery needs it because it declines OpenTUI's mouse capture, so links
 * stay clickable (see `gallery.tsx`). Terminals differ on the default: iTerm2
 * has it on, Ghostty follows xterm and leaves it off, so without this the wheel
 * does nothing there. Written by hand because OpenTUI performs terminal setup
 * itself and exposes no option for this mode.
 */
const ENABLE = '\x1b[?1007h'
const DISABLE = '\x1b[?1007l'

/**
 * Ask the terminal to send cursor keys on wheel, and give the mode back when
 * the process ends.
 *
 * Restoring on `exit` rather than from the quit handler covers ctrl-c, which
 * OpenTUI's `exitOnCtrlC` handles inside the renderer.
 */
export function enableAlternateScroll(): void {
  process.stdout.write(ENABLE)
  process.on('exit', () => process.stdout.write(DISABLE))
}
