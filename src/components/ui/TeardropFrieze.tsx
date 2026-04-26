import React, { useId } from 'react'

interface TeardropFriezeProps {
  /** Band height in px. Default 56. */
  height?: number
  /** Width of one repeating unit in px. Default 240. */
  unit?: number
  className?: string
  title?: string
}

/**
 * Fatimid-inspired ornamental band: a central red teardrop enveloped by a
 * continuous gold ogee-arch halo, flanked by sweeping half-palmettes.
 * Built as an SVG <pattern> at userSpaceOnUse so it tiles seamlessly.
 */
export function TeardropFrieze({
  height = 56,
  unit = 240,
  className,
  title,
}: TeardropFriezeProps) {
  const patternId = useId()
  const halfId = useId()
  const decorative = !title
  const cx = unit / 2
  const cy = height / 2

  // Universal scaling factor relative to default height 56
  const k = height / 56

  // ---------------------------------------------------------------------------
  // Geometry Definitions
  // We only define the LEFT HALF of the symmetrical elements.
  // The SVG <use> tag will mirror them perfectly across the center X axis.
  // ---------------------------------------------------------------------------

  // The main continuous flowing vine. It now swoops all the way to x=0
  // with perfectly vertical tangents so it seamlessly connects to adjacent tiles.
  const vineLeftHalf = [
    `M ${cx} ${48 * k}`, // Starts at the bottom center of the halo
    `A ${14 * k} ${14 * k} 0 0 1 ${cx - 14 * k} ${34 * k}`, // Sweeps up the left side
    `C ${cx - 14 * k} ${26 * k}, ${cx - 8 * k} ${16 * k}, ${cx} ${12 * k}`, // Ogee arch pointing up
    `C ${cx - 16 * k} ${8 * k}, ${cx - 40 * k} ${8 * k}, ${cx - 60 * k} ${14 * k}`, // Swoops down and out
    // Key Fix: Reaches exactly x=0 with vertical control points so it tiles seamlessly
    `C ${cx - 90 * k} ${22 * k}, 0 ${18 * k}, 0 ${cy}`,
    // Loops back from the edge
    `C 0 ${38 * k}, ${cx - 90 * k} ${34 * k}, ${cx - 60 * k} ${42 * k}`,
    `C ${cx - 40 * k} ${48 * k}, ${cx - 16 * k} ${48 * k}, ${cx - 14 * k} ${34 * k}`, // Sweeps back into the halo
  ].join(' ')

  // The large lower leaf pointing outwards
  const leftLowerLeaf = [
    `M ${cx - 25 * k} ${42 * k}`,
    `C ${cx - 35 * k} ${32 * k}, ${cx - 50 * k} ${28 * k}, ${cx - 60 * k} ${34 * k}`,
    `C ${cx - 55 * k} ${38 * k}, ${cx - 50 * k} ${42 * k}, ${cx - 48 * k} ${46 * k}`,
    `C ${cx - 38 * k} ${46 * k}, ${cx - 30 * k} ${46 * k}, ${cx - 25 * k} ${42 * k} Z`,
  ].join(' ')

  // The large upper leaf curling inwards towards the teardrop
  const leftUpperLeaf = [
    `M ${cx - 35 * k} ${12 * k}`,
    `C ${cx - 30 * k} ${20 * k}, ${cx - 25 * k} ${25 * k}, ${cx - 22 * k} ${30 * k}`,
    `C ${cx - 28 * k} ${28 * k}, ${cx - 38 * k} ${26 * k}, ${cx - 42 * k} ${30 * k}`,
    `C ${cx - 48 * k} ${24 * k}, ${cx - 50 * k} ${16 * k}, ${cx - 54 * k} ${12 * k}`,
    `C ${cx - 48 * k} ${10 * k}, ${cx - 42 * k} ${10 * k}, ${cx - 35 * k} ${12 * k} Z`,
  ].join(' ')

  // The central floating red teardrop
  const dropPath = [
    `M ${cx} ${18 * k}`,
    `C ${cx - 9 * k} ${24 * k}, ${cx - 10 * k} ${30 * k}, ${cx - 10 * k} ${35 * k}`,
    `A ${10 * k} ${10 * k} 0 0 0 ${cx + 10 * k} ${35 * k}`,
    `C ${cx + 10 * k} ${30 * k}, ${cx + 9 * k} ${24 * k}, ${cx} ${18 * k}`,
    `Z`,
  ].join(' ')

  return (
    <svg
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={title}
      className={className}
    >
      {title && <title>{title}</title>}
      <defs>
        {/* We define the left half of the intricate elements here to mirror later */}
        <g id={halfId}>
          {/* Main skeleton vine */}
          <path
            d={vineLeftHalf}
            fill="none"
            stroke="var(--alam-gold)"
            strokeWidth={2 * k}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Palmette Leaves */}
          <path d={leftLowerLeaf} fill="var(--alam-gold)" />
          <path d={leftUpperLeaf} fill="var(--alam-gold)" />

          {/* Incised leaf veins (cream cutouts) */}
          <path
            d={`M ${cx - 28 * k} ${41 * k} Q ${cx - 45 * k} ${35 * k} ${cx - 55 * k} ${37 * k}`}
            fill="none"
            stroke="#f4ead5"
            strokeWidth={1 * k}
            strokeLinecap="round"
          />
          <path
            d={`M ${cx - 35 * k} ${15 * k} Q ${cx - 40 * k} ${20 * k} ${cx - 46 * k} ${24 * k}`}
            fill="none"
            stroke="#f4ead5"
            strokeWidth={1 * k}
            strokeLinecap="round"
          />

          {/* Seam Clasp: Centered exactly at x=0. When adjacent tiles touch,
              the left and right halves of this motif merge into a complete diamond knot. */}
          <path
            d={`M 0 ${cy - 14 * k} C ${10 * k} ${cy - 14 * k}, ${14 * k} ${cy - 8 * k}, ${14 * k} ${cy} C ${14 * k} ${cy + 8 * k}, ${10 * k} ${cy + 14 * k}, 0 ${cy + 14 * k}`}
            fill="none"
            stroke="var(--alam-gold)"
            strokeWidth={2 * k}
          />
          <path
            d={`M 0 ${cy - 8 * k} C ${5 * k} ${cy - 8 * k}, ${7 * k} ${cy - 4 * k}, ${7 * k} ${cy} C ${7 * k} ${cy + 4 * k}, ${5 * k} ${cy + 8 * k}, 0 ${cy + 8 * k}`}
            fill="var(--alam-gold)"
          />
        </g>

        <pattern
          id={patternId}
          x="0"
          y="0"
          width={unit}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          {/* Creamy architectural ground */}
          <rect width={unit} height={height} fill="#f4ead5" />

          {/* Thick rigid top/bottom borders */}
          <rect width={unit} height={3.5 * k} fill="var(--alam-gold)" />
          <rect y={height - 3.5 * k} width={unit} height={3.5 * k} fill="var(--alam-gold)" />

          {/* Thin internal trace bands */}
          <rect y={4.5 * k} width={unit} height={1 * k} fill="var(--alam-gold)" opacity="0.5" />
          <rect y={height - 5.5 * k} width={unit} height={1 * k} fill="var(--alam-gold)" opacity="0.5" />

          {/* Left half of the ornament */}
          <use href={`#${halfId}`} />
          {/* Right half — dynamically mirrored so the paths flawlessly connect in the center */}
          <use href={`#${halfId}`} transform={`translate(${unit},0) scale(-1,1)`} />

          {/* Floating Central Red Teardrop */}
          <path d={dropPath} fill="var(--tear)" />

          {/* Glassy white highlight inside the teardrop */}
          <path
            d={`M ${cx - 4 * k} ${26 * k} C ${cx - 7 * k} ${30 * k}, ${cx - 7 * k} ${35 * k}, ${cx - 5 * k} ${39 * k}`}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={1 * k}
            strokeLinecap="round"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${patternId})`} />
    </svg>
  )
}

// Added wrapper to satisfy the preview environment
export default function App() {
  return (
    <div
      style={{
        '--tear': '#d9383a', // Warmer reference red
        '--alam-gold': '#c4a671', // Flat gold of the reference
        '--color-alam-gold-700': '#9b7d46',
      } as React.CSSProperties}
      className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 w-full"
    >
      {/* Container is kept ultra-wide (w-full max-w-5xl) so that you can see
        multiple 240px units repeating horizontally in the preview!
      */}
      <div className="w-full max-w-5xl px-4 flex flex-col gap-16">
        <div className="w-full">
          <h3 className="text-white/50 text-sm font-mono mb-4">Standard Height (56px) - Tiling Preview</h3>
          <TeardropFrieze />
        </div>
        <div className="w-full">
          <h3 className="text-white/50 text-sm font-mono mb-4">Large Height (112px) - Tiling Preview</h3>
          <TeardropFrieze height={112} unit={480} />
        </div>
      </div>
    </div>
  )
}
