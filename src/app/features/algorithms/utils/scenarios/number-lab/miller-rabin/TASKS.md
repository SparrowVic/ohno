# Miller-Rabin Primality - aktualne zadania i obliczenia

Ten plik opisuje aktywne zadania z `MILLER_RABIN_TASKS` w `index.ts` oraz ich
domyślne wartości. Aktualizuj go zawsze po zmianie listy tasków,
`defaultValues`, `notebookFlow` albo sposobu liczenia w notatniku.

Aktualny notatnik na UI pokazuje obliczenia jak zapis na kartce: osobne sekcje
`Rozkład n - 1`, `Test bazy`, `Kwadraty modularne`, `Wniosek`, `Wynik`.
Każdy test bazy zaczyna się od zapisu:

```text
n - 1 = 2^s * d
```

gdzie `d` jest nieparzyste. Następnie liczony jest ciąg:

```text
x0 = a^d mod n
x1 = x0^2 mod n
x2 = x1^2 mod n
...
```

Baza przechodzi test, gdy `x0 = 1` albo któryś z elementów ciągu jest równy
`n - 1`. W przeciwnym razie baza jest świadkiem złożoności.

## Kolejność w widoku

1. `short` - podstawowe zadanie startowe, liczba pierwsza przechodzi test.
2. `single-witness` - jedna baza wykrywa liczbę złożoną.
3. `strong-liar-multibase` - jedna baza kłamie, druga wykrywa złożoność.
4. `gcd-precheck` - baza ma wspólny dzielnik z `n`, więc potęgowanie nie jest potrzebne.
5. `sqrt-factor-leak` - test wykrywa nietrywialny pierwiastek z `1` i ujawnia czynniki.

---

## Zadanie 1 - Podstawowy test dla liczby pierwszej

Task id: `short`

Domyślne wartości:

- `n = 37`
- `base = 2`

Pola w popupie:

- `n`
- `base`

Treść:

Sprawdź, czy `37` przechodzi test Millera-Rabina dla bazy `2`. Pokaż rozkład
`n - 1` oraz kolejne kwadraty modularne.

### Rozkład `n - 1`

```text
n = 37
n - 1 = 36
36 = 2^2 * 9
s = 2
d = 9
```

### Test bazy `a = 2`

```text
x0 = 2^9 mod 37
x0 = 512 mod 37
x0 = 31
```

```text
31 != 1
31 != 36
```

Liczymy kolejny kwadrat:

```text
x1 = 31^2 mod 37
x1 = 961 mod 37
x1 = 36
```

### Wniosek

```text
x1 = n - 1
```

Baza `2` przechodzi test.

### Wynik

```text
37 jest strong probable prime dla bazy 2
```

W tym konkretnym przykładzie `37` jest liczbą pierwszą.

Charakter flow w notatniku:

- najprostszy pozytywny przebieg;
- pojawia się rozkład `n - 1 = 2^s * d`;
- test nie kończy się na `x0`, tylko po jednym kwadracie trafia w `n - 1`;
- to zadanie jest domyślnym pierwszym wyborem po otwarciu widoku.

---

## Zadanie 2 - Świadek złożoności w jednej bazie

Task id: `single-witness`

Domyślne wartości:

- `n = 221`
- `base = 137`

Pola w popupie:

- `n`
- `base`

Treść:

Sprawdź liczbę `221` testem Millera-Rabina dla bazy `137`. Ustal, czy baza jest
świadkiem złożoności.

### Rozkład `n - 1`

```text
n = 221
n - 1 = 220
220 = 2^2 * 55
s = 2
d = 55
```

### Test bazy `a = 137`

```text
x0 = 137^55 mod 221
x0 = 188
```

```text
188 != 1
188 != 220
```

Liczymy jedyny wymagany kwadrat:

```text
x1 = 188^2 mod 221
x1 = 35344 mod 221
x1 = 205
```

```text
205 != 220
```

### Wniosek

Ciąg nie trafił ani w `1` na początku, ani w `n - 1` w żadnym dozwolonym kroku.

```text
137 jest świadkiem złożoności liczby 221
```

### Wynik

```text
221 jest liczbą złożoną
```

Charakter flow w notatniku:

- negatywny przebieg bez szukania czynników;
- ważne jest to, że Miller-Rabin odpowiada „composite”, ale nie musi od razu
  mówić, przez co liczba się dzieli;
- zadanie ma krótki ciąg kwadratów, więc dobrze pokazuje samą logikę świadka.

---

## Zadanie 3 - Silny pseudopierwszy przypadek dla jednej bazy

