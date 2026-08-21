# BluCare+ Landing Page — Complete Text Design Specification

> **Purpose**: This document captures **every** text styling detail (fonts, colors, gradients, weights, sizes, spacing, transforms) across all sections of the BluCare+ landing page so the design can be reproduced **same-to-same** on any clone of this project.

---

## 1. Global Foundation

### 1.1 Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
```

### 1.2 Font Family (Every Element)
| Property | Value |
|----------|-------|
| `font-family` | `"Inter", sans-serif` |
| Weights loaded | `300` (Light), `400` (Regular), `500` (Medium), `600` (Semibold) |

### 1.3 Base Body Text
| Property | Value |
|----------|-------|
| `color` | `var(--text-primary)` → `#ECECF1` / `rgb(236, 236, 241)` |
| `background` | `var(--bg-base)` → `#0F0F12` |

---

## 2. Color Palette (Dark Theme — Default)

### 2.1 Text Colors
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--text-primary` | `#ECECF1` | `rgb(236, 236, 241)` | Main headings, body text, primary info |
| `--text-secondary` | `#B8BAC7` | `rgb(184, 186, 199)` | Descriptions, paragraphs, sub-info |
| `--text-subdued` | `#8A8D9E` | `rgb(138, 141, 158)` | Labels, nav links, copyright, dashes |

### 2.2 Accent Colors (Used on Text)
| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--accent-sage` | `#7FE1C3` | `rgb(127, 225, 195)` | Feature names, links, badges, "symptom" word, button text |
| `--accent-lavender` | `#B6C4FF` | `rgb(182, 196, 255)` | Section headings, "solution"/"Journey" word, hover states |
| `--accent-aqua` | `#A3E8ED` | `rgb(163, 232, 237)` | "Technical Documentation" link, hover alternate |

### 2.3 Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#0F0F12` | Page background |
| `--bg-surface` | `#15151A` | Cocktails & Menu section bg |
| `--bg-card` | `#1B1B22` | Card backgrounds |
| `--nav-bg` | `rgba(15, 15, 18, 0.8)` | Navbar (with blur) |

---

## 3. The Master Gradient — `text-gradient`

This is the **signature** gradient used on the hero title, subtitle lines, stats, and footer "BluCare+" word.

```css
background: linear-gradient(135deg, #ECECF1 0%, #7FE1C3 50%, #B6C4FF 100%);
/* Equivalent: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-sage) 50%, var(--accent-lavender) 100%) */
-webkit-background-clip: text;
background-clip: text;
color: transparent !important;
display: inline-block;
```

**Computed**: `linear-gradient(135deg, rgb(236,236,241) 0%, rgb(127,225,195) 50%, rgb(182,196,255) 100%)`

> This gradient flows from **off-white** → **mint/sage green** → **soft lavender blue** at a 135° angle.

---

## 4. Button Glow Gradient — `persistent-btn-glow::before`

The "BEGIN GENTLY" button has an animated glow ring behind it:

```css
background: linear-gradient(90deg, #7FE1C3, #0D9488, #A3E8ED, #7FE1C3);
background-size: 300% 100%;
filter: blur(12px);
opacity: 0.7;
animation: flowGradient 5s linear infinite;
```

**On hover**: `filter: blur(25px)`, `opacity: 1`, glow expands to `inset: -10px`.

The `flowGradient` keyframes animate `background-position` from `0% 50%` to `150% 50%`.

---

## 5. Section-by-Section Text Specs

---

### 5.1 NAVBAR

#### Brand Logo Text — "BluCare+"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `17.6px` (`text-[1.1rem]`) |
| Weight | `500` (Medium) |
| Color | `#ECECF1` / `rgb(236, 236, 241)` — `text-primary` |
| Letter Spacing | `-0.176px` (`tracking-[-0.01em]`) |
| Text Transform | `none` |
| Decoration | `none` (no underline) |

#### Brand Dot (beside logo)
| Property | Value |
|----------|-------|
| Size | `8px × 8px` |
| Background | `#7FE1C3` — `accent-sage` |
| Shape | Circle (`border-radius: 50%`) |
| Glow | `box-shadow: 0 0 15px rgba(127, 225, 195, 0.4)` |

#### Nav Links — "Chat"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `14.4px` (`text-[0.9rem]`) |
| Weight | `400` (Regular) |
| Color | `#8A8D9E` / `rgb(138, 141, 158)` — `text-subdued` |
| Hover Color | `#B6C4FF` — `accent-lavender` |
| Text Transform | `none` |
| Decoration | `none` |

