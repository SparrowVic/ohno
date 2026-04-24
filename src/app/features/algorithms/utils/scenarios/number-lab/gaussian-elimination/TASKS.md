# Gaussian Elimination - aktualne zadania i obliczenia

Ten plik opisuje aktywne zadania z `GAUSSIAN_ELIMINATION_TASKS` w `index.ts`
oraz ich domyślne wartości. Aktualizuj go zawsze po zmianie listy tasków,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

Aktualny notatnik na UI powinien pokazywać obliczenia jak zapis na kartce:
osobne sekcje `Układ równań`, `Macierz rozszerzona`, `Eliminacja w przód`,
`Eliminacja wstecz`, `Sprawdzenie`, `Wynik`. Dla układów osobliwych końcówka
ma jasno odróżniać `Wynik` z parametrem od `Brak rozwiązania` po wykryciu
sprzeczności.

Podstawowe operacje wierszowe:

```text
Ri <-> Rj
Ri <- Ri / pivot
Ri <- Ri - a * Rj
```

## Kolejność w widoku

1. `short` - podstawowe zadanie startowe, układ 2x2 z jednoznacznym wynikiem.
2. `row-swap` - zerowy pivot i konieczna zamiana wierszy.
3. `fraction-pivots` - układ 3x3, w którym pojawiają się ułamki.
4. `infinite-solutions` - układ zależny, zmienna wolna i rodzina rozwiązań.
5. `inconsistent-system` - układ sprzeczny, wiersz `0 = 1`, brak rozwiązań.

---

## Zadanie 1 - Podstawowe działanie eliminacji Gaussa

Task id: `short`

Domyślne wartości:

- `system = "1 1 | 5; 1 -1 | 1"`

Pola w popupie:

- `system`

Treść:

Rozwiąż układ:

```text
x + y = 5
x - y = 1
```

używając eliminacji Gaussa i pokaż wszystkie operacje wierszowe.

### Macierz rozszerzona

```text
[ 1   1 | 5 ]
[ 1  -1 | 1 ]
```

### Eliminacja w przód

```text
R2 <- R2 - R1
```

```text
[ 1   1 |  5 ]
[ 0  -2 | -4 ]
```

```text
R2 <- R2 / (-2)
```

```text
[ 1   1 | 5 ]
[ 0   1 | 2 ]
```

### Eliminacja wstecz

```text
R1 <- R1 - R2
```

```text
[ 1   0 | 3 ]
[ 0   1 | 2 ]
```

### Sprawdzenie

```text
3 + 2 = 5
3 - 2 = 1
```

### Wynik

```text
x = 3
y = 2
```

Charakter flow w notatniku:

- najprostszy przykład startowy;
- pokazuje eliminację w przód i wstecz bez ułamków;
- to zadanie jest domyślnym pierwszym wyborem po otwarciu widoku.

---

## Zadanie 2 - Zerowy pivot i zamiana wierszy

Task id: `row-swap`

Domyślne wartości:

- `system = "0 1 1 | 5; 1 1 1 | 6; 2 -1 1 | 3"`

Pola w popupie:

- `system`

Treść:

Rozwiąż układ:

```text
y + z = 5
x + y + z = 6
2x - y + z = 3
```

Pierwszy wiersz nie może być pivotem w kolumnie `x`, dlatego trzeba zacząć od
zamiany wierszy.

### Macierz rozszerzona

```text
[ 0   1   1 | 5 ]
[ 1   1   1 | 6 ]
[ 2  -1   1 | 3 ]
```

### Eliminacja w przód

```text
R1 <-> R2
```

```text
[ 1   1   1 | 6 ]
[ 0   1   1 | 5 ]
[ 2  -1   1 | 3 ]
```

```text
R3 <- R3 - 2R1
```

```text
[ 1   1   1 |  6 ]
[ 0   1   1 |  5 ]
[ 0  -3  -1 | -9 ]
```

