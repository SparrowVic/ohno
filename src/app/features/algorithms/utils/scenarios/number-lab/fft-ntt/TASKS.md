# Fast Fourier Transform / Number Theoretic Transform - aktualne zadania i obliczenia

Ten plik opisuje aktywne zadania z `FFT_NTT_TASKS` w `index.ts` oraz ich
domyślne wartości. Aktualizuj go zawsze po zmianie listy tasków,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

Aktualny notatnik na UI pokazuje obliczenia jak zapis na kartce: osobne sekcje
`Parametry`, `Pierwiastek`, `Transformata`, `Mnożenie punktowe`, `Transformata
odwrotna`, `Wynik`. Dla NTT wszystkie działania są wykonywane modulo `p`.
Dla klasycznego FFT używany jest zapis z pierwiastkiem zespolonym `omega`.

W zadaniach z konwolucją najważniejszy flow to:

```text
A -> FFT/NTT(A)
B -> FFT/NTT(B)
C_hat[i] = A_hat[i] * B_hat[i]
C = inverse FFT/NTT(C_hat)
```

## Kolejność w widoku

1. `short` - podstawowe zadanie startowe, konwolucja przez NTT długości 4.
2. `recursive-fft-split` - rekurencyjne rozbicie FFT na parzyste i nieparzyste.
3. `cyclic-vs-linear-trap` - pułapka cyklicznego zawijania bez paddingu.
4. `big-integer-convolution` - mnożenie liczb przez konwolucję cyfr.
5. `primitive-root-check` - zły pierwiastek NTT i naprawa parametru.

---

## Zadanie 1 - Podstawowa konwolucja przez NTT

Task id: `short`

Domyślne wartości:

- `mod = 17`
- `n = 4`
- `omega = 4`
- `A = [1, 2, 3, 0]`
- `B = [4, 5, 0, 0]`

Pola w popupie:

- `mod`
- `n`
- `omega`
- `A`
- `B`

Treść:

Pomnóż wielomiany:

```text
A(x) = 1 + 2x + 3x^2
B(x) = 4 + 5x
```

używając NTT długości `4` modulo `17` z pierwiastkiem `omega = 4`.

### Parametry

```text
mod = 17
n = 4
omega = 4
A = [1, 2, 3, 0]
B = [4, 5, 0, 0]
```

### Sprawdzenie pierwiastka

```text
4^2 mod 17 = 16 = -1 mod 17
4^4 mod 17 = 1
```

Zatem `4` jest pierwiastkiem czwartego stopnia modulo `17`.

### Transformata `A`

```text
NTT(A) = [6, 6, 2, 7]
```

### Transformata `B`

```text
NTT(B) = [9, 7, 16, 1]
```

### Mnożenie punktowe

```text
C_hat[0] = 6 * 9  mod 17 = 3
C_hat[1] = 6 * 7  mod 17 = 8
C_hat[2] = 2 * 16 mod 17 = 15
C_hat[3] = 7 * 1  mod 17 = 7
```

```text
C_hat = [3, 8, 15, 7]
```

### Transformata odwrotna

```text
omega^-1 mod 17 = 13
n^-1 = 4^-1 mod 17 = 13
```

```text
INTT(C_hat) = [4, 13, 5, 15]
```

### Wynik

Modulo `17`:

```text
C(x) = 4 + 13x + 5x^2 + 15x^3
```

W liczbach całkowitych przed redukcją środkowy współczynnik wynosi `22`, więc:

```text
[4, 13, 22, 15] mod 17 = [4, 13, 5, 15]
```

Charakter flow w notatniku:

- klasyczne `transform -> multiply -> inverse transform`;
- mały rozmiar, więc wynik da się sprawdzić ręcznie;
- to zadanie jest domyślnym pierwszym wyborem po otwarciu widoku.

---

## Zadanie 2 - Rekurencyjne FFT przez parzyste i nieparzyste indeksy

Task id: `recursive-fft-split`

Domyślne wartości:

- `n = 4`
- `omega = i`
- `A = [1, 2, 3, 4]`

Pola w popupie:

- `n`
- `omega`
- `A`

Treść:

Policz FFT wektora:

```text
A = [1, 2, 3, 4]
```

używając rekurencyjnego rozbicia Cooleya-Tukeya na część parzystą i nieparzystą.
Przyjmij konwencję:

```text
omega = i
```