#### User Avatar Letter — "P"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `13.6px` (`text-[0.85rem]`) |
| Weight | `500` (Medium) |
| Color | `#7FE1C3` — `accent-sage` |
| Background | `rgba(127, 225, 195, 0.06)` |
| Border | `1px solid rgba(127, 225, 195, 0.12)` |
| Shape | Full circle |

#### User Name — "Hi, Prashik"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `13.6px` (`text-[0.85rem]`) |
| Weight | `400` (Regular) |
| Color | `#B8BAC7` / `rgb(184, 186, 199)` — `text-secondary` |

---

### 5.2 HERO SECTION

#### Main Title — "BluCare+" (h1)
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `clamp(4rem, 15vw, 15rem)` — computed `240px` at desktop |
| Weight | `700` (Bold) — via `font-bold` class |
| Letter Spacing | `-12px` (`tracking-tighter` at this size) |
| Line Height | `300px` (1.25× font-size) |
| Color | `transparent` — **text is invisible, gradient shows through** |
| Background | **`text-gradient`** — `linear-gradient(135deg, #ECECF1 0%, #7FE1C3 50%, #B6C4FF 100%)` |
| Background Clip | `text` |
| Text Transform | `none` |
| Vertical Offset | `-translate-y-3` (mobile) / `-translate-y-9` (desktop) |

> Each character gets the `text-gradient` class via GSAP SplitText, creating per-character gradient fill.

#### "BEGIN GENTLY" Button
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `14px` |
| Weight | `600` (Semibold) |
| Color | `#7FE1C3` — `accent-sage` |
| Letter Spacing | `1.4px` (`tracking-widest`) |
| Text Transform | `UPPERCASE` |
| Background | `rgba(127, 225, 195, 0.1)` — sage at 10% opacity |
| Border | `1px solid rgba(127, 225, 195, 0.2)` — sage at 20% |
| Border Radius | Full pill (9999px) |
| Backdrop | `blur(12px)` — glassmorphism |
| Hover | bg becomes solid sage `#7FE1C3`, text becomes `--bg-base`, scale `1.05` |

#### "CLINICAL INTELLIGENCE PLATFORM" Label
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `12px` (`text-xs`) |
| Weight | `500` (Medium) |
| Color | `#B8BAC7` — `text-secondary` |
| Letter Spacing | `2.4px` (`tracking-[0.2em]`) |
| Text Transform | `UPPERCASE` |

#### Subtitle — "Advanced Diagnostics / Gentle Human Care"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `24px` (desktop `text-2xl`) / `20px` (mobile `text-xl`) |
| Weight | `500` (Medium) |
| Color | **`text-gradient` applied via GSAP SplitText on each line** |
| Background | `linear-gradient(135deg, #ECECF1 0%, #7FE1C3 50%, #B6C4FF 100%)` |
| Background Clip | `text` |
| Note | GSAP SplitText splits into lines, then adds `text-gradient` class to each line element |

#### Description — "BluCare+ harmonizes medical precision..."
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `16px` (desktop `text-base`) / `14px` (mobile `text-sm`) |
| Weight | `400` (Regular) |
| Color | `#B8BAC7` — `text-secondary` |
| Line Height | `24px` |

#### "Explore Architecture" Link
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `18px` |
| Weight | `500` (Medium) |
| Color | `#7FE1C3` — `accent-sage` |
| Hover Color | `#A3E8ED` — `accent-aqua` |
| Decoration | None; has a horizontal line beside it |
| Line Beside | `8px wide × 1px, bg-sage`, on hover grows to `12px, bg-aqua` |

---

### 5.3 COCKTAILS SECTION (Clinical Workflow / Core Intelligence)

#### Section Headings — "CLINICAL WORKFLOW" / "CORE INTELLIGENCE"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `14px` (`text-sm`) |
| Weight | `600` (Semibold) |
| Color | `#B6C4FF` / `rgb(182, 196, 255)` — **`accent-lavender`** |
| Letter Spacing | `1.4px` (`tracking-widest`) |
| Text Transform | `UPPERCASE` |

