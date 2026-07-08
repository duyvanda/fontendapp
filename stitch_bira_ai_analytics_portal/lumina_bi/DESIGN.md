---
name: Lumina BI
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a78'
  outline-variant: '#bbc9c7'
  surface-tint: '#006a64'
  primary: '#006a64'
  on-primary: '#ffffff'
  primary-container: '#00a79d'
  on-primary-container: '#003431'
  inverse-primary: '#5adacf'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#96f0e5'
  on-secondary-container: '#006f67'
  tertiary: '#984623'
  on-tertiary: '#ffffff'
  tertiary-container: '#dc7b53'
  on-tertiary-container: '#551a00'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7af6eb'
  primary-fixed-dim: '#5adacf'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504b'
  secondary-fixed: '#99f2e8'
  secondary-fixed-dim: '#7cd6cc'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7a300d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  success: '#10b981'
  warning: '#f59e0b'
  info: '#0ea5e9'
  border-light: '#e2e8f0'
  surface-card: '#ffffff'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-mobile: 16px
  gutter-mobile: 16px
---

## Brand & Style

This design system is engineered for a high-performance Business Intelligence (BI) portal, prioritizing data density without sacrificing aesthetic sophistication. The brand personality is **analytical, authoritative, and visionary**. It aims to evoke a sense of clarity and confidence, allowing users to navigate complex datasets with ease.

The design style is **Modern Corporate with High-Depth**, blending a clean, minimalist structural foundation with rich tactile elements. Key characteristics include:
- **Depth-Driven Hierarchy:** Extensive use of ambient shadows and stacked layers to separate data visualizations from the UI shell.
- **Precision Aesthetics:** Clean lines, generous whitespace, and a focus on clarity through typography.
- **Dynamic Accents:** Use of gradients to draw attention to primary actions and progress indicators, contrasting against a stable neutral background.

## Colors

The color palette is anchored by a **Teal Gradient** that symbolizes growth and technological precision. 

- **Primary & Secondary:** The teal spectrum (#00A79D to #00766E) is reserved for primary actions, active states, and key data highlights. Linear gradients should always flow from top-left to bottom-right.
- **Neutrals:** The background uses a cool-toned Slate-White (#f8fafc) to reduce eye strain during long analytical sessions. Cards and containers sit on pure white (#FFFFFF) to pop against the background.
- **Semantics:** Standard success, warning, and error colors are utilized but should be applied with lower saturation in non-critical areas to maintain the professional teal-dominant aesthetic.

## Typography

The typography system relies on **Inter** for its exceptional legibility and modern, neutral character. 

- **Hierarchy:** Dramatic weight contrasts between headlines (Bold/SemiBold) and body text (Regular) help users scan through metrics quickly.
- **Letter Spacing:** Headings use a slight negative tracking (-0.01em to -0.02em) for a more compact, professional look, while labels and captions use increased tracking (+0.05em) and uppercase styling to provide architectural structure to the layout.
- **Mobile Scale:** For mobile screens, headlines are capped at 32px to ensure long data labels do not wrap awkwardly.

## Layout & Spacing

This design system follows a strict **8px grid** to ensure consistency across all screen densities. 

- **Layout Model:** A fluid grid system is used for mobile views, with a standard 16px side margin. 
- **Rhythm:** Spacing between related items within a card should use `sm` (8px), while spacing between major sections or cards should use `lg` (24px).
- **Dividers:** Use dashed lines (1px weight, 4px dash, 4px gap) for secondary separations within cards to maintain a technical, "schematic" feel.
- **Transitions:** All interactive elements must use a `0.2s` to `0.3s` ease-in-out transition for hover, press, and state changes.

## Elevation & Depth

The system uses a multi-tier shadow strategy to define functional layers. All shadows should be tinted slightly with the primary teal or a deep slate to avoid a "muddy" appearance.

- **Level 0 (Floor):** Neutral background (#f8fafc).
- **Level 1 (Cards):** Surface white (#FFFFFF) with a soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Interactive/Buttons):** Applied to primary buttons and active states. Uses a more pronounced shadow: `0px 8px 16px rgba(0, 167, 157, 0.2)`.
- **Level 3 (Modals/Overlays):** The highest elevation with maximum diffusion: `0px 12px 32px rgba(0, 0, 0, 0.12)`.

## Shapes

The shape language is defined by high-radius curves that contrast with the technical nature of data.

- **Cards:** Use a fixed **16px border-radius** to create a soft, modern frame for charts and lists.
- **Buttons & Chips:** Follow a **Pill-shaped** (fully rounded) geometry to distinguish them clearly from the rectangular layout of the data containers.
- **Inputs:** Use an 8px radius to balance the cards and buttons.

## Components

- **Buttons:** Primary buttons must feature the Teal Gradient (#00A79D to #00766E). They are pill-shaped and include a primary-tinted shadow. Secondary buttons should use a ghost style with a subtle border.
- **Cards:** The primary container for information. Cards must have a 16px radius, a white background, and a Level 1 shadow. Headers within cards should be separated by a dashed divider.
- **Input Fields:** Outlined style with a 1px border (#e2e8f0). On focus, the border transitions to the primary teal with a subtle outer glow.
- **Chips/Badges:** Used for filtering and status. These are pill-shaped with light background tints (e.g., Success green at 10% opacity) and dark text.
- **List Items:** Feature a 1px solid bottom border (except the last item) or a dashed divider if part of a grouped metric. High-quality 0.2s hover states are required.
- **Data Visualizations:** Charts should utilize the primary/secondary teal as the main data series, with neutral greys for background axes and grids.