import { useState } from 'react';

/**
 * Loan requests per month, drawn as inline SVG.
 *
 * Hand-rolled rather than pulling in a charting library: this is the only chart
 * in the app, and the deployment target installs dependencies offline.
 *
 * One series, so there is no legend and no categorical palette — a single brand
 * hue carries the whole chart and identity comes from the axis labels.
 */

// A fixed coordinate space scaled by the viewBox, so the chart is responsive
// without needing to measure the container.
const W = 720;
const H = 210;
const PAD = { top: 16, right: 8, bottom: 28, left: 34 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const BAR_RATIO = 0.55;   // bar width as a fraction of its slot; the rest is gap
const CORNER = 4;

/** Round the axis maximum up to a multiple of the band count. Gridlines sit at
 *  quarters of the axis, so a max divisible by 4 is what keeps every tick label a
 *  whole number — otherwise a peak of 9 yields ticks like 0/2.25/4.5/6.75/9. */
const BANDS = 4;
const niceMax = (value) => Math.max(BANDS, Math.ceil(value / BANDS) * BANDS);

/** Bar with rounded top corners only — the bottom stays square because it is
 *  anchored to the baseline, and rounding it there would lift it off the axis. */
const barPath = (x, y, w, h) => {
    const r = Math.min(CORNER, w / 2, h);
    return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
};

const MonthlyLoansChart = ({ data }) => {
    const [hovered, setHovered] = useState(null);

    const points = data || [];
    const total = points.reduce((sum, d) => sum + d.count, 0);

    if (points.length === 0) {
        return <p className="text-sm text-gray-400 py-8 text-center">No loan history yet.</p>;
    }

    const peak = Math.max(...points.map(d => d.count), 0);
    const max = niceMax(peak);
    const slot = PLOT_W / points.length;
    const barW = slot * BAR_RATIO;
    const yOf = (v) => PAD.top + PLOT_H - (v / max) * PLOT_H;

    const ticks = Array.from({ length: BANDS + 1 }, (_, i) => (max / BANDS) * i);

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-auto"
                role="img"
                aria-label={`Loan requests per month over the last ${points.length} months, ${total} in total`}
            >
                {/* Gridlines and y-axis labels — recessive, behind the data. */}
                {ticks.map(t => (
                    <g key={t}>
                        <line
                            x1={PAD.left} x2={W - PAD.right}
                            y1={yOf(t)} y2={yOf(t)}
                            stroke="#e9ecef" strokeWidth="1"
                        />
                        <text
                            x={PAD.left - 8} y={yOf(t) + 3.5}
                            textAnchor="end" fontSize="10" fill="#adb5bd"
                        >
                            {t}
                        </text>
                    </g>
                ))}

                {points.map((d, i) => {
                    const x = PAD.left + i * slot + (slot - barW) / 2;
                    const y = yOf(d.count);
                    const h = PAD.top + PLOT_H - y;
                    const isHovered = hovered === i;

                    return (
                        <g key={d.month}>
                            {/* Full-height hit target: the bar itself is too small to
                                hover comfortably when the count is low or zero. */}
                            <rect
                                x={PAD.left + i * slot} y={PAD.top}
                                width={slot} height={PLOT_H}
                                fill="transparent"
                                onMouseEnter={() => setHovered(i)}
                                onMouseLeave={() => setHovered(null)}
                            />
                            {d.count > 0 && (
                                <path
                                    d={barPath(x, y, barW, h)}
                                    fill={isHovered ? '#5a8c04' : '#2d5a02'}
                                    className="transition-colors"
                                    pointerEvents="none"
                                />
                            )}
                            {/* Label the busiest month only — a number on every bar is
                                noise, and the rest are readable from the axis. */}
                            {d.count === peak && d.count > 0 && !isHovered && (
                                <text
                                    x={x + barW / 2} y={y - 5}
                                    textAnchor="middle" fontSize="10"
                                    fill="#495057" fontWeight="600"
                                    pointerEvents="none"
                                >
                                    {d.count}
                                </text>
                            )}
                            <text
                                x={PAD.left + i * slot + slot / 2} y={H - 9}
                                textAnchor="middle" fontSize="10"
                                fill={isHovered ? '#212529' : '#adb5bd'}
                                pointerEvents="none"
                            >
                                {d.label}
                            </text>
                        </g>
                    );
                })}

                {/* Baseline sits above the month labels. */}
                <line
                    x1={PAD.left} x2={W - PAD.right}
                    y1={PAD.top + PLOT_H} y2={PAD.top + PLOT_H}
                    stroke="#dee2e6" strokeWidth="1"
                />
            </svg>

            {hovered !== null && (
                <div
                    className="pointer-events-none absolute -top-1 bg-gray-900 text-white text-[11px] rounded px-2 py-1 whitespace-nowrap"
                    style={{
                        left: `${((hovered + 0.5) / points.length) * 100}%`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {points[hovered].label} {points[hovered].month.slice(0, 4)}:{' '}
                    <span className="font-semibold">{points[hovered].count}</span>{' '}
                    {points[hovered].count === 1 ? 'request' : 'requests'}
                </div>
            )}
        </div>
    );
};

export default MonthlyLoansChart;
