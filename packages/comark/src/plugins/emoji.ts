import type { MarkdownItPlugin } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'

// Curated set of common emoji shortcodes, organized by category.
// For the full GitHub set, install a dataset (e.g. `gemoji`) and pass it via
// the `extend` option — see EmojiOptions below.
const BASE_EMOJI = new Map<string, string>([
  // Smileys & emotions
  ['grinning', '😀'],
  ['smiley', '😃'],
  ['smile', '😄'],
  ['grin', '😁'],
  ['laughing', '😆'],
  ['satisfied', '😆'],
  ['sweat_smile', '😅'],
  ['joy', '😂'],
  ['wink', '😉'],
  ['blush', '😊'],
  ['innocent', '😇'],
  ['heart_eyes', '😍'],
  ['kissing_heart', '😘'],
  ['kissing', '😗'],
  ['kissing_closed_eyes', '😚'],
  ['kissing_smiling_eyes', '😙'],
  ['yum', '😋'],
  ['stuck_out_tongue', '😛'],
  ['stuck_out_tongue_winking_eye', '😜'],
  ['stuck_out_tongue_closed_eyes', '😝'],
  ['neutral_face', '😐'],
  ['expressionless', '😑'],
  ['no_mouth', '😶'],
  ['smirk', '😏'],
  ['unamused', '😒'],
  ['relieved', '😌'],
  ['pensive', '😔'],
  ['sleepy', '😪'],
  ['sleeping', '😴'],
  ['mask', '😷'],
  ['dizzy_face', '😵'],
  ['sunglasses', '😎'],
  ['confused', '😕'],
  ['worried', '😟'],
  ['open_mouth', '😮'],
  ['hushed', '😯'],
  ['astonished', '😲'],
  ['flushed', '😳'],
  ['frowning', '😦'],
  ['anguished', '😧'],
  ['fearful', '😨'],
  ['cold_sweat', '😰'],
  ['disappointed_relieved', '😥'],
  ['cry', '😢'],
  ['sob', '😭'],
  ['scream', '😱'],
  ['confounded', '😖'],
  ['persevere', '😣'],
  ['disappointed', '😞'],
  ['sweat', '😓'],
  ['weary', '😩'],
  ['tired_face', '😫'],
  ['triumph', '😤'],
  ['rage', '😡'],
  ['angry', '😠'],
  ['smiling_imp', '😈'],
  ['imp', '👿'],
  ['skull', '💀'],
  ['eyes', '👀'],
  ['eye', '👁️'],
  ['nose', '👃'],
  ['lips', '👄'],
  ['tongue', '👅'],

  // Hearts
  ['heart', '❤️'],
  ['yellow_heart', '💛'],
  ['green_heart', '💚'],
  ['blue_heart', '💙'],
  ['purple_heart', '💜'],
  ['broken_heart', '💔'],

  // People & gestures
  ['thumbsup', '👍'],
  ['+1', '👍'],
  ['thumbsdown', '👎'],
  ['-1', '👎'],
  ['ok_hand', '👌'],
  ['facepunch', '👊'],
  ['punch', '👊'],
  ['fist', '✊'],
  ['v', '✌️'],
  ['wave', '👋'],
  ['hand', '✋'],
  ['raised_hand', '✋'],
  ['clap', '👏'],
  ['pray', '🙏'],
  ['point_up', '☝️'],
  ['point_down', '👇'],
  ['point_left', '👈'],
  ['point_right', '👉'],
  ['raised_hands', '🙌'],
  ['muscle', '💪'],
  ['writing_hand', '✍️'],
  ['nail_care', '💅'],
  ['selfie', '🤳'],

  // Objects & symbols
  ['fire', '🔥'],
  ['sparkles', '✨'],
  ['star', '⭐'],
  ['star2', '🌟'],
  ['zap', '⚡'],
  ['boom', '💥'],
  ['collision', '💥'],
  ['100', '💯'],
  ['tada', '🎉'],
  ['confetti_ball', '🎊'],
  ['balloon', '🎈'],
  ['gift', '🎁'],
  ['birthday', '🎂'],
  ['cake', '🍰'],

  // Travel & places
  ['rocket', '🚀'],
  ['helicopter', '🚁'],
  ['airplane', '✈️'],
  ['boat', '⛵'],
  ['ship', '🚢'],
  ['train', '🚂'],
  ['bus', '🚌'],
  ['taxi', '🚕'],
  ['car', '🚗'],
  ['bike', '🚲'],
  ['checkered_flag', '🏁'],

  // Activities
  ['medal', '🏅'],
  ['trophy', '🏆'],
  ['medal_sports', '🏅'],
  ['medal_military', '🎖️'],
  ['soccer', '⚽'],
  ['basketball', '🏀'],
  ['football', '🏈'],
  ['baseball', '⚾'],
  ['tennis', '🎾'],
  ['bowling', '🎳'],
  ['golf', '⛳'],
  ['dart', '🎯'],

  // Food & drink
  ['beer', '🍺'],
  ['beers', '🍻'],
  ['wine_glass', '🍷'],
  ['cocktail', '🍸'],
  ['coffee', '☕'],
  ['pizza', '🍕'],
  ['hamburger', '🍔'],
  ['fries', '🍟'],
  ['apple', '🍎'],
  ['banana', '🍌'],
  ['watermelon', '🍉'],
  ['grapes', '🍇'],
  ['strawberry', '🍓'],
  ['cherries', '🍒'],
  ['lemon', '🍋'],
  ['peach', '🍑'],
  ['pear', '🍐'],
  ['pineapple', '🍍'],
  ['tomato', '🍅'],
  ['eggplant', '🍆'],
  ['hot_pepper', '🌶️'],
  ['corn', '🌽'],
  ['bread', '🍞'],
  ['croissant', '🥐'],
  ['baguette_bread', '🥖'],
  ['cheese', '🧀'],
  ['egg', '🥚'],
  ['poultry_leg', '🍗'],
  ['meat_on_bone', '🍖'],
  ['doughnut', '🍩'],
  ['cookie', '🍪'],
  ['chocolate_bar', '🍫'],
  ['candy', '🍬'],
  ['lollipop', '🍭'],
  ['ice_cream', '🍦'],
  ['icecream', '🍨'],
  ['shaved_ice', '🍧'],
  ['tea', '🍵'],
  ['sake', '🍶'],
  ['champagne', '🍾'],
  ['tropical_drink', '🍹'],

  // Weather & nature
  ['sunny', '☀️'],
  ['cloud', '☁️'],
  ['umbrella', '☂️'],
  ['snowflake', '❄️'],
  ['snowman', '⛄'],
  ['rainbow', '🌈'],
  ['ocean', '🌊'],
  ['droplet', '💧'],
  ['moon', '🌙'],
  ['partly_sunny', '⛅'],
  ['thunder_cloud_and_rain', '⛈️'],
  ['wind_face', '🌬️'],
  ['fog', '🌫️'],

  // Animals
  ['dog', '🐶'],
  ['cat', '🐱'],
  ['mouse', '🐭'],
  ['rabbit', '🐰'],
  ['fox_face', '🦊'],
  ['bear', '🐻'],
  ['panda_face', '🐼'],
  ['koala', '🐨'],
  ['tiger', '🐯'],
  ['lion', '🦁'],
  ['cow', '🐮'],
  ['pig', '🐷'],
  ['frog', '🐸'],
  ['monkey_face', '🐵'],
  ['see_no_evil', '🙈'],
  ['hear_no_evil', '🙉'],
  ['speak_no_evil', '🙊'],
  ['chicken', '🐔'],
  ['penguin', '🐧'],
  ['bird', '🐦'],
  ['baby_chick', '🐤'],
  ['bee', '🐝'],
  ['bug', '🐛'],
  ['butterfly', '🦋'],
  ['snail', '🐌'],
  ['turtle', '🐢'],
  ['snake', '🐍'],
  ['lizard', '🦎'],
  ['dragon', '🐉'],
  ['whale', '🐳'],
  ['dolphin', '🐬'],
  ['fish', '🐟'],
  ['octopus', '🐙'],
  ['shell', '🐚'],
  ['crab', '🦀'],

  // Plants
  ['tree', '🌲'],
  ['evergreen_tree', '🌲'],
  ['deciduous_tree', '🌳'],
  ['palm_tree', '🌴'],
  ['cactus', '🌵'],
  ['herb', '🌿'],
  ['shamrock', '☘️'],
  ['four_leaf_clover', '🍀'],
  ['maple_leaf', '🍁'],
  ['fallen_leaf', '🍂'],
  ['leaves', '🍃'],
  ['mushroom', '🍄'],
  ['cherry_blossom', '🌸'],
  ['rose', '🌹'],
  ['hibiscus', '🌺'],
  ['sunflower', '🌻'],
  ['blossom', '🌼'],
  ['bouquet', '💐'],
  ['seedling', '🌱'],
  ['christmas_tree', '🎄'],
  ['santa', '🎅'],
  ['gift_heart', '💝'],
  ['ring', '💍'],
  ['gem', '💎'],

  // Tech & objects
  ['bulb', '💡'],
  ['book', '📖'],
  ['pencil', '📝'],
  ['memo', '📝'],
  ['email', '✉️'],
  ['envelope', '✉️'],
  ['phone', '☎️'],
  ['telephone', '☎️'],
  ['iphone', '📱'],
  ['camera', '📷'],
  ['video_camera', '📹'],
  ['tv', '📺'],
  ['computer', '💻'],
  ['keyboard', '⌨️'],
  ['desktop_computer', '🖥️'],
  ['printer', '🖨️'],
  ['computer_mouse', '🖱️'],
  ['trackball', '🖲️'],
  ['joystick', '🕹️'],
  ['watch', '⌚'],
  ['alarm_clock', '⏰'],
  ['stopwatch', '⏱️'],
  ['timer_clock', '⏲️'],
  ['hourglass', '⌛'],
  ['hourglass_flowing_sand', '⏳'],
  ['satellite_antenna', '📡'],
  ['battery', '🔋'],
  ['electric_plug', '🔌'],
  ['lock', '🔒'],
  ['unlock', '🔓'],
  ['key', '🔑'],
  ['mag', '🔍'],
  ['mag_right', '🔎'],
  ['bell', '🔔'],
  ['no_bell', '🔕'],
  ['bookmark', '🔖'],
  ['link', '🔗'],
  ['wrench', '🔧'],
  ['hammer', '🔨'],
  ['nut_and_bolt', '🔩'],

  // Symbols
  ['thinking', '🤔'],
  ['thinking_face', '🤔'],
  ['question', '❓'],
  ['grey_question', '❔'],
  ['exclamation', '❗'],
  ['grey_exclamation', '❕'],
  ['warning', '⚠️'],
  ['x', '❌'],
  ['o', '⭕'],
  ['white_check_mark', '✅'],
  ['heavy_check_mark', '✔️'],
  ['accept', '🉑'],
  ['satellite', '📡'],
  ['arrow_up', '⬆️'],
  ['arrow_down', '⬇️'],
  ['arrow_left', '⬅️'],
  ['arrow_right', '➡️'],
  ['arrow_upper_right', '↗️'],
  ['arrow_lower_right', '↘️'],
  ['arrow_lower_left', '↙️'],
  ['arrow_upper_left', '↖️'],
  ['arrow_up_down', '↕️'],
  ['left_right_arrow', '↔️'],
  ['arrows_counterclockwise', '🔄'],
  ['back', '🔙'],
  ['end', '🔚'],
  ['on', '🔛'],
  ['soon', '🔜'],
  ['top', '🔝'],
  ['red_circle', '🔴'],
  ['blue_circle', '🔵'],
  ['white_circle', '⚪'],
  ['black_circle', '⚫'],
  ['red_square', '🟥'],
  ['blue_square', '🟦'],
  ['white_square', '⬜'],
  ['black_square', '⬛'],
  ['orange_square', '🟧'],
  ['yellow_square', '🟨'],
  ['green_square', '🟩'],
  ['purple_square', '🟪'],
  ['brown_square', '🟫'],
  ['diamond_shape_with_a_dot_inside', '💠'],
  ['radio_button', '🔘'],
  ['white_square_button', '🔳'],
  ['black_square_button', '🔲'],

  // Office & documents
  ['scissors', '✂️'],
  ['paperclip', '📎'],
  ['pushpin', '📌'],
  ['round_pushpin', '📍'],
  ['triangular_flag_on_post', '🚩'],
  ['closed_book', '📕'],
  ['open_book', '📖'],
  ['green_book', '📗'],
  ['blue_book', '📘'],
  ['orange_book', '📙'],
  ['notebook', '📓'],
  ['ledger', '📒'],
  ['page_with_curl', '📃'],
  ['scroll', '📜'],
  ['page_facing_up', '📄'],
  ['newspaper', '📰'],
  ['bookmark_tabs', '📑'],
  ['bar_chart', '📊'],
  ['chart_with_upwards_trend', '📈'],
  ['chart_with_downwards_trend', '📉'],
  ['calendar', '📅'],
  ['date', '📆'],
  ['clipboard', '📋'],
  ['file_folder', '📁'],
  ['open_file_folder', '📂'],
  ['briefcase', '💼'],
  ['package', '📦'],
  ['inbox_tray', '📥'],
  ['outbox_tray', '📤'],

  // Music & art
  ['musical_note', '🎵'],
  ['notes', '🎶'],
  ['microphone', '🎤'],
  ['headphones', '🎧'],
  ['guitar', '🎸'],
  ['trumpet', '🎺'],
  ['saxophone', '🎷'],
  ['violin', '🎻'],
  ['drum', '🥁'],
  ['clapper', '🎬'],
  ['art', '🎨'],
  ['performing_arts', '🎭'],
  ['game_die', '🎲'],
  ['slot_machine', '🎰'],
])

