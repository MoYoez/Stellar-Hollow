import { Fragment } from "react";
import type { TerminalStreamController } from "@/lib/terminal-stream";

interface TerminalCursorProps {
  color: string;
  solid?: boolean;
}

export function TerminalCursor({ color, solid = false }: TerminalCursorProps) {
  return (
    <span
      aria-hidden
      className={`terminal-cursor ${solid ? "terminal-cursor--solid" : "terminal-cursor--blink"}`}
      style={{
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}66`,
      }}
    />
  );
}

interface RichTextProps {
  text: string;
  /** Optional character limit for progressive terminal typing (counts visible glyphs only) */
  visibleChars?: number;
  showCursor?: boolean;
  cursorColor?: string;
  cursorSolid?: boolean;
}

/**
 * Lightweight inline text renderer supporting `~~strikethrough~~` inner-voice notes
 * and progressive character-by-character terminal typing without exposing raw `~~` markers.
 */
export function RichText({
  text,
  visibleChars,
  showCursor = false,
  cursorColor = "currentColor",
  cursorSolid = false,
}: RichTextProps) {
  const parts = text.split(/(~~[^~]+~~)/g);
  const limit = visibleChars === undefined ? Infinity : Math.max(0, visibleChars);

  let remaining = limit;
  const rendered: React.ReactNode[] = [];

  for (let idx = 0; idx < parts.length; idx++) {
    const part = parts[idx];
    if (!part || remaining <= 0) continue;

    const isDel = part.startsWith("~~") && part.endsWith("~~") && part.length > 4;
    const content = isDel ? part.slice(2, -2) : part;
    const chars = Array.from(content);
    const take = Math.min(chars.length, remaining);
    if (take <= 0) continue;

    const slice = take === chars.length ? content : chars.slice(0, take).join("");
    remaining -= take;

    if (isDel) {
      rendered.push(
        <del key={idx} className="soft-del">
          {slice}
        </del>
      );
    } else {
      rendered.push(<Fragment key={idx}>{slice}</Fragment>);
    }
  }

  return (
    <>
      {rendered}
      {showCursor && <TerminalCursor color={cursorColor} solid={cursorSolid} />}
    </>
  );
}

interface StreamTextProps {
  id: string;
  text: string;
  stream: TerminalStreamController;
  cursorColor: string;
  /** Keep a softly blinking cursor resting at the end once streaming completes */
  restCursor?: boolean;
}

export function StreamText({
  id,
  text,
  stream,
  cursorColor,
  restCursor = false,
}: StreamTextProps) {
  const count = stream.visibleCount(id);
  const showCursor = stream.isCursorAt(id) || restCursor;
  if (count === 0 && !showCursor) return null;

  return (
    <RichText
      text={text}
      visibleChars={count}
      showCursor={showCursor}
      cursorColor={cursorColor}
      cursorSolid={restCursor ? false : stream.isActivelyTyping}
    />
  );
}