#### List Item Names — "Symptom Assessment", "Risk Evaluation", etc.
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `24px` (`text-2xl`) |
| Weight | `300` (Light) |
| Color | `#7FE1C3` / `rgb(127, 225, 195)` — **`accent-sage`** |
| Hover Color | `#A3E8ED` — `accent-aqua` |
| Transition | `colors` |

#### List Item Details — "AI | INITIAL CHECK"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `12px` (`text-xs`) |
| Weight | `400` (Regular) |
| Color | `#8A8D9E` / `rgb(138, 141, 158)` — **`text-subdued`** |
| Letter Spacing | `0.6px` (`tracking-wider`) |
| Text Transform | `UPPERCASE` |

#### Step Labels — "Step 01", "Live", "SOS", etc.
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `20px` |
| Weight | `500` (Medium) |
| Color | `#B8BAC7` / `rgb(184, 186, 199)` — **`text-secondary`** |

---

### 5.4 ABOUT SECTION

#### Badge — "MEDICAL PRECISION"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `12px` (`text-xs`) |
| Weight | `600` (Semibold) |
| Color | `#7FE1C3` — `accent-sage` |
| Letter Spacing | `0.6px` (`tracking-wider`) |
| Text Transform | `UPPERCASE` |
| Background | `rgba(127, 225, 195, 0.1)` — sage 10% |
| Border | `1px solid rgba(127, 225, 195, 0.2)` — sage 20% |
| Border Radius | Full pill |
| Padding | `px-4 py-1` |

#### Main Heading — "Where every detail matters — from symptom to solution"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `72px` (desktop `md:text-7xl`) / `48px` (mobile `text-5xl`) |
| Weight | `300` (Light) |
| Color | `#ECECF1` — `text-primary` (base text) |
| Line Height | `90px` (tight) |

**Multi-color words within this heading:**
| Word | Color | Token |
|------|-------|-------|
| "Where every detail matters" | `#ECECF1` (off-white) | `text-primary` |
| "—" (dash) | `#8A8D9E` (muted gray) | `text-subdued` |
| "from" | `#ECECF1` (off-white) | `text-primary` |
| **"symptom"** | **`#7FE1C3` (mint green)** | **`accent-sage`** |
| "to" | `#ECECF1` (off-white) | `text-primary` |
| **"solution"** | **`#B6C4FF` (soft lavender)** | **`accent-lavender`** |

> JSX: `Where every detail matters <span className="text-subdued">-</span> from <span className="text-sage">symptom</span> to <span className="text-lavender">solution</span>`

#### Description Paragraph
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `18px` (`text-lg`) |
| Weight | `300` (Light) |
| Color | `#B8BAC7` — `text-secondary` |
| Line Height | `29.25px` (`leading-relaxed`) |

#### Stat Number — "120k+"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `48px` (desktop `md:text-5xl`) / `30px` (mobile `text-3xl`) |
| Weight | `500` (Medium) — via `.text-gradient` inheriting `font-medium` |
| Color | **`text-gradient`** — same master gradient |
| Background | `linear-gradient(135deg, #ECECF1 0%, #7FE1C3 50%, #B6C4FF 100%)` |

#### Stat Label — "VERIFIED TOKENS BY WHO"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `12px` (`text-xs`) |
| Weight | `300` (Light) |
| Color | `#8A8D9E` — `text-subdued` |
| Letter Spacing | `1.2px` (`tracking-widest`) |
| Text Transform | `UPPERCASE` |

---

### 5.5 MENU SECTION (Architecture Overview)

#### Section Heading — "ARCHITECTURE OVERVIEW"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `14px` (`text-sm`) |
| Weight | `600` (Semibold) |
| Color | `#B6C4FF` — **`accent-lavender`** |
| Letter Spacing | `1.4px` (`tracking-widest`) |
| Text Transform | `UPPERCASE` |

#### Tab Buttons — Active State
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `20px` |
| Weight | `500` (Medium) |
| Color | `#0F0F12` — dark (bg-base color, for contrast on sage bg) |
| Background | `#7FE1C3` — solid sage |
| Border | `1px solid #7FE1C3` |
| Border Radius | Full pill |
| Glow | `box-shadow: 0 0 20px rgba(127, 225, 195, 0.4)` |

#### Tab Buttons — Inactive State
| Property | Value |
|----------|-------|
| Color | `#8A8D9E` — `text-subdued` |
| Background | `transparent` |
| Border | `1px solid rgba(255, 255, 255, 0.05)` |
| Hover Color | `text-secondary` |
| Hover Border | `border-secondary` |

