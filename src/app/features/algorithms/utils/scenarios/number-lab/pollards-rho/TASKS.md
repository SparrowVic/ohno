# Pollard's Rho Factorization - aktualne zadania i obliczenia

Ten plik opisuje aktywne zadania z `POLLARDS_RHO_TASKS` w `index.ts` oraz
ich domyślne wartości. Aktualizuj go zawsze po zmianie listy tasków,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

Aktualny notatnik na UI pokazuje obliczenia jak zapis na kartce: osobne sekcje
`Parametry`, `Iteracje`, `NWD`, `Rozbicie`, `Wynik`. Dla wariantu Floyda każda
iteracja ma postać:

```text
x = f(x)
y = f(f(y))
d = gcd(|x - y|, n)
```

Gdy `d = 1`, algorytm idzie dalej. Gdy `1 < d < n`, znaleziono nietrywialny
dzielnik. Gdy `d = n`, przebieg jest traktowany jako nieudany i trzeba zmienić
funkcję, stałą `c` albo punkt startowy.

## Kolejność w widoku

1. `short` - podstawowe zadanie startowe.
2. `retry-after-cycle` - przypadek `d = n`, restart z inną funkcją.
3. `brent-batch-gcd` - wariant Brenta z iloczynem różnic i rzadszym `gcd`.
4. `recursive-factorization` - pełny rozkład przez rekurencyjne wywołania.
5. `composite-factor-split` - Pollard zwraca dzielnik złożony, niekoniecznie pierwszy.

---

## Zadanie 1 - Podstawowe działanie Pollard's Rho

Task id: `short`

Domyślne wartości:

- `n = 8051`
- `x0 = 2`
- `c = 1`
- `f(x) = x^2 + c (mod n)`

Pola w popupie:

- `n`
- `x0`
- `c`

Treść:

Rozłóż liczbę `8051` metodą Pollard's Rho. Użyj funkcji:

```text
f(x) = x^2 + 1 (mod 8051)
```

oraz punktu startowego `x0 = 2`. Wykonuj wariant Floyda, gdzie `x` porusza się
jednym krokiem, a `y` dwoma krokami.

### Parametry

```text
n = 8051
x0 = 2
f(x) = x^2 + 1 mod 8051
```

### Iteracje

|   i |   x |    y |      | x - y |     | gcd( | x - y | , n) |
| --: | --: | ---: | ---: | ----: | --- | ---- | ----- | ---- |
|   1 |   5 |   26 |   21 |     1 |
|   2 |  26 | 7474 | 7448 |     1 |
|   3 | 677 |  871 |  194 |    97 |

### Rozbicie

```text
1 < 97 < 8051
```

Znaleziono nietrywialny dzielnik:

```text
d = 97
```

Drugi czynnik:

```text
8051 / 97 = 83
```

### Wynik

```text
8051 = 97 * 83
```

Charakter flow w notatniku:

- krótkie, podstawowe uruchomienie algorytmu;
- klasyczny wariant Floyda: `x` idzie wolno, `y` idzie szybko;
- zakończenie następuje po pierwszym `gcd`, który daje `1 < d < n`;
- to zadanie jest domyślnym pierwszym wyborem po otwarciu widoku.

---

## Zadanie 2 - Restart po nieudanym cyklu

Task id: `retry-after-cycle`

Domyślne wartości:

- `n = 299`
- `x0 = 2`
- `c_fail = 1`
- `c_retry = 2`

Pola w popupie:

- `n`
- `x0`
- `c_fail`
- `c_retry`

Treść:

Dla liczby `299` uruchom Pollard's Rho z funkcją:

```text
f(x) = x^2 + 1 (mod 299)
```

Jeżeli algorytm zwróci `d = n`, potraktuj to jako nieudaną próbę i uruchom go
ponownie z funkcją:

```text
g(x) = x^2 + 2 (mod 299)
```

Pokaż, dlaczego pierwsza próba nie daje dzielnika oraz jak druga próba naprawia
sytuację.

### Próba 1

```text
n = 299
x0 = 2
f(x) = x^2 + 1 mod 299
```

|   i |   x |   y |     | x - y |     | gcd( | x - y | , 299) |
| --: | --: | --: | --: | ----: | --- | ---- | ----- | ------ |
|   1 |   5 |  26 |  21 |     1 |
|   2 |  26 | 262 | 236 |     1 |
|   3 |  79 |  78 |   1 |     1 |
|   4 | 262 | 262 |   0 |   299 |

