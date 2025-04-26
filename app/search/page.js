"use client";

import SearchInput from "@/components/SearchInput";
import { useAuth } from "@/hooks/useAuth";

export default function SearchPage() {
    useAuth();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Find beatmaps by artist</h1>
            <SearchInput />
        </div>
    );
} 