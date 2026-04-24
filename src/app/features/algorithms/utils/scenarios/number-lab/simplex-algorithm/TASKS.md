# Simplex Algorithm - aktualne zadania i obliczenia

Ten plik opisuje aktywne zadania z `SIMPLEX_ALGORITHM_TASKS` w `index.ts` oraz
ich domyślne wartości. Aktualizuj go zawsze po zmianie listy tasków,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

Aktualny notatnik na UI pokazuje obliczenia jak zapis na kartce: osobne sekcje
`Model`, `Postać standardowa`, `Tableau początkowe`, `Pivot`, `Test ilorazów`,
`Test optymalności`, `Wynik`. Dla wariantów specjalnych pojawiają się też sekcje
`Ograniczenie niewiążące`, `Alternatywne optimum` albo `Brak wiersza wychodzącego`.

Konwencja tableau:

```text
max z = c^T x
Ax <= b
x >= 0
```

Po dodaniu slacków zapisujemy wiersz celu jako:

```text
z - c^T x = 0
```

Zmienna wchodząca ma najbardziej ujemny koszt zredukowany. Zmienna wychodząca
wynika z testu najmniejszego dodatniego ilorazu `RHS / pivot_column`.

## Kolejność w widoku

1. `short` - podstawowe zadanie startowe, dwa pivoty i jednoznaczne optimum.
2. `slack-non-binding` - optimum z dodatnim slackiem, czyli ograniczeniem luźnym.
3. `degenerate-tie` - remis w teście ilorazów i pivot zdegenerowany.
4. `alternative-optimum` - końcowe tableau pokazuje alternatywne optimum.
5. `unbounded-ray` - brak wiersza wychodzącego, funkcja celu nieograniczona.

---

## Zadanie 1 - Klasyczny maksymalny zysk

Task id: `short`

Domyślne wartości:

- `objective = 40 30`
- `constraints = 1 1 | 12; 2 1 | 16`

Pola w popupie:

- `objective`
- `constraints`

Treść:

Rozwiąż:

```text
max z = 40x + 30y
x + y <= 12
2x + y <= 16
x, y >= 0
```

### Postać standardowa

```text
x + y + s1 = 12
2x + y + s2 = 16
z - 40x - 30y = 0
```

### Pivot 1

```text
koszty zredukowane = [-40, -30, 0, 0]
wchodzi x
```

Test ilorazów:

```text
s1: 12 / 1 = 12
s2: 16 / 2 = 8
```

```text
wychodzi s2
pivot = 2
```

Po pivocie:

```text
0   0.5   1  -0.5 | 4
1   0.5   0   0.5 | 8
0  -10    0  20   | 320
```

### Pivot 2

```text
koszty zredukowane = [0, -10, 0, 20]
wchodzi y
```

Test ilorazów:

```text
s1: 4 / 0.5 = 8
x:  8 / 0.5 = 16
```

```text
wychodzi s1
pivot = 0.5
```

Po pivocie:

```text
0  1  2  -1 | 8
1  0 -1   1 | 4
0  0 20  10 | 400
```

### Wynik

```text
x = 4
y = 8
z = 400
```

Charakter flow w notatniku:

- klasyczny startowy przykład;
- dwa pivoty;
- pełny test ilorazów i odczyt rozwiązania z bazy.

---

## Zadanie 2 - Ograniczenie niewiążące

Task id: `slack-non-binding`

Domyślne wartości:

- `objective = 3 5`
- `constraints = 1 0 | 4; 0 2 | 12; 3 2 | 18`

Pola w popupie:

- `objective`
- `constraints`

Treść:

Rozwiąż:

```text
max z = 3x + 5y
x <= 4
2y <= 12
3x + 2y <= 18
x, y >= 0
```

### Pivoty

Najpierw wchodzi `y`:

```text
s2: 12 / 2 = 6
s3: 18 / 2 = 9
```

Po pierwszym pivocie wchodzi `x`:

```text
s1: 4 / 1 = 4
s3: 6 / 3 = 2
```

Końcowe tableau:

```text
0  0  1  0.333 -0.333 | 2
0  1  0  0.5    0     | 6
1  0  0 -0.333  0.333 | 2
0  0  0  1.5    1     | 36
```

### Ograniczenie niewiążące

```text
s1 = 2
s2 = 0
s3 = 0
```

Pierwsze ograniczenie `x <= 4` jest luźne, bo:

```text
x = 2
2 < 4
```

### Wynik

