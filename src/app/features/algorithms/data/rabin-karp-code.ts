import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

const RABIN_KARP_TS = buildStructuredCode(`
  /**
   * Find pattern occurrences with a rolling polynomial hash.
   * Input: text, pattern, base, and modulus.
   * Returns: all verified match positions.
   */
  //#region rabin-karp function open
  //@step 1
  function rabinKarp(
    text: string,
    pattern: string,
    base = 911_382_323,
    mod = 972_663_749,
  ): number[] {
    if (pattern.length === 0 || pattern.length > text.length) {
      return [];
    }

    const matches: number[] = [];
    const patternLength = pattern.length;
    const highestPower = powMod(base, patternLength - 1, mod);
    const patternHash = hashOf(pattern, base, mod);
    let windowHash = hashOf(text.slice(0, patternLength), base, mod);

    for (let start = 0; start <= text.length - patternLength; start += 1) {
      //@step 5
      if (windowHash === patternHash && matchesAt(text, pattern, start)) {
        //@step 6
        matches.push(start);
      }

      if (start === text.length - patternLength) {
        break;
      }

      //@step 8
      windowHash = rollHash(
        windowHash,
        text[start]!,
        text[start + patternLength]!,
        highestPower,
        base,
        mod,
      );
    }

    //@step 9
    return matches;
  }
  //#endregion rabin-karp

  //#region hash-helpers helper collapsed
  function hashOf(source: string, base: number, mod: number): number {
    let value = 0;

    for (const char of source) {
      value = (value * base + charValue(char)) % mod;
    }

    return value;
  }

  function rollHash(
    currentHash: number,
    outgoingChar: string,
    incomingChar: string,
    highestPower: number,
    base: number,
    mod: number,
  ): number {
    const outgoingValue = charValue(outgoingChar);
    const incomingValue = charValue(incomingChar);
    const reduced = (currentHash - (outgoingValue * highestPower) % mod + mod) % mod;
    return (reduced * base + incomingValue) % mod;
  }

  function matchesAt(text: string, pattern: string, start: number): boolean {
    for (let index = 0; index < pattern.length; index += 1) {
      if (text[start + index] !== pattern[index]) {
        return false;
      }
    }

    return true;
  }

  function charValue(char: string): number {
    return (char.codePointAt(0) ?? 0) + 1;
  }

  function powMod(base: number, exponent: number, mod: number): number {
    let result = 1;

    for (let index = 0; index < exponent; index += 1) {
      result = (result * base) % mod;
    }

    return result;
  }
  //#endregion hash-helpers
`);

const RABIN_KARP_PY = buildStructuredCode(
  `
  """
  Find pattern occurrences with a rolling polynomial hash.
  Input: text, pattern, base, and modulus.
  Returns: all verified match positions.
  """
  //#region rabin-karp function open
  //@step 1
  def rabin_karp(
      text: str,
      pattern: str,
      base: int = 911_382_323,
      mod: int = 972_663_749,
  ) -> list[int]:
      if not pattern or len(pattern) > len(text):
          return []

      matches: list[int] = []
      pattern_length = len(pattern)
      highest_power = pow_mod(base, pattern_length - 1, mod)
      pattern_hash = hash_of(pattern, base, mod)
      window_hash = hash_of(text[:pattern_length], base, mod)

      for start in range(len(text) - pattern_length + 1):
          //@step 5
          if window_hash == pattern_hash and matches_at(text, pattern, start):
              //@step 6
              matches.append(start)

          if start == len(text) - pattern_length:
              break

          //@step 8
          window_hash = roll_hash(
              window_hash,
              text[start],
              text[start + pattern_length],
              highest_power,
              base,
              mod,
          )

      //@step 9
      return matches
  //#endregion rabin-karp

  //#region hash-helpers helper collapsed
  def hash_of(source: str, base: int, mod: int) -> int:
      value = 0
      for char in source:
          value = (value * base + char_value(char)) % mod
      return value

  def roll_hash(
      current_hash: int,
      outgoing_char: str,
      incoming_char: str,
      highest_power: int,
      base: int,
      mod: int,
  ) -> int:
      outgoing_value = char_value(outgoing_char)
      incoming_value = char_value(incoming_char)
      reduced = (current_hash - (outgoing_value * highest_power) % mod + mod) % mod
      return (reduced * base + incoming_value) % mod

  def matches_at(text: str, pattern: str, start: int) -> bool:
      return all(text[start + index] == pattern[index] for index in range(len(pattern)))

  def char_value(char: str) -> int:
      return ord(char) + 1

  def pow_mod(base: int, exponent: int, mod: int) -> int:
      result = 1
      for _ in range(exponent):
          result = (result * base) % mod
      return result
  //#endregion hash-helpers
  `,
  'python',
);

