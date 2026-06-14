// A visual that renders a title/author as an actual-looking book cover:
// a spine on the left edge, a coloured cover face, a glossy sheen, and depth.
// The colour is derived deterministically from the title so each book is consistent.

const PALETTES = [
    'from-primary-600 to-primary-800',
    'from-secondary-500 to-secondary-700',
    'from-accent-600 to-accent-800',
    'from-rose-500 to-rose-700',
    'from-indigo-500 to-indigo-700',
    'from-cyan-600 to-cyan-800',
    'from-fuchsia-600 to-fuchsia-800',
    'from-emerald-600 to-emerald-800',
];

const pickPalette = (seed = '') => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return PALETTES[hash % PALETTES.length];
};

const BookCover = ({ title = '', author = '', category, className = '' }) => {
    const gradient = pickPalette(title + author);

    return (
        <div className={`group/cover [perspective:800px] ${className}`}>
            <div className="relative h-full w-full rounded-l-[3px] rounded-r-lg shadow-[0_10px_25px_-8px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover/cover:[transform:rotateY(-8deg)] group-hover/cover:shadow-[0_18px_35px_-10px_rgba(0,0,0,0.5)]">
                {/* cover face */}
                <div className={`absolute inset-0 rounded-l-[3px] rounded-r-lg bg-gradient-to-br ${gradient} overflow-hidden`}>
                    {/* spine */}
                    <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-black/25" />
                    <div className="absolute left-[10px] top-0 bottom-0 w-px bg-white/25" />
                    <div className="absolute left-[13px] top-0 bottom-0 w-px bg-black/10" />

                    {/* glossy sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20" />

                    {/* text */}
                    <div className="relative flex flex-col h-full p-4 pl-5">
                        {category && (
                            <span className="self-start text-[9px] uppercase tracking-wider font-semibold text-white/70 border border-white/30 rounded px-1.5 py-0.5 mb-2 line-clamp-1">
                                {category}
                            </span>
                        )}
                        <p className="text-white font-display font-bold leading-snug line-clamp-5 drop-shadow-sm text-[15px]">
                            {title}
                        </p>
                        <div className="mt-auto pt-2">
                            <div className="h-px w-8 bg-white/40 mb-1.5" />
                            <p className="text-white/85 text-[11px] line-clamp-1 italic">{author}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookCover;
