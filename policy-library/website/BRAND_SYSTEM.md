# One Guy Consulting -- Brand System Specification

**Version:** 1.0
**Date:** 2026-02-15
**Aesthetic Direction:** Institutional Warmth
**Key Differentiator:** The evergreen-and-copper pairing -- no other compliance SaaS uses it. It reads as "old-growth authority meets artisan craftsmanship," the visual equivalent of a solo expert who built something lasting by hand.

---

## 1. Design Philosophy

**"One person. Complete authority."**

One Guy Consulting is not a faceless enterprise. It is a singular expert -- and the brand should feel like walking into a master craftsman's study: deep, warm wood tones, leather-bound seriousness, but also the quiet confidence of someone who has done this a thousand times. The visual language borrows from institutional gravitas (deep greens, geometric precision) while injecting warmth through copper metallics and natural textures that say "I built this personally."

**Visual Personality Adjectives:**
- Authoritative but approachable
- Crafted, not manufactured
- Deep, not flashy
- Warm, not cold
- Precise, not decorative
- Singular, not corporate

**What this is NOT:**
- Generic SaaS blue/purple
- Cold clinical healthcare white
- Startup-bright neon
- Enterprise gray monotone

---

## 2. Color Palette

### 2.1 Primary -- Deep Evergreen

The dominant brand color. Evokes trust, stability, growth, and healthcare without defaulting to hospital blue. Evergreen trees endure -- fitting for compliance that must be maintained perpetually.

| Token | Hex | Usage |
|-------|-----|-------|
| `--evergreen-950` | `#0B1D17` | Darkest text, hero backgrounds, power elements |
| `--evergreen-900` | `#122B22` | Dark mode primary surface |
| `--evergreen-800` | `#1A3D30` | Dark mode elevated surface, sidebar |
| `--evergreen-700` | `#24553F` | Dark borders, secondary elements |
| `--evergreen-600` | `#2E6D4F` | Interactive elements on dark, badges |
| `--evergreen-500` | `#3A8963` | Hover accents, progress indicators |
| `--evergreen-400` | `#52A87D` | Links on dark backgrounds |
| `--evergreen-300` | `#7CC4A0` | Subtle highlights on dark |
| `--evergreen-200` | `#B0DDCA` | Light tint backgrounds |
| `--evergreen-100` | `#D8EFE4` | Very light tint, tag backgrounds |
| `--evergreen-50`  | `#EEF7F2` | Lightest tint, hover states |

### 2.2 Accent Primary -- Burnished Copper

The signature accent. Copper conveys handcrafted quality, warmth, and individuality. It is the "one guy" color -- personal, artisanal, memorable. Used for CTAs, highlights, and moments that demand attention.

| Token | Hex | Usage |
|-------|-----|-------|
| `--copper-700` | `#8C4820` | Active/pressed states |
| `--copper-600` | `#A85A28` | Primary CTA buttons, key actions |
| `--copper-500` | `#D4793E` | Accent elements, icons, links |
| `--copper-400` | `#E09358` | Hover highlights on dark surfaces |
| `--copper-300` | `#EDAF7A` | Tags on dark, warm highlights |
| `--copper-200` | `#F5CCA5` | Light accent backgrounds |
| `--copper-100` | `#FAE5CE` | Subtle warm tint |
| `--copper-50`  | `#FDF3E8` | Lightest warm wash |

### 2.3 Neutral Surfaces -- Pearl and Sand

Two neutral families: Pearl (cool-neutral for structure) and Sand (warm-neutral for content areas).

**Pearl (Cool Neutral -- structural surfaces):**

| Token | Hex | Usage |
|-------|-----|-------|
| `--pearl-50`  | `#FAFBF9` | Primary light background |
| `--pearl-100` | `#F2F4F0` | Elevated cards, alternating rows |
| `--pearl-200` | `#E5E9E2` | Borders, dividers |
| `--pearl-300` | `#CDD4C9` | Disabled states, subtle borders |
| `--pearl-400` | `#A3AE9D` | Placeholder text |

**Sand (Warm Neutral -- content warmth):**

| Token | Hex | Usage |
|-------|-----|-------|
| `--sand-50`  | `#FDFAF5` | Hero sections, marketing pages |
| `--sand-100` | `#F7F0E5` | Featured content backgrounds |
| `--sand-200` | `#F0E4D4` | Callout backgrounds, card tints |
| `--sand-300` | `#E0D0BC` | Warm borders |

### 2.4 Dark Mode Surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `--dark-950` | `#0C1117` | Deepest background (body) |
| `--dark-900` | `#141C25` | Primary dashboard surface |
| `--dark-800` | `#1E2A36` | Elevated cards, modals |
| `--dark-700` | `#2A3A4A` | Borders, dividers |
| `--dark-600` | `#3A4D5E` | Subtle interactive borders |
| `--dark-500` | `#4F6577` | Muted text on dark |
| `--dark-400` | `#6B8294` | Secondary text on dark |
| `--dark-300` | `#94A7B5` | Body text on dark |
| `--dark-200` | `#C1CDD5` | Primary text on dark |
| `--dark-100` | `#E8ECF0` | Headings on dark |