```text
x = 2
y = 6
z = 36
```

Charakter flow w notatniku:

- wynik nie leży na przecięciu wszystkich ograniczeń;
- pojawia się interpretacja dodatniego slacka;
- dobre zadanie do pokazania, że simplex odczytuje nie tylko `x, y`, ale też
  stan zasobów.

---

## Zadanie 3 - Degeneracja i remis w teście ilorazów

Task id: `degenerate-tie`

Domyślne wartości:

- `objective = 2 1`
- `constraints = 1 0 | 2; 0 1 | 2; 1 1 | 2`

Pola w popupie:

- `objective`
- `constraints`

Treść:

Rozwiąż:

```text
max z = 2x + y
x <= 2
y <= 2
x + y <= 2
x, y >= 0
```

### Pivot 1

```text
koszty zredukowane = [-2, -1, 0, 0, 0]
wchodzi x
```

Test ilorazów:

```text
s1: 2 / 1 = 2
s3: 2 / 1 = 2
```

Remis:

```text
s1 i s3 mają iloraz 2
```

Wybieramy pierwszy taki wiersz, więc wychodzi `s1`.

### Pivot 2

Po pierwszym pivocie:

```text
1 0 1 0 0 | 2
0 1 0 1 0 | 2
0 1 -1 0 1 | 0
0 -1 2 0 0 | 4
```

Wchodzi `y`.

Test ilorazów:

```text
s2: 2 / 1 = 2
s3: 0 / 1 = 0
```

```text
wychodzi s3
pivot zdegenerowany
```

Iloraz `0` oznacza, że baza się zmienia, ale wartość funkcji celu nie rośnie.

### Wynik

```text
x = 2
y = 0
z = 4
```

Charakter flow w notatniku:

- pokazuje remis w min-ratio;
- pokazuje pivot z RHS równym `0`;
- wynik jest poprawny, ale po drodze występuje degeneracja.

---

## Zadanie 4 - Alternatywne optimum

Task id: `alternative-optimum`

Domyślne wartości:

- `objective = 1 1`
- `constraints = 1 1 | 4; 1 0 | 3; 0 1 | 3`

Pola w popupie:

- `objective`
- `constraints`

Treść:

Rozwiąż:

```text
max z = x + y
x + y <= 4
x <= 3
y <= 3
x, y >= 0
```

### Pivoty

Po dwóch pivotach otrzymujemy końcowe tableau:

```text
0 1 1 -1 0 | 1
1 0 0  1 0 | 3
0 0 -1 1 1 | 2
0 0 1  0 0 | 4
```

### Test optymalności

```text
koszty zredukowane = [0, 0, 1, 0, 0]
```

Koszt zredukowany zmiennej niebazowej `s2` jest równy `0`:

```text
s2 = 0 w wierszu celu
```

To oznacza alternatywne optimum.

### Wynik

Jedno rozwiązanie bazowe:

```text
x = 3
y = 1
z = 4
```

Inne rozwiązania na krawędzi:

```text
x + y = 4
1 <= x <= 3
```

Charakter flow w notatniku:

- simplex znajduje jedno optimum bazowe;
- końcowe tableau pokazuje, że optimum nie jest jednoznaczne;
- zadanie testuje odczytywanie informacji z kosztów zredukowanych, nie tylko
  samego `z`.

---

## Zadanie 5 - Przypadek nieograniczony

Task id: `unbounded-ray`

Domyślne wartości:

- `objective = 1 1`
- `constraints = -1 1 | 2; 0 1 | 3`

Pola w popupie:

- `objective`
- `constraints`

Treść:

Sprawdź problem:

```text
max z = x + y
-x + y <= 2
y <= 3
x, y >= 0
```

### Tableau początkowe

```text
-1  1  1  0 | 2
 0  1  0  1 | 3
-1 -1  0  0 | 0
```

### Kolumna wchodząca

Najbardziej ujemny koszt zredukowany wybiera `x`:

```text
wchodzi x
```

Kolumna `x` w ograniczeniach:

```text
[-1, 0]
```

### Brak wiersza wychodzącego

Nie ma dodatniego elementu w kolumnie `x`, więc test ilorazów nie ma kandydata.

### Brak skończonego optimum

```text
funkcja celu jest nieograniczona
```

Charakter flow w notatniku:

- brak pivotu końcowego;
- kluczowe jest wykrycie braku dodatniego elementu w kolumnie wchodzącej;
- UI nie powinno próbować odczytywać rozwiązania, którego nie ma.
