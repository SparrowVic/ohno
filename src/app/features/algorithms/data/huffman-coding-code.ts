import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const HUFFMAN_TS = buildStructuredCode(`
  //#region huffman-node interface collapsed
  interface HuffmanNode {
    readonly char: string | null;
    readonly freq: number;
    readonly left: HuffmanNode | null;
    readonly right: HuffmanNode | null;
  }
  //#endregion huffman-node

  /**
   * Build prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  function huffmanCodes(source: string): Record<string, string> {
    //@step 2
    const frequencies = countFrequency(source);

    //@step 3
    const queue = buildPriorityQueue(frequencies);
    if (queue.length === 0) {
      return {};
    }

    while (queue.length > 1) {
      queue.sort((left, right) => left.freq - right.freq);

      //@step 5
      const left = queue.shift()!;
      const right = queue.shift()!;

      //@step 7
      queue.push({
        char: null,
        freq: left.freq + right.freq,
        left,
        right,
      });
    }

    const codes: Record<string, string> = {};

    //@step 10
    assignCodes(queue[0]!, '', codes);
    return codes;
  }
  //#endregion huffman

  //#region frequency helper collapsed
  function countFrequency(source: string): Map<string, number> {
    const frequencies = new Map<string, number>();

    for (const char of source) {
      frequencies.set(char, (frequencies.get(char) ?? 0) + 1);
    }

    return frequencies;
  }

  function buildPriorityQueue(frequencies: Map<string, number>): HuffmanNode[] {
    return [...frequencies.entries()].map(([char, freq]) => ({
      char,
      freq,
      left: null,
      right: null,
    }));
  }

  function assignCodes(
    node: HuffmanNode,
    prefix: string,
    codes: Record<string, string>,
  ): void {
    if (node.char !== null) {
      codes[node.char] = prefix === '' ? '0' : prefix;
      return;
    }

    assignCodes(node.left!, prefix + '0', codes);
    assignCodes(node.right!, prefix + '1', codes);
  }
  //#endregion frequency
`);

const HUFFMAN_PY = buildStructuredCode(
  `
  from collections import Counter
  from dataclasses import dataclass
  import heapq


  //#region huffman-node interface collapsed
  @dataclass
  class HuffmanNode:
      char: str | None
      freq: int
      left: "HuffmanNode | None" = None
      right: "HuffmanNode | None" = None
  //#endregion huffman-node

  """
  Build prefix-free Huffman codes for a string.
  Input: source string.
  Returns: a map from character to its Huffman bitstring.
  """
  //#region huffman function open
  def huffman_codes(source: str) -> dict[str, str]:
      //@step 2
      frequencies = count_frequency(source)

      //@step 3
      heap = build_priority_queue(frequencies)
      if not heap:
          return {}

      order = len(heap)
      while len(heap) > 1:
          //@step 5
          _, _, left = heapq.heappop(heap)
          _, _, right = heapq.heappop(heap)

          //@step 7
          heapq.heappush(heap, (left.freq + right.freq, order, HuffmanNode(None, left.freq + right.freq, left, right)))
          order += 1

      _, _, root = heap[0]
      codes: dict[str, str] = {}

      //@step 10
      assign_codes(root, "", codes)
      return codes
  //#endregion huffman

  //#region frequency helper collapsed
  def count_frequency(source: str) -> dict[str, int]:
      return dict(Counter(source))

  def build_priority_queue(frequencies: dict[str, int]) -> list[tuple[int, int, HuffmanNode]]:
      heap: list[tuple[int, int, HuffmanNode]] = []
      for order, (char, freq) in enumerate(sorted(frequencies.items())):
          heap.append((freq, order, HuffmanNode(char, freq)))
      heapq.heapify(heap)
      return heap

  def assign_codes(node: HuffmanNode, prefix: str, codes: dict[str, str]) -> None:
      if node.char is not None:
          codes[node.char] = prefix or "0"
          return

      assign_codes(node.left, prefix + "0", codes)
      assign_codes(node.right, prefix + "1", codes)
  //#endregion frequency
  `,
  'python',
);

