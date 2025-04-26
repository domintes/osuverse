'use client';

import SearchArtistInput from '@/components/SearchArtistInput';
import { useAuth } from '@/hooks/useAuth';

export default function ArtistsPage() {
    useAuth();

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Find beatmaps by artist</h1>
            <SearchArtistInput />
        </div>
    );
}