# Euclidean GCD - aktualne zadania i obliczenia

Ten plik opisuje aktywne zadania z `EUCLIDEAN_GCD_TASKS` w `index.ts` oraz ich
domyślne wartości. Aktualizuj go zawsze po zmianie listy tasków,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

Aktualny notatnik na UI pokazuje obliczenia jak zapis na kartce: osobne sekcje
`Obliczenia`, `Ostatnia niezerowa reszta`, `Sprawdzenie`, `Wynik`. To jest
zwykły algorytm Euklidesa dla `gcd`, bez współczynników Bézouta i bez cofania.
Poprzedni dokument od Extended Euclidean już miał swoją sceniczną partię z
cofaniem, więc tutaj nie robimy bisu.

Podstawowy krok ma postać:

```text
a = q * b + r
gcd(a, b) = gcd(b, r)
```

Algorytm kończy się, gdy reszta jest równa `0`. Ostatnia niezerowa reszta jest
wynikiem `gcd`.

## Kolejność w widoku

1. `short` - podstawowe zadanie startowe.
2. `fibonacci-worst-case` - długi łańcuch dla kolejnych liczb Fibonacciego.
3. `multi-number-fold` - NWD wielu liczb przez składanie parami.
4. `fraction-reduction` - skracanie ułamka przez NWD.
5. `subtractive-to-division` - wersja odejmowania i jej skrót przez dzielenie.

---

## Zadanie 1 - Podstawowe działanie algorytmu Euklidesa

Task id: `short`

Domyślne wartości:

- `a = 60`
- `b = 48`

Pola w popupie:

- `a`
- `b`

Treść:

Oblicz:

```text
gcd(60, 48)
```

używając klasycznego algorytmu Euklidesa z dzieleniem z resztą.

### Obliczenia

```text
60 = 1 * 48 + 12
48 = 4 * 12 + 0
```

### Ostatnia niezerowa reszta

```text
12
```

### Wynik

```text
gcd(60, 48) = 12
```

### Sprawdzenie

```text
60 / 12 = 5
48 / 12 = 4
```

`12` dzieli obie liczby, a następny krok algorytmu zakończył się resztą `0`.

Charakter flow w notatniku:

- najkrótszy sensowny przykład;
- tylko dwa dzielenia;
- brak cofania, brak współczynników, sam NWD;
- to zadanie jest domyślnym pierwszym wyborem po otwarciu widoku.

---

## Zadanie 2 - Długi łańcuch Fibonacciego

Task id: `fibonacci-worst-case`

Domyślne wartości:

- `a = 144`
- `b = 89`

Pola w popupie:

- `a`
- `b`

Treść:

Oblicz:

```text
gcd(144, 89)
```

Pokaż pełny łańcuch dzielenia. Zauważ, że kolejne liczby Fibonacciego dają
bardzo długi przebieg algorytmu Euklidesa, bo ilorazy przez większość czasu są
równe `1`.

### Obliczenia

```text
144 = 1 * 89 + 55
89 = 1 * 55 + 34
55 = 1 * 34 + 21
34 = 1 * 21 + 13
21 = 1 * 13 + 8
13 = 1 * 8 + 5
8 = 1 * 5 + 3
5 = 1 * 3 + 2
3 = 1 * 2 + 1
2 = 2 * 1 + 0
```

### Ostatnia niezerowa reszta

```text
1
```

### Wynik

```text
gcd(144, 89) = 1
```

### Wniosek o długości

```text
większość ilorazów = 1
```

To oznacza wolne zmniejszanie reszt:

```text
144, 89, 55, 34, 21, 13, 8, 5, 3, 2, 1
```

Charakter flow w notatniku:

- długi przykład bez dodatkowego kontekstu;
- nacisk na liczbę kroków i zachowanie najgorszego typu;
- idealny test, czy UI dobrze renderuje dłuższy łańcuch dzielenia.

---

## Zadanie 3 - NWD wielu liczb przez składanie parami

Task id: `multi-number-fold`

Domyślne wartości:

- `values = [252, 198, 126, 90]`

Pola w popupie:

- `values`

Treść:

Oblicz największy wspólny dzielnik liczb:

```text
252, 198, 126, 90
```

Użyj własności:

