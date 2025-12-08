const Card = ({
    children,
    className = '',
    hover = false,
    onClick,
    ...props
}) => {
    const hoverClass = hover ? 'card-hover' : 'card';
    const clickableClass = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`${hoverClass} ${clickableClass} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
