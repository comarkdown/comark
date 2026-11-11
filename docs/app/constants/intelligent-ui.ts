// Answers rendered by the demos on /use-cases/intelligent-ui.

const unsplash = (id: string, w = 400, h = 400) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`

export const bikePrompt = 'Break down how a 7-speed bike is built'

const bikeIntro = `### 7-speed bicycle

A 7-speed bicycle is five systems working together. The frame carries the rider, the wheels roll, the drivetrain turns pedaling into motion across seven gears, the brakes slow you down, and the cockpit is where you steer and sit.`

export const bikeStages: { label: string; markdown: string }[] = [
  { label: 'Chat', markdown: bikeIntro },
  {
    label: 'Images',
    markdown: `### 7-speed bicycle

![Line drawing of a 7-speed bicycle](/intelligent-ui/bicycle.svg)

Upright handlebars for steering, seven gears for effort, and hand brakes for speed.`,
  },
  {
    label: 'Intelligent UI',
    markdown: `::bike-diagram{title="7-speed bicycle"}
---
systems:
  all:
    title: Five systems, one machine
    description: The frame carries you, the drivetrain moves you, and the rest steers and stops. Pick a system to see where it sits.
  frame:
    title: A diamond of tubes
    description: The frame holds every other part, and carries the rider's weight down to both wheels.
  wheels:
    title: Two wheels
    description: Spokes keep each rim true under load, and the tires grip the road and soak up bumps.
  drivetrain:
    title: Seven gears
    description: The pedals turn the chainring, the chain turns the rear cogs, and the derailleur moves the chain across seven of them for climbs, flats and descents.
  brakes:
    title: Rim brakes
    description: Each hand lever pulls a cable that squeezes two pads against the rim.
  cockpit:
    title: Where you meet the bike
    description: The handlebar, the stem and the saddle set how you sit and steer.
---
::`,
  },
]

export const roastPrompt = 'Plan a Sunday lamb roast for friends, I still don’t know how many people are coming'

export const roastMarkdown = `### A Sunday lamb roast for friends

A slow Sunday dinner: rosemary and garlic lamb, potatoes with crisp edges, honey-glazed roots, and something green to cut through the richness. Your guest list is still moving, so the shopping list follows your headcount.

::image-collage
---
images:
  - src: ${unsplash('1529692236671-f1f6cf9683ba', 800, 600)}
    alt: Roast meat carved on a wooden board
  - src: ${unsplash('1780304223294-d901e0378bb8', 400, 300)}
    alt: A roast dinner with gravy and vegetables
  - src: ${unsplash('1688437307687-fe226bddfab1', 400, 300)}
    alt: A long table set for dinner with candles
---
::

::summary-card{label="Your dinner plan" title="Sunday roast with friends"}
- **Style:** relaxed and generous, served family-style
- **Prep:** most of it done before anyone arrives
- **Oven time:** about 2 to 3 hours, depending on the lamb
- **Dessert:** baked the day before
::

#### 1. The menu

::media-list
---
items:
  - image: ${unsplash('1529692236671-f1f6cf9683ba')}
    title: Rosemary and garlic leg of lamb
    description: Rubbed with lemon, garlic, rosemary and olive oil. Carve it at the table, with gravy and mint sauce.
  - image: ${unsplash('1552661397-4233881ea8c8')}
    title: Crisp roast potatoes
    description: Parboiled, shaken until the edges go fluffy, then roasted until deep golden.
  - image: ${unsplash('1548869206-93b036288d7e')}
    title: Honey-glazed carrots and parsnips
    description: Roasted with thyme and a spoonful of honey.
  - image: ${unsplash('1631255444970-d06bbdd2c04f')}
    title: Lemony greens
    description: Tenderstem broccoli with toasted almonds and lemon zest.
  - image: ${unsplash('1506127946181-abb01a32593c')}
    title: Apple crumble
    description: Baked the day before, warmed while you eat the main course. Serve with vanilla ice cream.
---
::

#### 2. What to buy

Change the number of people, and the quantities follow.

::quantity-calculator{:guests="5"}
---
items:
  - name: Bone-in leg of lamb
    perGuest: 400
    unit: g
  - name: Potatoes
    perGuest: 300
    unit: g
  - name: Carrots
    perGuest: 1.5
  - name: Parsnips
    perGuest: 1
  - name: Tenderstem broccoli
    perGuest: 125
    unit: g
  - name: Apples for the crumble
    perGuest: 0.8
---
Generous portions. The lamb weight includes the bone.
::

Also pick up garlic, rosemary, thyme, lemons, honey, almonds, gravy ingredients, mint sauce and vanilla ice cream.

#### 3. Cooking timeline

Timed for dinner at 7 pm with a 2.4 kg leg of lamb. Adjust the roasting time to your joint.

::timeline{title="Cooking checklist"}
---
items:
  - time: Saturday
    title: Get ahead
    detail: Bake the crumble, mix the marinade and set the table.
  - time: 3:30 pm
    title: Season the lamb
    detail: Rub in the marinade and let the lamb come to room temperature.
  - time: 4:30 pm
    title: Lamb in the oven
    detail: Roast it, and trust a meat thermometer more than the clock.
  - time: 5:15 pm
    title: Prepare the sides
    detail: Peel the roots, parboil the potatoes and rough up their edges.
  - time: 6:15 pm
    title: Rest the lamb
    detail: Cover it loosely. Turn the oven up and roast the potatoes and roots.
  - time: 6:45 pm
    title: Finish
    detail: Make the gravy, cook the greens and warm the plates.
  - time: 7:00 pm
    title: Dinner
    detail: Carve at the table. Warm the crumble while everyone eats.
---
::

Cook the lamb to at least 63 °C (145 °F) inside, then let it rest for 3 minutes or more.

#### 4. Three hosting tips

- **Buy the lamb last**, once your numbers are final.
- **Free up oven space**: the lamb and the potatoes both need room.
- **Put out something to nibble**, such as olives, bread and whipped feta, while you finish cooking.
`

export const roastPlainMarkdown = `Sure! Since you don't know the headcount yet, only the lamb really needs to scale. Most sides stretch for a couple of extra guests.

### Sunday roast menu

- **Main:** rosemary and garlic leg of lamb
- **Sides:** roast potatoes, honey-glazed carrots and parsnips, lemony broccoli
- **Sauce:** gravy and mint sauce
- **Dessert:** apple crumble with vanilla ice cream

### How much to buy

| Guests | Lamb (bone-in) | Potatoes |
| --- | --- | --- |
| 4 | 1.6 kg | 1.2 kg |
| 6 | 2.4 kg | 1.8 kg |
| 8 | 3.2 kg | 2.4 kg |

### Timeline for dinner at 7 pm

1. **Saturday:** bake the crumble and mix the marinade.
2. **3:30 pm:** season the lamb.
3. **4:30 pm:** lamb in the oven.
4. **5:15 pm:** parboil the potatoes and prepare the roots.
5. **6:15 pm:** rest the lamb, roast the potatoes and roots.
6. **6:45 pm:** gravy and greens.
7. **7:00 pm:** carve and serve.

Cook the lamb to at least 63 °C (145 °F) inside, then let it rest for 3 minutes or more.

### Tips

- Buy the lamb once your numbers are final.
- The lamb and the potatoes both need oven space.
- Put out olives and bread while you finish cooking.
`