#### Feature Name — "Smart Follow-Up Engine" (in card)
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `36px` (desktop `md:text-4xl`) / `30px` (mobile `text-3xl`) |
| Weight | `300` (Light) |
| Color | `#7FE1C3` — **`accent-sage`** |

#### Lavender Accent Bar (below feature name)
| Property | Value |
|----------|-------|
| Width | `48px` (w-12) |
| Height | `4px` (h-1) |
| Color | `#B6C4FF` — `accent-lavender` |
| Border Radius | Full pill |

#### Feature Heading — "Understands Before It Responds"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `30px` (desktop `md:text-3xl`) / `24px` (mobile `text-2xl`) |
| Weight | `300` (Light) |
| Color | `#ECECF1` — `text-primary` |
| Line Height | `37.5px` (tight) |

#### Feature Description
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `18px` (desktop `md:text-lg`) / `16px` (mobile `text-base`) |
| Weight | `300` (Light) |
| Color | `#B8BAC7` — `text-secondary` |
| Line Height | `29.25px` (relaxed) |

#### "TECHNICAL DOCUMENTATION" Link
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `14px` (`text-sm`) |
| Weight | `500` (Medium) |
| Color | `#A3E8ED` — **`accent-aqua`** |
| Hover Color | `#7FE1C3` — `accent-sage` |
| Letter Spacing | `0.7px` (`tracking-wider`) |
| Text Transform | `UPPERCASE` |

#### Recipe Card (Glassmorphism Container)
| Property | Value |
|----------|-------|
| Background | `rgba(27, 27, 34, 0.3)` — bg-card at 30% opacity |
| Backdrop Filter | `blur(24px)` |
| Border | `1px solid rgba(255, 255, 255, 0.05)` |
| Border Radius | `32px` (rounded-[2rem]) |
| Shadow | `0 12px 40px rgba(0, 0, 0, 0.4)` |

---

### 5.6 FOOTER / CONTACT SECTION

#### Pre-heading Label — "GET IN TOUCH"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `12px` (`text-xs`) |
| Weight | `500` (Medium) |
| Color | `#B8BAC7` — `text-secondary` |
| Letter Spacing | `3.6px` (`tracking-[0.3em]`) |
| Text Transform | `UPPERCASE` |

#### Main Heading — "Start Your Journey With BluCare+"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `96px` (desktop `md:text-8xl`) / `48px` (mobile `text-5xl`) |
| Weight | `300` (Light) |
| Color | `#ECECF1` — `text-primary` (base) |
| Line Height | `96px` (none) |

**Multi-color words within this heading:**
| Word | Color | Token | Weight |
|------|-------|-------|--------|
| "Start Your" | `#ECECF1` | `text-primary` | `300` |
| **"Journey"** | **`#B6C4FF`** (lavender) | **`accent-lavender`** | `300` |
| "With" | `#ECECF1` | `text-primary` | `300` |
| **"BluCare+"** | **Gradient** (master `text-gradient`) | sage→lavender gradient | **`500` (Medium)** |

> JSX: `Start Your <span className="text-lavender">Journey</span> <br/> With <span className="font-medium text-gradient">BluCare+</span>`

#### Sub-section Labels — "AVAILABILITY", "SYSTEM STATUS", "CONTACT"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `12px` (`text-xs`) |
| Weight | `600` (Semibold) |
| Color | `#8A8D9E` — `text-subdued` |
| Letter Spacing | `1.2px` (`tracking-widest`) |
| Text Transform | `UPPERCASE` |

#### Info Primary Text — "24/7 Intelligent AI Support", "All Systems Operational", "support@ragblucare.ai"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `30px` |
| Weight | `300` (Light) |
| Color | `#ECECF1` — `text-primary` |

#### Info Secondary Text — "Global Clinical Access", "+91 9403871129"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `30px` |
| Weight | `300` (Light) |
| Color | `#B8BAC7` — `text-secondary` |

#### Copyright — "© 2026 BLUCARE+ SYSTEMS. ALL RIGHTS RESERVED."
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `12px` (`text-xs`) |
| Weight | `300` (Light) |
| Color | `#8A8D9E` — `text-subdued` |
| Letter Spacing | `0.6px` (`tracking-wider`) |

