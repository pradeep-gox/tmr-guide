export const BUBBLE_CSS = `
.tmrg-bubble {
  position: fixed;
  z-index: 2147483641;
  width: 260px;
  max-height: min(380px, calc(100vh - 120px));
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
  padding: 14px 16px 12px;
  pointer-events: auto;
  transition: left 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              top  0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.2s ease,
              transform 0.2s ease;
  transform-origin: bottom left;
  opacity: 0;
  transform: scale(0.85) translateY(8px);
}
.tmrg-bubble.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Tail */
.tmrg-bubble::before {
  content: '';
  position: absolute;
  bottom: 18px;
  width: 0; height: 0;
  border-style: solid;
}
.tmrg-bubble[data-side="right"]::before {
  left: -9px;
  border-width: 7px 9px 7px 0;
  border-color: transparent #e5e7eb transparent transparent;
}
.tmrg-bubble[data-side="right"]::after {
  content: '';
  position: absolute;
  bottom: 19.5px;
  left: -7px;
  width: 0; height: 0;
  border-style: solid;
  border-width: 5.5px 7px 5.5px 0;
  border-color: transparent #ffffff transparent transparent;
}
.tmrg-bubble[data-side="left"]::before {
  right: -9px;
  border-width: 7px 0 7px 9px;
  border-color: transparent transparent transparent #e5e7eb;
}
.tmrg-bubble[data-side="left"]::after {
  content: '';
  position: absolute;
  bottom: 19.5px;
  right: -7px;
  width: 0; height: 0;
  border-style: solid;
  border-width: 5.5px 0 5.5px 7px;
  border-color: transparent transparent transparent #ffffff;
}

/* Dismiss button */
.tmrg-bubble-dismiss {
  position: absolute;
  top: 8px; right: 10px;
  background: none; border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 16px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  pointer-events: auto;
  flex-shrink: 0;
}
.tmrg-bubble-dismiss:hover { color: #374151; background: #f3f4f6; }

/* Scrollable text area */
.tmrg-bubble-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  /* subtle scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
.tmrg-bubble-scroll::-webkit-scrollbar { width: 4px; }
.tmrg-bubble-scroll::-webkit-scrollbar-track { background: transparent; }
.tmrg-bubble-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }

/* Text */
.tmrg-bubble-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: #1f2937;
  margin: 0;
  padding-right: 12px;
  min-height: 20px;
}
.tmrg-bubble-text b { font-weight: 600; }
.tmrg-bubble-text a { color: #ff6700; text-decoration: underline; }

/* Typing dots */
.tmrg-typing {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 22px;
}
.tmrg-typing span {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #d1d5db;
  animation: tmrg-dot 1.1s ease-in-out infinite;
}
.tmrg-typing span:nth-child(2) { animation-delay: 0.18s; }
.tmrg-typing span:nth-child(3) { animation-delay: 0.36s; }
@keyframes tmrg-dot {
  0%, 80%, 100% { transform: translateY(0); background: #d1d5db; }
  40%            { transform: translateY(-5px); background: #ff6700; }
}
@media (prefers-reduced-motion: reduce) {
  .tmrg-typing span { animation: none; }
  .tmrg-bubble { transition: opacity 0.15s ease !important; }
}

/* Q&A input area */
.tmrg-bubble-input-row {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  align-items: flex-end;
  flex-shrink: 0;
}
.tmrg-bubble-input {
  flex: 1;
  resize: none;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 12.5px;
  line-height: 1.4;
  font-family: inherit;
  color: #1f2937;
  background: #f9fafb;
  outline: none;
  max-height: 80px;
  overflow-y: auto;
}
.tmrg-bubble-input:focus { border-color: #ff6700; background: #fff; }
.tmrg-bubble-send {
  flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: 8px;
  border: none;
  background: #ff6700;
  color: white;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  padding: 0;
}
.tmrg-bubble-send:disabled { background: #d1d5db; cursor: not-allowed; }
.tmrg-bubble-send:hover:not(:disabled) { background: #e85d00; }

/* Follow-up chips */
.tmrg-followups {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
  flex-shrink: 0;
}
.tmrg-chip {
  font-size: 11.5px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-radius: 20px;
  padding: 3px 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.tmrg-chip:hover { background: #ffedd5; }
`;
