# Chinese Remainder Theorem - aktualne zadania i obliczenia

Ten plik opisuje proponowane zadania z `CRT_TASKS` w `index.ts` oraz
ich domyslne wartosci. Aktualizuj go zawsze po zmianie listy taskow,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

Aktualny notatnik na UI powinien pokazywac obliczenia jak zapis na kartce:
osobne sekcje typu `Warunki`, `Test zgodnosci`, `Konstrukcja CRT`,
`Laczenie kongruencji`, `Sprawdzenie`, `Wynik`, bez opisowych captionow nad
kazdym rownaniem. Dla CRT wazne jest, zeby zadania nie roznily sie tylko
liczbami: raz uzywamy konstrukcji bezposredniej, raz laczenia krok po kroku,
raz uogolnionego CRT dla modulow niewzglednie pierwszych, raz wykrywamy
sprzecznosc, a raz przechodzimy przez reprezentacje mieszana Garnera.

## Kolejnosc w widoku

1. `short` - podstawowe zadanie startowe, klasyczna konstrukcja CRT.
2. `progressive-merge` - laczenie kongruencji krok po kroku.
3. `non-coprime-compatible` - uogolniony CRT, moduly nie sa parami wzglednie pierwsze, ale system jest zgodny.
4. `non-coprime-trap` - uogolniony CRT, system sprzeczny, brak rozwiazan.
5. `garner-mixed-radix` - zaawansowana rekonstrukcja metoda Garnera.

---

## Zadanie 1 - Podstawowe dzialanie algorytmu

Task id: `short`

Domyslne wartosci:

- `a1 = 2`
- `m1 = 3`
- `a2 = 3`
- `m2 = 5`
- `a3 = 2`
- `m3 = 7`

Pola w popupie:

- `a1`
- `m1`
- `a2`
- `m2`
- `a3`
- `m3`

Tresc:

Znajdz najmniejsza nieujemna liczbe `x`, ktora spelnia uklad kongruencji:

```text
x = 2 (mod 3)
x = 3 (mod 5)
x = 2 (mod 7)
```

Uzyj bezposredniej konstrukcji CRT i pokaz, skad biora sie skladniki sumy.

### Test wzglednej pierwszosci

```text
gcd(3, 5) = 1
gcd(3, 7) = 1
gcd(5, 7) = 1
```

Moduly sa parami wzglednie pierwsze, wiec istnieje dokladnie jedno rozwiazanie
modulo ich iloczyn.

### Modul laczny

```text
M = 3 * 5 * 7
M = 105
```

### Konstrukcja CRT

Dla kazdego warunku liczymy:

```text
Mi = M / mi
yi = Mi^(-1) (mod mi)
```

Dla pierwszej kongruencji:

```text
M1 = 105 / 3 = 35
35 = 2 (mod 3)
2 * 2 = 4 = 1 (mod 3)
y1 = 2
```

Dla drugiej kongruencji:

```text
M2 = 105 / 5 = 21
21 = 1 (mod 5)
1 * 1 = 1 (mod 5)
y2 = 1
```

Dla trzeciej kongruencji:

```text
M3 = 105 / 7 = 15
15 = 1 (mod 7)
1 * 1 = 1 (mod 7)
y3 = 1
```

### Suma CRT

```text
x = a1 * M1 * y1 + a2 * M2 * y2 + a3 * M3 * y3
x = 2 * 35 * 2 + 3 * 21 * 1 + 2 * 15 * 1
x = 140 + 63 + 30
x = 233
```

Redukcja modulo `M`:

```text
233 mod 105 = 23
```

### Sprawdzenie

```text
23 mod 3 = 2
23 mod 5 = 3
23 mod 7 = 2
```

### Wynik

```text
x = 23 (mod 105)
```

Czyli wszystkie rozwiazania maja postac:

```text
x = 23 + 105k
k in Z
```

Charakter flow w notatniku:

- najprostszy startowy przyklad CRT;
- pokazuje pelna konstrukcje `Mi`, odwrotnosci `yi` i sume CRT;
- wynik jest redukowany do najmniejszej nieujemnej liczby;
- to zadanie jest domyslnym pierwszym wyborem po otwarciu widoku.

---

## Zadanie 2 - Laczenie kongruencji krok po kroku

Task id: `progressive-merge`

Domyslne wartosci:

- `a1 = 4`
- `m1 = 9`
- `a2 = 2`
- `m2 = 11`
- `a3 = 7`
- `m3 = 13`

Pola w popupie:

- `a1`
- `m1`
- `a2`
- `m2`
- `a3`
- `m3`

Tresc:

Trzy procesy cykliczne zwracaja status poprawnosci w roznych momentach.
Szukamy pierwszego wspolnego momentu `x`, dla ktorego:

```text
x = 4 (mod 9)
x = 2 (mod 11)
x = 7 (mod 13)
```

Nie uzywaj bezposredniej sumy CRT. Polacz najpierw pierwsze dwa warunki w jedna
kongruencje, a potem dolacz trzeci warunek.

### Test wzglednej pierwszosci

```text
gcd(9, 11) = 1
gcd(9, 13) = 1
gcd(11, 13) = 1
```

Moduly sa parami wzglednie pierwsze.

### Modul laczny

```text
M = 9 * 11 * 13
M = 1287
```

### Laczenie pierwszych dwoch kongruencji

Z pierwszej kongruencji:

```text
x = 4 + 9k
```

Podstawiamy do drugiej:

```text
4 + 9k = 2 (mod 11)
9k = -2 (mod 11)
9k = 9 (mod 11)
```

Odwrotnosc `9` modulo `11`:

```text
9 * 5 = 45 = 1 (mod 11)
9^(-1) = 5 (mod 11)
```

Zatem:

```text
k = 9 * 5 (mod 11)
k = 45 (mod 11)
k = 1 (mod 11)
```

Czyli:

```text
k = 1 + 11t
```

Wracamy do `x`:

```text
x = 4 + 9(1 + 11t)
x = 4 + 9 + 99t
x = 13 + 99t
```

Po pierwszym laczeniu mamy:

```text
x = 13 (mod 99)
```

### Dolaczenie trzeciej kongruencji

Teraz podstawiamy:

```text
x = 13 + 99t
```

Warunek trzeci:

```text
13 + 99t = 7 (mod 13)
```

Redukujemy:

```text
13 = 0 (mod 13)
99 = 8 (mod 13)
```

Dostajemy:

```text
8t = 7 (mod 13)
```

Odwrotnosc `8` modulo `13`:

```text
8 * 5 = 40 = 1 (mod 13)
8^(-1) = 5 (mod 13)
```

Zatem:

```text
t = 7 * 5 (mod 13)
t = 35 (mod 13)
t = 9 (mod 13)
```

Czyli:

```text
t = 9 + 13u
```

Wracamy do `x`:

```text
x = 13 + 99(9 + 13u)
x = 13 + 891 + 1287u
x = 904 + 1287u
```

### Sprawdzenie

```text
904 mod 9 = 4
904 mod 11 = 2
904 mod 13 = 7
```

### Wynik

```text
x = 904 (mod 1287)
```

Czyli wszystkie rozwiazania maja postac:

```text
x = 904 + 1287u
u in Z
```

Charakter flow w notatniku:

- nie ma bezposredniej sumy `a_i * M_i * y_i`;
- notatnik buduje rozwiazanie iteracyjnie: najpierw `mod 99`, potem `mod 1287`;
- kazdy etap ma osobne podstawienie `x = a + Mk`;
- dobre zadanie do pokazania, ze CRT mozna liczyc przez stopniowe scalanie warunkow.

---

## Zadanie 3 - Uogolniony CRT, system zgodny mimo wspolnych dzielnikow

Task id: `non-coprime-compatible`

Domyslne wartosci:

- `a1 = 14`
- `m1 = 18`
- `a2 = 38`
- `m2 = 60`
- `a3 = 2`
- `m3 = 7`

Pola w popupie:

- `a1`
- `m1`
- `a2`
- `m2`
- `a3`
- `m3`

Tresc:

System logow z trzech maszyn zapisuje znaczniki czasu z roznymi okresami.
Dwie maszyny maja okresy, ktore nie sa wzglednie pierwsze, wiec zwykla wersja
CRT nie wystarczy. Znajdz wszystkie `x`, ktore spelniaja:

```text
x = 14 (mod 18)
x = 38 (mod 60)
x = 2  (mod 7)
```

Najpierw sprawdz zgodnosc kongruencji, potem polacz warunki metoda podstawiania.

### Test zgodnosci

Dla modulow niewzglednie pierwszych warunek zgodnosci pary jest taki:

```text
gcd(mi, mj) | (aj - ai)
```

Pierwsza i druga kongruencja:

```text
gcd(18, 60) = 6
38 - 14 = 24
24 mod 6 = 0
```

Ta para jest zgodna.

Pierwsza i trzecia kongruencja:

```text
gcd(18, 7) = 1
2 - 14 = -12
```

Ta para jest zgodna, bo `1` dzieli kazda liczbe.

Druga i trzecia kongruencja:

```text
gcd(60, 7) = 1
2 - 38 = -36
```

Ta para tez jest zgodna.

### Laczenie pierwszych dwoch kongruencji

Z pierwszej kongruencji:

```text
x = 14 + 18k
```

Podstawiamy do drugiej:

```text
14 + 18k = 38 (mod 60)
18k = 24 (mod 60)
```

Wspolny dzielnik:

```text
g = gcd(18, 60) = 6
```

Dzielimy kongruencje przez `6`:

```text
18k = 24 (mod 60)
3k = 4 (mod 10)
```

Odwrotnosc `3` modulo `10`:

```text
3 * 7 = 21 = 1 (mod 10)
3^(-1) = 7 (mod 10)
```

Zatem:

```text
k = 4 * 7 (mod 10)
k = 28 (mod 10)
k = 8 (mod 10)
```

Czyli:

```text
k = 8 + 10t
```

Wracamy do `x`:

```text
x = 14 + 18(8 + 10t)
x = 14 + 144 + 180t
x = 158 + 180t
```

Po scaleniu pierwszych dwoch warunkow:

```text
x = 158 (mod 180)
```

Tutaj `180 = lcm(18, 60)`.

### Dolaczenie trzeciej kongruencji

```text
x = 158 + 180t
x = 2 (mod 7)
```

Podstawiamy:

```text
158 + 180t = 2 (mod 7)
```

Redukujemy:

```text
158 = 4 (mod 7)
180 = 5 (mod 7)
```

Dostajemy:

```text
4 + 5t = 2 (mod 7)
5t = -2 (mod 7)
5t = 5 (mod 7)
```

Odwrotnosc `5` modulo `7`:

```text
5 * 3 = 15 = 1 (mod 7)
5^(-1) = 3 (mod 7)
```

Zatem:

```text
t = 5 * 3 (mod 7)
t = 15 (mod 7)
t = 1 (mod 7)
```

Czyli:

```text
t = 1 + 7u
```

Wracamy do `x`:

```text
x = 158 + 180(1 + 7u)
x = 158 + 180 + 1260u
x = 338 + 1260u
```

### Modul koncowy

```text
lcm(18, 60, 7) = 1260
```

### Sprawdzenie

```text
338 mod 18 = 14
338 mod 60 = 38
338 mod 7 = 2
```

### Wynik

```text
x = 338 (mod 1260)
```

Czyli wszystkie rozwiazania maja postac:

```text
x = 338 + 1260u
u in Z
```

Charakter flow w notatniku:

- zaczyna sie od testu zgodnosci, bo moduly nie sa parami wzglednie pierwsze;
- pojawia sie dzielenie kongruencji przez `gcd`, czego nie ma w klasycznym CRT;
- modul po pierwszym scaleniu to `lcm(18, 60)`, a nie iloczyn `18 * 60`;
- zadanie pokazuje poprawny przypadek uogolnionego CRT.