```text
gcd(a, b, c, d) = gcd(gcd(gcd(a, b), c), d)
```

### Krok 1: `gcd(252, 198)`

```text
252 = 1 * 198 + 54
198 = 3 * 54 + 36
54 = 1 * 36 + 18
36 = 2 * 18 + 0
```

```text
gcd(252, 198) = 18
```

### Krok 2: `gcd(18, 126)`

```text
126 = 7 * 18 + 0
```

```text
gcd(18, 126) = 18
```

### Krok 3: `gcd(18, 90)`

```text
90 = 5 * 18 + 0
```

```text
gcd(18, 90) = 18
```

### Wynik

```text
gcd(252, 198, 126, 90) = 18
```

### Interpretacja

Jeśli liczby oznaczają rozmiary partii danych, największy wspólny rozmiar bloku
wynosi:

```text
18
```

Liczba bloków:

```text
252 / 18 = 14
198 / 18 = 11
126 / 18 = 7
90 / 18 = 5
```

Charakter flow w notatniku:

- wejście nie jest parą, tylko listą liczb;
- algorytm jest odpalany kilka razy, a wynik poprzedniego kroku staje się
  wejściem następnego;
- zadanie testuje fold/reduce.

---

## Zadanie 4 - Skracanie ułamka przez NWD

Task id: `fraction-reduction`

Domyślne wartości:

- `numerator = 4620`
- `denominator = 1078`

Pola w popupie:

- `numerator`
- `denominator`

Treść:

Skróć ułamek:

```text
4620 / 1078
```

Najpierw oblicz `gcd(4620, 1078)` algorytmem Euklidesa, a potem podziel licznik
i mianownik przez otrzymany NWD.

### Obliczenia NWD

```text
4620 = 4 * 1078 + 308
1078 = 3 * 308 + 154
308 = 2 * 154 + 0
```

### Ostatnia niezerowa reszta

```text
154
```

### NWD

```text
gcd(4620, 1078) = 154
```

### Skracanie ułamka

```text
4620 / 154 = 30
1078 / 154 = 7
```

### Wynik

```text
4620 / 1078 = 30 / 7
```

Charakter flow w notatniku:

- NWD jest środkiem do celu, nie tylko wynikiem końcowym;
- po klasycznym łańcuchu dzielenia pojawia się etap normalizacji ułamka;
- zadanie przydatne w UI, jeśli algorytm ma obsługiwać interpretacje praktyczne.

---

## Zadanie 5 - Odejmowanie jako pierwotna forma algorytmu

Task id: `subtractive-to-division`

Domyślne wartości:

- `a = 168`
- `b = 72`

Pola w popupie:

- `a`
- `b`

Treść:

Oblicz:

```text
gcd(168, 72)
```

Najpierw pokaż wersję przez powtarzane odejmowanie, a potem zapisz ten sam
proces krócej jako dzielenie z resztą. Na końcu zinterpretuj wynik jako największy
rozmiar kwadratowego kafelka dla prostokąta `168 x 72`.

### Wersja przez odejmowanie

```text
168 - 72 = 96
96 - 72 = 24
72 - 24 = 48
48 - 24 = 24
24 - 24 = 0
```

Ostatnia dodatnia wartość:

```text
24
```

### Ten sam proces przez dzielenie

Pierwsze dwa odejmowania `72` od `168` można zapisać jako:

```text
168 = 2 * 72 + 24
```

Następne trzy odejmowania `24` od `72` można zapisać jako:

```text
72 = 3 * 24 + 0
```

### Wynik NWD

```text
gcd(168, 72) = 24
```

### Interpretacja geometryczna

Największy kwadratowy kafelek ma bok:

```text
24
```

Liczba kafelków w prostokącie:

```text
168 / 24 = 7
72 / 24 = 3
7 * 3 = 21
```

### Wynik końcowy

```text
bok kafelka = 24
liczba kafelków = 21
```

Charakter flow w notatniku:

- zaczyna się od odejmowania, a dopiero potem przechodzi do dzielenia z resztą;
- pokazuje, że szybki wariant modulo jest tylko skompresowaną wersją wielu
  odejmowań;
- końcówka ma interpretację geometryczną, ale obliczeniowo cały czas rządzi NWD.