Task id: `strong-liar-multibase`

Domyślne wartości:

- `n = 2047`
- `base1 = 2`
- `base2 = 3`

Pola w popupie:

- `n`
- `base1`
- `base2`

Treść:

Liczba `2047` przechodzi test Millera-Rabina dla bazy `2`, ale nie przechodzi go
dla bazy `3`. Pokaż oba testy i wyjaśnij, dlaczego jedna baza to za mało.

### Rozkład `n - 1`

```text
n = 2047
n - 1 = 2046
2046 = 2^1 * 1023
s = 1
d = 1023
```

### Test bazy `a = 2`

```text
x0 = 2^1023 mod 2047
x0 = 1
```

Skoro:

```text
x0 = 1
```

baza `2` przechodzi test.

### Test bazy `a = 3`

```text
x0 = 3^1023 mod 2047
x0 = 1565
```

```text
1565 != 1
1565 != 2046
```

Ponieważ `s = 1`, nie ma kolejnych kwadratów do sprawdzenia.

### Wniosek

```text
base 2: przechodzi
base 3: nie przechodzi
```

Baza `3` jest świadkiem złożoności.

### Wynik

```text
2047 jest liczbą złożoną
```

Dodatkowo:

```text
2047 = 23 * 89
```

Charakter flow w notatniku:

- pokazuje pojęcie strong liar bez ciężkiego tekstu teoretycznego;
- pierwsza baza daje fałszywe poczucie bezpieczeństwa;
- druga baza natychmiast niszczy ten optymizm, jak każda solidna procedura testowa.

---

## Zadanie 4 - Wczesny test `gcd(base, n)`

Task id: `gcd-precheck`

Domyślne wartości:

- `n = 91`
- `base = 7`

Pola w popupie:

- `n`
- `base`

Treść:

Przed wykonaniem potęgowania modularnego sprawdź, czy baza `7` jest względnie
pierwsza z `91`. Jeśli nie, zakończ test bez liczenia `a^d mod n`.

### Sprawdzenie bazy

```text
n = 91
a = 7
```

```text
gcd(7, 91) = 7
```

### Wniosek

```text
1 < gcd(a, n) < n
```

Baza `7` ma wspólny dzielnik z `n`, więc `n` jest złożone.

### Rozbicie

```text
91 / 7 = 13
```

### Wynik

```text
91 = 7 * 13
```

Charakter flow w notatniku:

- test kończy się przed właściwym Millerem-Rabinem;
- najważniejszym krokiem jest `gcd(a, n)`, nie potęgowanie;
- zadanie pokazuje praktyczny guard w implementacji, żeby nie robić drogich
  obliczeń, kiedy odpowiedź leży na ziemi i krzyczy „podnieś mnie”.

---

## Zadanie 5 - Nietrywialny pierwiastek z `1` i wyciek czynników

Task id: `sqrt-factor-leak`

Domyślne wartości:

- `n = 341`
- `base = 2`

Pola w popupie:

- `n`
- `base`

Treść:

Dla `n = 341` i bazy `2` wykonaj test Millera-Rabina. Gdy w ciągu kwadratów
pojawi się nietrywialny pierwiastek z `1`, użyj `gcd(x - 1, n)` oraz
`gcd(x + 1, n)` do odzyskania czynników.

### Rozkład `n - 1`

```text
n = 341
n - 1 = 340
340 = 2^2 * 85
s = 2
d = 85
```

### Test bazy `a = 2`

```text
x0 = 2^85 mod 341
x0 = 32
```

```text
32 != 1
32 != 340
```

Liczymy kwadrat:

```text
x1 = 32^2 mod 341
x1 = 1024 mod 341
x1 = 1
```

### Nietrywialny pierwiastek

Mamy:

```text
32^2 = 1 (mod 341)
```

ale:

```text
32 != 1
32 != -1 (mod 341)
```

To oznacza nietrywialny pierwiastek z `1` modulo liczby złożonej.

### Odzyskanie czynników

```text
gcd(32 - 1, 341) = gcd(31, 341) = 31
```

```text
gcd(32 + 1, 341) = gcd(33, 341) = 11
```

### Wynik

```text
341 = 31 * 11
```

Po uporządkowaniu:

```text
341 = 11 * 31
```

Charakter flow w notatniku:

- test nie tylko mówi „composite”, ale przy okazji znajduje czynniki;
- pojawia się osobna sekcja `Nietrywialny pierwiastek`;
- flow jest inne niż zwykły witness, bo końcówka przechodzi w dwa obliczenia `gcd`.