const HUFFMAN_CS = buildStructuredCode(
  `
  using System.Collections.Generic;

  //#region huffman-node interface collapsed
  public sealed class HuffmanNode
  {
      public required string? Char { get; init; }
      public required int Freq { get; init; }
      public HuffmanNode? Left { get; init; }
      public HuffmanNode? Right { get; init; }
  }
  //#endregion huffman-node

  /// <summary>
  /// Builds prefix-free Huffman codes for a string.
  /// Input: source string.
  /// Returns: a map from character to its Huffman bitstring.
  /// </summary>
  //#region huffman function open
  public static Dictionary<string, string> HuffmanCodes(string source)
  {
      //@step 2
      var frequencies = CountFrequency(source);

      //@step 3
      var queue = BuildPriorityQueue(frequencies);
      if (queue.Count == 0)
      {
          return [];
      }

      var sequence = queue.Count;
      while (queue.Count > 1)
      {
          //@step 5
          var left = queue.Dequeue();
          var right = queue.Dequeue();

          //@step 7
          queue.Enqueue(
              new HuffmanNode
              {
                  Char = null,
                  Freq = left.Freq + right.Freq,
                  Left = left,
                  Right = right,
              },
              (left.Freq + right.Freq, sequence++)
          );
      }

      var root = queue.Dequeue();
      var codes = new Dictionary<string, string>();

      //@step 10
      AssignCodes(root, string.Empty, codes);
      return codes;
  }
  //#endregion huffman

  //#region frequency helper collapsed
  private static Dictionary<string, int> CountFrequency(string source)
  {
      var frequencies = new Dictionary<string, int>();
      foreach (var ch in source)
      {
          var key = ch.ToString();
          frequencies[key] = (frequencies.TryGetValue(key, out var count) ? count : 0) + 1;
      }

      return frequencies;
  }

  private static PriorityQueue<HuffmanNode, (int Freq, int Sequence)> BuildPriorityQueue(
      Dictionary<string, int> frequencies
  )
  {
      var queue = new PriorityQueue<HuffmanNode, (int Freq, int Sequence)>();
      var sequence = 0;

      foreach (var entry in frequencies)
      {
          queue.Enqueue(
              new HuffmanNode
              {
                  Char = entry.Key,
                  Freq = entry.Value,
                  Left = null,
                  Right = null,
              },
              (entry.Value, sequence++)
          );
      }

      return queue;
  }

  private static void AssignCodes(HuffmanNode node, string prefix, Dictionary<string, string> codes)
  {
      if (node.Char is not null)
      {
          codes[node.Char] = prefix == string.Empty ? "0" : prefix;
          return;
      }

      AssignCodes(node.Left!, prefix + "0", codes);
      AssignCodes(node.Right!, prefix + "1", codes);
  }
  //#endregion frequency
  `,
  'csharp',
);

