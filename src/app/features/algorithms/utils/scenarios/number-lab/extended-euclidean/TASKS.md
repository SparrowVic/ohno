# Extended Euclidean - aktualne zadania i obliczenia

Ten plik opisuje aktywne zadania z `EXTENDED_EUCLIDEAN_TASKS` w `index.ts` oraz
ich domyslne wartosci. Aktualizuj go zawsze po zmianie listy taskow,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

## Kolejnosc w widoku

1. `short` - podstawowe zadanie startowe.
2. `rsa-inverse` - odwrotnosc modulo w kontekście RSA.
3. `diophantine-logistics` - rownanie diofantyczne z rozwiazaniem ogolnym.
4. `modular-equation-trap` - rownanie modularne bez rozwiazan.
5. `fibonacci-chain` - dlugi lancuch podstawiania wstecznego.

---

## Zadanie 1 - Podstawowe dzialanie algorytmu

Task id: `short`

Domyslne wartosci:

- `a = 60`
- `b = 48`

Tresc:

Znajdz liczby calkowite `s, t` takie, ze:

```text
60s + 48t = gcd(60, 48)
```

Zapisz kazde dzielenie w przod i pokaz back-substytucje w jednej linii.

### Obliczenia w przod

```text
60 = 1 * 48 + 12
48 = 4 * 12 + 0
```

```text
NWD = 12
```

### Cofanie

```text
12 = 60 - 1 * 48
```

### Wynik

```text
gcd(60, 48) = 12
s = 1
t = -1

12 = 1 * 60 + (-1) * 48
```

Charakter flow w notatniku:

- krotki, podstawowy przebieg;
- pelny algorytm, ale tylko jedna linia back-substytucji;
- to zadanie jest domyslnym pierwszym wyborem po otwarciu widoku.

---

## Zadanie 2 - Kryptografia RSA

Task id: `rsa-inverse`

Domyslne wartosci:

- `n = 221`
- `phi(n) = 192`
- `e = 35`

Pola w popupie:

- `n`
- `phi(n)`
- `e`

Tresc:

W systemie RSA rozważono `n = 221`, publiczny wykladnik `e = 35` oraz
`phi(n) = 192`.

1. Sprawdz, czy `e` posiada odwrotnosc modulo `phi(n)`.
2. Jesli tak, wyznacz klucz prywatny `d` taki, ze:

```text
d * e = 1 (mod phi(n))
```

3. Zinterpretuj wynik w kontekscie RSA.

### Obliczenia w przod

```text
192 = 5 * 35 + 17
35 = 2 * 17 + 1
17 = 17 * 1 + 0
```

```text
NWD = 1
```

Wniosek:

```text
gcd(192, 35) = 1
```

Odwrotnosc istnieje.

### Cofanie

```text
1 = 35 - 2 * 17
17 = 192 - 5 * 35

1 = 35 - 2 * (192 - 5 * 35)
1 = 35 - 2 * 192 + 10 * 35
1 = 11 * 35 - 2 * 192
```

### Wynik

Wspolczynnik przy `e = 35` wynosi `11`, wiec:

```text
d = 11
```

Sprawdzenie:

```text
35 * 11 = 385
385 mod 192 = 1
```

Interpretacja:

```text
(e, d) = (35, 11)
m^(e * d) = m (mod 221)
```

Charakter flow w notatniku:

- po znalezieniu `NWD = 1` pojawia sie test istnienia odwrotnosci;
- back-substytucja sluzy nie tylko do Bézouta, ale do odczytania
  wspolczynnika przy `e`;
- finalna linia interpretuje wynik jako klucz prywatny RSA.

---

## Zadanie 3 - Rownanie diofantyczne z kontekstem

Task id: `diophantine-logistics`

Domyslne wartosci:

- `a = 84`
- `b = 36`
- `target = 12`

Pola w popupie:

- `a`
- `b`
- `target`

Tresc:

Firma logistyczna uzywa dwoch typow ciezarowek:

- typ A przewozi `84` jednostki,
- typ B przewozi `36` jednostek.

Model matematyczny prowadzi do rownania:

```text
84x + 36y = 12
```

1. Znajdz rozwiazanie szczegolne.
2. Wyznacz rozwiazanie ogolne.
3. Wskaz rozwiazanie o najmniejszych wartosciach bezwzglednych.

### Obliczenia w przod

```text
84 = 2 * 36 + 12
36 = 3 * 12 + 0
```

```text
NWD = 12
```

### Sprawdzenie istnienia rozwiazan

```text
12 = 1 * NWD
```

Poniewaz `12` dzieli prawa strone rownania, rozwiazania istnieja.

### Cofanie

```text
12 = 84 - 2 * 36
```

To juz jest rownanie docelowe, bo prawa strona wynosi `12`.

### Rozwiazanie szczegolne