```text
R3 <- R3 + 3R2
```

```text
[ 1   1   1 | 6 ]
[ 0   1   1 | 5 ]
[ 0   0   2 | 6 ]
```

```text
R3 <- R3 / 2
```

```text
[ 1   1   1 | 6 ]
[ 0   1   1 | 5 ]
[ 0   0   1 | 3 ]
```

### Eliminacja wstecz

```text
R1 <- R1 - R3
```

```text
[ 1   1   0 | 3 ]
[ 0   1   1 | 5 ]
[ 0   0   1 | 3 ]
```

```text
R2 <- R2 - R3
```

```text
[ 1   1   0 | 3 ]
[ 0   1   0 | 2 ]
[ 0   0   1 | 3 ]
```

```text
R1 <- R1 - R2
```

```text
[ 1   0   0 | 1 ]
[ 0   1   0 | 2 ]
[ 0   0   1 | 3 ]
```

### Sprawdzenie

```text
2 + 3 = 5
1 + 2 + 3 = 6
2 * 1 - 2 + 3 = 3
```

### Wynik

```text
x = 1
y = 2
z = 3
```

Charakter flow w notatniku:

- zaczyna się od zamiany wierszy;
- pokazuje, że pivot nie zawsze znajduje się w bieżącym wierszu;
- końcówka nadal prowadzi do jednoznacznego wyniku.

---

## Zadanie 3 - Układ 3x3 z ułamkami po pivotach

Task id: `fraction-pivots`

Domyślne wartości:

- `system = "2 1 -1 | 8; -3 -1 2 | -11; -2 1 2 | -3"`

Pola w popupie:

- `system`

Treść:

Rozwiąż układ:

```text
2x + y - z = 8
-3x - y + 2z = -11
-2x + y + 2z = -3
```

Nie unikaj ułamków. W tym zadaniu ważne jest pokazanie, jak normalizacja
pivotów zmienia macierz.

### Macierz rozszerzona

```text
[  2   1  -1 |   8 ]
[ -3  -1   2 | -11 ]
[ -2   1   2 |  -3 ]
```

### Eliminacja w przód

```text
R1 <- R1 / 2
```

```text
[ 1   1/2  -1/2 |   4 ]
[ -3  -1     2  | -11 ]
[ -2   1     2  |  -3 ]
```

```text
R2 <- R2 + 3R1
```

```text
[ 1   1/2  -1/2 |  4 ]
[ 0   1/2   1/2 |  1 ]
[ -2  1     2   | -3 ]
```

```text
R3 <- R3 + 2R1
```

```text
[ 1   1/2  -1/2 | 4 ]
[ 0   1/2   1/2 | 1 ]
[ 0   2     1   | 5 ]
```

```text
R2 <- R2 / (1/2)
```

```text
[ 1   1/2  -1/2 | 4 ]
[ 0   1     1   | 2 ]
[ 0   2     1   | 5 ]
```

```text
R3 <- R3 - 2R2
```

```text
[ 1   1/2  -1/2 | 4 ]
[ 0   1     1   | 2 ]
[ 0   0    -1   | 1 ]
```

```text
R3 <- R3 / (-1)
```

```text
[ 1   1/2  -1/2 |  4 ]
[ 0   1     1   |  2 ]
[ 0   0     1   | -1 ]
```

### Eliminacja wstecz

```text
R1 <- R1 + (1/2)R3
```

```text
[ 1   1/2   0 | 7/2 ]
[ 0   1     1 | 2   ]
[ 0   0     1 | -1  ]
```

```text
R2 <- R2 - R3
```

```text
[ 1   1/2   0 | 7/2 ]
[ 0   1     0 | 3   ]
[ 0   0     1 | -1  ]
```

```text
R1 <- R1 - (1/2)R2
```

```text
[ 1   0   0 |  2 ]
[ 0   1   0 |  3 ]
[ 0   0   1 | -1 ]
```