const HUFFMAN_JAVA = buildStructuredCode(
  `
  import java.util.HashMap;
  import java.util.Map;
  import java.util.PriorityQueue;

  //#region huffman-node interface collapsed
  public static final class HuffmanNode {
      final String ch;
      final int freq;
      final HuffmanNode left;
      final HuffmanNode right;

      HuffmanNode(String ch, int freq, HuffmanNode left, HuffmanNode right) {
          this.ch = ch;
          this.freq = freq;
          this.left = left;
          this.right = right;
      }
  }

  public record QueueEntry(int freq, int sequence, HuffmanNode node) {}
  //#endregion huffman-node

  /**
   * Builds prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  public static Map<String, String> huffmanCodes(String source) {
      //@step 2
      Map<String, Integer> frequencies = countFrequency(source);

      //@step 3
      PriorityQueue<QueueEntry> queue = buildPriorityQueue(frequencies);
      if (queue.isEmpty()) {
          return Map.of();
      }

      int sequence = queue.size();
      while (queue.size() > 1) {
          //@step 5
          QueueEntry left = queue.remove();
          QueueEntry right = queue.remove();

          //@step 7
          queue.add(new QueueEntry(
              left.freq() + right.freq(),
              sequence++,
              new HuffmanNode(null, left.freq() + right.freq(), left.node(), right.node())
          ));
      }

      HuffmanNode root = queue.remove().node();
      Map<String, String> codes = new HashMap<>();

      //@step 10
      assignCodes(root, "", codes);
      return codes;
  }
  //#endregion huffman

  //#region frequency helper collapsed
  private static Map<String, Integer> countFrequency(String source) {
      Map<String, Integer> frequencies = new HashMap<>();
      for (int index = 0; index < source.length(); index += 1) {
          String ch = String.valueOf(source.charAt(index));
          frequencies.put(ch, frequencies.getOrDefault(ch, 0) + 1);
      }
      return frequencies;
  }

  private static PriorityQueue<QueueEntry> buildPriorityQueue(Map<String, Integer> frequencies) {
      PriorityQueue<QueueEntry> queue = new PriorityQueue<>(
          (left, right) -> left.freq() != right.freq()
              ? Integer.compare(left.freq(), right.freq())
              : Integer.compare(left.sequence(), right.sequence())
      );

      int sequence = 0;
      for (Map.Entry<String, Integer> entry : frequencies.entrySet()) {
          queue.add(new QueueEntry(
              entry.getValue(),
              sequence++,
              new HuffmanNode(entry.getKey(), entry.getValue(), null, null)
          ));
      }

      return queue;
  }

  private static void assignCodes(HuffmanNode node, String prefix, Map<String, String> codes) {
      if (node.ch != null) {
          codes.put(node.ch, prefix.isEmpty() ? "0" : prefix);
          return;
      }

      assignCodes(node.left, prefix + "0", codes);
      assignCodes(node.right, prefix + "1", codes);
  }
  //#endregion frequency
  `,
  'java',
);

const HUFFMAN_CPP = buildStructuredCode(
  `
  #include <memory>
  #include <queue>
  #include <string>
  #include <unordered_map>

  //#region huffman-node interface collapsed
  struct HuffmanNode {
      std::string ch;
      int freq;
      std::shared_ptr<HuffmanNode> left;
      std::shared_ptr<HuffmanNode> right;
  };

  struct QueueEntry {
      int freq;
      int sequence;
      std::shared_ptr<HuffmanNode> node;

      bool operator>(const QueueEntry& other) const {
          if (freq != other.freq) {
              return freq > other.freq;
          }
          return sequence > other.sequence;
      }
  };
  //#endregion huffman-node

  /**
   * Builds prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  std::unordered_map<std::string, std::string> huffmanCodes(const std::string& source) {
      //@step 2
      auto frequencies = countFrequency(source);

      //@step 3
      auto queue = buildPriorityQueue(frequencies);
      if (queue.empty()) {
          return {};
      }

      int sequence = static_cast<int>(queue.size());
      while (queue.size() > 1) {
          //@step 5
          auto left = queue.top();
          queue.pop();
          auto right = queue.top();
          queue.pop();

          //@step 7
          queue.push({
              left.freq + right.freq,
              sequence++,
              std::make_shared<HuffmanNode>(HuffmanNode{
                  "",
                  left.freq + right.freq,
                  left.node,
                  right.node,
              }),
          });
      }

      auto root = queue.top().node;
      std::unordered_map<std::string, std::string> codes;

      //@step 10
      assignCodes(root, "", codes);
      return codes;
  }
  //#endregion huffman

  //#region frequency helper collapsed
  std::unordered_map<std::string, int> countFrequency(const std::string& source) {
      std::unordered_map<std::string, int> frequencies;
      for (char ch : source) {
          std::string key(1, ch);
          frequencies[key] += 1;
      }
      return frequencies;
  }

  std::priority_queue<QueueEntry, std::vector<QueueEntry>, std::greater<QueueEntry>> buildPriorityQueue(
      const std::unordered_map<std::string, int>& frequencies
  ) {
      std::priority_queue<QueueEntry, std::vector<QueueEntry>, std::greater<QueueEntry>> queue;
      int sequence = 0;

      for (const auto& [ch, freq] : frequencies) {
          queue.push({
              freq,
              sequence++,
              std::make_shared<HuffmanNode>(HuffmanNode{ch, freq, nullptr, nullptr}),
          });
      }

      return queue;
  }

  void assignCodes(
      const std::shared_ptr<HuffmanNode>& node,
      const std::string& prefix,
      std::unordered_map<std::string, std::string>& codes
  ) {
      if (!node->ch.empty()) {
          codes[node->ch] = prefix.empty() ? "0" : prefix;
          return;
      }

      assignCodes(node->left, prefix + "0", codes);
      assignCodes(node->right, prefix + "1", codes);
  }
  //#endregion frequency
  `,
  'cpp',
);