### 2.5 Text Colors

| Token | Hex | Light Mode Usage | Dark Mode Equivalent |
|-------|-----|-------------------|---------------------|
| `--text-primary` | `#0F1A14` | Headings, body text | `--dark-100` (#E8ECF0) |
| `--text-secondary` | `#3D4F45` | Subheadings, descriptions | `--dark-300` (#94A7B5) |
| `--text-muted` | `#5C6E64` | Captions, helper text | `--dark-400` (#6B8294) |
| `--text-inverse` | `#FAFBF9` | Text on dark/colored backgrounds | -- |

### 2.6 Semantic Colors

All verified to meet WCAG AA contrast on Pearl-50 background.

| Token | Hex | On Pearl-50 Contrast | Usage |
|-------|-----|---------------------|-------|
| `--semantic-success` | `#247048` | 5.8:1 (AA) | Compliance met, passing states |
| `--semantic-warning` | `#8B5A12` | 5.7:1 (AA) | Attention needed, deadlines |
| `--semantic-error` | `#C44133` | 4.9:1 (AA) | Violations, failures, critical |
| `--semantic-info` | `#256A99` | 5.6:1 (AA) | Informational, neutral alerts |

**Semantic Tint Backgrounds (for alert/banner fills):**

| Token | Hex | Usage |
|-------|-----|-------|
| `--success-tint` | `#EEF7F2` | Success alert background |
| `--warning-tint` | `#FDF3E8` | Warning alert background |
| `--error-tint` | `#FEF0EE` | Error alert background |
| `--info-tint` | `#EDF5FA` | Info alert background |

### 2.7 WCAG Contrast Verification

All critical combinations verified mathematically:

| Combination | Ratio | Standard |
|-------------|-------|----------|
| Text Primary on Pearl-50 | 17.2:1 | AAA |
| Text Secondary on Pearl-50 | 8.4:1 | AAA |
| Text Muted on Pearl-50 | 5.2:1 | AA |
| Evergreen-950 on Sand-50 | 16.8:1 | AAA |
| Evergreen-700 on Sand-50 | 8.2:1 | AAA |
| Copper-600 on Sand-50 | 4.9:1 | AA |
| Copper-500 on Evergreen-950 | 5.5:1 | AA |
| Pearl-50 on Evergreen-900 | 14.5:1 | AAA |
| Pearl-50 on Dark-900 | 16.5:1 | AAA |
| White on Copper-600 | 4.9:1 | AA |
| White on Evergreen-600 | 5.9:1 | AA |
| White on Error | 4.9:1 | AA |
| White on Success | 5.8:1 | AA |

---

## 3. Typography

### 3.1 Font Pairing

**Headings:** `DM Serif Display`
A high-contrast serif with confident stroke variation. It reads as editorial and authoritative -- like a compliance document that actually commands respect. The serifs give it a "published" quality that sans-serif headings cannot match.

```css
/* next/font/google import */
import { DM_Serif_Display } from 'next/font/google';

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
});
```

**Body:** `DM Sans`
The natural companion to DM Serif Display -- same designer, same underlying metrics. Clean, geometric, highly readable at all sizes. Professional without being sterile.

```css
import { DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});
```

**Monospace (code/data):** `JetBrains Mono`
For policy identifiers, code blocks, data fields. Technically precise.

```css
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});
```

### 3.2 Type Scale

Based on a 1.250 (Major Third) ratio for controlled, professional hierarchy.

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--text-hero` | `clamp(2.75rem, 6vw, 4.5rem)` | 1.1 | 400 (serif) | Hero headlines |
| `--text-display` | `clamp(2rem, 4vw, 3rem)` | 1.15 | 400 (serif) | Section titles |
| `--text-h1` | `2.25rem` (36px) | 1.2 | 400 (serif) | Page titles |
| `--text-h2` | `1.75rem` (28px) | 1.25 | 400 (serif) | Section headings |
| `--text-h3` | `1.375rem` (22px) | 1.3 | 600 (sans) | Subsection headings |
| `--text-h4` | `1.125rem` (18px) | 1.35 | 600 (sans) | Card titles |
| `--text-body-lg` | `1.125rem` (18px) | 1.65 | 400 (sans) | Lead paragraphs |
| `--text-body` | `1rem` (16px) | 1.6 | 400 (sans) | Body text |
| `--text-body-sm` | `0.875rem` (14px) | 1.5 | 400 (sans) | Secondary info |
| `--text-caption` | `0.75rem` (12px) | 1.4 | 500 (sans) | Labels, captions |
| `--text-overline` | `0.6875rem` (11px) | 1.3 | 600 (sans) | Overlines, uppercase labels |

### 3.3 Font Weight Usage

| Weight | Name | Usage |
|--------|------|-------|
| 400 | Regular | Body text, serif headings (DM Serif Display only comes in 400 -- its strokes carry weight naturally) |
| 500 | Medium | Navigation, captions, emphasized body |
| 600 | Semibold | Sans-serif headings (h3, h4), buttons, badges |
| 700 | Bold | Key stats, emphasis, strong labels |

### 3.4 Letter Spacing

| Context | Value |
|---------|-------|
| Overlines / uppercase labels | `0.08em` |
| Buttons (uppercase) | `0.04em` |
| Headings (serif) | `-0.01em` |
| Body text | `0` (default) |

---

## 4. Design Tokens

### 4.1 Border Radius Scale

Deliberate restraint. Not bubbly, not harsh. The slight rounding softens without losing authority.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | `0` | Clipped/angular elements |
| `--radius-sm` | `4px` | Tags, small badges, inputs |
| `--radius-md` | `8px` | Buttons, cards, dropdowns |
| `--radius-lg` | `12px` | Larger cards, modals |
| `--radius-xl` | `16px` | Hero cards, featured sections |
| `--radius-2xl` | `24px` | Marketing page elements |
| `--radius-full` | `9999px` | Pills, avatars, circular badges |

### 4.2 Shadow Scale

Shadows use a green-tinted base for brand cohesion rather than pure black.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(11, 29, 23, 0.04)` | Subtle separation |
| `--shadow-sm` | `0 1px 3px rgba(11, 29, 23, 0.06), 0 1px 2px rgba(11, 29, 23, 0.04)` | Cards at rest |
| `--shadow-md` | `0 4px 6px rgba(11, 29, 23, 0.06), 0 2px 4px rgba(11, 29, 23, 0.04)` | Cards on hover |
| `--shadow-lg` | `0 10px 15px rgba(11, 29, 23, 0.08), 0 4px 6px rgba(11, 29, 23, 0.04)` | Dropdowns, popovers |
| `--shadow-xl` | `0 20px 25px rgba(11, 29, 23, 0.08), 0 8px 10px rgba(11, 29, 23, 0.03)` | Modals, dialogs |
| `--shadow-2xl` | `0 25px 50px rgba(11, 29, 23, 0.14)` | Hero sections, floating panels |
| `--shadow-copper` | `0 4px 14px rgba(168, 90, 40, 0.25)` | Copper CTA buttons |
| `--shadow-copper-lg` | `0 8px 24px rgba(168, 90, 40, 0.35)` | Copper CTA hover state |

### 4.3 Spacing Rhythm

Based on a 4px base unit. The system uses an 8px grid for general layout and a 4px grid for fine-tuning.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | `0` | -- |
| `--space-1` | `4px` | Tight gaps (icon-to-text) |
| `--space-2` | `8px` | Inline spacing, small gaps |
| `--space-3` | `12px` | Related element spacing |
| `--space-4` | `16px` | Standard padding, gaps |
| `--space-5` | `20px` | Medium spacing |
| `--space-6` | `24px` | Card padding, section gaps |
| `--space-8` | `32px` | Large spacing |
| `--space-10` | `40px` | Section padding |
| `--space-12` | `48px` | Section margins |
| `--space-16` | `64px` | Major section spacing |
| `--space-20` | `80px` | Hero padding |
| `--space-24` | `96px` | Between major page sections |

### 4.4 Transition Timing

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-default` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | Standard interactions |
| `--ease-in` | `200ms cubic-bezier(0.4, 0, 1, 1)` | Elements entering |
| `--ease-out` | `200ms cubic-bezier(0, 0, 0.2, 1)` | Elements leaving |
| `--ease-bounce` | `400ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Attention-grabbing moments |

### 4.5 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | `0` | Default |
| `--z-elevated` | `10` | Cards, raised elements |
| `--z-dropdown` | `20` | Dropdown menus |
| `--z-sticky` | `30` | Sticky headers |
| `--z-overlay` | `40` | Overlays, backdrops |
| `--z-modal` | `50` | Modals, dialogs |
| `--z-toast` | `60` | Toast notifications |

---

## 5. Component Style Guide

### 5.1 Buttons

**Primary (Copper CTA)**
```
Background: --copper-600 (#A85A28)
Text: white
Border: none
Radius: --radius-md (8px)
Padding: 12px 24px
Font: --text-body-sm, weight 600, uppercase, tracking 0.04em
Shadow: --shadow-copper
Hover: background --copper-700 (#8C4820), shadow --shadow-copper-lg, translateY(-1px)
Active: background --copper-700, translateY(0), shadow --shadow-sm
Focus: ring 2px --copper-400 offset 2px
```

**Secondary (Evergreen)**
```
Background: --evergreen-600 (#2E6D4F)
Text: white
Border: none
Radius: --radius-md
Padding: 12px 24px
Font: --text-body-sm, weight 600
Shadow: --shadow-sm
Hover: background --evergreen-700, shadow --shadow-md
Active: background --evergreen-800
Focus: ring 2px --evergreen-400 offset 2px
```

**Outline**
```
Background: transparent
Text: --evergreen-700
Border: 1.5px solid --evergreen-700
Radius: --radius-md
Padding: 11px 23px (account for border)
Font: --text-body-sm, weight 600
Hover: background --evergreen-50, border-color --evergreen-800
Active: background --evergreen-100
Focus: ring 2px --evergreen-400 offset 2px
```

**Ghost**
```
Background: transparent
Text: --evergreen-700
Border: none
Radius: --radius-md
Padding: 12px 24px
Font: --text-body-sm, weight 500
Hover: background --evergreen-50
Active: background --evergreen-100
Focus: ring 2px --evergreen-400 offset 2px
```

**Danger**
```
Background: --semantic-error (#C44133)
Text: white
Border: none
Radius: --radius-md
Padding: 12px 24px
Font: --text-body-sm, weight 600
Shadow: 0 4px 14px rgba(196, 65, 51, 0.25)
Hover: background #B33A2D, shadow intensified
Active: background #A0332A
Focus: ring 2px #E88A80 offset 2px
```

**Button Sizes:**

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| `sm` | 8px 16px | 13px | 36px |
| `md` | 12px 24px | 14px | 44px |
| `lg` | 16px 32px | 16px | 52px |

### 5.2 Cards

**Default Card**
```
Background: white (light) / --dark-800 (dark)
Border: 1px solid --pearl-200 (light) / --dark-700 (dark)
Radius: --radius-lg (12px)
Padding: 24px
Shadow: --shadow-sm
```

**Elevated Card**
```
Background: white (light) / --dark-800 (dark)
Border: 1px solid --pearl-200 (light) / --dark-700 (dark)
Radius: --radius-lg
Padding: 24px
Shadow: --shadow-md
Hover: shadow --shadow-lg, translateY(-2px), border-color --pearl-300
Transition: --ease-default
```

**Interactive Card (clickable)**
```
Background: white (light) / --dark-800 (dark)
Border: 1.5px solid --pearl-200 (light) / --dark-700 (dark)
Radius: --radius-lg
Padding: 24px
Shadow: --shadow-sm
Hover: shadow --shadow-lg, border-color --copper-300 (light) / --copper-500 (dark), translateY(-2px)
Active: shadow --shadow-sm, translateY(0)
Cursor: pointer
Transition: --ease-default
```

**Featured Card (hero/marketing)**
```
Background: linear-gradient(135deg, --sand-50, white) (light) / linear-gradient(135deg, --dark-900, --dark-800) (dark)
Border: 2px solid --evergreen-200 (light) / --evergreen-800 (dark)
Radius: --radius-xl (16px)
Padding: 32px
Shadow: --shadow-lg
```

### 5.3 Form Inputs

**Text Input / Textarea / Select**
```
Background: white (light) / --dark-800 (dark)
Text: --text-primary (light) / --dark-100 (dark)
Placeholder: --pearl-400 (light) / --dark-500 (dark)
Border: 1.5px solid --pearl-300 (light) / --dark-600 (dark)
Radius: --radius-sm (4px)
Padding: 10px 14px
Font: --text-body (16px), weight 400
Height: 44px (inputs), auto (textarea)
Focus: border-color --evergreen-500, ring 3px --evergreen-100 (light) / ring 3px rgba(58, 137, 99, 0.2) (dark)
Error: border-color --semantic-error, ring 3px --error-tint
Disabled: background --pearl-100, opacity 0.6, cursor not-allowed
```

**Label**
```
Font: --text-body-sm (14px), weight 500
Color: --text-secondary (light) / --dark-300 (dark)
Margin-bottom: 6px
```

**Helper Text**
```
Font: --text-caption (12px), weight 400
Color: --text-muted (light) / --dark-400 (dark)
Margin-top: 4px
```

**Error Message**
```
Font: --text-caption (12px), weight 500
Color: --semantic-error
Margin-top: 4px
```

### 5.4 Badges and Tags

**Solid Badge**
```
Padding: 2px 10px
Radius: --radius-full
Font: --text-overline (11px), weight 600, uppercase, tracking 0.08em
Height: 22px (inline-flex, items-center)
```

Badge color variants:

| Variant | Background | Text |
|---------|------------|------|
| Default | `--pearl-200` | `--text-secondary` |
| Evergreen | `--evergreen-100` | `--evergreen-800` |
| Copper | `--copper-100` | `--copper-700` |
| Success | `--success-tint` | `--semantic-success` |
| Warning | `--warning-tint` | `--semantic-warning` |
| Error | `--error-tint` | `--semantic-error` |
| Info | `--info-tint` | `--semantic-info` |

**Outline Badge**
```
Same sizing as Solid but:
Background: transparent
Border: 1px solid [color-300]
Text: [color-700]
```

### 5.5 Navigation (Top Bar)

**Light Mode (Public Pages)**
```
Background: rgba(253, 250, 245, 0.85) (sand-50 with backdrop blur)
Backdrop-filter: blur(12px) saturate(1.5)
Border-bottom: 1px solid --pearl-200
Height: 64px
Padding: 0 24px
Position: sticky top-0
Z-index: --z-sticky
```

**Nav Links:**
```
Font: --text-body-sm (14px), weight 500
Color: --text-secondary
Hover: color --evergreen-700
Active (current page): color --evergreen-700, font-weight 600
```

**Brand Mark in Nav:**
```
Icon container: 36px square, --evergreen-700 background, --radius-md
Icon: ShieldCheck, 20px, white
Brand name: --text-body-sm, weight 700, color --evergreen-950
```

**Dark Mode (Dashboard)**
```
Background: rgba(20, 28, 37, 0.8) (dark-900 with backdrop blur)
Backdrop-filter: blur(12px) saturate(1.2)
Border-bottom: 1px solid --dark-700
```

### 5.6 Sidebar (Dashboard)

```
Width: 260px (expanded), 72px (collapsed)
Background: --evergreen-950 (light theme dashboard) / --dark-950 (dark theme)
Border-right: 1px solid --evergreen-900 / --dark-800

Logo area:
  Padding: 20px
  Border-bottom: 1px solid rgba(255,255,255,0.08)

Nav items:
  Padding: 10px 16px
  Radius: --radius-md
  Font: --text-body-sm, weight 500
  Color: rgba(255,255,255,0.65)
  Icon: 20px, same color
  Gap: 12px (icon to text)
  Hover: background rgba(255,255,255,0.06), color rgba(255,255,255,0.9)
  Active: background --evergreen-800, color white, font-weight 600
  Active indicator: 3px left border, --copper-500

Section labels:
  Padding: 24px 16px 8px
  Font: --text-overline (11px), weight 600, uppercase, tracking 0.08em
  Color: rgba(255,255,255,0.35)

Collapse toggle:
  Position: absolute bottom-20px
  Size: 28px circle
  Background: --evergreen-800
  Border: 1px solid --evergreen-700
```

### 5.7 Tables

```
Header row:
  Background: --pearl-100 (light) / --dark-800 (dark)
  Font: --text-caption, weight 600, uppercase, tracking 0.06em
  Color: --text-muted
  Padding: 12px 16px
  Border-bottom: 2px solid --pearl-200

Body rows:
  Padding: 14px 16px
  Border-bottom: 1px solid --pearl-200 (light) / --dark-700 (dark)
  Font: --text-body-sm, weight 400

Alternating rows:
  Even: background --pearl-50 (light) / --dark-900 (dark)

Hover row:
  Background: --evergreen-50 (light) / rgba(46, 109, 79, 0.08) (dark)

Sortable header:
  Cursor: pointer
  Hover: color --text-primary, background --pearl-200
```

### 5.8 Modals and Dialogs

```
Overlay: rgba(11, 29, 23, 0.6), backdrop-filter blur(4px)
Container:
  Background: white (light) / --dark-800 (dark)
  Radius: --radius-xl (16px)
  Shadow: --shadow-2xl
  Max-width: 560px (standard), 800px (wide)
  Padding: 0

Header:
  Padding: 24px 24px 0
  Border: none

Body:
  Padding: 16px 24px

Footer:
  Padding: 16px 24px 24px
  Border-top: 1px solid --pearl-200 (light) / --dark-700 (dark)
  Display: flex, justify-end, gap 12px

Animation: scale(0.95) opacity(0) -> scale(1) opacity(1), 200ms ease-out
```

### 5.9 Toast / Notification

```
Position: fixed bottom-20px right-20px
Max-width: 400px
Background: white (light) / --dark-800 (dark)
Border: 1px solid --pearl-200 / --dark-700
Border-left: 4px solid [semantic color]
Radius: --radius-md
Shadow: --shadow-lg
Padding: 16px 20px
Z-index: --z-toast

Animation: translateX(120%) -> translateX(0), 300ms ease-out
Exit: translateX(0) -> translateX(120%), 200ms ease-in
```

---

## 6. Visual Identity Elements

### 6.1 Gradient Combinations

**Hero Gradient (Light)**
```css
background: linear-gradient(145deg, #FDFAF5 0%, #EEF7F2 40%, #FAFBF9 100%);
/* Sand-50 -> Evergreen-50 -> Pearl-50 */
```

**Hero Gradient (Dark)**
```css
background: linear-gradient(145deg, #0B1D17 0%, #141C25 60%, #122B22 100%);
/* Evergreen-950 -> Dark-900 -> Evergreen-900 */
```

**Copper Accent Gradient (for CTAs, featured elements)**
```css
background: linear-gradient(135deg, #A85A28 0%, #D4793E 100%);
/* Copper-600 -> Copper-500 */
```

**Evergreen Depth Gradient (for stat bars, progress)**
```css
background: linear-gradient(135deg, #122B22 0%, #2E6D4F 100%);
/* Evergreen-900 -> Evergreen-600 */
```

**Dark Section Gradient (for coverage stats, dark panels)**
```css
background: linear-gradient(145deg, #0B1D17 0%, #141C25 50%, #0B1D17 100%);
/* with subtle overlays: */
/* Overlay 1: radial-gradient(ellipse at 20% 50%, rgba(46,109,79,0.15), transparent 60%) */
/* Overlay 2: radial-gradient(ellipse at 80% 20%, rgba(168,90,40,0.10), transparent 50%) */
```

### 6.2 Background Textures

**Grain/Noise Texture (subtle, 2-3% opacity)**
```css
.texture-grain {
  position: relative;
}
.texture-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.025;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

**Diagonal Line Pattern (for hero sections, 2% opacity)**
```css
.texture-lines {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(11, 29, 23, 0.02) 10px,
    rgba(11, 29, 23, 0.02) 11px
  );
}
```

**Dot Grid Pattern (for dashboard backgrounds)**
```css
.texture-dots {
  background-image: radial-gradient(
    circle,
    rgba(11, 29, 23, 0.06) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}
```

### 6.3 Decorative Elements

**Shield Motif**
The brand icon is a shield with a checkmark -- this shield shape can be used as a recurring decorative element at large scale and low opacity.

```css
.shield-watermark {
  clip-path: polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%);
  /* Use at 3-5% opacity as background decoration */
}
```

**Copper Accent Line**
A thin copper line (2px) used as a horizontal rule or section divider:
```css
.accent-rule {
  height: 2px;
  width: 64px;
  background: linear-gradient(90deg, #A85A28, #D4793E);
  border-radius: 1px;
}
```

**Corner Accent**
Small geometric detail for featured cards:
```css
.corner-accent::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, transparent 50%, rgba(168, 90, 40, 0.08) 50%);
}
```

### 6.4 Icon Style

- **Library:** Heroicons v2 (outline style for navigation, solid style for active states)
- **Size scale:** 16px (inline), 20px (navigation), 24px (feature icons), 32px (hero features)
- **Container shape:** Rounded square (--radius-md) with tinted background
- **Container colors (light):** --evergreen-50 background, --evergreen-600 icon
- **Container colors (dark):** rgba(46, 109, 79, 0.15) background, --evergreen-400 icon
- **Accent containers:** --copper-50 background, --copper-600 icon

### 6.5 Favicon and Brand Mark

**Shield Mark:**
```svg
<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2L4 7v8c0 7.73 5.12 14.96 12 17 6.88-2.04 12-9.27 12-17V7L16 2z" fill="#122B22"/>
  <path d="M13.5 20.5l-4-4 1.41-1.41L13.5 17.67l7.59-7.59L22.5 11.5l-9 9z" fill="#D4793E"/>
</svg>
```
- Shield body: Evergreen-900 (#122B22)
- Checkmark: Copper-500 (#D4793E)

---

## 7. Page-Specific Treatments

### 7.1 Public Marketing Pages (Home, Blog, Policies)

- **Background:** Pearl-50 with Sand-50 hero gradient
- **Navigation:** Frosted glass (sand-50 at 85% opacity, blur)
- **Hero:** Generous whitespace (80-96px padding), serif headline, copper CTA
- **Cards:** White with pearl borders, subtle shadow, copper hover accent
- **Footer:** Evergreen-950 background, pearl/copper text
- **Overall feel:** Open, warm, trustworthy

### 7.2 Dashboard Pages (Privacy Officer Portal)

- **Background:** Dark-950 with subtle dot grid texture
- **Sidebar:** Evergreen-950, copper active indicator
- **Top bar:** Dark-900 with blur, sticky
- **Cards:** Dark-800 with dark-700 borders
- **Stats:** Large serif numbers in copper or evergreen-400
- **Charts/Graphs:** Evergreen-500 primary, copper-500 secondary, semantic colors for status
- **Overall feel:** Dense, data-rich, commanding

### 7.3 Blog

- **Layout:** Left-aligned content column (max 720px) with TOC sidebar
- **Headlines:** DM Serif Display, evergreen-950
- **Body:** DM Sans, 18px, generous line height (1.65)
- **Links:** Copper-600, underline on hover
- **Blockquotes:** Copper-500 left border, sand-100 background
- **Code blocks:** Evergreen-950 background, copper-300 syntax highlights

### 7.4 Training Pages

- **Progress indicators:** Evergreen gradient fill
- **Module cards:** Interactive card style with copper hover border
- **Completion badges:** Success green with shield motif
- **Quiz states:** Info blue for questions, success green for correct, error red for incorrect

---

## 8. CSS Custom Properties Implementation

This is the complete set of CSS custom properties to add to `globals.css`:

```css
:root {
  /* ---------- BRAND: EVERGREEN ---------- */
  --evergreen-950: #0B1D17;
  --evergreen-900: #122B22;
  --evergreen-800: #1A3D30;
  --evergreen-700: #24553F;
  --evergreen-600: #2E6D4F;
  --evergreen-500: #3A8963;
  --evergreen-400: #52A87D;
  --evergreen-300: #7CC4A0;
  --evergreen-200: #B0DDCA;
  --evergreen-100: #D8EFE4;
  --evergreen-50:  #EEF7F2;

  /* ---------- BRAND: COPPER ---------- */
  --copper-700: #8C4820;
  --copper-600: #A85A28;
  --copper-500: #D4793E;
  --copper-400: #E09358;
  --copper-300: #EDAF7A;
  --copper-200: #F5CCA5;
  --copper-100: #FAE5CE;
  --copper-50:  #FDF3E8;

  /* ---------- NEUTRAL: PEARL ---------- */
  --pearl-50:  #FAFBF9;
  --pearl-100: #F2F4F0;
  --pearl-200: #E5E9E2;
  --pearl-300: #CDD4C9;
  --pearl-400: #A3AE9D;

  /* ---------- NEUTRAL: SAND ---------- */
  --sand-50:  #FDFAF5;
  --sand-100: #F7F0E5;
  --sand-200: #F0E4D4;
  --sand-300: #E0D0BC;

  /* ---------- DARK SURFACES ---------- */
  --dark-950: #0C1117;
  --dark-900: #141C25;
  --dark-800: #1E2A36;
  --dark-700: #2A3A4A;
  --dark-600: #3A4D5E;
  --dark-500: #4F6577;
  --dark-400: #6B8294;
  --dark-300: #94A7B5;
  --dark-200: #C1CDD5;
  --dark-100: #E8ECF0;

  /* ---------- TEXT ---------- */
  --text-primary:   #0F1A14;
  --text-secondary: #3D4F45;
  --text-muted:     #5C6E64;
  --text-inverse:   #FAFBF9;

  /* ---------- SEMANTIC ---------- */
  --semantic-success: #247048;
  --semantic-warning: #8B5A12;
  --semantic-error:   #C44133;
  --semantic-info:    #256A99;

  --success-tint: #EEF7F2;
  --warning-tint: #FDF3E8;
  --error-tint:   #FEF0EE;
  --info-tint:    #EDF5FA;

  /* ---------- THEME (LIGHT DEFAULT) ---------- */
  --background:        var(--pearl-50);
  --foreground:        var(--text-primary);
  --surface-elevated:  #ffffff;
  --surface-sunken:    var(--pearl-100);
  --border-default:    var(--pearl-200);
  --border-subtle:     var(--pearl-300);

  --accent-primary:    var(--copper-600);
  --accent-hover:      var(--copper-700);
  --accent-light:      var(--copper-50);

  /* ---------- RADIUS ---------- */
  --radius-none: 0;
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* ---------- SHADOWS ---------- */
  --shadow-xs:  0 1px 2px rgba(11, 29, 23, 0.04);
  --shadow-sm:  0 1px 3px rgba(11, 29, 23, 0.06), 0 1px 2px rgba(11, 29, 23, 0.04);
  --shadow-md:  0 4px 6px rgba(11, 29, 23, 0.06), 0 2px 4px rgba(11, 29, 23, 0.04);
  --shadow-lg:  0 10px 15px rgba(11, 29, 23, 0.08), 0 4px 6px rgba(11, 29, 23, 0.04);
  --shadow-xl:  0 20px 25px rgba(11, 29, 23, 0.08), 0 8px 10px rgba(11, 29, 23, 0.03);
  --shadow-2xl: 0 25px 50px rgba(11, 29, 23, 0.14);
  --shadow-copper:    0 4px 14px rgba(168, 90, 40, 0.25);
  --shadow-copper-lg: 0 8px 24px rgba(168, 90, 40, 0.35);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background:        var(--dark-950);
    --foreground:        var(--dark-100);
    --surface-elevated:  var(--dark-800);
    --surface-sunken:    var(--dark-900);
    --border-default:    var(--dark-700);
    --border-subtle:     var(--dark-600);

    --accent-primary:    var(--copper-500);
    --accent-hover:      var(--copper-400);
    --accent-light:      rgba(212, 121, 62, 0.12);

    --text-primary:   var(--dark-100);
    --text-secondary: var(--dark-300);
    --text-muted:     var(--dark-400);
  }
}
```

---

## 9. Tailwind CSS v4 Integration

Since the project uses Tailwind CSS v4, extend the theme in `globals.css` using the `@theme` directive:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* Brand colors available as Tailwind utilities */
  --color-evergreen-50: var(--evergreen-50);
  --color-evergreen-100: var(--evergreen-100);
  --color-evergreen-200: var(--evergreen-200);
  --color-evergreen-300: var(--evergreen-300);
  --color-evergreen-400: var(--evergreen-400);
  --color-evergreen-500: var(--evergreen-500);
  --color-evergreen-600: var(--evergreen-600);
  --color-evergreen-700: var(--evergreen-700);
  --color-evergreen-800: var(--evergreen-800);
  --color-evergreen-900: var(--evergreen-900);
  --color-evergreen-950: var(--evergreen-950);

  --color-copper-50: var(--copper-50);
  --color-copper-100: var(--copper-100);
  --color-copper-200: var(--copper-200);
  --color-copper-300: var(--copper-300);
  --color-copper-400: var(--copper-400);
  --color-copper-500: var(--copper-500);
  --color-copper-600: var(--copper-600);
  --color-copper-700: var(--copper-700);

  --color-pearl-50: var(--pearl-50);
  --color-pearl-100: var(--pearl-100);
  --color-pearl-200: var(--pearl-200);
  --color-pearl-300: var(--pearl-300);
  --color-pearl-400: var(--pearl-400);

  --color-sand-50: var(--sand-50);
  --color-sand-100: var(--sand-100);
  --color-sand-200: var(--sand-200);
  --color-sand-300: var(--sand-300);

  --color-dark-100: var(--dark-100);
  --color-dark-200: var(--dark-200);
  --color-dark-300: var(--dark-300);
  --color-dark-400: var(--dark-400);
  --color-dark-500: var(--dark-500);
  --color-dark-600: var(--dark-600);
  --color-dark-700: var(--dark-700);
  --color-dark-800: var(--dark-800);
  --color-dark-900: var(--dark-900);
  --color-dark-950: var(--dark-950);

  --color-success: var(--semantic-success);
  --color-warning: var(--semantic-warning);
  --color-error: var(--semantic-error);
  --color-info: var(--semantic-info);

  --color-success-tint: var(--success-tint);
  --color-warning-tint: var(--warning-tint);
  --color-error-tint: var(--error-tint);
  --color-info-tint: var(--info-tint);

  --font-heading: var(--font-dm-serif);
  --font-body: var(--font-dm-sans);
  --font-mono: var(--font-jetbrains-mono);
}
```

