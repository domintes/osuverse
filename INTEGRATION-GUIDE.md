# Przewodnik po nowych komponentach i narzędziach Osuverse

Ten dokument zawiera instrukcje, jak skutecznie wykorzystać nowe biblioteki i komponenty, które zostały zintegrowane z projektem Osuverse.

## Użyte biblioteki

1. **Tagify** - Zaawansowany system tagów z autouzupełnianiem
2. **FuseJS** - Silnik wyszukiwania fuzzy dla zaawansowanych zapytań
3. **TanStack Table** - Zarządzanie tabelami z sortowaniem i filtrowaniem
4. **Motion** - Biblioteka animacji dla płynnego interfejsu użytkownika
5. **Jotai** - Zarządzanie stanem aplikacji z atomami, reducerami i selektorami

## 1. Tagify - Zaawansowane zarządzanie tagami

Komponent `EnhancedTagInput` został już zaimplementowany w `src/components/TagInput/EnhancedTagInput.jsx`.

### Przykład użycia:

```jsx
import EnhancedTagInput from '@/components/TagInput/EnhancedTagInput';

// W komponencie
const [tags, setTags] = useState([]);
const suggestions = ['easy', 'hard', 'medium', 'stream', 'jumps', 'tech'];

return (
  <EnhancedTagInput 
    value={tags}
    onChange={setTags}
    suggestions={suggestions}
    placeholder="Dodaj tagi..."
  />
);
```

## 2. FuseJS - Zaawansowane wyszukiwanie

Komponent `AdvancedSearchEngine` wykorzystuje FuseJS do wyszukiwania rozmytego w kolekcjach danych.

### Przykład użycia:

```jsx
import AdvancedSearchEngine from '@/components/SearchInput/AdvancedSearchEngine';

// W komponencie
const beatmaps = [...]; // dane do przeszukania

const handleResultsChange = (results) => {
  console.log('Znalezione beatmapy:', results);
};

return (
  <AdvancedSearchEngine
    data={beatmaps}
    keys={['title', 'artist', 'creator']} // pola do przeszukiwania
    onResultsChange={handleResultsChange}
    placeholder="Wyszukaj beatmapy..."
  />
);
```

## 3. TanStack Table - Zaawansowane tabele danych

Komponent `DataTable` oferuje zaawansowane funkcje tabel, takie jak sortowanie, filtrowanie i paginacja.

### Przykład użycia:

```jsx
import DataTable from '@/components/BeatmapSearchResults/DataTable';

// W komponencie
const data = [...]; // dane do wyświetlenia

const columns = [
  {
    accessorKey: 'title',
    header: 'Tytuł',
    cell: info => <span>{info.getValue()}</span>,
  },
  {
    accessorKey: 'artist',
    header: 'Artysta',
  },
  {
    accessorKey: 'difficulty_rating',
    header: 'Trudność',
    cell: info => <span>{info.getValue().toFixed(2)}★</span>,
  }
];

return (
  <DataTable 
    data={data} 
    columns={columns}
    initialSortBy={[{ id: 'difficulty_rating', desc: true }]}
  />
);
```

## 4. Motion - Animacje UI

Zaimplementowaliśmy zestaw komponentów animacji w `src/components/AnimatedComponents.jsx`.

### Przykład użycia:

```jsx
import { 
  AnimatedNeonButton, 
  FadeIn, 
  SlideIn, 
  NeonLoader, 
  TypewriterText 
} from '@/components/AnimatedComponents';

// W komponencie
return (
  <div>
    <FadeIn delay={0.3}>
      <h1>Osuverse</h1>
    </FadeIn>
    
    <SlideIn direction="up" delay={0.5}>
      <p>Twoja kolekcja beatmap w jednym miejscu</p>
    </SlideIn>
    
    {isLoading ? (
      <NeonLoader color="#ff66aa" size={60} />
    ) : (
      <AnimatedNeonButton onClick={handleClick} color="#66ffaa">
        Rozpocznij
      </AnimatedNeonButton>
    )}
    
    <TypewriterText 
      text="Witaj w przyszłości zarządzania beatmapami!" 
      speed={0.05}
      onComplete={() => console.log('Animacja zakończona')}
    />
  </div>
);
```

## 5. Jotai - Zaawansowane zarządzanie stanem

Jotai oferuje wiele zaawansowanych funkcji do zarządzania stanem:

### atomWithReducer

Już zaimplementowane w `src/store/collectionsReducerAtom.js`:

```js
// Przykład tworzenia atomu z reducerem
import { atomWithReducer } from 'jotai/utils';

const initialState = { /* ... */ };
const reducer = (state, action) => { /* ... */ };

export const myAtom = atomWithReducer(initialState, reducer);

// Użycie w komponencie
const [state, dispatch] = useAtom(myAtom);
```

### atomFamily i selectAtom

Zaimplementowane w `src/store/beatmapsAtomFamily.js`:

```js
// Przykład użycia atomFamily
import { useBeatmap, filteredBeatmapsAtom, beatmapsFilterAtom } from '@/store/beatmapsAtomFamily';
import { useAtom } from 'jotai';

// W komponencie
const beatmap = useBeatmap('1234'); // Pobiera pojedynczą beatmapę
const [filteredBeatmaps] = useAtom(filteredBeatmapsAtom); // Pobiera przefiltrowane beatmapy
const [filter, setFilter] = useAtom(beatmapsFilterAtom); // Ustawia filtry

// Zmiana filtrów
setFilter(prev => ({
  ...prev,
  difficulty: 5,
  mode: 'osu'
}));
```

## Refaktoryzacja kodu

Przy refaktoryzacji kodu zalecane jest:

1. Używanie **atomWithReducer** dla złożonych stanów
2. Dzielenie reducerów na logiczne części (np. collectionsReducer, uiReducer)
3. Tworzenie customowych hooków dla wspólnych funkcjonalności
4. Oddzielenie logiki biznesowej od komponentów UI

Przykładowa struktura projektu:

```
src/
  components/
    [ComponentName]/
      index.jsx          # Główny komponent
      styles.scss        # Styl komponentu
      hooks/             # Hooki specyficzne dla komponentu
      utils/             # Funkcje pomocnicze
  hooks/                 # Globalne hooki aplikacji
  store/                 # Atomy i reducery Jotai
    atoms/               # Pojedyncze atomy
    reducers/            # Reducery i akcje
  utils/                 # Globalne funkcje pomocnicze
```

## Dobre praktyki

1. Wykorzystuj hooki dla logiki biznesowej
2. Staraj się stosować komponenty prezentacyjne (bez stanu)
3. Korzystaj z animacji dla lepszego UX, ale nie przesadzaj
4. Używaj atomów Jotai do przechowywania globalnego stanu
5. Dla przetwarzania danych używaj selectAtom zamiast logiki w komponentach

Życzymy udanej pracy z nowymi narzędziami!
