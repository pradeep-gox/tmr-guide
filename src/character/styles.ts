export const CHARACTER_CSS = `
/* ── tmr-guide character ─────────────────────────────────────── */
#tmr-guide-root {
  position: fixed;
  top: 0; left: 0;
  width: 0; height: 0;
  z-index: 2147483640;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.tmrg-char {
  position: fixed;
  /* Above the spotlight overlay (2147483638) and ring (2147483639) so the
     character is always fully visible even when the overlay is active */
  z-index: 2147483640;
  pointer-events: auto;
  cursor: pointer;
  transition: left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
              top  0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, left, top;
}

/* States */
.tmrg-char[data-state="idle"] .tmrg-char-inner {
  animation: tmrg-float 2.4s ease-in-out infinite;
}
.tmrg-char[data-state="walking"] .tmrg-char-inner {
  animation: tmrg-walk 0.45s ease-in-out infinite;
}
.tmrg-char[data-state="talking"] .tmrg-char-inner {
  animation: tmrg-talk 0.35s ease-in-out infinite;
}
.tmrg-char[data-state="thinking"] .tmrg-char-inner {
  animation: tmrg-think 1.2s ease-in-out infinite;
}
.tmrg-char[data-state="celebrating"] .tmrg-char-inner {
  animation: tmrg-celebrate 0.5s ease-in-out 3;
}

@media (prefers-reduced-motion: reduce) {
  .tmrg-char[data-state] .tmrg-char-inner { animation: none !important; }
  .tmrg-char { transition: none !important; }
}

@keyframes tmrg-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}
@keyframes tmrg-walk {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%       { transform: translateY(-3px) rotate(2deg); }
}
@keyframes tmrg-talk {
  0%, 100% { transform: scaleY(1); }
  50%       { transform: scaleY(0.96); }
}
@keyframes tmrg-think {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25%       { transform: translateY(-2px) rotate(-3deg); }
  75%       { transform: translateY(-2px) rotate(3deg); }
}
@keyframes tmrg-celebrate {
  0%   { transform: translateY(0) scale(1); }
  30%  { transform: translateY(-18px) scale(1.08); }
  60%  { transform: translateY(-4px) scale(0.97); }
  100% { transform: translateY(0) scale(1); }
}

/* ── Toggle button — shared base ──────────────────────────────── */
.tmrg-toggle-btn {
  position: absolute;
  bottom: -26px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px 3px 7px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.13);
  background: #fff;
  color: #888;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
  transition: opacity 0.18s, background 0.12s, color 0.12s, border-color 0.12s;
  line-height: 1;
  font-family: inherit;
}
.tmrg-toggle-btn:hover { background: #f4f4f4; color: #444; }
.tmrg-toggle-btn[data-enabled="false"] {
  color: #ff6700;
  border-color: rgba(255,103,0,0.35);
  background: rgba(255,103,0,0.05);
}
.tmrg-toggle-btn[data-enabled="false"]:hover { background: rgba(255,103,0,0.10); }

/* hover variant — hidden by default; JS controls show/hide with a grace-period delay */
.tmrg-toggle-btn[data-style="hover"] {
  opacity: 0;
  pointer-events: none;
}

/* badge variant — icon-only circle on character top-right corner */
.tmrg-toggle-btn[data-style="badge"] {
  bottom: auto;
  top: -5px;
  right: -5px;
  left: auto;
  transform: none;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  justify-content: center;
  font-size: 0;
}

/* ── Corner chip — detached fixed pill ────────────────────────── */
.tmrg-corner-chip {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px 4px 8px;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.13);
  background: #fff;
  color: #888;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.10);
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  line-height: 1;
  font-family: inherit;
  z-index: 2147483641;
}
.tmrg-corner-chip:hover { background: #f4f4f4; color: #444; }
.tmrg-corner-chip[data-enabled="false"] {
  color: #ff6700;
  border-color: rgba(255,103,0,0.35);
  background: rgba(255,103,0,0.05);
}
.tmrg-corner-chip[data-enabled="false"]:hover { background: rgba(255,103,0,0.10); }

/* ── Context menu ─────────────────────────────────────────────── */
.tmrg-ctx-menu {
  position: fixed;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.13);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.14);
  padding: 4px;
  z-index: 2147483641;
  pointer-events: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.tmrg-ctx-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #444;
  cursor: pointer;
  border-radius: 5px;
  white-space: nowrap;
  transition: background 0.1s;
}
.tmrg-ctx-item:hover { background: #f4f4f4; }

/* Sparkles on celebrate */
.tmrg-sparkle {
  position: absolute;
  width: 6px; height: 6px;
  border-radius: 50%;
  pointer-events: none;
  animation: tmrg-sparkle-pop 0.7s ease-out forwards;
  opacity: 0;
}
@keyframes tmrg-sparkle-pop {
  0%   { transform: translate(0,0) scale(0); opacity: 1; }
  100% { transform: translate(var(--sx), var(--sy)) scale(1); opacity: 0; }
}
`;
