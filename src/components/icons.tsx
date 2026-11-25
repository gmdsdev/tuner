import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export const SlidersIcon = () => (
  <svg {...base} width="20" height="20" viewBox="0 0 20 20" strokeWidth={1.6}>
    <path d="M3 6h9M15 6h2M3 14h2M8 14h9" />
    <circle cx="13.5" cy="6" r="1.8" />
    <circle cx="6.5" cy="14" r="1.8" />
  </svg>
)

export const ChevronDownIcon = () => (
  <svg {...base} width="16" height="16" viewBox="0 0 16 16" strokeWidth={1.6}>
    <path d="M4 6l4 4 4-4" />
  </svg>
)

export const CloseIcon = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 18 18" strokeWidth={1.8}>
    <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
  </svg>
)

export const ArrowUpIcon = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 18 18" strokeWidth={2}>
    <path d="M9 14V4M4.5 8.5L9 4l4.5 4.5" />
  </svg>
)

export const ArrowDownIcon = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 18 18" strokeWidth={2}>
    <path d="M9 4v10M4.5 9.5L9 14l4.5-4.5" />
  </svg>
)

export const CheckIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 18 18" strokeWidth={2}>
    <path d="M4 9.5l3.2 3.2L14 5.5" />
  </svg>
)

export const MicIcon = () => (
  <svg {...base} width="20" height="20" viewBox="0 0 20 20" strokeWidth={1.7}>
    <rect x="7" y="2.5" width="6" height="10" rx="3" />
    <path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" />
  </svg>
)

export const LockIcon = () => (
  <svg {...base} width="12" height="12" viewBox="0 0 12 12" strokeWidth={1.5}>
    <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
    <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
  </svg>
)
