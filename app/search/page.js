"use client";

import SearchInput from "@/components/SearchInput";
import { useAuth } from "@/hooks/useAuth";

export default function SearchPage() {
    useAuth();

    return (
        <div>
            <h1>Find osu! beatmaps</h1>
            <SearchInput />
        </div>
    );
} 