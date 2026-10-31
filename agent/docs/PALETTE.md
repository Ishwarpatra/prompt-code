# PALETTE.md: Colour Palette from the Colour Wheel

> AGENT-ONLY. For agents and maintainers. Not part of the Prompt Code app: never import, bundle, or read this at runtime.

Status: prepared and measured. **Not applied.** No file in `static/` was changed. Applying it edits the audited UI, so it waits for the owner (see section 9).

Files: this document, `agent/reference/palette.html` (visual wheel, scales and tokens) and `agent/reference/palette-tokens.css` (drop-in tokens).

## 1. The idea in one paragraph
The UI already uses a **complementary scheme**. The accent, yellow, sits at 50 degrees on the classic colour wheel (HSL). Its opposite is 230 degrees, a blue. The page greys are tinted toward that blue: measured at about 213 degrees, 17 degrees from the exact opposite. So the neutrals carry the complement quietly, and the yellow is the only warm, saturated note. That is why the page feels calm with one clear action colour. This palette formalises that: it builds full tonal scales around the same hues, spaces the status colours away from the accent, and measures every pairing the UI uses.

## 2. Where each colour sits on the wheel
Classic wheel = the RGB/HSL wheel (red at the top, 0 degrees, clockwise). Perceptual wheel = OKLCH hue, which spaces colours more evenly to the eye. Both are given.

| Family | Role | Anchor | Classic hue | Perceptual hue |
|---|---|---|---|---|
| Neutral | Ground, panels, text, borders. Tinted toward the complement so greys belong to the scheme | #7C8590 (step 500) | 213 | 253 |
| Accent (yellow) | The one action colour: Convert button and selected options | #FFD400 (step 400) | 50 | 94 |
| Secondary (complement) | Reserved. Not used in the UI today. For links or info if ever needed | #7183F5 (step 500) | 232 | 274 |
| Success | Success messages only, always with an icon and words | #3AA85B (step 500) | 138 | 150 |
| Warning | Warning messages only, always with an icon and words | #CA7900 (step 500) | 36 | 65 |
| Danger | Errors and delete actions, always with words | #EC544B (step 500) | 3 | 27 |