const HUFFMAN_JS = buildStructuredCode(
  `
  /**
   * Build prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  function huffmanCodes(source) {
      //@step 2
      const frequencies = countFrequency(source);

      //@step 3
      const queue = buildPriorityQueue(frequencies);
      if (queue.length === 0) {
          return {};
      }

      while (queue.length > 1) {
          queue.sort((left, right) => left.freq - right.freq);

          //@step 5
          const left = queue.shift();
          const right = queue.shift();

          //@step 7
          queue.push({
              char: null,
              freq: left.freq + right.freq,
              left,
              right,
          });
      }

      const codes = {};

      //@step 10
      assignCodes(queue[0], '', codes);
      return codes;
  }
  //#endregion huffman

  //#region frequency helper collapsed
  function countFrequency(source) {
      const frequencies = new Map();
      for (const char of source) {
          frequencies.set(char, (frequencies.get(char) ?? 0) + 1);
      }
      return frequencies;
  }

  function buildPriorityQueue(frequencies) {
      return [...frequencies.entries()].map(([char, freq]) => ({
          char,
          freq,
          left: null,
          right: null,
      }));
  }

  function assignCodes(node, prefix, codes) {
      if (node.char !== null) {
          codes[node.char] = prefix === '' ? '0' : prefix;
          return;
      }

      assignCodes(node.left, prefix + '0', codes);
      assignCodes(node.right, prefix + '1', codes);
  }
  //#endregion frequency
  `,
  'javascript',
);

const HUFFMAN_GO = buildStructuredCode(
  `
  package strings

  //#region huffman-node interface collapsed
  type HuffmanNode struct {
      Char *rune
      Freq int
      Left *HuffmanNode
      Right *HuffmanNode
  }
  //#endregion huffman-node

  /**
   * Builds prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  func HuffmanCodes(source string) map[rune]string {
      //@step 2
      frequencies := countFrequency(source)

      //@step 3
      queue := buildPriorityQueue(frequencies)
      if len(queue) == 0 {
          return map[rune]string{}
      }

      for len(queue) > 1 {
          sort.Slice(queue, func(left int, right int) bool {
              return queue[left].Freq < queue[right].Freq
          })

          //@step 5
          left := queue[0]
          right := queue[1]
          queue = queue[2:]

          //@step 7
          queue = append(queue, &HuffmanNode{
              Char: nil,
              Freq: left.Freq + right.Freq,
              Left: left,
              Right: right,
          })
      }

      codes := make(map[rune]string)

      //@step 10
      assignCodes(queue[0], "", codes)
      return codes
  }
  //#endregion huffman

  //#region frequency helper collapsed
  func countFrequency(source string) map[rune]int {
      frequencies := make(map[rune]int)
      for _, char := range source {
          frequencies[char] += 1
      }
      return frequencies
  }

  func buildPriorityQueue(frequencies map[rune]int) []*HuffmanNode {
      queue := make([]*HuffmanNode, 0, len(frequencies))
      for char, freq := range frequencies {
          currentChar := char
          queue = append(queue, &HuffmanNode{Char: &currentChar, Freq: freq, Left: nil, Right: nil})
      }
      return queue
  }

  func assignCodes(node *HuffmanNode, prefix string, codes map[rune]string) {
      if node.Char != nil {
          if prefix == "" {
              codes[*node.Char] = "0"
          } else {
              codes[*node.Char] = prefix
          }
          return
      }

      assignCodes(node.Left, prefix + "0", codes)
      assignCodes(node.Right, prefix + "1", codes)
  }
  //#endregion frequency
  `,
  'go',
);

