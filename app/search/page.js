"use client";

import SearchInput from "@/components/SearchInput";
import { useAuth } from "@/hooks/useAuth";
import MainOsuverseDiv from '@/components/MainOsuverseDiv';

export default function SearchPage() {
    useAuth();

    return (
        <MainOsuverseDiv className="search-container">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#ea81fb', textShadow: '0 0 16px #2f0f3a' }}>Find beatmaps by artist</h1>
            <SearchInput />
        </MainOsuverseDiv>
    );
}