# 🎵 Coolections - Modern Collection Viewer

A beautiful, modern alternative to the Collections page with inspiration from osu.ppy.sh and randrop.io.

## 🌟 Features

### View Modes
- **Grid View**: Card-based layout with beatmap covers
- **List View**: Full-width items with detailed information

### Random Picker 🎲
- Click "Random" to get a random beatmap from your collections
- Featured display with large cover art
- One-click to open in osu!

### Smart Filtering
- **All Beatmaps**: View everything at once
- **Favorites**: Quick access to favorited maps
- **To Check**: Maps you've marked to review
- **Collection Selector**: Filter by any specific collection

### Beautiful UI
- Gradient accents (purple to cyan)
- Smooth animations and transitions
- Hover effects on cards
- Responsive design for all devices
- Cover image backgrounds
- Star rating displays

## 🎨 Design Inspiration

### From osu.ppy.sh:
- Grid layout with beatmap cards
- Cover image backgrounds
- Expandable difficulty lists
- Clean, modern aesthetic
- Filter tabs

### From randrop.io:
- Random beatmap picker
- Featured random beatmap showcase
- Shuffle animation
- Quick play functionality

## 🚀 Usage

1. Navigate to `/coolections` or click "Coolections" in the navbar
2. Choose your view mode (Grid or List)
3. Apply filters as needed
4. Click "Random" for a random beatmap
5. Click on beatmaps to open them in osu.ppy.sh

## 📱 Responsive

- **Desktop**: Full grid layout, all features
- **Tablet**: Adapted grid, stacked controls
- **Mobile**: Single column, touch-optimized

## 🎯 Quick Actions

- Click beatmap card → Open beatmapset in osu!
- Click "Difficulties" → Expand difficulty list
- Click difficulty chip → Open specific difficulty
- Click "Random" → Get random beatmap
- Click "Open in osu!" → Launch random beatmap

## 🎨 Customization

The page respects your Osuverse theme settings and uses CSS variables for colors:
- `--accent`: Primary accent color
- `--text`: Text color
- `--bg-primary`: Background color

## 🔧 Technical

- Built with Next.js 14+ (App Router)
- Uses Jotai for state management
- Lucide React for icons
- SCSS for styling
- Fully client-side rendered

## 📦 Files

```
app/coolections/
├── page.js          # Main component
└── coolections.scss # Styles
```

## 🎨 Color Scheme

- **Primary**: #ea81fb (Purple/Pink)
- **Secondary**: #64c8ff (Cyan/Blue)
- **Gradients**: Purple → Cyan
- **Overlays**: Semi-transparent blacks

## ⌨️ Keyboard Support

- Tab navigation through elements
- Enter to activate buttons
- Esc to close modals (future)

## 🐛 Troubleshooting

**No beatmaps showing?**
- Make sure you have beatmaps in your collections
- Check if filters are too restrictive

**Random button not working?**
- Ensure you have at least one beatmap in the filtered view

**Beatmaps not opening?**
- Make sure pop-ups are allowed for the site

## 🔮 Future Ideas

- [ ] Search within collections
- [ ] Sort options (star rating, date added)
- [ ] Bulk selection and actions
- [ ] Custom color themes
- [ ] Export collection as image
- [ ] Advanced random filters
- [ ] Statistics dashboard
- [ ] Playlist creator
- [ ] Share collections with friends

## 🤝 Contributing

Found a bug or have a feature request? Open an issue or submit a PR!

---

Made with ❤️ for the Osuverse community
