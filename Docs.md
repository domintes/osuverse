# Osuverse Developer Docs

## Most Important Files & Functions

- **State Management:**
  - `src/store/collectionAtom.js` — Jotai atom for user collections (with localStorage persistence)
  - `src/store/authAtom.js` — Jotai atom for authentication state
- **UI Components:**
  - `src/components/UserCollectionsPanel.jsx` — Main UI for managing collections and subcollections
  - `src/components/TagSections.jsx/TagSections.jsx` — Dynamic tag grouping and filtering (Artists, Mappers, Difficulty, User Tags)
  - `src/components/CustomTags/CustomTags.jsx` — User custom tags UI
  - `src/components/OsuverseLogo/AddBeatmapModal/AddBeatmapModal.jsx` — Modal for adding beatmaps to collections (with custom tags)
  - `src/components/BlackHoleParticles.jsx` — Animated background for void/galaxy effect
- **Styling:**
  - `app/globals.scss` — Global theme (dark, cyberpunk, void, hi-tech)
  - Component-specific SCSS in each component folder

## How to Re-use Components

- All major UI elements are modular React components with their own SCSS.
- Use Jotai atoms for global state (collections, auth, selected tags).
- TagSections and CustomTags are reusable for any tag-based filtering UI.
- AddBeatmapModal can be triggered from anywhere to add beatmaps to any collection/subcollection.

## Ideas for Future Development

- **Cloud Sync:** Save user collections to account (if authenticated), not just localStorage.
- **Advanced Tagging:** Allow users to create, edit, and merge custom tags; support tag colors.
- **osu!APIv2 Integration:** Improve search and metadata fetching (see: osu.ppy.sh/docs/)
- **Mobile UI:** Responsive improvements for mobile devices.
- **Collection Sharing:** Public/private collection links, import/export.
- **More Visual Effects:** Animated event horizon, metallic UI, more cyberpunk/galaxy backgrounds.
- **Accessibility:** Keyboard navigation, colorblind-friendly themes.

---

For more, see README.md and in-code comments.
