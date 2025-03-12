# Osuverse

Osuverse to aplikacja webowa do zarządzania kolekcjami beatmap z gry osu!. Pozwala na wyszukiwanie, organizowanie i tagowanie beatmap, ułatwiając zarządzanie własną biblioteką map.

## Główne funkcjonalności

- Wyszukiwanie beatmap przez osu!api v2
- System kolekcji beatmap
- System customowych tagów
- Sortowanie i filtrowanie beatmap
- Nowoczesny, responsywny interfejs użytkownika

## Technologie

- React + Vite
- SCSS dla stylowania
- Zustand do zarządzania stanem
- osu!api v2 do pobierania danych
- LocalStorage do przechowywania lokalnych danych

## TODO Lista

### Priorytet 1: Podstawowa funkcjonalność
- [ ] System autentykacji osu!
  - [ ] Implementacja OAuth flow
  - [ ] Zapisywanie tokenu w bezpieczny sposób
  - [ ] Automatyczne odświeżanie tokenu

- [ ] Ulepszenie systemu tagów
  - [ ] Interfejs do zarządzania tagami (dodawanie, usuwanie, edycja)
  - [ ] Automatyczne sugestie tagów
  - [ ] Grupowanie tagów (np. difficulty, style, length)
  - [ ] Zapisywanie tagów w localStorage

- [ ] Rozbudowa systemu kolekcji
  - [ ] Interfejs do zarządzania kolekcjami
  - [ ] Możliwość eksportu/importu kolekcji
  - [ ] Współdzielenie kolekcji między użytkownikami
  - [ ] Statystyki kolekcji (liczba map, średnia trudność, etc.)

### Priorytet 2: Zaawansowane funkcje
- [ ] Zaawansowane filtrowanie beatmap
  - [ ] Filtrowanie po metadanych (AR, CS, HP, etc.)
  - [ ] Filtrowanie po tagach
  - [ ] Zapisywanie presetów filtrów

- [ ] System podglądu beatmap
  - [ ] Wyświetlanie szczegółowych informacji
  - [ ] Podgląd miniaturki mapy
  - [ ] Odtwarzanie preview audio
  - [ ] Podstawowe statystyki (długość, BPM, etc.)

- [ ] Integracja z osu!
  - [ ] Bezpośrednie pobieranie beatmap
  - [ ] Synchronizacja z lokalnymi kolekcjami osu!
  - [ ] Sprawdzanie statusu posiadania beatmapy

### Priorytet 3: UX i optymalizacja
- [ ] Optymalizacja wydajności
  - [ ] Cachowanie beatmap
  - [ ] Lazy loading dla list
  - [ ] Optymalizacja zapytań do API

- [ ] Ulepszenia UX
  - [ ] Animacje i przejścia
  - [ ] Tryb ciemny/jasny
  - [ ] Customowe motywy
  - [ ] Skróty klawiszowe

- [ ] PWA
  - [ ] Offline mode
  - [ ] Push notifications
  - [ ] Instalacja jako aplikacja

## Jak zacząć

1. Sklonuj repozytorium
```bash
git clone https://github.com/domintes/osuverse.git
```

2. Zainstaluj zależności
```bash
cd osuverse
npm install
```

3. Utwórz plik `.env` w głównym katalogu:
```env
VITE_OSU_CLIENT_ID=twoje_client_id
VITE_OSU_CLIENT_SECRET=twoje_client_secret
```

4. Uruchom aplikację
```bash
npm run dev
```

## Jak kontrybuować

1. Forkuj projekt
2. Stwórz branch z funkcjonalnością (`git checkout -b feature/AmazingFeature`)
3. Commituj zmiany (`git commit -m 'Add some AmazingFeature'`)
4. Pushuj do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## Licencja

Ten projekt jest na licencji MIT - zobacz plik [LICENSE.md](LICENSE.md) po szczegóły.
