# Reservoir Sampling - aktualne zadania i obliczenia

Ten plik opisuje aktywne zadania z `RESERVOIR_SAMPLING_TASKS` w `index.ts` oraz
ich domyślne wartości. Aktualizuj go zawsze po zmianie listy tasków,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

Aktualny notatnik na UI pokazuje obliczenia jak zapis na kartce: osobne sekcje
`Parametry`, `Strumień`, `Losowania`, `Stan rezerwuaru`, `Sprawdzenie`, `Wynik`.
Ponieważ algorytm jest losowy, każde zadanie ma podane z góry wartości losowe,
żeby wynik był deterministyczny i dało się go sensownie testować w UI.

Dla klasycznego wariantu `k = 1` używamy reguły:

```text
przy elemencie i: zastąp próbkę z prawdopodobieństwem 1 / i
```

Dla wariantu ogólnego `k > 1` używamy reguły:

```text
przy elemencie i > k: losuj j z zakresu [1, i]
jeśli j <= k, zastąp reservoir[j]
```

## Kolejność w widoku

1. `short` - podstawowe zadanie startowe dla `k = 1`.
2. `fixed-k-updates` - rezerwuar rozmiaru `3` z indeksami zastąpień.
3. `predicate-reservoir` - sampling tylko po elementach spełniających predykat.
4. `weighted-reservoir` - sampling ważony przez klucze priorytetowe.
5. `distributed-merge` - łączenie lokalnych rezerwuarów przez globalne priorytety.

---

## Zadanie 1 - Podstawowy reservoir sampling dla `k = 1`

Task id: `short`

Domyślne wartości:

- `k = 1`
- `stream = [A, B, C, D, E, F]`
- `random = {2: 0.70, 3: 0.20, 4: 0.90, 5: 0.10, 6: 0.40}`

Pola w popupie:

- `k`
- `stream`
- `random`

Treść:

Przetwórz strumień `A, B, C, D, E, F` algorytmem Reservoir Sampling dla
`k = 1`. Dla elementu `i` zastąp aktualną próbkę, gdy `random[i] < 1 / i`.

### Parametry

```text
k = 1
stream = [A, B, C, D, E, F]
```

### Przebieg

|   i | element | random[i] | próg `1 / i` | decyzja      | reservoir |
| --: | :-----: | --------: | -----------: | :----------- | :-------: |
|   1 |    A    |         - |            - | start        |    [A]    |
|   2 |    B    |      0.70 |         0.50 | nie zastępuj |    [A]    |
|   3 |    C    |      0.20 |     0.333... | zastąp       |    [C]    |
|   4 |    D    |      0.90 |         0.25 | nie zastępuj |    [C]    |
|   5 |    E    |      0.10 |         0.20 | zastąp       |    [E]    |
|   6 |    F    |      0.40 |     0.166... | nie zastępuj |    [E]    |

### Sprawdzenie idei prawdopodobieństwa

Dla pierwszego elementu:

```text
P(A zostaje do końca) = (1 - 1/2)(1 - 1/3)(1 - 1/4)(1 - 1/5)(1 - 1/6)
```

```text
P(A zostaje do końca) = (1/2)(2/3)(3/4)(4/5)(5/6) = 1/6
```

Dla elementu `E`:

```text
P(E jest wybrane na i = 5) = 1/5
P(E przetrwa i = 6) = 1 - 1/6 = 5/6
```

```text
P(E w końcowej próbce) = (1/5)(5/6) = 1/6
```

### Wynik

Dla podanych losowań:

```text
reservoir = [E]
```

Charakter flow w notatniku:

- najprostszy przypadek strumieniowy;
- każde losowanie jest jawnie porównane z progiem `1 / i`;
- dodatkowa sekcja pokazuje, skąd bierze się równe prawdopodobieństwo;
- to zadanie jest domyślnym pierwszym wyborem po otwarciu widoku.

---

## Zadanie 2 - Rezerwuar rozmiaru `3` z indeksami zastąpień

Task id: `fixed-k-updates`

Domyślne wartości:

- `k = 3`
- `stream = [a, b, c, d, e, f, g, h]`
- `draws = {4: 2, 5: 5, 6: 1, 7: 3, 8: 6}`

Pola w popupie:

- `k`
- `stream`
- `draws`

Treść:

Przetwórz strumień `a, b, c, d, e, f, g, h` algorytmem Reservoir Sampling dla
`k = 3`. Pierwsze trzy elementy trafiają do rezerwuaru. Dla każdego kolejnego
elementu `i` losowany jest indeks `j` z zakresu `[1, i]`. Jeśli `j <= k`, zastąp
pozycję `j` w rezerwuarze.

### Parametry

```text
k = 3
stream = [a, b, c, d, e, f, g, h]
```

### Inicjalizacja

```text
reservoir = [a, b, c]
```

### Przebieg

|   i | element | j z `[1, i]` | decyzja                    | reservoir |
| --: | :-----: | -----------: | :------------------------- | :-------: |
|   4 |    d    |            2 | `2 <= 3`, zastąp pozycję 2 | [a, d, c] |
|   5 |    e    |            5 | `5 > 3`, pomiń             | [a, d, c] |
|   6 |    f    |            1 | `1 <= 3`, zastąp pozycję 1 | [f, d, c] |
|   7 |    g    |            3 | `3 <= 3`, zastąp pozycję 3 | [f, d, g] |
|   8 |    h    |            6 | `6 > 3`, pomiń             | [f, d, g] |

### Wynik

```text
reservoir = [f, d, g]
```

Charakter flow w notatniku:

- klasyczny wariant dla `k > 1`;
- zamiast progów `1 / i` pojawia się losowy indeks `j`;
- zadanie ma kilka zastąpień i kilka pominięć, więc UI musi pokazać zmianę stanu
  rezerwuaru po każdym kroku.

---

## Zadanie 3 - Reservoir Sampling z predykatem

Task id: `predicate-reservoir`

Domyślne wartości:

- `k = 2`
- `predicate = status == ERROR`
- `stream = [(1, OK), (2, ERROR), (3, OK), (4, ERROR), (5, ERROR), (6, OK), (7, ERROR)]`
- `draws_for_real_items = {3: 1, 4: 4}`

Pola w popupie:

- `k`
- `predicate`
- `stream`
- `draws_for_real_items`

Treść:

Z próbek mają być wybierane tylko zdarzenia spełniające predykat:

```text
status == ERROR
```

Elementy `OK` są ignorowane i nie zwiększają licznika losowania. Przetwórz
strumień i pokaż stan rezerwuaru błędów.

### Parametry

```text
k = 2
predicate = status == ERROR
```

### Przebieg

| indeks strumienia |  element   | spełnia predykat? | licznik realny r | losowanie | decyzja                    |        reservoir         |
| ----------------: | :--------: | :---------------: | ---------------: | :-------: | :------------------------- | :----------------------: |
|                 1 |  (1, OK)   |        nie        |                0 |     -     | ignoruj                    |            []            |
|                 2 | (2, ERROR) |        tak        |                1 |     -     | dodaj                      |       [(2, ERROR)]       |
|                 3 |  (3, OK)   |        nie        |                1 |     -     | ignoruj                    |       [(2, ERROR)]       |
|                 4 | (4, ERROR) |        tak        |                2 |     -     | dodaj                      | [(2, ERROR), (4, ERROR)] |
|                 5 | (5, ERROR) |        tak        |                3 |   j = 1   | `1 <= 2`, zastąp pozycję 1 | [(5, ERROR), (4, ERROR)] |
|                 6 |  (6, OK)   |        nie        |                3 |     -     | ignoruj                    | [(5, ERROR), (4, ERROR)] |
|                 7 | (7, ERROR) |        tak        |                4 |   j = 4   | `4 > 2`, pomiń             | [(5, ERROR), (4, ERROR)] |

### Wynik

```text
reservoir = [(5, ERROR), (4, ERROR)]
```

### Wniosek

Losowania są liczone względem liczby elementów spełniających predykat, nie względem
całej długości strumienia.

Charakter flow w notatniku:

- strumień ma elementy „puste” z punktu widzenia samplingu;
- najważniejszy jest oddzielny licznik `r`, który rośnie tylko dla elementów
  spełniających predykat;
- zadanie pokazuje realny przypadek z logów.

---

## Zadanie 4 - Weighted Reservoir Sampling przez klucze priorytetowe

Task id: `weighted-reservoir`

