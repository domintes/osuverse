"use client";

import SearchInput from "@/components/SearchInput";
import { useAuth } from "@/hooks/useAuth";
import OsuverseDiv from '@/components/OsuverseDiv';

export default function SearchPage() {
    useAuth();

    return (
        <OsuverseDiv>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#7ee0ff', textShadow: '0 0 16px #1a2a4d' }}>Find beatmaps by artist</h1>
            <SearchInput />
        </OsuverseDiv>
    );
}