const RABIN_KARP_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  /// <summary>
  /// Finds pattern occurrences with a rolling polynomial hash.
  /// Input: text, pattern, base, and modulus.
  /// Returns: all verified match positions.
  /// </summary>
  //#region rabin-karp function open
  //@step 1
  public static List<int> RabinKarp(
      string text,
      string pattern,
      int @base = 911_382_323,
      int mod = 972_663_749
  )
  {
      if (pattern.Length == 0 || pattern.Length > text.Length)
      {
          return [];
      }

      var matches = new List<int>();
      var patternLength = pattern.Length;
      var highestPower = PowMod(@base, patternLength - 1, mod);
      var patternHash = HashOf(pattern, @base, mod);
      var windowHash = HashOf(text[..patternLength], @base, mod);

      for (var start = 0; start <= text.Length - patternLength; start += 1)
      {
          //@step 5
          if (windowHash == patternHash && MatchesAt(text, pattern, start))
          {
              //@step 6
              matches.Add(start);
          }

          if (start == text.Length - patternLength)
          {
              break;
          }

          //@step 8
          windowHash = RollHash(
              windowHash,
              text[start],
              text[start + patternLength],
              highestPower,
              @base,
              mod
          );
      }

      //@step 9
      return matches;
  }
  //#endregion rabin-karp

  //#region hash-helpers helper collapsed
  private static int HashOf(string source, int @base, int mod)
  {
      var value = 0L;
      foreach (var ch in source)
      {
          value = (value * @base + CharValue(ch)) % mod;
      }

      return (int)value;
  }

  private static int RollHash(
      int currentHash,
      char outgoingChar,
      char incomingChar,
      int highestPower,
      int @base,
      int mod
  )
  {
      var outgoingValue = CharValue(outgoingChar);
      var incomingValue = CharValue(incomingChar);
      var reduced = (currentHash - (long)outgoingValue * highestPower % mod + mod) % mod;
      return (int)((reduced * @base + incomingValue) % mod);
  }

  private static bool MatchesAt(string text, string pattern, int start)
  {
      for (var index = 0; index < pattern.Length; index += 1)
      {
          if (text[start + index] != pattern[index])
          {
              return false;
          }
      }

      return true;
  }

  private static int CharValue(char ch)
  {
      return ch + 1;
  }

  private static int PowMod(int @base, int exponent, int mod)
  {
      var result = 1L;
      for (var index = 0; index < exponent; index += 1)
      {
          result = (result * @base) % mod;
      }

      return (int)result;
  }
  //#endregion hash-helpers
  `,
  'csharp',
);

const RABIN_KARP_JAVA = buildStructuredCode(
  `
  import java.util.ArrayList;
  import java.util.List;

  /**
   * Finds pattern occurrences with a rolling polynomial hash.
   * Input: text, pattern, base, and modulus.
   * Returns: all verified match positions.
   */
  //#region rabin-karp function open
  //@step 1
  public static List<Integer> rabinKarp(
      String text,
      String pattern,
      int base,
      int mod
  ) {
      if (pattern.isEmpty() || pattern.length() > text.length()) {
          return List.of();
      }

      List<Integer> matches = new ArrayList<>();
      int patternLength = pattern.length();
      int highestPower = powMod(base, patternLength - 1, mod);
      int patternHash = hashOf(pattern, base, mod);
      int windowHash = hashOf(text.substring(0, patternLength), base, mod);

      for (int start = 0; start <= text.length() - patternLength; start += 1) {
          //@step 5
          if (windowHash == patternHash && matchesAt(text, pattern, start)) {
              //@step 6
              matches.add(start);
          }

          if (start == text.length() - patternLength) {
              break;
          }

          //@step 8
          windowHash = rollHash(
              windowHash,
              text.charAt(start),
              text.charAt(start + patternLength),
              highestPower,
              base,
              mod
          );
      }

      //@step 9
      return matches;
  }
  //#endregion rabin-karp

  //#region hash-helpers helper collapsed
  private static int hashOf(String source, int base, int mod) {
      long value = 0;
      for (int index = 0; index < source.length(); index += 1) {
          value = (value * base + charValue(source.charAt(index))) % mod;
      }
      return (int)value;
  }

  private static int rollHash(
      int currentHash,
      char outgoingChar,
      char incomingChar,
      int highestPower,
      int base,
      int mod
  ) {
      int outgoingValue = charValue(outgoingChar);
      int incomingValue = charValue(incomingChar);
      long reduced = (currentHash - (long)outgoingValue * highestPower % mod + mod) % mod;
      return (int)((reduced * base + incomingValue) % mod);
  }

  private static boolean matchesAt(String text, String pattern, int start) {
      for (int index = 0; index < pattern.length(); index += 1) {
          if (text.charAt(start + index) != pattern.charAt(index)) {
              return false;
          }
      }
      return true;
  }

  private static int charValue(char ch) {
      return ch + 1;
  }

  private static int powMod(int base, int exponent, int mod) {
      long result = 1;
      for (int index = 0; index < exponent; index += 1) {
          result = (result * base) % mod;
      }
      return (int)result;
  }
  //#endregion hash-helpers
  `,
  'java',
);

const RABIN_KARP_CPP = buildStructuredCode(
  `
  #include <string>
  #include <vector>

  /**
   * Finds pattern occurrences with a rolling polynomial hash.
   * Input: text, pattern, base, and modulus.
   * Returns: all verified match positions.
   */
  //#region rabin-karp function open
  //@step 1
  std::vector<int> rabinKarp(
      const std::string& text,
      const std::string& pattern,
      int base = 911382323,
      int mod = 972663749
  ) {
      if (pattern.empty() || pattern.size() > text.size()) {
          return {};
      }

      std::vector<int> matches;
      int patternLength = static_cast<int>(pattern.size());
      int highestPower = powMod(base, patternLength - 1, mod);
      int patternHash = hashOf(pattern, base, mod);
      int windowHash = hashOf(text.substr(0, patternLength), base, mod);

      for (int start = 0; start <= static_cast<int>(text.size()) - patternLength; start += 1) {
          //@step 5
          if (windowHash == patternHash && matchesAt(text, pattern, start)) {
              //@step 6
              matches.push_back(start);
          }

          if (start == static_cast<int>(text.size()) - patternLength) {
              break;
          }

          //@step 8
          windowHash = rollHash(
              windowHash,
              text[start],
              text[start + patternLength],
              highestPower,
              base,
              mod
          );
      }

      //@step 9
      return matches;
  }
  //#endregion rabin-karp

  //#region hash-helpers helper collapsed
  int hashOf(const std::string& source, int base, int mod) {
      long long value = 0;
      for (char ch : source) {
          value = (value * base + charValue(ch)) % mod;
      }
      return static_cast<int>(value);
  }

  int rollHash(
      int currentHash,
      char outgoingChar,
      char incomingChar,
      int highestPower,
      int base,
      int mod
  ) {
      int outgoingValue = charValue(outgoingChar);
      int incomingValue = charValue(incomingChar);
      long long reduced = (currentHash - (1LL * outgoingValue * highestPower) % mod + mod) % mod;
      return static_cast<int>((reduced * base + incomingValue) % mod);
  }

  bool matchesAt(const std::string& text, const std::string& pattern, int start) {
      for (int index = 0; index < static_cast<int>(pattern.size()); index += 1) {
          if (text[start + index] != pattern[index]) {
              return false;
          }
      }
      return true;
  }

  int charValue(char ch) {
      return static_cast<unsigned char>(ch) + 1;
  }

  int powMod(int base, int exponent, int mod) {
      long long result = 1;
      for (int index = 0; index < exponent; index += 1) {
          result = (result * base) % mod;
      }
      return static_cast<int>(result);
  }
  //#endregion hash-helpers
  `,
  'cpp',
);

export const RABIN_KARP_CODE = RABIN_KARP_TS.lines;
export const RABIN_KARP_CODE_REGIONS = RABIN_KARP_TS.regions;
export const RABIN_KARP_CODE_HIGHLIGHT_MAP = RABIN_KARP_TS.highlightMap;
export const RABIN_KARP_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: RABIN_KARP_TS.lines,
    regions: RABIN_KARP_TS.regions,
    highlightMap: RABIN_KARP_TS.highlightMap,
    source: RABIN_KARP_TS.source,
  },
  python: {
    language: 'python',
    lines: RABIN_KARP_PY.lines,
    regions: RABIN_KARP_PY.regions,
    highlightMap: RABIN_KARP_PY.highlightMap,
    source: RABIN_KARP_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: RABIN_KARP_CS.lines,
    regions: RABIN_KARP_CS.regions,
    highlightMap: RABIN_KARP_CS.highlightMap,
    source: RABIN_KARP_CS.source,
  },
  java: {
    language: 'java',
    lines: RABIN_KARP_JAVA.lines,
    regions: RABIN_KARP_JAVA.regions,
    highlightMap: RABIN_KARP_JAVA.highlightMap,
    source: RABIN_KARP_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: RABIN_KARP_CPP.lines,
    regions: RABIN_KARP_CPP.regions,
    highlightMap: RABIN_KARP_CPP.highlightMap,
    source: RABIN_KARP_CPP.source,
  },
};