This allows usage like:
```html
<div class="bg-evergreen-600 text-pearl-50">...</div>
<button class="bg-copper-600 hover:bg-copper-700 shadow-copper">...</button>
<p class="text-dark-300">Dashboard text</p>
<span class="bg-success-tint text-success">Compliant</span>
```

---

## 10. Migration Cheat Sheet

Quick reference for replacing existing Tailwind classes:

| Current Class | New Class |
|---------------|-----------|
| `bg-blue-600` | `bg-evergreen-600` or `bg-copper-600` (CTAs) |
| `bg-blue-50` | `bg-evergreen-50` or `bg-sand-50` |
| `text-blue-600` | `text-evergreen-600` or `text-copper-600` |
| `from-blue-600 to-cyan-600` | `from-copper-600 to-copper-500` (CTAs) |
| `bg-gradient-to-br from-slate-900` | `bg-gradient-to-br from-evergreen-950` (dark sections) |
| `text-slate-900` | `text-[--text-primary]` or keep `text-slate-900` |
| `text-slate-600` | `text-[--text-muted]` |
| `border-slate-200` | `border-pearl-200` |
| `bg-white` | `bg-pearl-50` (pages) or `bg-white` (cards) |
| `shadow-blue-600/25` | `shadow-copper` (custom shadow) |
| `text-emerald-600` | `text-success` |
| `text-red-600` | `text-error` |
| `bg-slate-800/50` (dark dashboard) | `bg-dark-800/50` |
| `border-slate-700/50` | `border-dark-700/50` |
| `from-cyan-400 via-blue-400 to-violet-400` | `from-copper-400 via-copper-500 to-evergreen-400` |

