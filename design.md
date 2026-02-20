Design a neo-brutalist dark UI with these exact rules:
Base palette — near-black background #0A0A0A, card surfaces #141414, raised elements #1E1E1E, borders #2A2A2A. All monochromatic. No gradients, no blur backgrounds, no glass effects.
Accent colors — electric yellow #E8FF47 as the single primary accent. Red #FF4444 for heat/danger states only. Green #44FF88 for success/mild states only. Use accents on one dominant element per screen maximum. Never as large background fills.
Typography — Space Grotesk or Outfit for body text. JetBrains Mono or similar monospace for all numbers, phone numbers, scores, and data values. Off-white #F0F0F0 for primary text, #808080 for labels.
Buttons — solid border 1px #2A2A2A, border-radius 14px, hard drop-shadow 4px 4px 0px #000. On hover: shadow grows to 5px 5px 0px #000 and element lifts -1px. On active/press: shadow collapses to 0px 0px 0px #000 and element translates down +3px — a physical sunken press feel. Transition: 75ms ease. Primary CTA uses yellow fill with black text. Ghost buttons use transparent fill with white text.
Cards — background #141414, border 1px #2A2A2A, border-radius 20px, no shadow. Padding 20px.
Interactive rows (table rows, list items) — on hover: background shifts to #1E1E1E, left border accent 3px solid #E8FF47. Cursor pointer. Transition 100ms.
Modals — centered, same card treatment, border-radius 24px. Backdrop: rgba(0,0,0,0.85). Slide-up animation 300ms ease-out on open.
Tag/pill buttons — inactive: bg-#1E1E1E border-#2A2A2A. Selected: bg-#E8FF47 text-black border-#E8FF47 with the press shadow. Max 3 selectable at once — unselectable ones dim to opacity-40.
Progress/flavor bars — dark track #1E1E1E, filled portion #E8FF47, height 8px, border-radius 4px. Animate width from 0 on mount over 600ms with 80ms stagger per bar.
Overall feel — brutally structured, no decoration, no drop shadows except the hard offset shadow on interactive elements. Rounded edges soften the brutalism without removing it. Consistent 4px grid spacing. Nothing is centered unless it's a modal or result card.
