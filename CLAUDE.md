# Second Spring — instructions for Claude Code

Second Spring is a browser board game (a Terraforming Mars spin-off about restoring a ruined valley).
Plain HTML/CSS/JavaScript, no build step, no frameworks. The owner (Samuli) is a beginner: explain steps simply.

## How we work: design in Project chats, build in Claude Code

1. **Design happens in the Claude Project chats** ("Second Spring" project). There we brainstorm and decide:
   new cards, rules, balance, layouts, artwork ideas.
2. **When a design is decided**, the Project chat writes an **Implementation brief** (format below).
   Samuli pastes it into Claude Code, or saves it as a file in `designs/` and points Claude Code to it.
3. **Claude Code implements exactly what the brief says** — nothing more.
   If the brief is unclear, contradicts the current code, or would need extra changes to work,
   **ask before building** instead of guessing or redesigning.
4. Design questions that come up while coding (balance, look, new rules) go back to the Project chat.
   Claude Code may point them out, but does not decide them alone.

### Implementation brief format
```
## Implementation brief: <short title>
Goal: <one or two sentences>
Changes:
- <each concrete change: what, where it shows, how it behaves>
Not changing: <anything that must stay as it is>
Done when: <how to check it works>
```

## Learning while building

Samuli is a beginner and wants to **learn** through this project, not just get finished code.
- **Explain as you go:** say in plain words what you are changing and why, and name the concept
  (e.g. "this is an event listener", "this is a CSS grid"). Keep it short — one or two sentences per idea.
- **Ask him questions often** about what is being done, e.g.:
  - "Where in `game.js` do you think the score is calculated?" before showing it
  - "What do you expect will happen if we remove this line?"
  - "Which of these two ways would you pick, and why?"
- Ask at natural moments (before a change, after a change, when something new appears) — about one or two
  questions per task, not a quiz after every line. If he says he's in a hurry, skip the questions.
- When he answers, tell him what was right, gently correct what wasn't, and connect it to the code.
- Teach him the tools too: `git status` / `git diff`, the browser console (F12), reading error messages.

### Technical learning (coding and software in general)

Beyond this game, Samuli wants to **learn to code and understand how software works** in general.
- **Teach the underlying technology**, not just the fix: how JavaScript, HTML, CSS, the browser, HTTP,
  servers, JSON, git and the terminal actually work, at a beginner level. Use the change at hand as the example.
- **Show the "why"**: why code is structured a certain way, what the trade-offs are, and what a
  professional would do differently in a bigger project (frameworks, databases, testing, hosting).
- **Explain the tools and when to use them**: when a tool fits and when it doesn't (e.g. Python's
  `http.server` vs a real web server, Live Server vs `server.py`, Tailscale Funnel vs a hosting service,
  plain JS vs a framework like React, localStorage vs a database, Claude Code vs Project chats).
- **Ask technical questions too**, mixed with the game questions, e.g.:
  - "What do you think happens between pressing Join and seeing the lobby?"
  - "Why might this be a function instead of copying the code twice?"
  - "Which tool would you use for this, and why?"
- When a new concept appears, suggest one small thing he could try himself (change a value, add a
  `console.log`, read a line of code) so he learns by doing. Keep it optional and short.

## Standing rules (always)

1. **Do not change parts of the game that were not asked for.** No "while I'm here" clean-ups or redesigns.
2. **After every change, write a complete list of everything changed or added** — missing nothing.
   - Mark anything that was not explicitly asked for as **(extra)** and say why it was needed.
   - List exactly which files changed.
   - Remind Samuli to press **Ctrl+F5** in the browser to load the new version.
3. **Never `git commit` or `git push`.** Samuli makes all commits himself to learn git.
   Explaining git steps and showing `git status` / `git diff` is fine.
4. Keep the code easy to extend (e.g. adding cards or synergies should only need a new line of data).

## Files

| Path | What it is |
|---|---|
| `index.html` | Page shell, loads `style.css` and `game.js` |
| `style.css` | All styling |
| `game.js` | All game logic, card list, rendering, bots, online client |
| `server.py` | Small Python server: serves the files + online lobbies (standard library only) |
| `cards/` | Card pictures, named `<card-name-in-kebab-case>.png`, about 560×420 px. Missing pictures fall back to a scene background |
| `corps/` | Corporation logos (`<name>.png`) and text-free icons (`<name>-icon.png`) |
| `tile-art/`, `tile-art/props/` | Board tile pictures (about 160 px wide) and the clay ground texture |
| `ui/` | Interface art; `ui/syn/<key>.svg` = synergy symbols; `ui/card-bg-*.jpg` = card scene backgrounds |
| `resources/` | Resource icons |
| `background.jpg` | Page background (`background.png` is the larger original, not used by the game) |

Keep pictures small: about 2× the size they appear on screen. Friends load everything over the owner's home upload.

## Game facts (current)

- **Board:** 61-hex honeycomb, 8 ruins at the start. Tiles: Forest, Wetland, Settlement, Fusion Plant,
  Wildlife Corridor. Tiles are permanent (only ruins can be cleared). A Settlement can't be next to another Settlement.
- **Tracks:** CO₂ 14 → 0, Soil 0 → 14 %, Wetlands 0 → 9. Each step = +1 TR. Score counts TR above 10 (`TR0`).
  All three full, or generation 15, ends the game.
- **Resources:** Credits, Salvage, Rare minerals, Seeds, Fusion Cells, Biochar (Fusion Cells become Biochar at income).
  Standard projects: Forest (8 Seeds), Soil (8 Biochar).
- **Cards:** 220 cards — 115 Build, 63 Active, 42 Event. Everyone starts with 8; each generation you see 5 and keep 3;
  unkept cards go to a discard pile that is reshuffled into the deck. No hand limit.
- **Synergies** are the only card categories: Industry (Salvage pays 2 Cr), Engine (Rare mineral pays 3 Cr),
  Science, Recycling (all ruin clearing), Power (all Fusion Plant placing), Fusion Cell, Soil, Clean Air,
  Wildlife (all Corridor placing), Settlement (every Settlement card places a Settlement, nothing else does).
- **Card data** lives in `CARDS` in `game.js`, one card per line:
  `name|cost|type|synergies|requirement|effects|flavour`. The effect codes are explained in the comment
  right above `CARDS` — read it before adding or changing cards.
- **Corporations** each bend one rule (e.g. Vireo Seed Bank: Seeds pay 2 Cr for Soil cards).
- **Bots** are simple but fair; they must understand any new effect that gets added.

## Running and testing

- **Local:** VS Code Live Server on `index.html`, or `py server.py` in this folder → http://localhost:8000
- **Online with friends:**
  1. `robocopy C:\programming\SecondSpring C:\SecondSpringPublic /MIR /XD .git designs /XF CLAUDE.md`
  2. In `C:\SecondSpringPublic`: `py server.py`
  3. In a second window: `tailscale funnel 8000` and share the `https://….ts.net` link
- After changing game logic, test a full game (solo with bots) and check the browser console (F12) for errors.
- `server.py` must never serve `.py` files or hidden folders, and keeps its limits (40 rooms, 4 players, 1 MB requests).