const HUFFMAN_RUST = buildStructuredCode(
  `
  use std::collections::HashMap;

  //#region huffman-node interface collapsed
  struct HuffmanNode {
      ch: Option<char>,
      freq: i32,
      left: Option<Box<HuffmanNode>>,
      right: Option<Box<HuffmanNode>>,
  }
  //#endregion huffman-node

  /**
   * Builds prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  fn huffman_codes(source: &str) -> HashMap<char, String> {
      //@step 2
      let frequencies = count_frequency(source);

      //@step 3
      let mut queue = build_priority_queue(&frequencies);
      if queue.is_empty() {
          return HashMap::new();
      }

      while queue.len() > 1 {
          queue.sort_by_key(|node| node.freq);

          //@step 5
          let left = queue.remove(0);
          let right = queue.remove(0);

          //@step 7
          queue.push(HuffmanNode {
              ch: None,
              freq: left.freq + right.freq,
              left: Some(Box::new(left)),
              right: Some(Box::new(right)),
          });
      }

      let mut codes = HashMap::new();

      //@step 10
      assign_codes(&queue[0], String::new(), &mut codes);
      codes
  }
  //#endregion huffman

  //#region frequency helper collapsed
  fn count_frequency(source: &str) -> HashMap<char, i32> {
      let mut frequencies = HashMap::new();
      for ch in source.chars() {
          *frequencies.entry(ch).or_insert(0) += 1;
      }
      frequencies
  }

  fn build_priority_queue(frequencies: &HashMap<char, i32>) -> Vec<HuffmanNode> {
      frequencies
          .iter()
          .map(|(&ch, &freq)| HuffmanNode {
              ch: Some(ch),
              freq,
              left: None,
              right: None,
          })
          .collect()
  }

  fn assign_codes(node: &HuffmanNode, prefix: String, codes: &mut HashMap<char, String>) {
      if let Some(ch) = node.ch {
          codes.insert(ch, if prefix.is_empty() { "0".to_string() } else { prefix });
          return;
      }

      assign_codes(node.left.as_ref().unwrap(), format!("{prefix}0"), codes);
      assign_codes(node.right.as_ref().unwrap(), format!("{prefix}1"), codes);
  }
  //#endregion frequency
  `,
  'rust',
);