/**
 * Options for the emoji plugin.
 */
export interface EmojiOptions {
  /**
   * Add or override shortcodes. Values take precedence over the built-in set,
   * so this can also be used to remap an existing shortcode.
   *
   * Pass a full dataset here to go beyond the curated built-in set — install a
   * package such as `gemoji` and forward its map:
   *
   * @example
   * ```ts
   * import { nameToEmoji } from 'gemoji'
   * emoji({ extend: nameToEmoji })
   * ```
   *
   * @example
   * ```ts
   * emoji({ extend: { shipit: '🚀', myteam: '🦄' } })
   * ```
   */
  extend?: Record<string, string>
}

/**
 * Emoji parser for markdown-it.
 * Only supports :emoji_name: syntax (no shortcuts/emoticons).
 * Uses a Map for O(1) lookups and simple string scanning.
 */
const createEmojiRule = (emojiMap: Map<string, string>) => (state: any, silent: boolean) => {
  const max = state.posMax
  const start = state.pos

  // Quick check: must start with ':'
  if (state.src.charCodeAt(start) !== 0x3a /* : */) {
    return false
  }

  // Find the closing ':'
  let pos = start + 1
  while (pos < max) {
    const code = state.src.charCodeAt(pos)

    // Found closing ':'
    if (code === 0x3a /* : */) {
      const emojiName = state.src.slice(start + 1, pos)

      // Check if this is a valid emoji
      const emojiChar = emojiMap.get(emojiName)
      if (emojiChar) {
        if (!silent) {
          const token = state.push('emoji', '', 0)
          token.markup = emojiName
          token.content = emojiChar
        }
        state.pos = pos + 1
        return true
      }

      // Not a valid emoji, stop searching
      return false
    }

    // Only allow word characters, digits, underscores, hyphens, and plus
    // This matches the pattern of valid emoji names
    if (
      (code >= 0x61 && code <= 0x7a) || // a-z
      (code >= 0x41 && code <= 0x5a) || // A-Z
      (code >= 0x30 && code <= 0x39) || // 0-9
      code === 0x5f || // _
      code === 0x2d || // -
      code === 0x2b // +
    ) {
      pos++
      continue
    }

    // Invalid character in emoji name
    return false
  }

  // No closing ':' found
  return false
}

export const markdownItEmoji: MarkdownItPlugin = (md) => {
  md.inline.ruler.before('emphasis', 'emoji', createEmojiRule(BASE_EMOJI))
}

export default defineComarkPlugin<EmojiOptions>((options) => {
  const emojiMap = options?.extend
    ? new Map<string, string>([...BASE_EMOJI, ...Object.entries(options.extend)])
    : BASE_EMOJI

  const markdownItPlugin: MarkdownItPlugin = (md) => {
    md.inline.ruler.before('emphasis', 'emoji', createEmojiRule(emojiMap))
  }

  return {
    name: 'emoji',
    markdownItPlugins: [markdownItPlugin],
  }
})