### Wniosek po próbie 1

```text
d = 299 = n
```

To nie jest nietrywialny dzielnik. Trafiliśmy w cykl w taki sposób, że `x = y`
modulo `n`, więc `gcd(0, n)` oddaje całe `n`. Algorytm nie znalazł faktora.

### Próba 2

```text
n = 299
x0 = 2
g(x) = x^2 + 2 mod 299
```

|   i |   x |   y |     | x - y |     | gcd( | x - y | , 299) |
| --: | --: | --: | --: | ----: | --- | ---- | ----- | ------ |
|   1 |   6 |  38 |  32 |     1 |
|   2 |  38 |  11 |  27 |     1 |
|   3 | 250 | 181 |  69 |    23 |

### Rozbicie

```text
d = 23
299 / 23 = 13
```

### Wynik

```text
299 = 23 * 13
```

Charakter flow w notatniku:

- pierwsza gałąź kończy się porażką `d = n`;
- po porażce zmieniana jest funkcja iteracyjna, ale nie zmienia się sam algorytm;
- zadanie uczy, że Pollard's Rho nie ma obowiązku znaleźć dzielnika w pierwszym
  przebiegu, bo matematyka najwyraźniej też lubi robić przerwy na dramę.

---

## Zadanie 3 - Wariant Brenta i batchowanie NWD

Task id: `brent-batch-gcd`

Domyślne wartości:

- `n = 10403`
- `x0 = 2`
- `c = 1`
- `m = 3`

Pola w popupie:

- `n`
- `x0`
- `c`
- `m`

Treść:

Rozłóż `10403` wariantem Brenta. Zamiast liczyć `gcd` po każdej pojedynczej
różnicy, grupuj maksymalnie `m = 3` różnice w iloczyn:

```text
q = product(|x - y_i|) mod n
```

a następnie licz:

```text
d = gcd(q, n)
```

### Parametry

```text
n = 10403
x0 = 2
f(x) = x^2 + 1 mod 10403
m = 3
```

### Blok `r = 1`

```text
x = 2
```

|   y |     | x - y |     | q mod n |
| --: | --: | ----: | --- | ------- |
|  26 |  24 |    24 |

```text
gcd(24, 10403) = 1
```

### Blok `r = 2`

```text
x = 26
```

|    y |      | x - y |     | q mod n |
| ---: | ---: | ----: | --- | ------- |
| 3903 | 3877 |  3877 |
| 3418 | 3392 |  1392 |

```text
gcd(1392, 10403) = 1
```

### Blok `r = 4`, pierwsza paczka

```text
x = 3418
```

|    y |      | x - y |     | q mod n |
| ---: | ---: | ----: | --- | ------- |
|  978 | 2440 |  2440 |
| 9812 | 6394 |  7263 |
| 5983 | 2565 |  8225 |

```text
gcd(8225, 10403) = 1
```

### Blok `r = 4`, druga paczka

```text
x = 3418
```

|    y |      | x - y |     | q mod n |
| ---: | ---: | ----: | --- | ------- |
| 9970 | 6552 |  6552 |

```text
gcd(6552, 10403) = 1
```

### Blok `r = 8`

```text
x = 9970
```

|    y |      | x - y |     | q mod n |
| ---: | ---: | ----: | --- | ------- |
| 2799 | 7171 |  7171 |
|  943 | 9027 |  5151 |
| 4995 | 4975 |  3636 |

```text
gcd(3636, 10403) = 101
```

### Rozbicie

```text
d = 101
10403 / 101 = 103
```

### Wynik

```text
10403 = 101 * 103
```

Charakter flow w notatniku:

- inny rytm obliczeń niż Floyd: najpierw rośnie blok `r`, potem liczony jest
  zbiorczy iloczyn różnic;
- `gcd` pojawia się rzadziej, ale na większym pakiecie informacji;
- zadanie dobrze pokazuje, po co istnieje wariant Brenta, zamiast tylko klonować
  tabelkę z `x` i `y`.

---

## Zadanie 4 - Pełny rozkład przez rekurencję

Task id: `recursive-factorization`

Domyślne wartości:

- `n = 104663`
- `x0 = 2`
- `c = 1`

Pola w popupie:

- `n`
- `x0`
- `c`

Treść:

Użyj Pollard's Rho do pełnego rozkładu liczby `104663`. Po znalezieniu jednego
dzielnika rozbijaj dalej pozostały iloraz, aż wszystkie czynniki będą pierwsze.

