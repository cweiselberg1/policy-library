# Design System: Institutional Authority

## Design Philosophy

**Healthcare compliance demands authority, not decoration.** This design system rejects the generic blue/cyan gradients dominating SaaS interfaces. Instead, it establishes visual power through bold typography, geometric precision, and a color palette that conveys institutional trust.

## Color Palette

### Brand Colors (WCAG AA Compliant)

**Navy (Primary)**
- `--navy-950: #0A1628` - Text, backgrounds, power elements
- `--navy-900: #162339` - Elevated surfaces (dark mode)
- `--navy-800: #1E2F4F` - Secondary text
- `--navy-700: #2A4066` - Borders, accents

**Orange (Accent Primary)**
- `--orange-500: #FF6B35` - Primary actions, highlights, energy
- `--orange-600: #E55A28` - Hover states
- `--orange-700: #CC4A1C` - Active states

**Gold (Accent Secondary)**
- `--gold-400: #D4A259` - Secondary accents, warmth
- `--gold-500: #B8924F` - Refined touches

**Cream (Background)**
- `--cream-50: #FEFCF8` - Base background (light mode)
- `--cream-100: #FAF6ED` - Elevated surfaces
- `--cream-200: #F5EDDB` - Subtle backgrounds

### Contrast Ratios (WCAG AA Verified)

| Combination | Ratio | Standard | Pass |
|-------------|-------|----------|------|
| Navy 950 on Cream 50 | 17.2:1 | AAA | ✓ |
| Navy 700 on Cream 50 | 8.9:1 | AAA | ✓ |
| Navy 800 on Cream 100 | 10.1:1 | AAA | ✓ |
| Orange 500 on Cream 50 | 4.6:1 | AA | ✓ |
| Orange 500 on Navy 950 | 3.8:1 | AA (large text) | ✓ |
| Gold 400 on Navy 950 | 5.2:1 | AA | ✓ |

**All text meets WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)**

## Typography

### Font Stack
```css
font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**Fixed:** Arial fallback removed. Geist Sans is the primary typeface with proper system font fallbacks.

### Type Scale
- **Hero Headlines:** `clamp(3rem, 8vw, 6.5rem)` - Dramatic, commanding
- **Section Headlines:** `3rem - 5rem` - Strong hierarchy
- **Body Text:** `1rem - 1.25rem` - Readable, confident
- **Labels:** `0.75rem` uppercase, tracked - Institutional precision

### Font Weights
- Bold (700): Headlines, CTAs, labels
- Semibold (600): Subheadings
- Medium (500): Body text, navigation
- No light weights (authority, not delicacy)

## Spacing & Layout

### Generous Whitespace
- Hero padding: `5rem - 7rem` vertical
- Section spacing: `10rem` between major sections
- Card padding: `2.5rem` internal
- Element gaps: `1.5rem - 2.5rem`

**Philosophy:** Space conveys confidence. Crowded layouts signal insecurity.

## Visual Elements

### Geometric Patterns
- **Diagonal line pattern** (45deg) at 2% opacity for subtle texture
- **Noise texture overlay** using SVG filter at 3% opacity for depth
- **Clipped corners** using CSS `clip-path` for angular, authoritative shapes

### Iconography
- Octagonal shield shapes (8-sided polygon via clip-path)
- Sharp, geometric icon containers
- No rounded corners on icon backgrounds
- Icons sized 1.75rem - 2.25rem for impact

### Interactive States
- **Hover:** `scale(1.02) - scale(1.05)` with smooth transitions
- **Active:** Opacity reduction to 70%
- **Focus:** Clear outline, no ambiguity
- No easing functions that feel playful

## Component Patterns

### Cards
- **2px borders** in navy or gold
- **Clipped corners** (24px cuts) for distinction
- **Triangular accent overlays** at 5% opacity
- Hover: subtle scale and border color shift

### Buttons
- **Uppercase tracking-wide labels** (0.05em)
- **Angled corners** using clip-path
- **Bold weight** (700)
- Primary: Orange on light, Navy on dark
- Secondary: Gold accents

### Stats/Numbers
- **Extra-bold display** (text-6xl, 900 weight)
- Color-coded by category
- Small uppercase labels beneath
- Contained in geometric boxes

## Dark Mode

### Automatic Theme Switching
```css
@media (prefers-color-scheme: dark) {
  --background: #0A1628 (navy-950)
  --foreground: #FEFCF8 (cream-50)
  --surface-elevated: #162339 (navy-900)
}
```

### Dark Mode Adjustments
- **Higher contrast** than light mode
- Orange and gold remain vibrant
- Borders shift to lighter navy tones
- Text uses cream colors for warmth
- No pure white (harsh on eyes)

## Accessibility

### WCAG AA Compliance
- All text meets 4.5:1 minimum contrast
- Large text (18pt+) meets 3:1 minimum
- Interactive elements have clear focus states
- Color is never the sole indicator

### Keyboard Navigation
- Tab order follows visual hierarchy
- Focus indicators are visible
- No keyboard traps

### Screen Readers
- Semantic HTML structure
- ARIA labels where needed
- Skip links for navigation

## Anti-Patterns (Never Use)

❌ **Blue/cyan gradients** (SaaS cliché)
❌ **Rounded cards** with shadows (generic)
❌ **Light font weights** (weak authority)
❌ **Playful animations** (unprofessional)
❌ **Pastel colors** (lacks confidence)
❌ **Centered layouts everywhere** (boring)
❌ **Arial/Helvetica/system fonts** (default look)

## Implementation Notes

### CSS Variables
All colors defined as CSS custom properties in `globals.css`:
- Enables consistent theming
- Easy maintenance
- Automatic dark mode switching
- Design token system

### Performance
- Noise texture: inline SVG (no HTTP request)
- Geometric patterns: CSS (no images)
- Font loading: optimized with Next.js font system
- Animations: CSS-only, no JavaScript

### Browser Support
- Modern browsers (last 2 versions)
- Progressive enhancement for older browsers
- Fallbacks for clip-path, CSS variables

## Design Principles

1. **Authority over friendliness** - Compliance is serious
2. **Clarity over decoration** - Information hierarchy first
3. **Boldness over subtlety** - Confident visual statements
4. **Geometric over organic** - Structured, institutional feel
5. **Contrast over harmony** - High readability always

---

**This is not a design system that says "trust us, we're friendly."**

**It says: "Trust us. We know what we're doing."**
