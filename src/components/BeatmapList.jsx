import React from 'react';
import useStore from '../store';
import './beatmapList.scss';

export default function BeatmapList() {
    const beatmaps = useStore(state => state.beatmaps);

    return (
        <div>
            <h2>Beatmap List</h2>
            {beatmaps.length === 0 ? (
                <p>No beatmaps available</p>
            ) : (
                <ul>
                    {beatmaps.map((beatmap, index) => (
                        <li key={index}>
                            {beatmap.title} by {beatmap.beatmapset.artist}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
