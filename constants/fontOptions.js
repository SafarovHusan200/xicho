export const FONT_OPTIONS = [
  { id: 'inter', label: 'Inter', isDefault: true },
  { id: 'onest', label: 'Onest' },
  { id: 'manrope', label: 'Manrope' },
  { id: 'montserrat', label: 'Montserrat' },
];

/* Literal font names rather than var(--font-*) indirection: those variables are
   only defined starting at <body> (next/font's `.variable` class), while
   --app-font-family is set on <html> — a custom property's var() references
   resolve against the scope where THAT property is declared, not wherever it's
   later inherited to, so a var()-based chain here would silently resolve to
   nothing every time. */
export const FONT_STACKS = {
  inter: '"Inter", "Inter Fallback", sans-serif',
  onest: '"Onest", "Onest Fallback", "Inter", "Inter Fallback", sans-serif',
  manrope: '"Manrope", "Manrope Fallback", "Inter", "Inter Fallback", sans-serif',
  montserrat: '"Montserrat", "Montserrat Fallback", "Inter", "Inter Fallback", sans-serif',
};
