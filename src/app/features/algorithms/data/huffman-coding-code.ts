import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder';

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
};