### Podział wejścia

```text
A_even = [1, 3]
A_odd  = [2, 4]
```

### FFT części parzystej

Dla długości `2` pierwiastkiem jest `-1`:

```text
FFT([1, 3]) = [1 + 3, 1 - 3]
FFT([1, 3]) = [4, -2]
```

### FFT części nieparzystej

```text
FFT([2, 4]) = [2 + 4, 2 - 4]
FFT([2, 4]) = [6, -2]
```

### Składanie motylkami

```text
E = [4, -2]
O = [6, -2]
omega = i
```

Dla `k = 0`:

```text
X0 = E0 + omega^0 * O0 = 4 + 6 = 10
X2 = E0 - omega^0 * O0 = 4 - 6 = -2
```

Dla `k = 1`:

```text
X1 = E1 + omega^1 * O1 = -2 + i * (-2) = -2 - 2i
X3 = E1 - omega^1 * O1 = -2 - i * (-2) = -2 + 2i
```

### Wynik

```text
FFT([1, 2, 3, 4]) = [10, -2 - 2i, -2, -2 + 2i]
```

Charakter flow w notatniku:

- brak mnożenia wielomianów, samo wnętrze FFT;
- nacisk na split `even/odd` i motylki;
- dobry przykład do pokazania, że FFT to nie magia, tylko sprytne przepakowanie
  tych samych sum.

---

## Zadanie 3 - Pułapka: konwolucja cykliczna zamiast liniowej

Task id: `cyclic-vs-linear-trap`

Domyślne wartości:

- `mod = 17`
- `A = [1, 2, 3, 4]`
- `B = [1, 1, 1, 1]`
- `bad_n = 4`
- `good_n = 8`
- `omega4 = 4`
- `omega8 = 2`

Pola w popupie:

- `mod`
- `A`
- `B`
- `bad_n`
- `good_n`
- `omega4`
- `omega8`

Treść:

Pokaż, co się stanie, gdy do liniowej konwolucji dwóch wektorów długości `4`
użyjemy NTT długości `4` bez paddingu. Następnie popraw obliczenie przez padding
do długości `8`.

### Błędne ustawienie: `n = 4`

```text
A = [1, 2, 3, 4]
B = [1, 1, 1, 1]
mod = 17
omega4 = 4
```

### NTT długości `4`

```text
NTT(A) = [10, 7, 15, 6]
NTT(B) = [4, 0, 0, 0]
```

### Mnożenie punktowe

```text
C_hat = [10*4, 7*0, 15*0, 6*0] mod 17
C_hat = [6, 0, 0, 0]
```

### Transformata odwrotna

```text
INTT(C_hat) = [10, 10, 10, 10]
```

To jest konwolucja cykliczna, czyli współczynniki z końca zawinęły się na
początek.

### Poprawne ustawienie: `n = 8`

Dla liniowej konwolucji potrzeba długości co najmniej:

```text
len(A) + len(B) - 1 = 4 + 4 - 1 = 7
```

Bierzemy więc `n = 8`.

```text
A = [1, 2, 3, 4, 0, 0, 0, 0]
B = [1, 1, 1, 1, 0, 0, 0, 0]
omega8 = 2
```

### Poprawny wynik przez NTT długości `8`

```text
INTT(NTT(A) * NTT(B)) = [1, 3, 6, 10, 9, 7, 4, 0]
```

### Wynik liniowy

```text
A * B = [1, 3, 6, 10, 9, 7, 4]
```

Charakter flow w notatniku:

- celowo najpierw pojawia się błędny wynik;
- kluczowy jest test minimalnej długości `len(A) + len(B) - 1`;
- zadanie pokazuje różnicę między konwolucją cykliczną i liniową.

---

## Zadanie 4 - Mnożenie liczb przez konwolucję cyfr

Task id: `big-integer-convolution`

Domyślne wartości:

- `left = 123`
- `right = 12`
- `base = 10`
- `mod = 17`
- `n = 4`
- `omega = 4`

Pola w popupie:

- `left`
- `right`
- `base`
- `mod`
- `n`
- `omega`

Treść:

Pomnóż liczby `123` i `12`, traktując cyfry jako współczynniki wielomianu w
bazie `10`. Konwolucję cyfr policz przez NTT długości `4` modulo `17`.

### Zamiana liczb na wektory cyfr

Cyfry zapisujemy od najmniej znaczącej:

