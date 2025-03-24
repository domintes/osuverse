"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { authAtom } from "../store/authAtom";

export function useAuth() {
    const [token, setToken] = useAtom(authAtom);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch("/api/auth");
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Failed to fetch token");
                }
                const data = await res.json();
                setToken(data.access_token);
            } catch (err) {
                console.error("Auth error:", err.message);
                // Nie ustawiamy tokenu w przypadku błędu
            }
        };

        if (!token) fetchToken();
    }, [token, setToken]);

    return token;
}
