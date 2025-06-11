// filepath: c:\Stuff\Projects\osuverse\REFACTORING-PLAN.md
# Plan Refaktoryzacji Osuverse

## Problemy obecnej implementacji

1. Duży komponent `UserCollectionsPanel.jsx` z wieloma odpowiedzialnościami
2. Mieszanie logiki biznesowej i UI
3. Duplikacja kodu i trudności w utrzymaniu
4. Wiele lokalnych stanów zamiast centralnego zarządzania

## Proponowana Architektura

### Centralne zarządzanie stanem z atomWithReducer

Już zaimplementowaliśmy atom z reducerem (`collectionsReducerAtom.js`), ale nie jest on jeszcze w pełni wykorzystywany w komponentach. Proponuję pełną migrację do tego podejścia:

```
┌───────────────────┐      ┌─────────────────┐
│                   │      │                 │
│   Components      │─────▶│  Atom Hooks     │
│                   │      │                 │
└───────────────────┘      └────────┬────────┘
        ▲                           │
        │                           ▼
┌───────┴───────────┐      ┌─────────────────┐
│                   │      │                 │
│    UI Updates     │◀─────│    Reducers     │
│                   │      │                 │
└───────────────────┘      └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │                 │
                           │   Local Storage │
                           │                 │
                           └─────────────────┘
```

### Podział reducerów

Zastosowaliśmy już podział reducerów na specjalizowane moduły:

1. `collectionsReducer.js` - zarządzanie kolekcjami
2. `beatmapsReducer.js` - zarządzanie beatmapami
3. `tagsReducer.js` - zarządzanie tagami
4. `uiReducer.js` - zarządzanie stanem interfejsu

## Kroki refaktoryzacji

1. ✅ Utworzyć atomWithReducer dla każdego głównego obszaru funkcjonalnego
2. ✅ Zdefiniować akcje i kreatory akcji
3. ✅ Zaimplementować reducery
4. ✅ Podzielić duże komponenty na mniejsze
5. ✅ Utworzyć hooki do korzystania z atomów i dispatchowania akcji
6. 🔄 Zastąpić lokalne stany odpowiednimi akcjami i selektorami
7. 🔄 Zapewnić obsługę persystencji za pomocą localStorage

## Korzyści refaktoryzacji

1. **Lepsza organizacja kodu** - każdy reducer odpowiada za swój obszar funkcjonalny
2. **Łatwiejsze testowanie** - łatwiej testować reducery jako czyste funkcje
3. **Lepsze debugowanie** - każda zmiana stanu jest jawnie wykonywana przez akcje
4. **Mniejsze komponenty** - łatwiejsze do zrozumienia i utrzymania
5. **Spójne zarządzanie stanem** - jeden wzorzec dla całego projektu
6. **Łatwiejsze rozszerzanie** - dodawanie nowych funkcji tylko przez dodanie akcji i reduktora

## Implementacja hooków niestandardowych

Dla każdego obszaru funkcjonalnego utworzyliśmy dedykowane hooki:

1. `useCollectionsReducer.js` - hook do zarządzania kolekcjami
2. `useBeatmapSort.js` - hook do sortowania beatmap
3. `useBeatmapFilter.js` - hook do filtrowania beatmap
4. `useCollectionDragDrop.js` - hook do obsługi drag & drop w kolekcjach

Te hooki zapewniają specjalizowaną funkcjonalność i ukrywają szczegóły implementacji przed komponentami.

## Struktura komponentów

Podzieliliśmy `UserCollectionsPanel` na mniejsze komponenty:

1. `UserCollectionsPanel.jsx` - główny komponent (prosty wrapper)
2. `UserCollectionsPanelContainer.jsx` - kontener zarządzający stanem
3. `CollectionsList.jsx` - lista kolekcji
4. `CollectionItem.jsx` - pojedyncza kolekcja
5. `SubcollectionItem.jsx` - pojedyncza podkolekcja
6. `BeatmapList.jsx` - lista beatmap w kolekcji/podkolekcji
7. `AddCollectionForm.jsx` - formularze dodawania kolekcji/podkolekcji
8. `GlobalFilterSortControls.jsx` - kontrolki filtrowania i sortowania

## Dalsze rekomendacje

1. Przeprowadzić podobną refaktoryzację dla pozostałych głównych obszarów funkcjonalnych w aplikacji (np. wyszukiwanie, panel użytkownika)
2. Zastosować podejście testowe z testami jednostkowymi dla reducerów
3. Dodać narzędzia do debugowania stanu (np. logger akcji)
4. Zapewnić optymalizację renderowania za pomocą React.memo i useMemo
5. Rozważyć dodanie obsługi TypeScript dla lepszej kontroli typów

## Podsumowanie

Proponowana refaktoryzacja pozwoli na bardziej zorganizowane zarządzanie stanem i zmniejszenie złożoności komponentów. Centralny rdzeń aplikacji oparty na atomWithReducer z Jotai zapewni większą przewidywalność zmian stanu i łatwiejsze debugowanie.
