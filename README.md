# Osuverse

A modern, cyberpunk-inspired web app for creating and managing osu! beatmap collections with custom tags, dynamic tag sorting, and hi-tech void/galaxy visuals.

## Features

- **Modern UI**: Cyberpunk, void, hi-tech, and metallic dark blue/black hole theme
- **User Collections**: Add, manage, and organize beatmaps into collections and subcollections
- **Custom Tags**: Add your own tags to beatmaps; dynamic tag sections (Artists, Mappers, Difficulty, User Tags)
- **Tag Filtering**: Show/hide tag groups with checkboxes; filter beatmaps by tags
- **osu!APIv2 Integration**: Search and fetch beatmaps (see [osu!APIv2 docs](https://osu.ppy.sh/docs/))
- **Global State**: Uses Jotai for state, with localStorage persistence
- **Account Sync**: (Planned) Save collections to user account if authenticated
- **Beautiful Effects**: Black hole particles, animated gradients, neon glows

## Quick Start

1. `npm install`
2. `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Developer Docs

See [Docs.md](./Docs.md) for important files, component reuse, and future ideas.

## Contributing

- Fork, branch, and PR as usual
- Please keep the cyberpunk/void/hi-tech style consistent
- See [osu!APIv2 docs](https://osu.ppy.sh/docs/) for API integration

---

For more, see in-code comments and Docs.md

## Environment variables

This project expects a local environment file for secrets and configuration. Copy the example and fill in your values before running the app:

1. Copy `.env.example` to `.env.local`.
2. Fill in `OSU_API_CLIENT_ID` and `OSU_API_CLIENT_SECRET` (get them from https://osu.ppy.sh/oauth/applications).
3. Ensure `OSU_REDIRECT_URI` matches the redirect you registered (e.g. `http://localhost:3000/api/auth/callback`).
4. Optionally set `DATABASE_URL` (Prisma). For quick local setup you can use SQLite: `DATABASE_URL="file:./dev.db"`.

Example:

```powershell
cp .env.example .env.local
# edit .env.local and add your client id/secret
```

Note: `.env*` is ignored by git by default in this repository. Do not commit secrets.
