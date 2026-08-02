/**
 * Titles per category as horizontal bars.
 *
 * Horizontal because category names are long and would collide or need rotating
 * on a vertical axis. Built from divs rather than SVG so the labels wrap and
 * truncate with normal CSS.
 *
 * One measure, one hue — bar length carries the magnitude, so colouring each
 * category differently would add a second encoding that means nothing.
 */
const CategoryBreakdown = ({ categories, limit = 10 }) => {
    if (!categories || categories.length === 0) {
        return <p className="text-sm text-gray-400 py-8 text-center">No categories yet.</p>;
    }

    // Already sorted by title count server-side.
    const shown = categories.slice(0, limit);
    const remainder = categories.slice(limit);
    const remainderTitles = remainder.reduce((sum, c) => sum + c.titles, 0);
    const max = Math.max(...shown.map(c => c.titles), 1);

    return (
        <div>
            <ul className="space-y-2.5">
                {shown.map(c => (
                    <li key={c.category} className="flex items-center gap-3">
                        <span className="w-32 sm:w-40 shrink-0 text-[13px] text-gray-600 truncate" title={c.category}>
                            {c.category}
                        </span>
                        <span className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <span
                                className="block h-full bg-primary-600 rounded-full"
                                style={{ width: `${Math.max(2, (c.titles / max) * 100)}%` }}
                            />
                        </span>
                        <span className="w-14 shrink-0 text-right text-[13px] text-gray-900 font-medium tabular-nums">
                            {c.titles}
                        </span>
                    </li>
                ))}
            </ul>

            {remainder.length > 0 && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    + {remainder.length} more categories holding {remainderTitles} titles
                </p>
            )}
        </div>
    );
};

export default CategoryBreakdown;
