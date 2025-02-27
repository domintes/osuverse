import React from 'react';
import useStore from '../store';

const RemoveBeatmapButton = ({ beatmapId }) => {
    const removeBeatmap = useStore((state) => state.removeBeatmap);

    const handleRemove = () => {
        removeBeatmap(beatmapId);
    };

    return (
        <button onClick={handleRemove}>
            Remove
        </button>
    );
};

export default RemoveBeatmapButton;
