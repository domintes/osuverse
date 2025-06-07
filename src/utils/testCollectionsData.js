/**
 * Dane testowe do sprawdzania funkcjonalności związanych z kolekcjami
 */

export const testCollectionsData = {
  collections: [
    {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Unsorted',
      order: -1,
      isSystemCollection: true,
      subcollections: []
    },
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Favorites',
      order: -2,
      isSystemCollection: true,
      subcollections: []
    },
    {
      id: 'test-collection-1',
      name: 'Tech Maps',
      order: 1,
      subcollections: [
        {
          id: 'test-subcollection-1',
          name: 'Fast Streams',
          order: 1
        },
        {
          id: 'test-subcollection-2',
          name: 'Challenges',
          order: 2
        }
      ]
    },
    {
      id: 'test-collection-2',
      name: 'Farm Maps',
      order: 2,
      subcollections: []
    }
  ],
  beatmaps: {
    'beatmap-1': {
      id: 'beatmap-1',
      setId: 'set-1',
      artist: 'Camellia',
      title: 'GHOST',
      version: 'Insane',
      creator: 'BlueSky',
      difficulty_rating: 6.2,
      collectionId: 'test-collection-1',
      subcollectionId: 'test-subcollection-1',
      userTags: [
        { tag: 'tech', tag_value: 3 },
        { tag: 'stream', tag_value: 4 },
        { tag: 'favorite', tag_value: 5 }
      ],
      cover: 'https://assets.ppy.sh/beatmaps/816264/covers/cover.jpg',
      previewUrl: 'https://b.ppy.sh/preview/816264.mp3'
    },
    'beatmap-2': {
      id: 'beatmap-2',
      setId: 'set-1',
      artist: 'Camellia',
      title: 'GHOST',
      version: 'Normal',
      creator: 'BlueSky',
      difficulty_rating: 4.2,
      collectionId: 'test-collection-1',
      subcollectionId: 'test-subcollection-1',
      userTags: [
        { tag: 'tech', tag_value: 2 },
        { tag: 'beginner', tag_value: 3 }
      ],
      cover: 'https://assets.ppy.sh/beatmaps/816264/covers/cover.jpg',
      previewUrl: 'https://b.ppy.sh/preview/816264.mp3'
    },
    'beatmap-3': {
      id: 'beatmap-3',
      setId: 'set-2',
      artist: 'DragonForce',
      title: 'Through The Fire And Flames',
      version: 'Expert',
      creator: 'RedStar',
      difficulty_rating: 7.1,
      collectionId: 'test-collection-1',
      subcollectionId: 'test-subcollection-2',
      userTags: [
        { tag: 'stream', tag_value: 5 },
        { tag: 'speed', tag_value: 5 },
        { tag: 'challenge', tag_value: 4 }
      ],
      cover: 'https://assets.ppy.sh/beatmaps/751771/covers/cover.jpg',
      previewUrl: 'https://b.ppy.sh/preview/751771.mp3'
    },
    'beatmap-4': {
      id: 'beatmap-4',
      setId: 'set-3',
      artist: 'YOASOBI',
      title: 'Racing Into The Night',
      version: 'Hard',
      creator: 'MapperX',
      difficulty_rating: 5.3,
      collectionId: 'test-collection-2',
      subcollectionId: null,
      userTags: [
        { tag: 'farm', tag_value: 4 },
        { tag: 'jump', tag_value: 3 }
      ],
      cover: 'https://assets.ppy.sh/beatmaps/928118/covers/cover.jpg',
      previewUrl: 'https://b.ppy.sh/preview/928118.mp3'
    },
    'beatmap-5': {
      id: 'beatmap-5',
      setId: 'set-4',
      artist: 'Hoshimachi Suisei',
      title: 'GHOST',
      version: 'Extreme',
      creator: 'MapperX',
      difficulty_rating: 6.5,
      collectionId: 'test-collection-2',
      subcollectionId: null,
      userTags: [
        { tag: 'farm', tag_value: 5 },
        { tag: 'jump', tag_value: 5 },
        { tag: 'favorite', tag_value: 4 }
      ],
      cover: 'https://assets.ppy.sh/beatmaps/1093421/covers/cover.jpg',
      previewUrl: 'https://b.ppy.sh/preview/1093421.mp3'
    }
  },
  beatmapsets: {
    'set-1': {
      id: 'set-1',
      artist: 'Camellia',
      title: 'GHOST',
      creator: 'BlueSky',
      cover: 'https://assets.ppy.sh/beatmaps/816264/covers/cover.jpg'
    },
    'set-2': {
      id: 'set-2',
      artist: 'DragonForce',
      title: 'Through The Fire And Flames',
      creator: 'RedStar',
      cover: 'https://assets.ppy.sh/beatmaps/751771/covers/cover.jpg'
    },
    'set-3': {
      id: 'set-3',
      artist: 'YOASOBI',
      title: 'Racing Into The Night',
      creator: 'MapperX',
      cover: 'https://assets.ppy.sh/beatmaps/928118/covers/cover.jpg'
    },
    'set-4': {
      id: 'set-4',
      artist: 'Hoshimachi Suisei',
      title: 'GHOST',
      creator: 'MapperX',
      cover: 'https://assets.ppy.sh/beatmaps/1093421/covers/cover.jpg'
    }
  },
  tags: {
    'tech': { 
      count: 2, 
      beatmapIds: ['beatmap-1', 'beatmap-2'] 
    },
    'stream': { 
      count: 2, 
      beatmapIds: ['beatmap-1', 'beatmap-3'] 
    },
    'favorite': { 
      count: 2, 
      beatmapIds: ['beatmap-1', 'beatmap-5'] 
    },
    'beginner': { 
      count: 1, 
      beatmapIds: ['beatmap-2'] 
    },
    'speed': { 
      count: 1, 
      beatmapIds: ['beatmap-3'] 
    },
    'challenge': { 
      count: 1, 
      beatmapIds: ['beatmap-3'] 
    },
    'farm': { 
      count: 2, 
      beatmapIds: ['beatmap-4', 'beatmap-5'] 
    },
    'jump': { 
      count: 2, 
      beatmapIds: ['beatmap-4', 'beatmap-5'] 
    }
  }
};

/**
 * Funkcja do wczytywania danych testowych do atomu kolekcji
 * @param {Function} setCollections - Funkcja aktualizująca atom kolekcji
 */
export const loadTestCollectionsData = (setCollections) => {
  setCollections(testCollectionsData);
};