---

## Zadanie 4 - Uogolniony CRT, przypadek pulapka

Task id: `non-coprime-trap`

Domyslne wartosci:

- `a1 = 5`
- `m1 = 12`
- `a2 = 14`
- `m2 = 18`
- `a3 = 19`
- `m3 = 25`

Pola w popupie:

- `a1`
- `m1`
- `a2`
- `m2`
- `a3`
- `m3`

Tresc:

Rozwaz system warunkow:

```text
x = 5  (mod 12)
x = 14 (mod 18)
x = 19 (mod 25)
```

Sprawdz, czy system ma rozwiazanie. Nie wykonuj konstrukcji CRT, jezeli warunki
sa sprzeczne.

### Test zgodnosci pierwszej pary

Dla pary kongruencji trzeba sprawdzic:

```text
gcd(m1, m2) | (a2 - a1)
```

Tutaj:

```text
gcd(12, 18) = 6
14 - 5 = 9
9 mod 6 = 3
```

Czyli:

```text
6 nie dzieli 9
```

### Diagnoza sprzecznosci

Pierwsza kongruencja wymusza:

```text
x = 5 (mod 12)
x = 5 (mod 6)
```

Druga kongruencja wymusza:

```text
x = 14 (mod 18)
x = 2  (mod 6)
```

Ten sam `x` nie moze jednoczesnie spelniac:

```text
x = 5 (mod 6)
x = 2 (mod 6)
```

### Wynik

```text
Brak rozwiazan
```

Trzecia kongruencja nie ma znaczenia dla koncowego wniosku, bo sprzecznosc jest
juz w pierwszych dwoch warunkach.

Charakter flow w notatniku:

- zadanie celowo nie przechodzi do liczenia odwrotnosci modularnych;
- najwazniejszy jest test `gcd(mi, mj) | (aj - ai)`;
- flow konczy sie negatywnym wynikiem, bez konstrukcji `x`;
- to dobry test, czy UI nie probuje na sile liczyc CRT dla sprzecznego systemu.

---

## Zadanie 5 - Rekonstrukcja metoda Garnera

Task id: `garner-mixed-radix`

Domyslne wartosci:

- `a1 = 4`
- `m1 = 5`
- `a2 = 3`
- `m2 = 7`
- `a3 = 8`
- `m3 = 9`
- `a4 = 6`
- `m4 = 11`

Pola w popupie:

- `a1`
- `m1`
- `a2`
- `m2`
- `a3`
- `m3`
- `a4`
- `m4`

Tresc:

Liczba zostala zapisana jako zestaw reszt wzgledem kilku malych modulow. Trzeba
odtworzyc jedna liczbe `x` z zakresu `0 <= x < M`, ale bez klasycznej sumy CRT.
Uzyj reprezentacji mieszanej Garnera.

Dane:

```text
x = 4 (mod 5)
x = 3 (mod 7)
x = 8 (mod 9)
x = 6 (mod 11)
```

Szukamy postaci:

```text
x = c0 + c1 * 5 + c2 * 5 * 7 + c3 * 5 * 7 * 9
```

czyli:

```text
x = c0 + 5c1 + 35c2 + 315c3
```

### Test wzglednej pierwszosci

```text
gcd(5, 7) = 1
gcd(5, 9) = 1
gcd(5, 11) = 1
gcd(7, 9) = 1
gcd(7, 11) = 1
gcd(9, 11) = 1
```

Moduly sa parami wzglednie pierwsze.

### Modul laczny

```text
M = 5 * 7 * 9 * 11
M = 3465
```

### Wspolczynnik c0

Z pierwszej kongruencji:

```text
x = 4 (mod 5)
```

W reprezentacji mieszanej:

```text
x = c0 + 5c1 + 35c2 + 315c3
```

Wszystkie skladniki poza `c0` sa wielokrotnosciami `5`, wiec:

```text
c0 = 4
```

### Wspolczynnik c1

Podstawiamy `c0 = 4` i patrzymy modulo `7`:

