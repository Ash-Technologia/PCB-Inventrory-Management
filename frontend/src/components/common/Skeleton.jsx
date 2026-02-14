const Skeleton = ({ width = '100%', height = '20px', className = '', circle = false }) => {
    if (circle) {
        return (
            <div
                className={`skeleton rounded-full ${className}`}
                style={{ width: height, height }}
            />
        );
    }

    return (
        <div
            className={`skeleton ${className}`}
            style={{ width, height }}
        />
    );
};

export default Skeleton;
