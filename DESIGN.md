---
name: rubjangNK Design System
description: Visual guidelines for rubjangNK, the local service matching platform for Nong Khai.
colors:
  primary: "#0c324e"
  accent-orange: "#e06b29"
  line-green: "#06c755"
  neutral-bg: "#ffffff"
  neutral-surface: "#f8f9fa"
  neutral-border: "#e9ecef"
  text-primary: "#212529"
  text-muted: "#6c757d"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "6px"
  md: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-line:
    backgroundColor: "{colors.line-green}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  card-technician:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: rubjangNK

## 1. Overview

**Creative North Star: "The Trustworthy Local Guide"**

This design system is engineered for a high-trust, friction-free local marketplace matching service. The layout is optimized for maximum readability, high density, and clean accessibility under varying outdoor light conditions. It deliberately rejects standard over-saturated SaaS templates with beige backgrounds, instead choosing a clean, high-contrast white and slate gray canvas paired with a reliable deep blue.

**Key Characteristics:**
- **High Readability:** Text-first layout, robust contrast, and generous tap targets.
- **Unambiguous Affordances:** Primary action buttons are color-coded (LINE Green for quick chat/contact, Deep Navy Blue for primary platform actions).
- **Clear Information Density:** Profile cards show critical parameters (Verified status, distance, rating) compactly.

## 2. Colors

The palette is anchored by a deep trustworthy primary navy blue and features a bright, warm amber/orange accent representing featured, high-priority listings.

### Primary
- **Trustworthy Navy** (#0c324e): Used for key branding elements, primary navigation buttons, and main section headers.

### Secondary
- **Vibrant Orange** (#e06b29): Reserved specifically for the "Featured" status, promotional banners, and active/highlighted labels.
- **LINE Green** (#06c755): Strictly reserved for "Contact via LINE" quick action buttons to instantly guide the user to communication.

### Neutral
- **Clean White** (#ffffff): Used as the primary background for content containers and cards.
- **Cool Neutral Surface** (#f8f9fa): Used as the page canvas background to group cards and lists cleanly.
- **Slate Ink** (#212529): Standard body text color ensuring a high 4.5:1+ contrast ratio.

### Named Rules
**The Rarity of Orange Rule.** The vibrant orange accent is used on ≤5% of any given screen. It is only used to denote active "Featured" states to preserve its visual value.

## 3. Typography

**Display Font:** Inter, system-ui, -apple-system, sans-serif
**Body Font:** Inter, system-ui, -apple-system, sans-serif

**Character:** Clean, highly legible sans-serif stack to handle both Thai and English text seamlessly at all sizes.

### Hierarchy
- **Display** (700, 32px, 1.2): Used for primary page titles and hero headers.
- **Headline** (700, 24px, 1.3): Used for section headers ("ช่างและแม่บ้านแนะนำในหนองคาย").
- **Title** (600, 18px, 1.4): Used for names and key headings within cards.
- **Body** (400, 16px, 1.5): Standard prose and technician details.
- **Label** (500, 14px, 1.2): Small detail labels, ratings, and badges.

## 4. Elevation

The system is flat-by-default, relying on subtle borders and background shifts to separate content rather than deep heavy shadows.

### Shadow Vocabulary
- **Card Shadow** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05)`): Used on technician profile cards to lift them slightly from the neutral canvas.

### Named Rules
**The Flat Canvas Rule.** Shadows are never used on primary containers or page headers. Depth is established through subtle 1px border lines (#e9ecef) or background contrast.

## 5. Components

### Buttons
- **Shape:** Soft rounded corners (6px radius).
- **Primary:** Trustworthy Navy background with bold white text.
- **LINE Quick Connect:** LINE Green background with an embedded white LINE chat icon. Highly visible.

### Cards / Containers
- **Corner Style:** Medium rounded corners (12px radius).
- **Background:** White background, thin border (#e9ecef), and a very light ambient card shadow.
- **Internal Padding:** Generous padding (16px) separating technician photo, bio, ratings, and action buttons.

### Inputs / Fields
- **Style:** Clean border outline (#ced4da) with soft corners (6px radius).
- **Focus:** Deep Navy border shift with a very light blue outer glow.

## 6. Do's and Don'ts

### Do:
- **Do** use the LINE Green button *only* for initiating a direct chat or call with the service provider.
- **Do** ensure all profile cards display a clear Verified Badge when verified.
- **Do** maintain a strict 4.5:1 text-to-background contrast ratio on all service listing descriptions.

### Don't:
- **Don't** use fluid typography for dashboard and profile labels. Use the fixed rem scale steps.
- **Don't** use neon or violet gradients for call-to-actions. Keep the solid, trustworthy colors.
- **Don't** stack multiple cards inside each other. Use a single card for each technician listing.
