export const theme = {
  colors: {
    primary: '#ff66aa', // osu! pink
    secondary: '#2a2040', // deep purple
    background: '#0a0a0f', // almost black
    void: '#13131f', // void container background
    text: '#ffffff',
    textSecondary: '#b3b3cc',
    border: 'rgba(255, 102, 170, 0.2)',
    error: '#ff4444',
    success: '#44ff44',
    danger: '#ff4444',
  },
  shadows: {
    void: '0 4px 20px rgba(0, 0, 0, 0.25)',
    hover: '0 8px 30px rgba(255, 102, 170, 0.15)',
    active: '0 2px 10px rgba(255, 102, 170, 0.2)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  grid: {
    columns: 12,
    containerMaxWidth: '1440px',
    containerPadding: '1.5rem',
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
  zIndex: {
    background: -1,
    base: 0,
    dropdown: 1000,
    modal: 2000,
    tooltip: 3000,
  },
  typography: {
    fontFamily: {
      base: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      glitch: '"Space Mono", monospace',
      heading: '"Outfit", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      xxl: '1.875rem',
      md: '1.875rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
};

// Helper functions to access theme values
export const color = (key) => theme.colors[key];
export const shadow = (key) => theme.shadows[key];
export const radius = (key) => theme.borderRadius[key];
export const space = (key) => theme.spacing[key];
export const breakpoint = (key) => theme.breakpoints[key];
export const transition = (key) => theme.transitions[key];
export const z = (key) => theme.zIndex[key];
export const font = (key) => theme.typography.fontFamily[key];
export const fontSize = (key) => theme.typography.fontSize[key];

// Gradient helpers
export const gradients = {
  void: `linear-gradient(135deg, ${theme.colors.void} 0%, ${darken(theme.colors.void, 0.05)} 100%)`,
  primary: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${darken(theme.colors.primary, 0.1)} 100%)`,
  background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${darken(theme.colors.background, 0.05)} 100%)`,
};

// Utility functions (replacing Sass functions)
export function darken(color, amount) {
  return adjustColor(color, { l: -amount * 100 });
}

export function lighten(color, amount) {
  return adjustColor(color, { l: amount * 100 });
}

// Color adjustment function (simple implementation)
function adjustColor(color, { l = 0 }) {
  // Convert hex to RGB
  let r, g, b;
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
    if (match) {
      [, r, g, b] = match.map(Number);
    }
  }

  if (r === undefined || g === undefined || b === undefined) {
    return color;
  }

  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  let li = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = li > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Adjust lightness
  li = Math.max(0, Math.min(1, li + l / 100));

  // Convert back to RGB
  let r1, g1, b1;
  if (s === 0) {
    r1 = g1 = b1 = li;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = li < 0.5 ? li * (1 + s) : li + s - li * s;
    const p = 2 * li - q;
    r1 = hue2rgb(p, q, h + 1 / 3);
    g1 = hue2rgb(p, q, h);
    b1 = hue2rgb(p, q, h - 1 / 3);
  }

  // Convert back to hex
  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}