#### Bottom Links — "PRIVACY", "CLINICAL TERMS", "SECURITY"
| Property | Value |
|----------|-------|
| Font | `Inter, sans-serif` |
| Size | `12px` (`text-xs`) |
| Weight | `500` (Medium) |
| Color | `#8A8D9E` — `text-subdued` |
| Hover Color | `#B6C4FF` — `accent-lavender` |
| Letter Spacing | `1.2px` (`tracking-widest`) |
| Text Transform | `UPPERCASE` |

---

## 6. Light Theme Overrides

When `data-theme="light"` is set on `<html>`, all CSS variables change:

| Token | Dark Value | Light Value |
|-------|-----------|-------------|
| `--text-primary` | `#ECECF1` | `#020617` |
| `--text-secondary` | `#B8BAC7` | `#1E293B` |
| `--text-subdued` | `#8A8D9E` | `#475569` |
| `--accent-sage` | `#7FE1C3` | `#0D9488` |
| `--accent-lavender` | `#B6C4FF` | `#4F46E5` |
| `--accent-aqua` | `#A3E8ED` | `#0891B2` |
| `--bg-base` | `#0F0F12` | `#F8FAFC` |
| `--bg-surface` | `#15151A` | `#F1F5F9` |
| `--bg-card` | `#1B1B22` | `#FFFFFF` |

> All text styles remain structurally the same; only the variable values swap. The `text-gradient` automatically adapts because it references variables.

---

## 7. Quick Reference — All Gradients Used on Text

| Where | Gradient CSS | Direction |
|-------|-------------|-----------|
| Hero "BluCare+" h1 (per char) | `linear-gradient(135deg, #ECECF1 0%, #7FE1C3 50%, #B6C4FF 100%)` | 135° |
| Hero subtitle lines | Same as above (applied via SplitText) | 135° |
| "120k+" stat | Same as above | 135° |
| Footer "BluCare+" word | Same as above | 135° |
| Button glow ring | `linear-gradient(90deg, #7FE1C3, #0D9488, #A3E8ED, #7FE1C3)` | 90° horizontal, animated |

---

## 8. Quick Reference — Font Weight Map

| Weight Value | Name | Where Used |
|-------------|------|------------|
| `300` | Light | Hero h1 (CSS says light but class overrides to bold), About heading, feature headings, descriptions, footer heading, footer info text |
| `400` | Regular | Nav links, description paragraphs, list details, user name, copyright |
| `500` | Medium | Brand text, hero label, subtitle, explore link, tab buttons, stat number, tech doc link, footer label, footer links, avatar letter, footer "BluCare+" gradient word |
| `600` | Semibold | BEGIN GENTLY button, section headings (CLINICAL WORKFLOW etc), badges, footer sub-labels |
| `700` | Bold | Hero h1 "BluCare+" (applied via `font-bold` class in JSX) |

---

## 9. Quick Reference — Letter Spacing Map

| Spacing | CSS Class | Where Used |
|---------|-----------|------------|
| `-12px` | `tracking-tighter` (scaled) | Hero h1 at 240px |
| `-0.176px` | `tracking-[-0.01em]` | Navbar brand |
| `normal` | default | Most body text |
| `0.6px` | `tracking-wider` | List details, badges, copyright |
| `0.7px` | `tracking-wider` | Tech doc link |
| `1.2px` | `tracking-widest` | Footer labels, bottom links, stat label |
| `1.4px` | `tracking-widest` | Button text, section headings |
| `2.4px` | `tracking-[0.2em]` | Hero "CLINICAL INTELLIGENCE PLATFORM" |
| `3.6px` | `tracking-[0.3em]` | Footer "GET IN TOUCH" |

---

## 10. Text Transform Map

| Transform | Where Used |
|-----------|------------|
| `UPPERCASE` | All labels, badges, button text, section headings, nav sub-labels, copyright, footer links, list item details |
| `none` | Hero h1, brand, nav links, body text, headings, feature names, descriptions |

---

## 11. Radial Gradient (Background, Not Text)

Used as background for the Menu section:

```css
background: radial-gradient(circle at center, rgba(163, 232, 237, 0.15) 0%, transparent 70%);
```

This creates a subtle aqua glow behind the architecture overview section.

---

## 12. Noise Overlay

Every section has a `.noisy` overlay:
```css
background-image: url("/images/noise.png");
background-repeat: repeat;
opacity: 0.15;
```
This adds texture over all backgrounds and gradients.