```text
x = 4 + 5c1 + 35c2 + 315c3
x = 3 (mod 7)
```

Skladniki `35c2` i `315c3` znikaja modulo `7`, wiec:

```text
4 + 5c1 = 3 (mod 7)
5c1 = -1 (mod 7)
5c1 = 6 (mod 7)
```

Odwrotnosc `5` modulo `7`:

```text
5 * 3 = 15 = 1 (mod 7)
5^(-1) = 3 (mod 7)
```

Zatem:

```text
c1 = 6 * 3 (mod 7)
c1 = 18 (mod 7)
c1 = 4
```

### Wspolczynnik c2

Aktualna postac:

```text
x = 4 + 5 * 4 + 35c2 + 315c3
x = 24 + 35c2 + 315c3
```

Patrzymy modulo `9`:

```text
24 + 35c2 = 8 (mod 9)
```

Redukujemy:

```text
24 = 6 (mod 9)
35 = 8 (mod 9)
```

Dostajemy:

```text
6 + 8c2 = 8 (mod 9)
8c2 = 2 (mod 9)
```

Odwrotnosc `8` modulo `9`:

```text
8 * 8 = 64 = 1 (mod 9)
8^(-1) = 8 (mod 9)
```

Zatem:

```text
c2 = 2 * 8 (mod 9)
c2 = 16 (mod 9)
c2 = 7
```

### Wspolczynnik c3

Aktualna postac:

```text
x = 24 + 35 * 7 + 315c3
x = 269 + 315c3
```

Patrzymy modulo `11`:

```text
269 + 315c3 = 6 (mod 11)
```

Redukujemy:

```text
269 = 5 (mod 11)
315 = 7 (mod 11)
```

Dostajemy:

```text
5 + 7c3 = 6 (mod 11)
7c3 = 1 (mod 11)
```

Odwrotnosc `7` modulo `11`:

```text
7 * 8 = 56 = 1 (mod 11)
7^(-1) = 8 (mod 11)
```

Zatem:

```text
c3 = 1 * 8 (mod 11)
c3 = 8
```

### Zlozenie liczby

```text
x = c0 + 5c1 + 35c2 + 315c3
x = 4 + 5 * 4 + 35 * 7 + 315 * 8
x = 4 + 20 + 245 + 2520
x = 2789
```

### Sprawdzenie

```text
2789 mod 5 = 4
2789 mod 7 = 3
2789 mod 9 = 8
2789 mod 11 = 6
```

### Wynik

```text
x = 2789 (mod 3465)
```

Czyli wszystkie rozwiazania maja postac:

```text
x = 2789 + 3465k
k in Z
```

Charakter flow w notatniku:

- zadanie nie uzywa klasycznej konstrukcji z `Mi = M / mi`;
- wynik powstaje przez kolejne cyfry reprezentacji mieszanej `c0, c1, c2, c3`;
- kazdy nowy wspolczynnik jest liczony z kolejnej kongruencji;
- to najbardziej zaawansowany przyklad, przydatny do pokazania CRT w wersji algorytmicznej.

---

## Uwagi implementacyjne

- `short` powinien byc domyslnie wybranym taskiem po wejściu na widok.
- Dla `short`, `progressive-merge` i `garner-mixed-radix` mozna wymagac modulow parami wzglednie pierwszych.
- Dla `non-coprime-compatible` i `non-coprime-trap` UI musi dopuscic moduly z `gcd(mi, mj) > 1`.
- W zadaniach uogolnionych najpierw wykonuj test zgodnosci `gcd(mi, mj) | (aj - ai)`.
- Jezeli test zgodnosci nie przejdzie, notatnik powinien konczyc sie sekcja `Brak rozwiazan`, bez liczenia odwrotnosci modularnych.
- Jezeli test zgodnosci przejdzie, modul koncowy jest `lcm(m1, m2, ..., mn)`, a nie prostym iloczynem wszystkich modulow.
- Odwrotnosci modularne pojawiaja sie tylko tam, gdzie po redukcji wspolczynnik i modul sa wzglednie pierwsze.