---

## 11. Anti-Patterns (Never Use)

| Pattern | Why It Fails | Use Instead |
|---------|-------------|-------------|
| `bg-blue-600` (generic blue) | Looks like every other SaaS | Evergreen or copper |
| `from-blue-600 to-cyan-600` gradient | "AI slop" gradient cliche | Copper gradient or solid evergreen |
| `text-gray-*` for primary text | No brand identity | Pearl, sand, or dark scale |
| `rounded-full` on cards | Childish, unprofessional | `--radius-lg` (12px) max |
| Pure white (`#FFFFFF`) as page bg | Harsh, unbranded | Pearl-50 (`#FAFBF9`) |
| Pure black text (`#000000`) | Harsh contrast | Text-primary (`#0F1A14`) |
| Inter/Roboto/Arial/system fonts | Generic, forgettable | DM Serif Display + DM Sans |
| Light font weights (300, 200) | Weak, undermines authority | 400 minimum |
| Purple/violet accents | Trendy, uncommitted | Copper for warmth, evergreen for trust |
| Rainbow multi-color stats | Carnival, not authority | 2-3 brand colors max for data |

---

## 12. Design Principles Summary

1. **Evergreen Authority** -- The deep green anchors everything in stability and trust. It is the foundation color, used generously for backgrounds, text, and structural elements.

2. **Copper Warmth** -- Copper is reserved for moments of action and attention. It is the "personal touch" color -- CTAs, active states, key highlights. Using it sparingly makes it more powerful.

3. **Generous Space** -- White space is not empty space. It is confidence. Crowded layouts signal insecurity. Give elements room to breathe.

4. **Serif Authority** -- DM Serif Display headlines communicate "we publish serious content" without being stuffy. The serif/sans pairing creates natural visual hierarchy.

5. **Consistent Restraint** -- Two brand colors, two neutral families, one accent. No color chaos. Every color has a defined role and a reason for being there.

6. **Accessibility is Architecture** -- WCAG AA is the floor, not the ceiling. Every color pairing was mathematically verified before inclusion. Accessibility is not a feature; it is the foundation.

---

*This document serves as the single source of truth for all visual design decisions in the One Guy Consulting HIPAA Compliance Portal.*
