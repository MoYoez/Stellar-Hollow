interface TideWavesProps {
  primaryColor: string;
  secondaryColor: string;
  dark?: boolean;
}

/**
 * 3-layer translucent Morandi tide waves resting gently at the bottom of the viewport.
 * Seamless double-tile SVG wave paths drifting at slow staggered rhythms (18s / 26s / 34s),
 * smoothly cross-fading color as the reader scrolls across chapters.
 */
export function TideWaves({ primaryColor, secondaryColor, dark = false }: TideWavesProps) {
  const waveTransition = {
    transition: "fill 2.1s cubic-bezier(0.33, 1, 0.68, 1), fill-opacity 1.1s ease, stroke 2.1s cubic-bezier(0.33, 1, 0.68, 1), stroke-opacity 1.1s ease",
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 h-[126px] sm:h-[148px] overflow-hidden z-[2]"
    >
      {/* Back slow mist wave */}
      <div className="tide-wave-track tide-wave-track--slow">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tide-wave-svg">
          <path
            d="M0,74 C180,26 360,118 540,74 C720,30 900,114 1080,74 C1260,34 1350,96 1440,74 L1440,160 L0,160 Z"
            fill={secondaryColor}
            fillOpacity={dark ? 0.08 : 0.14}
            style={waveTransition}
          />
        </svg>
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tide-wave-svg">
          <path
            d="M0,74 C180,26 360,118 540,74 C720,30 900,114 1080,74 C1260,34 1350,96 1440,74 L1440,160 L0,160 Z"
            fill={secondaryColor}
            fillOpacity={dark ? 0.08 : 0.14}
            style={waveTransition}
          />
        </svg>
      </div>

      {/* Middle counter-drifting pastel tide */}
      <div className="tide-wave-track tide-wave-track--mid">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tide-wave-svg">
          <path
            d="M0,96 C240,54 480,132 720,96 C960,60 1200,130 1440,96 L1440,160 L0,160 Z"
            fill={primaryColor}
            fillOpacity={dark ? 0.11 : 0.18}
            style={waveTransition}
          />
        </svg>
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tide-wave-svg">
          <path
            d="M0,96 C240,54 480,132 720,96 C960,60 1200,130 1440,96 L1440,160 L0,160 Z"
            fill={primaryColor}
            fillOpacity={dark ? 0.11 : 0.18}
            style={waveTransition}
          />
        </svg>
      </div>

      {/* Front gentle wave with whisper-thin luminous crest */}
      <div className="tide-wave-track tide-wave-track--front">
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tide-wave-svg">
          <path
            d="M0,116 C220,86 440,142 720,116 C1000,90 1220,142 1440,116 L1440,160 L0,160 Z"
            fill={primaryColor}
            fillOpacity={dark ? 0.14 : 0.22}
            style={waveTransition}
          />
          <path
            d="M0,116 C220,86 440,142 720,116 C1000,90 1220,142 1440,116"
            fill="none"
            stroke={primaryColor}
            strokeOpacity={dark ? 0.3 : 0.44}
            strokeWidth="1.2"
            style={waveTransition}
          />
        </svg>
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="tide-wave-svg">
          <path
            d="M0,116 C220,86 440,142 720,116 C1000,90 1220,142 1440,116 L1440,160 L0,160 Z"
            fill={primaryColor}
            fillOpacity={dark ? 0.14 : 0.22}
            style={waveTransition}
          />
          <path
            d="M0,116 C220,86 440,142 720,116 C1000,90 1220,142 1440,116"
            fill="none"
            stroke={primaryColor}
            strokeOpacity={dark ? 0.3 : 0.44}
            strokeWidth="1.2"
            style={waveTransition}
          />
        </svg>
      </div>
    </div>
  );
}
