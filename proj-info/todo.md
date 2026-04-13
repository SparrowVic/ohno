# TODO

## Information Architecture

- Zostawić główny podział `Algorithms` vs `Structures`.
- Nie duplikować tych samych bytów w obu widokach tylko po to, że są powiązane.
- Traktować `Structures` jako widok typu "czym to jest i jak działa wewnętrznie".
- Traktować `Algorithms` jako widok typu "co wykonujemy i jaki jest przebieg procesu".
- Rozważyć zmianę sekcji `Trees` w `Algorithms` na `Tree Algorithms` albo `Tree Traversals`, bo przy obecnym zakresie brzmi zbyt szeroko.

## Cross-links Between Algorithms And Structures

- Dodać sekcję `Related structures` na widoku algorytmu.
- Dodać sekcję `Related algorithms` albo `Common algorithms` na widoku struktury.
- Pokazywać relacje tylko wtedy, gdy są faktycznie sensowne edukacyjnie.

Przykładowe mapowania:

- `BFS` -> `Queue`
- `DFS` -> `Stack`
- `Dijkstra` -> `Priority Queue`, `Min Heap`
- `Kruskal` -> `Union-Find`
- `Prim` -> `Priority Queue`
- `Topological Sort (Kahn's)` -> `Queue`
- `Trie` -> `Prefix Search`
- `Segment Tree` -> `Range Query`, `Range Update`
- `Heap` -> `Heap Sort`, `Priority Queue`

## Catalog UX

- Dodać filtr `Implemented` / `Coming soon`.
- Dodać licznik zaimplementowanych pozycji per sekcja.
- Dodać badge typu `Implemented`, `Planned`, `Premium visualization`, `Concept only`.
- Rozważyć `featured` lub `recommended path` dla początkujących.

## Educational Metadata

- Dodać `Prerequisites` na kartach detail, np. `graphs`, `heaps`, `recursion`.
- Dodać `Used in` lub `Builds on`.
- Dodać `Related concepts`.
- Dodać poziom trudności osobno dla teorii i osobno dla implementacji, jeśli katalog zacznie rosnąć.

## Future Visualization Roadmap

- Grafy:
  - `BFS`
  - `DFS`
  - `Dijkstra`
  - `A*`
  - `Prim`
  - `Kruskal`
- Struktury drzewiaste:
  - `BST`
  - `AVL`
  - `Red-Black Tree`
  - `B-Tree`
  - `B+ Tree`
  - `Trie`
  - `Segment Tree`
  - `Fenwick Tree`
- Warto rozważyć wspólny silnik wizualizacji node-edge dla grafów i drzew, zamiast budować każdy renderer od zera.

## Detail View Ideas

- Dodać presetowe inputy zamiast tylko losowania danych.
- Dodać tryb `step explanation`, który pokazuje krótkie wyjaśnienie aktualnej operacji.
- Dodać tryb `compare`, np. `BFS vs DFS`, `Merge Sort vs Quick Sort`.
- Dodać zapamiętywanie ostatniego wariantu wizualizacji i rozmiaru inputu per algorytm.
- Dodać `shareable state` w query params dla wybranej wizualizacji, speed, size i danych wejściowych.

## i18n Rollout

- Rozszerzyć Transloco na katalog, sidebar, detail pages i stany `coming soon`.
- Trzymać klucze w stałych/obiektach zamiast rozproszonych stringów.
- Zostawić label `Przejebane` dla PL.
- Dla EN obecnie używane `Insane`, ale można jeszcze rozważyć `Brutal` albo `Extreme`.

## Small UI Improvements Worth Doing Later

- Dodać w sidebarze subtelny opis sekcji przy hover lub active state.
- Dodać ikonę `lock` albo inny wizualny sygnał dla niezaimplementowanych pozycji.
- Dodać podpowiedź po hover na disabled card z krótkim komunikatem, że wizualizacja jest planowana.
- Dodać miękki onboarding na pustszych sekcjach, np. `Start with Bubble Sort`, `Try Radix Sort next`.