```text
123 -> [3, 2, 1, 0]
12  -> [2, 1, 0, 0]
```

### Transformata

```text
NTT([3, 2, 1, 0]) = [6, 10, 2, 11]
NTT([2, 1, 0, 0]) = [3, 6, 1, 15]
```

### Mnożenie punktowe

```text
C_hat[0] = 6  * 3  mod 17 = 1
C_hat[1] = 10 * 6  mod 17 = 9
C_hat[2] = 2  * 1  mod 17 = 2
C_hat[3] = 11 * 15 mod 17 = 12
```

```text
C_hat = [1, 9, 2, 12]
```

### Transformata odwrotna

```text
INTT(C_hat) = [6, 7, 4, 1]
```

### Przeniesienia w bazie `10`

```text
c0 = 6 -> digit 6, carry 0
c1 = 7 -> digit 7, carry 0
c2 = 4 -> digit 4, carry 0
c3 = 1 -> digit 1, carry 0
```

Cyfry od najmniej znaczącej:

```text
[6, 7, 4, 1]
```

Po odwróceniu:

```text
1476
```

### Wynik

```text
123 * 12 = 1476
```

Charakter flow w notatniku:

- FFT/NTT jest użyte jako narzędzie do mnożenia dużych liczb;
- po odwrotnej transformacie pojawia się dodatkowy etap `carry`;
- przykład jest mały, ale flow jest takie samo jak przy długich liczbach.

---

## Zadanie 5 - Zły pierwiastek NTT i utrata odwracalności

Task id: `primitive-root-check`

Domyślne wartości:

- `mod = 17`
- `n = 8`
- `omega_bad = 4`
- `omega_good = 2`

Pola w popupie:

- `mod`
- `n`
- `omega_bad`
- `omega_good`

Treść:

Sprawdź, czy `omega = 4` może być użyte jako pierwiastek pierwotny stopnia `8`
modulo `17`. Jeśli nie, pokaż, jak prowadzi to do kolizji transformaty, a potem
napraw parametr przez wybór `omega = 2`.

### Próba z `omega = 4`

```text
mod = 17
n = 8
omega = 4
```

Sprawdzamy potęgi:

```text
4^8 mod 17 = 1
4^4 mod 17 = 1
```

Dla pierwiastka pierwotnego stopnia `8` powinno być:

```text
omega^8 = 1
omega^4 != 1
```

Tutaj `4^4 = 1`, więc `4` ma rząd `4`, a nie `8`.

### Kolizja transformaty

Weźmy dwa różne wektory:

```text
A = [1, 0, 0, 0, 0, 0, 0, 0]
B = [0, 0, 0, 0, 1, 0, 0, 0]
```

Dla `A`:

```text
NTT_bad(A)[k] = 1
```

Dla `B`:

```text
NTT_bad(B)[k] = 4^(4k)
```

Ale:

```text
4^4 = 1
```

więc:

```text
4^(4k) = 1
```

Stąd:

```text
NTT_bad(A) = [1, 1, 1, 1, 1, 1, 1, 1]
NTT_bad(B) = [1, 1, 1, 1, 1, 1, 1, 1]
```

Dwa różne wejścia mają tę samą transformatę, więc transformata nie jest
odwracalna.

### Naprawa: `omega = 2`

```text
2^8 mod 17 = 1
2^4 mod 17 = 16 = -1 mod 17
```

Zatem `2` jest poprawnym pierwiastkiem pierwotnym stopnia `8` modulo `17`.

Dla wektora `B`:

```text
NTT_good(B)[k] = 2^(4k) = (-1)^k
```

czyli:

```text
NTT_good(B) = [1, 16, 1, 16, 1, 16, 1, 16]
```

A dla `A` nadal:

```text
NTT_good(A) = [1, 1, 1, 1, 1, 1, 1, 1]
```

### Wynik

```text
omega = 4  -> niepoprawny pierwiastek dla n = 8
omega = 2  -> poprawny pierwiastek dla n = 8
```

Charakter flow w notatniku:

- zadanie nie liczy konwolucji, tylko waliduje warunek konieczny NTT;
- pokazuje realną awarię: utratę jednoznaczności transformacji;
- bardzo dobre jako zaawansowany test UI, bo wynik nie jest kolejną tabelką
  mnożenia, tylko wykryciem błędnych parametrów.