const HUFFMAN_SWIFT = buildStructuredCode(
  `
  //#region huffman-node interface collapsed
  final class HuffmanNode {
      let char: Character?
      let freq: Int
      let left: HuffmanNode?
      let right: HuffmanNode?

      init(char: Character?, freq: Int, left: HuffmanNode?, right: HuffmanNode?) {
          self.char = char
          self.freq = freq
          self.left = left
          self.right = right
      }
  }
  //#endregion huffman-node

  /**
   * Builds prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  func huffmanCodes(_ source: String) -> [Character: String] {
      //@step 2
      let frequencies = countFrequency(source)

      //@step 3
      var queue = buildPriorityQueue(frequencies)
      if queue.isEmpty {
          return [:]
      }

      while queue.count > 1 {
          queue.sort { $0.freq < $1.freq }

          //@step 5
          let left = queue.removeFirst()
          let right = queue.removeFirst()

          //@step 7
          queue.append(HuffmanNode(char: nil, freq: left.freq + right.freq, left: left, right: right))
      }

      var codes: [Character: String] = [:]

      //@step 10
      assignCodes(queue[0], "", &codes)
      return codes
  }
  //#endregion huffman

  //#region frequency helper collapsed
  func countFrequency(_ source: String) -> [Character: Int] {
      var frequencies: [Character: Int] = [:]
      for char in source {
          frequencies[char, default: 0] += 1
      }
      return frequencies
  }

  func buildPriorityQueue(_ frequencies: [Character: Int]) -> [HuffmanNode] {
      frequencies.map { char, freq in
          HuffmanNode(char: char, freq: freq, left: nil, right: nil)
      }
  }

  func assignCodes(_ node: HuffmanNode, _ prefix: String, _ codes: inout [Character: String]) {
      if let char = node.char {
          codes[char] = prefix.isEmpty ? "0" : prefix
          return
      }

      assignCodes(node.left!, prefix + "0", &codes)
      assignCodes(node.right!, prefix + "1", &codes)
  }
  //#endregion frequency
  `,
  'swift',
);

const HUFFMAN_PHP = buildStructuredCode(
  `
  /**
   * Builds prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  function huffmanCodes(string $source): array
  {
      //@step 2
      $frequencies = countFrequency($source);

      //@step 3
      $queue = buildPriorityQueue($frequencies);
      if ($queue === []) {
          return [];
      }

      while (count($queue) > 1) {
          usort($queue, static fn (array $left, array $right): int => $left['freq'] <=> $right['freq']);

          //@step 5
          $left = array_shift($queue);
          $right = array_shift($queue);

          //@step 7
          $queue[] = [
              'char' => null,
              'freq' => $left['freq'] + $right['freq'],
              'left' => $left,
              'right' => $right,
          ];
      }

      $codes = [];

      //@step 10
      assignCodes($queue[0], '', $codes);
      return $codes;
  }
  //#endregion huffman

  //#region frequency helper collapsed
  function countFrequency(string $source): array
  {
      $frequencies = [];
      foreach (str_split($source) as $char) {
          $frequencies[$char] = ($frequencies[$char] ?? 0) + 1;
      }
      return $frequencies;
  }

  function buildPriorityQueue(array $frequencies): array
  {
      $queue = [];
      foreach ($frequencies as $char => $freq) {
          $queue[] = [
              'char' => $char,
              'freq' => $freq,
              'left' => null,
              'right' => null,
          ];
      }
      return $queue;
  }

  function assignCodes(array $node, string $prefix, array &$codes): void
  {
      if ($node['char'] !== null) {
          $codes[$node['char']] = $prefix === '' ? '0' : $prefix;
          return;
      }

      assignCodes($node['left'], $prefix . '0', $codes);
      assignCodes($node['right'], $prefix . '1', $codes);
  }
  //#endregion frequency
  `,
  'php',
);