### Sprawdzenie

```text
2 * 2 + 3 - (-1) = 8
-3 * 2 - 3 + 2 * (-1) = -11
-2 * 2 + 3 + 2 * (-1) = -3
```

### Wynik

```text
x = 2
y = 3
z = -1
```

Charakter flow w notatniku:

- ułamki są częścią obliczeń, nie błędem formatowania;
- zadanie dobrze sprawdza renderowanie macierzy z wartościami typu `1/2`;
- wynik jest jednoznaczny, ale droga do niego jest dłuższa niż w przykładzie startowym.

---

## Zadanie 4 - Układ zależny i zmienna wolna

Task id: `infinite-solutions`

Domyślne wartości:

- `system = "1 1 1 | 6; 2 2 2 | 12; 1 -1 0 | 0"`

Pola w popupie:

- `system`

Treść:

Zbadaj układ:

```text
x + y + z = 6
2x + 2y + 2z = 12
x - y = 0
```

i zapisz wszystkie rozwiązania, jeżeli układ nie ma jednego rozwiązania.

### Macierz rozszerzona

```text
[ 1   1   1 |  6 ]
[ 2   2   2 | 12 ]
[ 1  -1   0 |  0 ]
```

### Eliminacja w przód

```text
R2 <- R2 - 2R1
```

```text
[ 1   1   1 | 6 ]
[ 0   0   0 | 0 ]
[ 1  -1   0 | 0 ]
```

```text
R3 <- R3 - R1
```

```text
[ 1   1   1 |  6 ]
[ 0   0   0 |  0 ]
[ 0  -2  -1 | -6 ]
```

```text
R2 <-> R3
```

```text
[ 1   1   1 |  6 ]
[ 0  -2  -1 | -6 ]
[ 0   0   0 |  0 ]
```

```text
R2 <- R2 / (-2)
```

```text
[ 1   1   1   | 6 ]
[ 0   1   1/2 | 3 ]
[ 0   0   0   | 0 ]
```

### Eliminacja wstecz

```text
R1 <- R1 - R2
```

```text
[ 1   0   1/2 | 3 ]
[ 0   1   1/2 | 3 ]
[ 0   0   0   | 0 ]
```

### Zmienne wolne

Kolumna `z` nie ma pivota, więc:

```text
z = t
```

Z macierzy po redukcji:

```text
x + (1/2)z = 3
y + (1/2)z = 3
```

### Wynik

```text
x = 3 - (1/2)t
y = 3 - (1/2)t
z = t
t in R
```

Charakter flow w notatniku:

- wiersz zerowy oznacza zależność równań, a nie sprzeczność;
- wynik nie jest pojedynczym punktem, tylko rodziną rozwiązań;
- zadanie sprawdza, czy UI umie zakończyć flow wynikiem parametrycznym.

---

## Zadanie 5 - Układ sprzeczny

Task id: `inconsistent-system`

Domyślne wartości:

- `system = "1 1 | 2; 2 2 | 5"`

Pola w popupie:

- `system`

Treść:

Sprawdź, czy układ:

```text
x + y = 2
2x + 2y = 5
```

ma rozwiązanie.

### Macierz rozszerzona

```text
[ 1   1 | 2 ]
[ 2   2 | 5 ]
```

### Eliminacja w przód

```text
R2 <- R2 - 2R1
```

```text
[ 1   1 | 2 ]
[ 0   0 | 1 ]
```

### Sprzeczność

Drugi wiersz oznacza:

```text
0 = 1
```

### Brak rozwiązania

```text
układ jest sprzeczny
```

Charakter flow w notatniku:

- flow kończy się natychmiast po wykryciu sprzecznego wiersza;
- nie ma eliminacji wstecz ani podstawiania wyniku;
- w notatniku sekcja końcowa powinna mieć ikonę `×`, a nie `✓`.