### Pierwsze wywołanie

```text
n = 104663
f(x) = x^2 + 1 mod 104663
x0 = 2
```

|   i |   x |     y |       | x - y |     | gcd( | x - y | , n) |
| --: | --: | ----: | ----: | ----: | --- | ---- | ----- | ---- |
|   1 |   5 |    26 |    21 |     1 |
|   2 |  26 | 39678 | 39652 |     1 |
|   3 | 677 |   871 |   194 |    97 |

```text
104663 / 97 = 1079
```

Pierwsze rozbicie:

```text
104663 = 97 * 1079
```

### Drugie wywołanie

Teraz rozbijamy `1079` tą samą funkcją:

```text
n = 1079
f(x) = x^2 + 1 mod 1079
x0 = 2
```

|   i |   x |   y |     | x - y |     | gcd( | x - y | , n) |
| --: | --: | --: | --: | ----: | --- | ---- | ----- | ---- |
|   1 |   5 |  26 |  21 |     1 |
|   2 |  26 | 834 | 808 |     1 |
|   3 | 677 | 871 | 194 |     1 |
|   4 | 834 | 236 | 598 |    13 |

```text
1079 / 13 = 83
```

Drugie rozbicie:

```text
1079 = 13 * 83
```

### Wynik

```text
104663 = 97 * 13 * 83
```

Po uporządkowaniu:

```text
104663 = 13 * 83 * 97
```

Charakter flow w notatniku:

- algorytm nie kończy się po jednym znalezionym dzielniku;
- wynik `d` jest używany do podziału problemu na dwa mniejsze;
- notatnik pokazuje drzewo faktoryzacji, nie tylko pojedynczą tabelę iteracji.

---

## Zadanie 5 - Pollard zwraca dzielnik złożony

Task id: `composite-factor-split`

Domyślne wartości:

- `n = 169071`
- `x0 = 2`
- `c = 1`
- `c_for_21 = 2`

Pola w popupie:

- `n`
- `x0`
- `c`
- `c_for_21`

Treść:

Rozłóż `169071`. Zwróć uwagę, że Pollard's Rho może zwrócić dzielnik
nietrywialny, który sam nadal jest złożony. Trzeba go wtedy rozbić dalej.

### Pierwsze wywołanie

```text
n = 169071
f(x) = x^2 + 1 mod 169071
x0 = 2
```

|   i |   x |   y |     | x - y |     | gcd( | x - y | , n) |
| --: | --: | --: | --: | ----: | --- | ---- | ----- | ---- |
|   1 |   5 |  26 |  21 |    21 |

### Pierwsze rozbicie

```text
d = 21
169071 / 21 = 8051
```

```text
169071 = 21 * 8051
```

Dzielnik `21` nie jest pierwszy, więc nie wolno kończyć. No chyba że celem jest
oddanie rozwiązania, które wygląda jak niedokończona kanapka.

### Rozbicie dzielnika `21`

Używamy funkcji:

```text
g(x) = x^2 + 2 mod 21
x0 = 2
```

|   i |   x |   y |     | x - y |     | gcd( | x - y | , 21) |
| --: | --: | --: | --: | ----: | --- | ---- | ----- | ----- |
|   1 |   6 |  17 |  11 |     1 |
|   2 |  17 |  11 |   6 |     3 |

```text
21 / 3 = 7
21 = 3 * 7
```

### Rozbicie ilorazu `8051`

```text
n = 8051
f(x) = x^2 + 1 mod 8051
x0 = 2
```

|   i |   x |    y |      | x - y |     | gcd( | x - y | , n) |
| --: | --: | ---: | ---: | ----: | --- | ---- | ----- | ---- |
|   1 |   5 |   26 |   21 |     1 |
|   2 |  26 | 7474 | 7448 |     1 |
|   3 | 677 |  871 |  194 |    97 |

```text
8051 / 97 = 83
8051 = 97 * 83
```

### Wynik

```text
169071 = 3 * 7 * 97 * 83
```

Po uporządkowaniu:

```text
169071 = 3 * 7 * 83 * 97
```

Charakter flow w notatniku:

- pierwszy znaleziony dzielnik jest poprawny, ale złożony;
- notatnik musi mieć etap `czy d jest pierwsze?` albo przynajmniej etap
  dalszego rozbijania `d`;
- zadanie wymusza pełną faktoryzację, a nie tylko znalezienie „jakiegoś” dzielnika.