const HUFFMAN_KOTLIN = buildStructuredCode(
  `
  //#region huffman-node interface collapsed
  data class HuffmanNode(
      val ch: Char?,
      val freq: Int,
      val left: HuffmanNode? = null,
      val right: HuffmanNode? = null,
  )
  //#endregion huffman-node

  /**
   * Builds prefix-free Huffman codes for a string.
   * Input: source string.
   * Returns: a map from character to its Huffman bitstring.
   */
  //#region huffman function open
  fun huffmanCodes(source: String): Map<Char, String> {
      //@step 2
      val frequencies = countFrequency(source)

      //@step 3
      val queue = buildPriorityQueue(frequencies).toMutableList()
      if (queue.isEmpty()) {
          return emptyMap()
      }

      while (queue.size > 1) {
          queue.sortBy { it.freq }

          //@step 5
          val left = queue.removeAt(0)
          val right = queue.removeAt(0)

          //@step 7
          queue += HuffmanNode(ch = null, freq = left.freq + right.freq, left = left, right = right)
      }

      val codes = mutableMapOf<Char, String>()

      //@step 10
      assignCodes(queue[0], "", codes)
      return codes
  }
  //#endregion huffman

  //#region frequency helper collapsed
  fun countFrequency(source: String): Map<Char, Int> {
      val frequencies = mutableMapOf<Char, Int>()
      for (char in source) {
          frequencies[char] = (frequencies[char] ?: 0) + 1
      }
      return frequencies
  }

  fun buildPriorityQueue(frequencies: Map<Char, Int>): List<HuffmanNode> {
      return frequencies.map { (char, freq) ->
          HuffmanNode(ch = char, freq = freq)
      }
  }

  fun assignCodes(node: HuffmanNode, prefix: String, codes: MutableMap<Char, String>) {
      if (node.ch != null) {
          codes[node.ch] = if (prefix.isEmpty()) "0" else prefix
          return
      }

      assignCodes(node.left!!, prefix + "0", codes)
      assignCodes(node.right!!, prefix + "1", codes)
  }
  //#endregion frequency
  `,
  'kotlin',
);

export const HUFFMAN_CODE = HUFFMAN_TS.lines;
export const HUFFMAN_CODE_REGIONS = HUFFMAN_TS.regions;
export const HUFFMAN_CODE_HIGHLIGHT_MAP = HUFFMAN_TS.highlightMap;
export const HUFFMAN_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: HUFFMAN_TS.lines,
    regions: HUFFMAN_TS.regions,
    highlightMap: HUFFMAN_TS.highlightMap,
    source: HUFFMAN_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: HUFFMAN_JS.lines,
    regions: HUFFMAN_JS.regions,
    highlightMap: HUFFMAN_JS.highlightMap,
    source: HUFFMAN_JS.source,
  },
  python: {
    language: 'python',
    lines: HUFFMAN_PY.lines,
    regions: HUFFMAN_PY.regions,
    highlightMap: HUFFMAN_PY.highlightMap,
    source: HUFFMAN_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: HUFFMAN_CS.lines,
    regions: HUFFMAN_CS.regions,
    highlightMap: HUFFMAN_CS.highlightMap,
    source: HUFFMAN_CS.source,
  },
  java: {
    language: 'java',
    lines: HUFFMAN_JAVA.lines,
    regions: HUFFMAN_JAVA.regions,
    highlightMap: HUFFMAN_JAVA.highlightMap,
    source: HUFFMAN_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: HUFFMAN_CPP.lines,
    regions: HUFFMAN_CPP.regions,
    highlightMap: HUFFMAN_CPP.highlightMap,
    source: HUFFMAN_CPP.source,
  },
  go: {
    language: 'go',
    lines: HUFFMAN_GO.lines,
    regions: HUFFMAN_GO.regions,
    highlightMap: HUFFMAN_GO.highlightMap,
    source: HUFFMAN_GO.source,
  },
  rust: {
    language: 'rust',
    lines: HUFFMAN_RUST.lines,
    regions: HUFFMAN_RUST.regions,
    highlightMap: HUFFMAN_RUST.highlightMap,
    source: HUFFMAN_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: HUFFMAN_SWIFT.lines,
    regions: HUFFMAN_SWIFT.regions,
    highlightMap: HUFFMAN_SWIFT.highlightMap,
    source: HUFFMAN_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: HUFFMAN_PHP.lines,
    regions: HUFFMAN_PHP.regions,
    highlightMap: HUFFMAN_PHP.highlightMap,
    source: HUFFMAN_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: HUFFMAN_KOTLIN.lines,
    regions: HUFFMAN_KOTLIN.regions,
    highlightMap: HUFFMAN_KOTLIN.highlightMap,
    source: HUFFMAN_KOTLIN.source,
  },
};