Domyślne wartości:

- `k = 2`
- `items = [(A, 1, 0.64), (B, 2, 0.25), (C, 4, 0.81), (D, 3, 0.125), (E, 1, 0.90)]`
- `key = u^(1 / weight)`
- `keep = largest keys`

Pola w popupie:

- `k`
- `items`
- `key_formula`

Treść:

Wykonaj ważony Reservoir Sampling dla `k = 2`. Każdy element ma wagę `w` oraz
wylosowaną wartość `u` z przedziału `(0, 1)`. Dla każdego elementu policz klucz:

```text
key = u^(1 / w)
```

a następnie zachowaj `k` elementów z największymi kluczami.

### Parametry

```text
k = 2
key = u^(1 / weight)
wybieramy największe klucze
```

### Obliczenia kluczy

| element | weight |     u | key = u^(1 / weight) |
| :-----: | -----: | ----: | -------------------: |
|    A    |      1 |  0.64 |               0.6400 |
|    B    |      2 |  0.25 |               0.5000 |
|    C    |      4 |  0.81 |               0.9487 |
|    D    |      3 | 0.125 |               0.5000 |
|    E    |      1 |  0.90 |               0.9000 |

### Ranking

```text
C: 0.9487
E: 0.9000
A: 0.6400
B: 0.5000
D: 0.5000
```

### Wynik

Wybieramy dwa największe klucze:

```text
reservoir = [C, E]
```

Charakter flow w notatniku:

- wariant ważony, więc nie ma prostego `1 / i`;
- każdy element dostaje priorytet zależny od wagi;
- większa waga zwiększa szansę na wysoki klucz, ale nie daje gwarancji wyboru.

---

## Zadanie 5 - Łączenie rezerwuarów rozproszonych

Task id: `distributed-merge`

Domyślne wartości:

- `k = 2`
- `priority = smaller is better`
- `shardA = [(a1, 0.72), (a2, 0.15), (a3, 0.44), (a4, 0.05)]`
- `shardB = [(b1, 0.20), (b2, 0.91), (b3, 0.11)]`
- `shardC = [(c1, 0.36), (c2, 0.07), (c3, 0.62), (c4, 0.18), (c5, 0.02)]`

Pola w popupie:

- `k`
- `priority_mode`
- `shardA`
- `shardB`
- `shardC`

Treść:

Każdy element w strumieniu dostał globalny losowy priorytet. Mniejszy priorytet
jest lepszy. Każdy shard lokalnie zachowuje `k = 2` najlepsze elementy. Następnie
połącz lokalne rezerwuary i wybierz globalne `k = 2` najlepsze elementy.

### Parametry

```text
k = 2
mniejszy priority = lepszy
```

### Shard A

| element | priority |
| :-----: | -------: |
|   a1    |     0.72 |
|   a2    |     0.15 |
|   a3    |     0.44 |
|   a4    |     0.05 |

Lokalny rezerwuar:

```text
A_local = [(a4, 0.05), (a2, 0.15)]
```

### Shard B

| element | priority |
| :-----: | -------: |
|   b1    |     0.20 |
|   b2    |     0.91 |
|   b3    |     0.11 |

Lokalny rezerwuar:

```text
B_local = [(b3, 0.11), (b1, 0.20)]
```

### Shard C

| element | priority |
| :-----: | -------: |
|   c1    |     0.36 |
|   c2    |     0.07 |
|   c3    |     0.62 |
|   c4    |     0.18 |
|   c5    |     0.02 |

Lokalny rezerwuar:

```text
C_local = [(c5, 0.02), (c2, 0.07)]
```

### Scalanie kandydatów

```text
c5: 0.02
a4: 0.05
c2: 0.07
b3: 0.11
a2: 0.15
b1: 0.20
```

### Wynik globalny

Wybieramy dwa najmniejsze priorytety:

```text
reservoir = [(c5, 0.02), (a4, 0.05)]
```

Charakter flow w notatniku:

- zadanie nie przechodzi przez jeden strumień liniowo;
- każdy shard ma lokalny wynik, a potem następuje merge;
- dobry przykład do systemów rozproszonych, gdzie nie trzeba ściągać całego
  strumienia do jednej maszyny tylko po to, żeby wylosować dwa elementy.
