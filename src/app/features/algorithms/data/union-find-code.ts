import { CodeVariantMap } from '../models/detail';
import { buildCodeVariants } from './code-variant-builder/code-variant-builder';

const UNION_FIND_CODE_SOURCES = {
  typescript: `
    class DisjointSet {
      private parent = new Map<string, string>();
      private rank = new Map<string, number>();
      private size = new Map<string, number>();

      makeSet(x: string): void {
        //@step 2
        this.parent.set(x, x);
        this.rank.set(x, 0);
        this.size.set(x, 1);
      }

      find(x: string): string {
        //@step 5
        const root = this.parent.get(x)!;
        if (root !== x) {
          //@step 6
          this.parent.set(x, this.find(root));
        }
        return this.parent.get(x)!;
      }

      union(a: string, b: string): boolean {
        //@step 8
        let rootA = this.find(a);
        let rootB = this.find(b);
        //@step 9
        if (rootA === rootB) return false;
        if ((this.rank.get(rootA) ?? 0) < (this.rank.get(rootB) ?? 0)) {
          [rootA, rootB] = [rootB, rootA];
        }
        //@step 10
        this.parent.set(rootB, rootA);
        this.size.set(rootA, (this.size.get(rootA) ?? 0) + (this.size.get(rootB) ?? 0));
        if ((this.rank.get(rootA) ?? 0) === (this.rank.get(rootB) ?? 0)) {
          this.rank.set(rootA, (this.rank.get(rootA) ?? 0) + 1);
        }
        //@step 12
        return true;
      }
    }
  `,
  javascript: `
    class DisjointSet {
      constructor() {
        this.parent = new Map();
        this.rank = new Map();
        this.size = new Map();
      }

      makeSet(x) {
        this.parent.set(x, x);
        this.rank.set(x, 0);
        this.size.set(x, 1);
      }

      find(x) {
        const root = this.parent.get(x);
        if (root !== x) {
          this.parent.set(x, this.find(root));
        }
        return this.parent.get(x);
      }

      union(a, b) {
        let rootA = this.find(a);
        let rootB = this.find(b);
        if (rootA === rootB) return false;
        if ((this.rank.get(rootA) ?? 0) < (this.rank.get(rootB) ?? 0)) {
          [rootA, rootB] = [rootB, rootA];
        }
        this.parent.set(rootB, rootA);
        this.size.set(rootA, (this.size.get(rootA) ?? 0) + (this.size.get(rootB) ?? 0));
        if ((this.rank.get(rootA) ?? 0) === (this.rank.get(rootB) ?? 0)) {
          this.rank.set(rootA, (this.rank.get(rootA) ?? 0) + 1);
        }
        return true;
      }
    }
  `,
  python: `
    class DisjointSet:
        def __init__(self) -> None:
            self.parent: dict[str, str] = {}
            self.rank: dict[str, int] = {}
            self.size: dict[str, int] = {}

        def make_set(self, x: str) -> None:
            self.parent[x] = x
            self.rank[x] = 0
            self.size[x] = 1

        def find(self, x: str) -> str:
            if self.parent[x] != x:
                self.parent[x] = self.find(self.parent[x])
            return self.parent[x]

        def union(self, a: str, b: str) -> bool:
            root_a = self.find(a)
            root_b = self.find(b)
            if root_a == root_b:
                return False
            if self.rank[root_a] < self.rank[root_b]:
                root_a, root_b = root_b, root_a
            self.parent[root_b] = root_a
            self.size[root_a] += self.size[root_b]
            if self.rank[root_a] == self.rank[root_b]:
                self.rank[root_a] += 1
            return True
  `,
  csharp: `
    using System.Collections.Generic;

    public sealed class DisjointSet
    {
        private readonly Dictionary<string, string> _parent = new();
        private readonly Dictionary<string, int> _rank = new();
        private readonly Dictionary<string, int> _size = new();

        public void MakeSet(string x)
        {
            _parent[x] = x;
            _rank[x] = 0;
            _size[x] = 1;
        }

        public string Find(string x)
        {
            if (_parent[x] != x)
            {
                _parent[x] = Find(_parent[x]);
            }
            return _parent[x];
        }

        public bool Union(string a, string b)
        {
            var rootA = Find(a);
            var rootB = Find(b);
            if (rootA == rootB) return false;
            if (_rank[rootA] < _rank[rootB]) (rootA, rootB) = (rootB, rootA);
            _parent[rootB] = rootA;
            _size[rootA] += _size[rootB];
            if (_rank[rootA] == _rank[rootB]) _rank[rootA] += 1;
            return true;
        }
    }
  `,
  java: `
    import java.util.HashMap;
    import java.util.Map;

    public final class DisjointSet {
        private final Map<String, String> parent = new HashMap<>();
        private final Map<String, Integer> rank = new HashMap<>();
        private final Map<String, Integer> size = new HashMap<>();

        public void makeSet(String x) {
            parent.put(x, x);
            rank.put(x, 0);
            size.put(x, 1);
        }

        public String find(String x) {
            if (!parent.get(x).equals(x)) {
                parent.put(x, find(parent.get(x)));
            }
            return parent.get(x);
        }

        public boolean union(String a, String b) {
            String rootA = find(a);
            String rootB = find(b);
            if (rootA.equals(rootB)) return false;
            if (rank.get(rootA) < rank.get(rootB)) {
                String swap = rootA;
                rootA = rootB;
                rootB = swap;
            }
            parent.put(rootB, rootA);
            size.put(rootA, size.get(rootA) + size.get(rootB));
            if (rank.get(rootA).equals(rank.get(rootB))) {
                rank.put(rootA, rank.get(rootA) + 1);
            }
            return true;
        }
    }
  `,
  cpp: `
    #include <string>
    #include <unordered_map>

    class DisjointSet {
    public:
        void makeSet(const std::string& x) {
            parent[x] = x;
            rank[x] = 0;
            size[x] = 1;
        }

        std::string find(const std::string& x) {
            if (parent[x] != x) {
                parent[x] = find(parent[x]);
            }
            return parent[x];
        }

        bool unite(const std::string& a, const std::string& b) {
            std::string rootA = find(a);
            std::string rootB = find(b);
            if (rootA == rootB) return false;
            if (rank[rootA] < rank[rootB]) std::swap(rootA, rootB);
            parent[rootB] = rootA;
            size[rootA] += size[rootB];
            if (rank[rootA] == rank[rootB]) rank[rootA] += 1;
            return true;
        }

    private:
        std::unordered_map<std::string, std::string> parent;
        std::unordered_map<std::string, int> rank;
        std::unordered_map<std::string, int> size;
    };
  `,
  go: `
    package graphs

    type DisjointSet struct {
        parent map[string]string
        rank   map[string]int
        size   map[string]int
    }

    func NewDisjointSet() *DisjointSet {
        return &DisjointSet{
            parent: map[string]string{},
            rank:   map[string]int{},
            size:   map[string]int{},
        }
    }

    func (ds *DisjointSet) MakeSet(x string) {
        ds.parent[x] = x
        ds.rank[x] = 0
        ds.size[x] = 1
    }

    func (ds *DisjointSet) Find(x string) string {
        if ds.parent[x] != x {
            ds.parent[x] = ds.Find(ds.parent[x])
        }
        return ds.parent[x]
    }

    func (ds *DisjointSet) Union(a string, b string) bool {
        rootA, rootB := ds.Find(a), ds.Find(b)
        if rootA == rootB {
            return false
        }
        if ds.rank[rootA] < ds.rank[rootB] {
            rootA, rootB = rootB, rootA
        }
        ds.parent[rootB] = rootA
        ds.size[rootA] += ds.size[rootB]
        if ds.rank[rootA] == ds.rank[rootB] {
            ds.rank[rootA] += 1
        }
        return true
    }
  `,
  rust: `
    use std::collections::HashMap;

    struct DisjointSet {
        parent: HashMap<String, String>,
        rank: HashMap<String, i32>,
        size: HashMap<String, i32>,
    }

    impl DisjointSet {
        fn new() -> Self {
            Self {
                parent: HashMap::new(),
                rank: HashMap::new(),
                size: HashMap::new(),
            }
        }

        fn make_set(&mut self, x: &str) {
            self.parent.insert(x.to_string(), x.to_string());
            self.rank.insert(x.to_string(), 0);
            self.size.insert(x.to_string(), 1);
        }

        fn find(&mut self, x: &str) -> String {
            if self.parent.get(x).is_some_and(|parent| parent != x) {
                let root = self.find(self.parent.get(x).cloned().unwrap_or_default().as_str());
                self.parent.insert(x.to_string(), root.clone());
            }
            self.parent.get(x).cloned().unwrap_or_default()
        }

        fn union(&mut self, a: &str, b: &str) -> bool {
            let mut root_a = self.find(a);
            let mut root_b = self.find(b);
            if root_a == root_b {
                return false;
            }
            if self.rank[&root_a] < self.rank[&root_b] {
                std::mem::swap(&mut root_a, &mut root_b);
            }
            self.parent.insert(root_b.clone(), root_a.clone());
            self.size.insert(root_a.clone(), self.size[&root_a] + self.size[&root_b]);
            if self.rank[&root_a] == self.rank[&root_b] {
                self.rank.insert(root_a, self.rank[&root_a] + 1);
            }
            true
        }
    }
  `,
  swift: `
    final class DisjointSet {
        private var parent: [String: String] = [:]
        private var rank: [String: Int] = [:]
        private var size: [String: Int] = [:]

        func makeSet(_ x: String) {
            parent[x] = x
            rank[x] = 0
            size[x] = 1
        }

        func find(_ x: String) -> String {
            if parent[x] != x {
                parent[x] = find(parent[x] ?? x)
            }
            return parent[x] ?? x
        }

        func union(_ a: String, _ b: String) -> Bool {
            var rootA = find(a)
            var rootB = find(b)
            if rootA == rootB { return false }
            if (rank[rootA] ?? 0) < (rank[rootB] ?? 0) {
                swap(&rootA, &rootB)
            }
            parent[rootB] = rootA
            size[rootA] = (size[rootA] ?? 0) + (size[rootB] ?? 0)
            if (rank[rootA] ?? 0) == (rank[rootB] ?? 0) {
                rank[rootA] = (rank[rootA] ?? 0) + 1
            }
            return true
        }
    }
  `,
  php: `
    <?php

    final class DisjointSet
    {
        private array $parent = [];
        private array $rank = [];
        private array $size = [];

        public function makeSet(string $x): void
        {
            $this->parent[$x] = $x;
            $this->rank[$x] = 0;
            $this->size[$x] = 1;
        }

        public function find(string $x): string
        {
            if ($this->parent[$x] !== $x) {
                $this->parent[$x] = $this->find($this->parent[$x]);
            }
            return $this->parent[$x];
        }

        public function union(string $a, string $b): bool
        {
            $rootA = $this->find($a);
            $rootB = $this->find($b);
            if ($rootA === $rootB) return false;
            if ($this->rank[$rootA] < $this->rank[$rootB]) {
                [$rootA, $rootB] = [$rootB, $rootA];
            }
            $this->parent[$rootB] = $rootA;
            $this->size[$rootA] += $this->size[$rootB];
            if ($this->rank[$rootA] === $this->rank[$rootB]) {
                $this->rank[$rootA] += 1;
            }
            return true;
        }
    }
  `,
  kotlin: `
    class DisjointSet {
        private val parent = mutableMapOf<String, String>()
        private val rank = mutableMapOf<String, Int>()
        private val size = mutableMapOf<String, Int>()

        fun makeSet(x: String) {
            parent[x] = x
            rank[x] = 0
            size[x] = 1
        }

        fun find(x: String): String {
            if (parent[x] != x) {
                parent[x] = find(parent[x] ?: x)
            }
            return parent[x] ?: x
        }

        fun union(a: String, b: String): Boolean {
            var rootA = find(a)
            var rootB = find(b)
            if (rootA == rootB) return false
            if ((rank[rootA] ?: 0) < (rank[rootB] ?: 0)) {
                val swap = rootA
                rootA = rootB
                rootB = swap
            }
            parent[rootB] = rootA
            size[rootA] = (size[rootA] ?: 0) + (size[rootB] ?: 0)
            if ((rank[rootA] ?: 0) == (rank[rootB] ?: 0)) {
                rank[rootA] = (rank[rootA] ?: 0) + 1
            }
            return true
        }
    }
  `,
} as const;

export const UNION_FIND_CODE_VARIANTS: CodeVariantMap = buildCodeVariants(UNION_FIND_CODE_SOURCES);
export const UNION_FIND_CODE = UNION_FIND_CODE_VARIANTS.typescript?.lines ?? [];
