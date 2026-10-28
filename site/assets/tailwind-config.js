// Thème Œil Studio v2 — partagé par toutes les pages.
// Un fond, une encre, un signal (rose), et trois aplats qui identifient les disciplines.
// Les noms de jetons historiques (surface-card, primary-container…) sont conservés pour les jeux.
const INK = "#141413";
const GROUND = "#F7F6F2";
tailwind.config = {
  theme: {
    extend: {
      colors: {
        // Rôles principaux
        ink: INK,
        ground: GROUND,
        signal: "#F0447A",
        "field-color": "#D8EF71",
        "field-composition": "#B9D9FF",
        "field-typography": "#F7B4CC",

        // Surfaces : des paliers de ton, jamais d'ombre
        background: GROUND,
        surface: GROUND,
        "surface-bright": GROUND,
        "surface-canvas": GROUND,
        "surface-card": "#FFFFFF",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F0EFEA",
        "surface-container": "#EAE9E3",
        "surface-container-high": "#E2E1DA",
        "surface-container-highest": "#D8D7CF",
        "surface-variant": "#E2E1DA",
        "surface-dim": "#D8D7CF",
        "border-subtle": "#E0DFD8",
        outline: "#8A8983",
        "outline-variant": "#CFCEC6",

        // Texte
        "text-primary": INK,
        "on-surface": INK,
        "on-background": INK,
        "text-muted": "#5E5D58",
        "on-surface-variant": "#4A4945",
        secondary: "#5E5D58",

        // Action : l'encre. Le signal sert à la sélection et au résultat.
        primary: "#000000",
        "primary-container": INK,
        "accent-electric": INK,
        "surface-tint": INK,
        "on-primary": "#FFFFFF",
        "on-primary-container": "#FFFFFF",
        "inverse-surface": INK,
        "inverse-on-surface": GROUND,

        // Disciplines (anciens noms, mêmes aplats)
        "domain-color": "#D8EF71",
        "domain-composition": "#B9D9FF",
        "domain-typography": "#F7B4CC",
        "domain-vector": "#FFC08F",

        error: "#C4222B",
        "error-container": "#FCDCDD",
        "on-error": "#FFFFFF",
      },
      borderRadius: { DEFAULT: "2px", lg: "4px", xl: "6px", full: "9999px" },
      boxShadow: { xs: "none", sm: "none", DEFAULT: "none", md: "none", lg: "none", inner: "none" },
      spacing: {
        margin: "2rem", "margin-mobile": "1rem", gutter: "1.5rem", "gutter-mobile": "1rem",
        "space-xs": "0.25rem", "space-sm": "0.5rem", "space-md": "1rem", "space-lg": "1.5rem", "space-xl": "2.5rem",
      },
      fontFamily: {
        sans: ["Inter Tight", "system-ui", "sans-serif"],
        // Une seule famille : tous les anciens rôles pointent vers Inter Tight.
        "headline-xl": ["Inter Tight"], "headline-xl-mobile": ["Inter Tight"],
        "headline-lg": ["Inter Tight"], "headline-lg-mobile": ["Inter Tight"],
        "headline-md": ["Inter Tight"], "headline-sm": ["Inter Tight"],
        "body-lg": ["Inter Tight"], "body-md": ["Inter Tight"], "body-sm": ["Inter Tight"],
        "label-md": ["Inter Tight"], "label-caps": ["Inter Tight"],
        "mono-sm": ["Inter Tight"], "mono-metric": ["Inter Tight"],
      },
      fontSize: {
        mega: ["clamp(4.5rem, 15.4vw, 15rem)", { lineHeight: "0.86", letterSpacing: "-0.06em", fontWeight: "500" }],
        big: ["clamp(2.75rem, 7vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.05em", fontWeight: "500" }],
        display: ["clamp(4.5rem, 10.5vw, 10rem)", { lineHeight: "0.9", letterSpacing: "-0.055em", fontWeight: "500" }],
        "headline-xl": ["64px", { lineHeight: "1", letterSpacing: "-0.045em", fontWeight: "500" }],
        "headline-xl-mobile": ["40px", { lineHeight: "1.02", letterSpacing: "-0.04em", fontWeight: "500" }],
        "headline-lg": ["44px", { lineHeight: "1.04", letterSpacing: "-0.035em", fontWeight: "500" }],
        "headline-lg-mobile": ["30px", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "500" }],
        "headline-md": ["28px", { lineHeight: "1.12", letterSpacing: "-0.025em", fontWeight: "500" }],
        "headline-sm": ["19px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-lg": ["19px", { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.55", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.3", fontWeight: "500" }],
        "label-caps": ["13px", { lineHeight: "1.3", fontWeight: "500" }],
        "mono-sm": ["13px", { lineHeight: "1.4", fontWeight: "400" }],
        "mono-metric": ["15px", { lineHeight: "1.4", fontWeight: "500" }],
      },
    },
  },
};