Notes:
- Accent and secondary are exact opposites on the perceptual wheel (94 and 274 degrees).
- Neutrals use hue 253 (the measured average of today's greys), within about 21 degrees of the accent's opposite.
- Status hues are spaced away from the accent on the perceptual wheel: danger 27, warning 65, accent 94, success 150.
- On the classic wheel the amber warning (36 degrees) sits only 14 degrees from the accent (50). They never do the same job: the accent marks actions; amber appears only inside warning messages, with an icon and words.
- Today the warning tint is yellow, the same family as the accent. This palette moves it to a peach tint so a warning cannot be mistaken for the action colour.

## 3. Rules that keep it standard
- 60 / 30 / 10 by area, roughly: about 60 percent ground and panels, about 30 percent ink, text and rules, about 10 percent accent and status.
- One accent. Yellow is used for the primary action and the selected option only. Anything else yellow is a defect.
- Secondary (the complement) is reserved. If used, it counts as a core colour under R-29 (2 to 3 core colours plus 1 accent; neutrals do not count).
- Status colours are functional, used only in message boxes and delete actions, and always with an icon and words. Colour never carries meaning alone.
- Text pairs are measured at 4.5:1 or better; borders and focus rings at 3:1 or better.
- Dark theme swaps the scale ends: ground becomes neutral 950, text neutral 100. The accent stays the same yellow in both themes, with the same dark text on it.

## 4. The scales
Eleven steps from light (50) to dark (950), equal in perceived lightness across families. Out-of-range colours were reduced in chroma until they fit the screen. The yellow scale turns olive in its dark steps because yellow cannot be dark and bright at once; those steps are rarely needed.

### Neutral
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| #F9FAFC | #F3F5F7 | #E5E8EC | #D5D9DE | #AAB2BB | #7C8590 | #616A74 | #49515C | #323940 | #20242A | #13161A |

### Accent (yellow)
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| #FFFAE9 | #FFF5D3 | #FFEDAD | #FFE279 | #FFD400 | #D9B400 | #B59600 | #8E7500 | #695600 | #4A3C00 | #2F2600 |

### Secondary (complement)
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| #F2F5FF | #E5EAFF | #CFD9FF | #B2C0FF | #91A3FF | #7183F5 | #5867D6 | #434FAD | #303981 | #1F2557 | #101533 |

### Success
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| #E8FBEB | #D5F5DA | #B6EABF | #8FD89E | #62C37A | #3AA85B | #218A45 | #146D34 | #085023 | #093517 | #041E0B |

### Warning
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| #FFF3E8 | #FFE6D0 | #FFD1A5 | #FFB160 | #EE921A | #CA7900 | #A66200 | #824C00 | #613700 | #412300 | #271300 |

### Danger
| 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|
| #FFF2F0 | #FFE4E0 | #FFCDC6 | #FFABA1 | #FF7F73 | #EC544B | #CC3430 | #A12623 | #791A18 | #520E0C | #320605 |

## 5. Semantic tokens
Names match `css/style.css` so the block can replace the current one.

| Token | Light | Dark | From (light / dark) |
|---|---|---|---|
| `--ground` | #F3F5F7 | #13161A | neutral 100 / neutral 950 |
| `--panel` | #FFFFFF | #20242A | white / neutral 900 |
| `--ink` | #13161A | #F3F5F7 | neutral 950 / neutral 100 |
| `--muted` | #49515C | #AAB2BB | neutral 700 / neutral 400 |
| `--line` | #D5D9DE | #323940 | neutral 300 / neutral 800 |
| `--line-strong` | #7C8590 | #7C8590 | neutral 500 / neutral 500 |
| `--accent` | #FFD400 | #FFD400 | accent 400 / accent 400 |
| `--accent-ink` | #13161A | #13161A | neutral 950 / neutral 950 |
| `--focus` | #13161A | #FFD400 | neutral 950 / accent 400 |
| `--ok-bg` | #D5F5DA | #041E0B | success 100 / success 950 |
| `--warn-bg` | #FFE6D0 | #271300 | warning 100 / warning 950 |
| `--err-bg` | #FFE4E0 | #320605 | danger 100 / danger 950 |
| `--danger-text` | #A12623 | #FFABA1 | danger 700 / danger 300 |

## 6. Contrast, measured
Every row was computed with the WCAG formula and re-checked with the antislop-human `contrast-check.py`; both agree to two decimals. Text needs 4.5:1; borders and rings need 3:1.

### Light theme
| Pairing | Colours | Ratio | Needs | Result |
|---|---|---|---|---|
| ink on ground | #13161A on #F3F5F7 | 16.60:1 | 4.5:1 | Pass |
| ink on panel | #13161A on #FFFFFF | 18.14:1 | 4.5:1 | Pass |
| muted on ground | #49515C on #F3F5F7 | 7.35:1 | 4.5:1 | Pass |
| muted on panel (placeholder) | #49515C on #FFFFFF | 8.03:1 | 4.5:1 | Pass |
| accent-ink on accent (button) | #13161A on #FFD400 | 12.67:1 | 4.5:1 | Pass |
| ink on ok tint | #13161A on #D5F5DA | 15.47:1 | 4.5:1 | Pass |
| ink on warning tint | #13161A on #FFE6D0 | 15.10:1 | 4.5:1 | Pass |
| ink on error tint | #13161A on #FFE4E0 | 15.06:1 | 4.5:1 | Pass |
| danger text on panel | #A12623 on #FFFFFF | 7.45:1 | 4.5:1 | Pass |
| input border vs panel | #7C8590 on #FFFFFF | 3.74:1 | 3:1 | Pass |
| input border vs ground | #7C8590 on #F3F5F7 | 3.42:1 | 3:1 | Pass |
| focus ring vs ground | #13161A on #F3F5F7 | 16.60:1 | 3:1 | Pass |
| focus ring vs panel | #13161A on #FFFFFF | 18.14:1 | 3:1 | Pass |
| chip border (ink) vs ground | #13161A on #F3F5F7 | 16.60:1 | 3:1 | Pass |

### Dark theme
| Pairing | Colours | Ratio | Needs | Result |
|---|---|---|---|---|
| ink on ground | #F3F5F7 on #13161A | 16.60:1 | 4.5:1 | Pass |
| ink on panel | #F3F5F7 on #20242A | 14.26:1 | 4.5:1 | Pass |
| muted on ground | #AAB2BB on #13161A | 8.46:1 | 4.5:1 | Pass |
| muted on panel (placeholder) | #AAB2BB on #20242A | 7.27:1 | 4.5:1 | Pass |
| accent-ink on accent (button) | #13161A on #FFD400 | 12.67:1 | 4.5:1 | Pass |
| ink on ok tint | #F3F5F7 on #041E0B | 16.07:1 | 4.5:1 | Pass |
| ink on warning tint | #F3F5F7 on #271300 | 16.29:1 | 4.5:1 | Pass |
| ink on error tint | #F3F5F7 on #320605 | 16.51:1 | 4.5:1 | Pass |
| danger text on panel | #FFABA1 on #20242A | 8.60:1 | 4.5:1 | Pass |
| input border vs panel | #7C8590 on #20242A | 4.17:1 | 3:1 | Pass |
| input border vs ground | #7C8590 on #13161A | 4.85:1 | 3:1 | Pass |
| focus ring vs ground | #FFD400 on #13161A | 12.67:1 | 3:1 | Pass |
| focus ring vs panel | #FFD400 on #20242A | 10.89:1 | 3:1 | Pass |
| chip border (ink) vs ground | #F3F5F7 on #13161A | 16.60:1 | 3:1 | Pass |

## 7. Other harmonies, for comparison
These use the same method with a different relationship to the yellow accent. They are here so the choice is a choice. The recommended scheme is the first.

| Scheme | Hues (perceptual) | Companion colours (light, deep) | When it fits |
|---|---|---|---|
| Complementary (recommended; what the UI uses) | 94, 274 | 274: #CBD5FF, #5664D3 | Yellow with its opposite. The opposite is carried by tinted neutrals, so the page stays calm and the accent pops. |
| Split-complementary | 94, 244, 304 | 244: #B5DDFF, #0077BA; 304: #E2CCFF, #8851C0 | Yellow with the two colours beside its opposite. More variety, still balanced; needs a rule for the second colour. |
| Analogous | 64, 94, 124 | 64: #FFCC9E, #A35F00; 124: #C0EA61, #617E00 | Amber, yellow, lime. Harmonious but low contrast between roles; hard to make the action stand out. |
| Triadic | 94, 214, 334 | 214: #86E9FF, #007F94; 334: #FFC0F2, #A9429A | Yellow, cyan-blue, magenta. Lively; the three compete, so two would have to stay very small. |

Whichever scheme is chosen, keep the same discipline: tint the neutrals toward the opposite of the accent, space the status hues away from the accent, and measure every pairing.

## 8. What changes if applied
Almost nothing in light theme: the neutral scale reproduces today's greys to within 1 to 2 units per channel.

| Token | Today | Palette |
|---|---|---|
| `--ink` (light) | #14161A | #13161A |
| `--muted` (light) | #4A515C | #49515C |
| `--line-strong` (light) | #7C858F | #7C8590 |
| `--ground` (light) | #F3F5F7 | #F3F5F7 |
| `--line` (light) | #D5D9DE | #D5D9DE |
| `--warn-bg` (light) | #FFF1C2 | #FFE6D0 |
| `--ok-bg` (light) | #DDF3E8 | #D5F5DA |
| `--err-bg` (light) | #FFDAD6 | #FFE4E0 |
| `--ground` (dark) | #0F1215 | #13161A |
| `--panel` (dark) | #171B1F | #20242A |
| `--ink` (dark) | #EEF0F2 | #F3F5F7 |
| `--muted` (dark) | #A5ADB8 | #AAB2BB |
| `--ok-bg` (dark) | #12301F | #041E0B |
| `--warn-bg` (dark) | #3A3009 | #271300 |
| `--err-bg` (dark) | #3F1612 | #320605 |

Visible changes: the warning tint becomes peach (light) and a brown-black (dark), the dark panels are a little lighter, and the dark status backgrounds are darker and less saturated. A `--danger-text` token is added so the delete button and field errors no longer hard-code red.

## 9. How to apply (owner decision)
1. Say "apply the palette". That edits `static/css/style.css`: the colour lines in the two token blocks are replaced by those in `agent/reference/palette-tokens.css` (the font and width tokens `--display`, `--sans`, `--mono`, `--max` stay), and the hard-coded reds in `.btn-danger` and `.field-error` switch to `--danger-text`.
2. The static tests in `tests/ui` read `--muted`, `--panel`, `--ink` and `--ground` from the stylesheet and re-check contrast, so the new values are tested automatically. The simulated-browser tests are unaffected.
3. Already tried on a throwaway copy: no token is left undefined, and all 11 static checks pass with the new colours. Not tried: a real browser.
4. Look at both themes in a real browser (audit finding 8). Colour is the part of this work no script can judge by eye.

If the logo or brand colour changes (audit finding 3), regenerate: keep the neutral hue within about 20 degrees of the accent's opposite, space the status hues at least 25 degrees from the accent, and measure again.

## 10. Method
Colours were generated in OKLCH (perceptually even lightness), reduced in chroma until inside the sRGB range, and rounded to hex. The yellow anchor #FFD400 is exact. Contrast uses the WCAG 2.x relative-luminance formula. Nothing here was judged by eye on a screen.