```text
x0 = 1
y0 = -2

84 * 1 + 36 * (-2) = 84 - 72 = 12
```

### Rozwiazanie ogolne

Dla rownania `ax + by = c`, przy `g = gcd(a, b)`:

```text
x = x0 + (b / g)k
y = y0 - (a / g)k
k in Z
```

Tutaj:

```text
g = 12
b / g = 36 / 12 = 3
a / g = 84 / 12 = 7
```

Dlatego:

```text
x = 1 + 3k
y = -2 - 7k
k in Z
```

### Minimalizacja

Dla `k = 0`:

```text
x = 1
y = -2
```

Sasiednie wartosci sa wieksze bezwzglednie:

```text
k = -1 -> x = -2, y = 5
k = 1  -> x = 4,  y = -9
```

Wybieramy:

```text
x = 1
y = -2
```

Charakter flow w notatniku:

- po `NWD` pojawia sie osobny test `gcd(a,b) | target`;
- back-substytucja jest krotka, ale potem flow przechodzi w skalowanie,
  rozwiazanie szczegolne, rozwiazanie ogolne i minimalizacje;
- zadanie nie konczy sie na samych wspolczynnikach Bézouta.

---

## Zadanie 4 - Rownanie modularne, przypadek pulapka

Task id: `modular-equation-trap`

Domyslne wartosci:

- `modulus = 221`
- `coefficient = 143`
- `rhs = 55`

Pola w popupie:

- `modulus`
- `coefficient`
- `rhs`

Tresc:

Rozwiaz kongruencje:

```text
143x = 55 (mod 221)
```

1. Sprawdz, czy rozwiazanie istnieje.
2. Jesli tak, znajdz wszystkie rozwiazania.
3. Uzasadnij wynik.

### Obliczenia w przod

```text
221 = 1 * 143 + 78
143 = 1 * 78 + 65
78 = 1 * 65 + 13
65 = 5 * 13 + 0
```

```text
NWD = 13
```

### Sprawdzenie istnienia rozwiazan

Kongruencja `ax = c (mod m)` ma rozwiazanie tylko wtedy, gdy:

```text
gcd(a, m) | c
```

Tutaj:

```text
gcd(143, 221) = 13
55 mod 13 = 3
```

Czyli:

```text
13 nie dzieli 55
```

### Wniosek

```text
Brak rozwiazan
```

Charakter flow w notatniku:

- zadanie celowo nie przechodzi do back-substytucji;
- kluczowy moment to test podzielnosci po znalezieniu `NWD`;
- flow konczy sie wnioskiem negatywnym, a nie wspolczynnikami Bézouta.

---

## Zadanie 5 - Dlugi lancuch Fibonacciego

Task id: `fibonacci-chain`

Domyslne wartosci:

- `a = 89`
- `b = 55`

Tresc:

Wyznacz wspolczynniki Bézouta dla kolejnych liczb Fibonacciego `89` i `55`,
czyli liczby calkowite `s, t` takie, ze:

```text
89s + 55t = gcd(89, 55)
```

Sprawdz, ze wartosci bezwzgledne wspolczynnikow tez sa liczbami Fibonacciego.

### Obliczenia w przod

```text
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

```text
NWD = 1
```

### Cofanie

```text
1 = 3 - 1 * 2
2 = 5 - 1 * 3

1 = 3 - (5 - 1 * 3)
1 = 2 * 3 - 1 * 5
```

```text
3 = 8 - 1 * 5

1 = 2 * (8 - 1 * 5) - 1 * 5
1 = 2 * 8 - 3 * 5
```

```text
5 = 13 - 1 * 8

1 = 2 * 8 - 3 * (13 - 1 * 8)
1 = 5 * 8 - 3 * 13
```

```text
8 = 21 - 1 * 13

1 = 5 * (21 - 1 * 13) - 3 * 13
1 = 5 * 21 - 8 * 13
```

```text
13 = 34 - 1 * 21

1 = 5 * 21 - 8 * (34 - 1 * 21)
1 = 13 * 21 - 8 * 34
```

```text
21 = 55 - 1 * 34

1 = 13 * (55 - 1 * 34) - 8 * 34
1 = 13 * 55 - 21 * 34
```

```text
34 = 89 - 1 * 55

1 = 13 * 55 - 21 * (89 - 1 * 55)
1 = -21 * 89 + 34 * 55
```

### Wynik

```text
gcd(89, 55) = 1
s = -21
t = 34

1 = (-21) * 89 + 34 * 55
```

Sprawdzenie:

```text
(-21) * 89 + 34 * 55 = -1869 + 1870 = 1
```

Charakter flow w notatniku:

- to najdluzszy aktywny przyklad back-substytucji;
- wszystkie ilorazy w przod sa rowne `1`, poza ostatnim krokiem terminalnym;
- wspolczynniki `21` i `34` sa kolejnymi liczbami Fibonacciego.
