/**
 * The small caret used by the header dropdowns: a chevron with butt-cut ends,
 * drawn on a 400-unit em grid so it can be sized with `font-size`.
 */
export function ChevronIcon() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M97 118 205 226 313 118 348 153 205 303 62 153Z" />
    </svg>
  );
}
