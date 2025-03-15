// Przykładowe dane beatmap z osu! API v2
// Zawiera różne gatunki muzyczne, w tym breakcore i frenchcore

export const beatmaps = [
  {
    id: 1001,
    title: "The Big Black",
    artist: "The Quick Brown Fox",
    creator: "Blue Dragon",
    bpm: 360,
    star_rating: 6.58,
    status: "ranked",
    tags: ["breakcore", "speedcore", "dragonforce", "difficult", "stream"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/131891/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/131891/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/131891/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 15,
    updatedAt: Date.now() - 3600000 * 24 * 5
  },
  {
    id: 1002,
    title: "Freedom Dive",
    artist: "Xi",
    creator: "Nakagawa-Kanon",
    bpm: 222.22,
    star_rating: 7.27,
    status: "ranked",
    tags: ["stream", "technical", "difficult", "japanese", "xi"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/129891/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/129891/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/129891/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 20,
    updatedAt: Date.now() - 3600000 * 24 * 10
  },
  {
    id: 1003,
    title: "Brain Power",
    artist: "NOMA",
    creator: "Monstrata",
    bpm: 170,
    star_rating: 5.44,
    status: "ranked",
    tags: ["stream", "jump", "electronic", "meme", "vocal"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/633519/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/633519/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/633519/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 25,
    updatedAt: Date.now() - 3600000 * 24 * 15
  },
  {
    id: 1004,
    title: "Everything Will Freeze",
    artist: "Undead Corporation",
    creator: "Ekoro",
    bpm: 240,
    star_rating: 7.65,
    status: "ranked",
    tags: ["metal", "stream", "difficult", "japanese", "rock"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/158023/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/158023/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/158023/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 30,
    updatedAt: Date.now() - 3600000 * 24 * 20
  },
  {
    id: 1005,
    title: "Euphoria",
    artist: "DJ TOTTO",
    creator: "PaRaDogi",
    bpm: 180,
    star_rating: 5.79,
    status: "ranked",
    tags: ["trance", "japanese", "instrumental", "dnb", "electronic"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/183911/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/183911/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/183911/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 35,
    updatedAt: Date.now() - 3600000 * 24 * 25
  },
  {
    id: 1006,
    title: "Speedcore 300",
    artist: "DJ Myosuke",
    creator: "LMT",
    bpm: 300,
    star_rating: 8.25,
    status: "ranked",
    tags: ["speedcore", "japanese", "stream", "difficult", "electronic"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/293832/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/293832/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/293832/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 40,
    updatedAt: Date.now() - 3600000 * 24 * 30
  },
  {
    id: 1007,
    title: "Avalanche",
    artist: "Camellia",
    creator: "handsome",
    bpm: 175,
    star_rating: 6.79,
    status: "loved",
    tags: ["breakcore", "glitch", "japanese", "stream", "electronic"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/899732/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/899732/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/899732/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 45,
    updatedAt: Date.now() - 3600000 * 24 * 35
  },
  {
    id: 1008,
    title: "Quaoar",
    artist: "The Quick Brown Fox",
    creator: "Blue Dragon",
    bpm: 300,
    star_rating: 7.12,
    status: "ranked",
    tags: ["breakcore", "speedcore", "difficult", "stream", "electronic"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/109059/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/109059/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/109059/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 50,
    updatedAt: Date.now() - 3600000 * 24 * 40
  },
  {
    id: 1009,
    title: "Extratone Suicide",
    artist: "Diabarha",
    creator: "Ekoro",
    bpm: 900,
    star_rating: 9.45,
    status: "loved",
    tags: ["extratone", "speedcore", "breakcore", "difficult", "stream"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/883975/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/883975/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/883975/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 55,
    updatedAt: Date.now() - 3600000 * 24 * 45
  },
  {
    id: 1010,
    title: "DJ Noriken - #ERASEERASE",
    artist: "DJ Noriken",
    creator: "Reol",
    bpm: 180,
    star_rating: 5.65,
    status: "ranked",
    tags: ["frenchcore", "hardcore", "electronic", "japanese"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/512408/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/512408/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/512408/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 60,
    updatedAt: Date.now() - 3600000 * 24 * 50
  },
  {
    id: 1011,
    title: "Embraced by the Flame",
    artist: "Camellia",
    creator: "SKSalt",
    bpm: 174,
    star_rating: 6.33,
    status: "ranked",
    tags: ["dnb", "japanese", "electronic", "drumstep", "jump"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/751771/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/751771/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/751771/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 65,
    updatedAt: Date.now() - 3600000 * 24 * 55
  },
  {
    id: 1012,
    title: "Frenchcore Vibes",
    artist: "Dr. Peacock",
    creator: "RiP3X",
    bpm: 200,
    star_rating: 6.12,
    status: "ranked",
    tags: ["frenchcore", "hardcore", "electronic", "stream", "jump"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/712276/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/712276/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/712276/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 70,
    updatedAt: Date.now() - 3600000 * 24 * 60
  },
  {
    id: 1013,
    title: "Soulless 4",
    artist: "ExileLord",
    creator: "Nathan",
    bpm: 260,
    star_rating: 8.92,
    status: "loved",
    tags: ["technical", "guitar", "difficult", "instrumental", "stream"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/421743/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/421743/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/421743/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 75,
    updatedAt: Date.now() - 3600000 * 24 * 65
  },
  {
    id: 1014,
    title: "GHOST",
    artist: "Camellia",
    creator: "Skystar",
    bpm: 165,
    star_rating: 6.83,
    status: "ranked",
    tags: ["japanese", "electronic", "jump", "stream", "technical"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/679779/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/679779/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/679779/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 80,
    updatedAt: Date.now() - 3600000 * 24 * 70
  },
  {
    id: 1015,
    title: "Cycle Hit",
    artist: "Kasai Harcores",
    creator: "Worminators",
    bpm: 186,
    star_rating: 7.25,
    status: "ranked",
    tags: ["japanese", "electronic", "jump", "stream", "technical"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/636839/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/636839/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/636839/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 85,
    updatedAt: Date.now() - 3600000 * 24 * 75
  },
  {
    id: 1016,
    title: "Breakcore Massacre",
    artist: "Diabarha",
    creator: "MinhTheThao",
    bpm: 340,
    star_rating: 9.12,
    status: "loved",
    tags: ["breakcore", "hardcore", "electronic", "difficult", "stream"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/862694/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/862694/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/862694/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 90,
    updatedAt: Date.now() - 3600000 * 24 * 80
  },
  {
    id: 1017,
    title: "Frenchkore Elixir",
    artist: "The Speed Freak",
    creator: "MrKrabs",
    bpm: 210,
    star_rating: 6.78,
    status: "ranked",
    tags: ["frenchcore", "hardcore", "electronic", "stream", "difficult"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/891243/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/891243/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/891243/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 95,
    updatedAt: Date.now() - 3600000 * 24 * 85
  },
  {
    id: 1018,
    title: "Image Material",
    artist: "Tatsh",
    creator: "Scorpiour",
    bpm: 150,
    star_rating: 7.02,
    status: "ranked",
    tags: ["trance", "japanese", "electronic", "difficult", "stream"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/93523/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/93523/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/93523/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 100,
    updatedAt: Date.now() - 3600000 * 24 * 90
  },
  {
    id: 1019,
    title: "Flower Dance",
    artist: "DJ Okawari",
    creator: "Narcissu",
    bpm: 155,
    star_rating: 5.78,
    status: "ranked",
    tags: ["piano", "jazz", "instrumental", "jump", "technical"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/472158/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/472158/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/472158/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 105,
    updatedAt: Date.now() - 3600000 * 24 * 95
  },
  {
    id: 1020,
    title: "Ultimate Ascension",
    artist: "Camellia",
    creator: "fanzhen0019",
    bpm: 160,
    star_rating: 7.46,
    status: "ranked",
    tags: ["japanese", "electronic", "technical", "jump", "stream"],
    covers: {
      cover: "https://assets.ppy.sh/beatmaps/773366/covers/cover.jpg",
      card: "https://assets.ppy.sh/beatmaps/773366/covers/card.jpg",
      list: "https://assets.ppy.sh/beatmaps/773366/covers/list.jpg"
    },
    createdAt: Date.now() - 3600000 * 24 * 110,
    updatedAt: Date.now() - 3600000 * 24 * 100
  }
]; 