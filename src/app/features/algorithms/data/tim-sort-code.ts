import { CodeVariantMap } from '../models/detail';
import { buildStructuredCode } from './code-line-builder/code-line-builder';

const TIM_SORT_TS = buildStructuredCode(`
  /**
   * Sort the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region tim-sort function open
  //@step 1
  function timSort(values: number[]): number[] {
    const minRun = Math.min(values.length || 1, 8);
    const temp = Array.from({ length: values.length }, () => 0);

    for (let start = 0; start < values.length; start += minRun) {
      const end = Math.min(start + minRun - 1, values.length - 1);
      //@step 5
      insertionSortRange(values, start, end);
    }

    for (let width = minRun; width < values.length; width *= 2) {
      for (let left = 0; left < values.length; left += width * 2) {
        const middle = Math.min(left + width - 1, values.length - 1);
        const right = Math.min(left + width * 2 - 1, values.length - 1);

        if (middle >= right) {
          continue;
        }

        //@step 9
        mergeRuns(values, temp, left, middle, right);
      }
    }

    //@step 12
    return values;
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  function insertionSortRange(values: number[], left: number, right: number): void {
    for (let index = left + 1; index <= right; index += 1) {
      //@step 15
      const current = values[index];
      let scan = index - 1;

      while (scan >= left && values[scan] > current) {
        //@step 17
        values[scan + 1] = values[scan];
        scan -= 1;
      }

      //@step 17
      values[scan + 1] = current;
    }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  function mergeRuns(
    values: number[],
    temp: number[],
    left: number,
    middle: number,
    right: number,
  ): void {
    let leftIndex = left;
    let rightIndex = middle + 1;
    let writeIndex = left;

    while (leftIndex <= middle && rightIndex <= right) {
      //@step 21
      if (values[leftIndex] <= values[rightIndex]) {
        temp[writeIndex] = values[leftIndex];
        leftIndex += 1;
      } else {
        temp[writeIndex] = values[rightIndex];
        rightIndex += 1;
      }
      writeIndex += 1;
    }

    while (leftIndex <= middle) {
      temp[writeIndex] = values[leftIndex];
      leftIndex += 1;
      writeIndex += 1;
    }

    while (rightIndex <= right) {
      temp[writeIndex] = values[rightIndex];
      rightIndex += 1;
      writeIndex += 1;
    }

    for (let index = left; index <= right; index += 1) {
      //@step 25
      values[index] = temp[index];
    }
  }
  //#endregion merge-runs
`);

const TIM_SORT_JS = buildStructuredCode(
  `
  /**
   * Sort the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable array of numbers.
   * Returns: the same array after in-place sorting.
   */
  //#region tim-sort function open
  //@step 1
  function timSort(values) {
      const minRun = Math.min(values.length || 1, 8);
      const temp = Array.from({ length: values.length }, () => 0);

      for (let start = 0; start < values.length; start += minRun) {
          const end = Math.min(start + minRun - 1, values.length - 1);
          //@step 5
          insertionSortRange(values, start, end);
      }

      for (let width = minRun; width < values.length; width *= 2) {
          for (let left = 0; left < values.length; left += width * 2) {
              const middle = Math.min(left + width - 1, values.length - 1);
              const right = Math.min(left + width * 2 - 1, values.length - 1);

              if (middle >= right) {
                  continue;
              }

              //@step 9
              mergeRuns(values, temp, left, middle, right);
          }
      }

      //@step 12
      return values;
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  function insertionSortRange(values, left, right) {
      for (let index = left + 1; index <= right; index += 1) {
          //@step 15
          const current = values[index];
          let scan = index - 1;

          while (scan >= left && values[scan] > current) {
              //@step 17
              values[scan + 1] = values[scan];
              scan -= 1;
          }

          //@step 17
          values[scan + 1] = current;
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  function mergeRuns(values, temp, left, middle, right) {
      let leftIndex = left;
      let rightIndex = middle + 1;
      let writeIndex = left;

      while (leftIndex <= middle && rightIndex <= right) {
          //@step 21
          if (values[leftIndex] <= values[rightIndex]) {
              temp[writeIndex] = values[leftIndex];
              leftIndex += 1;
          } else {
              temp[writeIndex] = values[rightIndex];
              rightIndex += 1;
          }
          writeIndex += 1;
      }

      while (leftIndex <= middle) {
          temp[writeIndex] = values[leftIndex];
          leftIndex += 1;
          writeIndex += 1;
      }

      while (rightIndex <= right) {
          temp[writeIndex] = values[rightIndex];
          rightIndex += 1;
          writeIndex += 1;
      }

      for (let index = left; index <= right; index += 1) {
          //@step 25
          values[index] = temp[index];
      }
  }
  //#endregion merge-runs
  `,
  'javascript',
);

const TIM_SORT_PY = buildStructuredCode(
  `
  """
  Sort the array with a simplified TimSort: insertion-sort small runs, then merge them.
  Input: mutable list of numbers.
  Returns: the same list after in-place sorting.
  """
  //#region tim-sort function open
  //@step 1
  def tim_sort(values: list[int]) -> list[int]:
      min_run = min(len(values) or 1, 8)
      temp = [0] * len(values)

      for start in range(0, len(values), min_run):
          end = min(start + min_run - 1, len(values) - 1)
          //@step 5
          insertion_sort_range(values, start, end)

      width = min_run
      while width < len(values):
          for left in range(0, len(values), width * 2):
              middle = min(left + width - 1, len(values) - 1)
              right = min(left + width * 2 - 1, len(values) - 1)

              if middle >= right:
                  continue

              //@step 9
              merge_runs(values, temp, left, middle, right)
          width *= 2

      //@step 12
      return values
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  def insertion_sort_range(values: list[int], left: int, right: int) -> None:
      for index in range(left + 1, right + 1):
          //@step 15
          current = values[index]
          scan = index - 1

          while scan >= left and values[scan] > current:
              //@step 17
              values[scan + 1] = values[scan]
              scan -= 1

          //@step 17
          values[scan + 1] = current
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  def merge_runs(values: list[int], temp: list[int], left: int, middle: int, right: int) -> None:
      left_index = left
      right_index = middle + 1
      write_index = left

      while left_index <= middle and right_index <= right:
          //@step 21
          if values[left_index] <= values[right_index]:
              temp[write_index] = values[left_index]
              left_index += 1
          else:
              temp[write_index] = values[right_index]
              right_index += 1
          write_index += 1

      while left_index <= middle:
          temp[write_index] = values[left_index]
          left_index += 1
          write_index += 1

      while right_index <= right:
          temp[write_index] = values[right_index]
          right_index += 1
          write_index += 1

      for index in range(left, right + 1):
          //@step 25
          values[index] = temp[index]
  //#endregion merge-runs
  `,
  'python',
);

const TIM_SORT_CS = buildStructuredCode(
  `
  /// <summary>
  /// Sorts the array with a simplified TimSort: insertion-sort small runs, then merge them.
  /// Input: mutable array of integers.
  /// Returns: the same array after in-place sorting.
  /// </summary>
  //#region tim-sort function open
  //@step 1
  public static int[] TimSort(int[] values)
  {
      var minRun = Math.Min(values.Length == 0 ? 1 : values.Length, 8);
      var temp = new int[values.Length];

      for (var start = 0; start < values.Length; start += minRun)
      {
          var end = Math.Min(start + minRun - 1, values.Length - 1);
          //@step 5
          InsertionSortRange(values, start, end);
      }

      for (var width = minRun; width < values.Length; width *= 2)
      {
          for (var left = 0; left < values.Length; left += width * 2)
          {
              var middle = Math.Min(left + width - 1, values.Length - 1);
              var right = Math.Min(left + width * 2 - 1, values.Length - 1);

              if (middle >= right)
              {
                  continue;
              }

              //@step 9
              MergeRuns(values, temp, left, middle, right);
          }
      }

      //@step 12
      return values;
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  private static void InsertionSortRange(int[] values, int left, int right)
  {
      for (var index = left + 1; index <= right; index += 1)
      {
          //@step 15
          var current = values[index];
          var scan = index - 1;

          while (scan >= left && values[scan] > current)
          {
              //@step 17
              values[scan + 1] = values[scan];
              scan -= 1;
          }

          //@step 17
          values[scan + 1] = current;
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  private static void MergeRuns(int[] values, int[] temp, int left, int middle, int right)
  {
      var leftIndex = left;
      var rightIndex = middle + 1;
      var writeIndex = left;

      while (leftIndex <= middle && rightIndex <= right)
      {
          //@step 21
          if (values[leftIndex] <= values[rightIndex])
          {
              temp[writeIndex] = values[leftIndex];
              leftIndex += 1;
          }
          else
          {
              temp[writeIndex] = values[rightIndex];
              rightIndex += 1;
          }
          writeIndex += 1;
      }

      while (leftIndex <= middle)
      {
          temp[writeIndex] = values[leftIndex];
          leftIndex += 1;
          writeIndex += 1;
      }

      while (rightIndex <= right)
      {
          temp[writeIndex] = values[rightIndex];
          rightIndex += 1;
          writeIndex += 1;
      }

      for (var index = left; index <= right; index += 1)
      {
          //@step 25
          values[index] = temp[index];
      }
  }
  //#endregion merge-runs
  `,
  'csharp',
);

const TIM_SORT_JAVA = buildStructuredCode(
  `
  /**
   * Sorts the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region tim-sort function open
  //@step 1
  public static int[] timSort(int[] values) {
      int minRun = Math.min(values.length == 0 ? 1 : values.length, 8);
      int[] temp = new int[values.length];

      for (int start = 0; start < values.length; start += minRun) {
          int end = Math.min(start + minRun - 1, values.length - 1);
          //@step 5
          insertionSortRange(values, start, end);
      }

      for (int width = minRun; width < values.length; width *= 2) {
          for (int left = 0; left < values.length; left += width * 2) {
              int middle = Math.min(left + width - 1, values.length - 1);
              int right = Math.min(left + width * 2 - 1, values.length - 1);

              if (middle >= right) {
                  continue;
              }

              //@step 9
              mergeRuns(values, temp, left, middle, right);
          }
      }

      //@step 12
      return values;
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  private static void insertionSortRange(int[] values, int left, int right) {
      for (int index = left + 1; index <= right; index += 1) {
          //@step 15
          int current = values[index];
          int scan = index - 1;

          while (scan >= left && values[scan] > current) {
              //@step 17
              values[scan + 1] = values[scan];
              scan -= 1;
          }

          //@step 17
          values[scan + 1] = current;
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  private static void mergeRuns(int[] values, int[] temp, int left, int middle, int right) {
      int leftIndex = left;
      int rightIndex = middle + 1;
      int writeIndex = left;

      while (leftIndex <= middle && rightIndex <= right) {
          //@step 21
          if (values[leftIndex] <= values[rightIndex]) {
              temp[writeIndex] = values[leftIndex];
              leftIndex += 1;
          } else {
              temp[writeIndex] = values[rightIndex];
              rightIndex += 1;
          }
          writeIndex += 1;
      }

      while (leftIndex <= middle) {
          temp[writeIndex] = values[leftIndex];
          leftIndex += 1;
          writeIndex += 1;
      }

      while (rightIndex <= right) {
          temp[writeIndex] = values[rightIndex];
          rightIndex += 1;
          writeIndex += 1;
      }

      for (int index = left; index <= right; index += 1) {
          //@step 25
          values[index] = temp[index];
      }
  }
  //#endregion merge-runs
  `,
  'java',
);

const TIM_SORT_CPP = buildStructuredCode(
  `
  #include <algorithm>
  #include <vector>

  void insertionSortRange(std::vector<int>& values, int left, int right);
  void mergeRuns(std::vector<int>& values, std::vector<int>& temp, int left, int middle, int right);

  /**
   * Sorts the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region tim-sort function open
  //@step 1
  std::vector<int> timSort(std::vector<int> values) {
      int minRun = std::min(values.empty() ? 1 : static_cast<int>(values.size()), 8);
      std::vector<int> temp(values.size(), 0);

      for (int start = 0; start < static_cast<int>(values.size()); start += minRun) {
          int end = std::min(start + minRun - 1, static_cast<int>(values.size()) - 1);
          //@step 5
          insertionSortRange(values, start, end);
      }

      for (int width = minRun; width < static_cast<int>(values.size()); width *= 2) {
          for (int left = 0; left < static_cast<int>(values.size()); left += width * 2) {
              int middle = std::min(left + width - 1, static_cast<int>(values.size()) - 1);
              int right = std::min(left + width * 2 - 1, static_cast<int>(values.size()) - 1);

              if (middle >= right) {
                  continue;
              }

              //@step 9
              mergeRuns(values, temp, left, middle, right);
          }
      }

      //@step 12
      return values;
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  void insertionSortRange(std::vector<int>& values, int left, int right) {
      for (int index = left + 1; index <= right; index += 1) {
          //@step 15
          int current = values[index];
          int scan = index - 1;

          while (scan >= left && values[scan] > current) {
              //@step 17
              values[scan + 1] = values[scan];
              scan -= 1;
          }

          //@step 17
          values[scan + 1] = current;
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  void mergeRuns(std::vector<int>& values, std::vector<int>& temp, int left, int middle, int right) {
      int leftIndex = left;
      int rightIndex = middle + 1;
      int writeIndex = left;

      while (leftIndex <= middle && rightIndex <= right) {
          //@step 21
          if (values[leftIndex] <= values[rightIndex]) {
              temp[writeIndex] = values[leftIndex];
              leftIndex += 1;
          } else {
              temp[writeIndex] = values[rightIndex];
              rightIndex += 1;
          }
          writeIndex += 1;
      }

      while (leftIndex <= middle) {
          temp[writeIndex] = values[leftIndex];
          leftIndex += 1;
          writeIndex += 1;
      }

      while (rightIndex <= right) {
          temp[writeIndex] = values[rightIndex];
          rightIndex += 1;
          writeIndex += 1;
      }

      for (int index = left; index <= right; index += 1) {
          //@step 25
          values[index] = temp[index];
      }
  }
  //#endregion merge-runs
  `,
  'cpp',
);

const TIM_SORT_GO = buildStructuredCode(
  `
  package sorting

  /**
   * Sorts the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable slice of integers.
   * Returns: the same slice after in-place sorting.
   */
  //#region tim-sort function open
  //@step 1
  func TimSort(values []int) []int {
      minRun := len(values)
      if minRun == 0 {
          minRun = 1
      }
      if minRun > 8 {
          minRun = 8
      }
      temp := make([]int, len(values))

      for start := 0; start < len(values); start += minRun {
          end := start + minRun - 1
          if end >= len(values) {
              end = len(values) - 1
          }
          //@step 5
          insertionSortRange(values, start, end)
      }

      for width := minRun; width < len(values); width *= 2 {
          for left := 0; left < len(values); left += width * 2 {
              middle := left + width - 1
              if middle >= len(values) {
                  middle = len(values) - 1
              }
              right := left + width*2 - 1
              if right >= len(values) {
                  right = len(values) - 1
              }

              if middle >= right {
                  continue
              }

              //@step 9
              mergeRuns(values, temp, left, middle, right)
          }
      }

      //@step 12
      return values
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  func insertionSortRange(values []int, left int, right int) {
      for index := left + 1; index <= right; index += 1 {
          //@step 15
          current := values[index]
          scan := index - 1

          for scan >= left && values[scan] > current {
              //@step 17
              values[scan+1] = values[scan]
              scan -= 1
          }

          //@step 17
          values[scan+1] = current
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  func mergeRuns(values []int, temp []int, left int, middle int, right int) {
      leftIndex := left
      rightIndex := middle + 1
      writeIndex := left

      for leftIndex <= middle && rightIndex <= right {
          //@step 21
          if values[leftIndex] <= values[rightIndex] {
              temp[writeIndex] = values[leftIndex]
              leftIndex += 1
          } else {
              temp[writeIndex] = values[rightIndex]
              rightIndex += 1
          }
          writeIndex += 1
      }

      for leftIndex <= middle {
          temp[writeIndex] = values[leftIndex]
          leftIndex += 1
          writeIndex += 1
      }

      for rightIndex <= right {
          temp[writeIndex] = values[rightIndex]
          rightIndex += 1
          writeIndex += 1
      }

      for index := left; index <= right; index += 1 {
          //@step 25
          values[index] = temp[index]
      }
  }
  //#endregion merge-runs
  `,
  'go',
);

const TIM_SORT_RUST = buildStructuredCode(
  `
  /**
   * Sorts the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable vector of integers.
   * Returns: the same vector after in-place sorting.
   */
  //#region tim-sort function open
  //@step 1
  fn tim_sort(mut values: Vec<i32>) -> Vec<i32> {
      let mut min_run = values.len();
      if min_run == 0 {
          min_run = 1;
      }
      if min_run > 8 {
          min_run = 8;
      }
      let mut temp = vec![0; values.len()];

      for start in (0..values.len()).step_by(min_run) {
          let end = (start + min_run - 1).min(values.len() - 1);
          //@step 5
          insertion_sort_range(&mut values, start, end);
      }

      let mut width = min_run;
      while width < values.len() {
          let mut left = 0;
          while left < values.len() {
              let middle = (left + width - 1).min(values.len() - 1);
              let right = (left + width * 2 - 1).min(values.len() - 1);

              if middle < right {
                  //@step 9
                  merge_runs(&mut values, &mut temp, left, middle, right);
              }

              left += width * 2;
          }
          width *= 2;
      }

      //@step 12
      values
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  fn insertion_sort_range(values: &mut [i32], left: usize, right: usize) {
      for index in (left + 1)..=right {
          //@step 15
          let current = values[index];
          let mut scan = index as isize - 1;

          while scan >= left as isize && values[scan as usize] > current {
              //@step 17
              values[scan as usize + 1] = values[scan as usize];
              scan -= 1;
          }

          //@step 17
          values[scan as usize + 1] = current;
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  fn merge_runs(values: &mut [i32], temp: &mut [i32], left: usize, middle: usize, right: usize) {
      let mut left_index = left;
      let mut right_index = middle + 1;
      let mut write_index = left;

      while left_index <= middle && right_index <= right {
          //@step 21
          if values[left_index] <= values[right_index] {
              temp[write_index] = values[left_index];
              left_index += 1;
          } else {
              temp[write_index] = values[right_index];
              right_index += 1;
          }
          write_index += 1;
      }

      while left_index <= middle {
          temp[write_index] = values[left_index];
          left_index += 1;
          write_index += 1;
      }

      while right_index <= right {
          temp[write_index] = values[right_index];
          right_index += 1;
          write_index += 1;
      }

      for index in left..=right {
          //@step 25
          values[index] = temp[index];
      }
  }
  //#endregion merge-runs
  `,
  'rust',
);

const TIM_SORT_SWIFT = buildStructuredCode(
  `
  /**
   * Sorts the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region tim-sort function open
  //@step 1
  func timSort(_ values: inout [Int]) -> [Int] {
      let minRun = min(values.isEmpty ? 1 : values.count, 8)
      var temp = Array(repeating: 0, count: values.count)

      for start in stride(from: 0, to: values.count, by: minRun) {
          let end = min(start + minRun - 1, values.count - 1)
          //@step 5
          insertionSortRange(&values, start, end)
      }

      var width = minRun
      while width < values.count {
          for left in stride(from: 0, to: values.count, by: width * 2) {
              let middle = min(left + width - 1, values.count - 1)
              let right = min(left + width * 2 - 1, values.count - 1)

              if middle >= right {
                  continue
              }

              //@step 9
              mergeRuns(&values, &temp, left, middle, right)
          }
          width *= 2
      }

      //@step 12
      return values
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  func insertionSortRange(_ values: inout [Int], _ left: Int, _ right: Int) {
      guard left < right else {
          return
      }

      for index in (left + 1)...right {
          //@step 15
          let current = values[index]
          var scan = index - 1

          while scan >= left && values[scan] > current {
              //@step 17
              values[scan + 1] = values[scan]
              scan -= 1
          }

          //@step 17
          values[scan + 1] = current
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  func mergeRuns(_ values: inout [Int], _ temp: inout [Int], _ left: Int, _ middle: Int, _ right: Int) {
      var leftIndex = left
      var rightIndex = middle + 1
      var writeIndex = left

      while leftIndex <= middle && rightIndex <= right {
          //@step 21
          if values[leftIndex] <= values[rightIndex] {
              temp[writeIndex] = values[leftIndex]
              leftIndex += 1
          } else {
              temp[writeIndex] = values[rightIndex]
              rightIndex += 1
          }
          writeIndex += 1
      }

      while leftIndex <= middle {
          temp[writeIndex] = values[leftIndex]
          leftIndex += 1
          writeIndex += 1
      }

      while rightIndex <= right {
          temp[writeIndex] = values[rightIndex]
          rightIndex += 1
          writeIndex += 1
      }

      for index in left...right {
          //@step 25
          values[index] = temp[index]
      }
  }
  //#endregion merge-runs
  `,
  'swift',
);

const TIM_SORT_PHP = buildStructuredCode(
  `
  <?php

  /**
   * Sorts the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   *
   * @param array<int, int> $values
   * @return array<int, int>
   */
  //#region tim-sort function open
  //@step 1
  function timSort(array &$values): array
  {
      $minRun = min($values === [] ? 1 : count($values), 8);
      $temp = array_fill(0, count($values), 0);

      for ($start = 0; $start < count($values); $start += $minRun) {
          $end = min($start + $minRun - 1, count($values) - 1);
          //@step 5
          insertionSortRange($values, $start, $end);
      }

      for ($width = $minRun; $width < count($values); $width *= 2) {
          for ($left = 0; $left < count($values); $left += $width * 2) {
              $middle = min($left + $width - 1, count($values) - 1);
              $right = min($left + $width * 2 - 1, count($values) - 1);

              if ($middle >= $right) {
                  continue;
              }

              //@step 9
              mergeRuns($values, $temp, $left, $middle, $right);
          }
      }

      //@step 12
      return $values;
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  function insertionSortRange(array &$values, int $left, int $right): void
  {
      for ($index = $left + 1; $index <= $right; $index += 1) {
          //@step 15
          $current = $values[$index];
          $scan = $index - 1;

          while ($scan >= $left && $values[$scan] > $current) {
              //@step 17
              $values[$scan + 1] = $values[$scan];
              $scan -= 1;
          }

          //@step 17
          $values[$scan + 1] = $current;
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  function mergeRuns(array &$values, array &$temp, int $left, int $middle, int $right): void
  {
      $leftIndex = $left;
      $rightIndex = $middle + 1;
      $writeIndex = $left;

      while ($leftIndex <= $middle && $rightIndex <= $right) {
          //@step 21
          if ($values[$leftIndex] <= $values[$rightIndex]) {
              $temp[$writeIndex] = $values[$leftIndex];
              $leftIndex += 1;
          } else {
              $temp[$writeIndex] = $values[$rightIndex];
              $rightIndex += 1;
          }
          $writeIndex += 1;
      }

      while ($leftIndex <= $middle) {
          $temp[$writeIndex] = $values[$leftIndex];
          $leftIndex += 1;
          $writeIndex += 1;
      }

      while ($rightIndex <= $right) {
          $temp[$writeIndex] = $values[$rightIndex];
          $rightIndex += 1;
          $writeIndex += 1;
      }

      for ($index = $left; $index <= $right; $index += 1) {
          //@step 25
          $values[$index] = $temp[$index];
      }
  }
  //#endregion merge-runs
  `,
  'php',
);

const TIM_SORT_KOTLIN = buildStructuredCode(
  `
  /**
   * Sorts the array with a simplified TimSort: insertion-sort small runs, then merge them.
   * Input: mutable array of integers.
   * Returns: the same array after in-place sorting.
   */
  //#region tim-sort function open
  //@step 1
  fun timSort(values: IntArray): IntArray {
      val minRun = minOf(if (values.isEmpty()) 1 else values.size, 8)
      val temp = IntArray(values.size)

      var start = 0
      while (start < values.size) {
          val end = minOf(start + minRun - 1, values.size - 1)
          //@step 5
          insertionSortRange(values, start, end)
          start += minRun
      }

      var width = minRun
      while (width < values.size) {
          var left = 0
          while (left < values.size) {
              val middle = minOf(left + width - 1, values.size - 1)
              val right = minOf(left + width * 2 - 1, values.size - 1)

              if (middle < right) {
                  //@step 9
                  mergeRuns(values, temp, left, middle, right)
              }

              left += width * 2
          }
          width *= 2
      }

      //@step 12
      return values
  }
  //#endregion tim-sort

  //#region insertion-range helper collapsed
  fun insertionSortRange(values: IntArray, left: Int, right: Int) {
      for (index in left + 1..right) {
          //@step 15
          val current = values[index]
          var scan = index - 1

          while (scan >= left && values[scan] > current) {
              //@step 17
              values[scan + 1] = values[scan]
              scan -= 1
          }

          //@step 17
          values[scan + 1] = current
      }
  }
  //#endregion insertion-range

  //#region merge-runs helper collapsed
  fun mergeRuns(values: IntArray, temp: IntArray, left: Int, middle: Int, right: Int) {
      var leftIndex = left
      var rightIndex = middle + 1
      var writeIndex = left

      while (leftIndex <= middle && rightIndex <= right) {
          //@step 21
          if (values[leftIndex] <= values[rightIndex]) {
              temp[writeIndex] = values[leftIndex]
              leftIndex += 1
          } else {
              temp[writeIndex] = values[rightIndex]
              rightIndex += 1
          }
          writeIndex += 1
      }

      while (leftIndex <= middle) {
          temp[writeIndex] = values[leftIndex]
          leftIndex += 1
          writeIndex += 1
      }

      while (rightIndex <= right) {
          temp[writeIndex] = values[rightIndex]
          rightIndex += 1
          writeIndex += 1
      }

      for (index in left..right) {
          //@step 25
          values[index] = temp[index]
      }
  }
  //#endregion merge-runs
  `,
  'kotlin',
);

export const TIM_SORT_CODE = TIM_SORT_TS.lines;
export const TIM_SORT_CODE_REGIONS = TIM_SORT_TS.regions;
export const TIM_SORT_CODE_HIGHLIGHT_MAP = TIM_SORT_TS.highlightMap;
export const TIM_SORT_CODE_VARIANTS: CodeVariantMap = {
  typescript: {
    language: 'typescript',
    lines: TIM_SORT_TS.lines,
    regions: TIM_SORT_TS.regions,
    highlightMap: TIM_SORT_TS.highlightMap,
    source: TIM_SORT_TS.source,
  },
  javascript: {
    language: 'javascript',
    lines: TIM_SORT_JS.lines,
    regions: TIM_SORT_JS.regions,
    highlightMap: TIM_SORT_JS.highlightMap,
    source: TIM_SORT_JS.source,
  },
  python: {
    language: 'python',
    lines: TIM_SORT_PY.lines,
    regions: TIM_SORT_PY.regions,
    highlightMap: TIM_SORT_PY.highlightMap,
    source: TIM_SORT_PY.source,
  },
  csharp: {
    language: 'csharp',
    lines: TIM_SORT_CS.lines,
    regions: TIM_SORT_CS.regions,
    highlightMap: TIM_SORT_CS.highlightMap,
    source: TIM_SORT_CS.source,
  },
  java: {
    language: 'java',
    lines: TIM_SORT_JAVA.lines,
    regions: TIM_SORT_JAVA.regions,
    highlightMap: TIM_SORT_JAVA.highlightMap,
    source: TIM_SORT_JAVA.source,
  },
  cpp: {
    language: 'cpp',
    lines: TIM_SORT_CPP.lines,
    regions: TIM_SORT_CPP.regions,
    highlightMap: TIM_SORT_CPP.highlightMap,
    source: TIM_SORT_CPP.source,
  },
  go: {
    language: 'go',
    lines: TIM_SORT_GO.lines,
    regions: TIM_SORT_GO.regions,
    highlightMap: TIM_SORT_GO.highlightMap,
    source: TIM_SORT_GO.source,
  },
  rust: {
    language: 'rust',
    lines: TIM_SORT_RUST.lines,
    regions: TIM_SORT_RUST.regions,
    highlightMap: TIM_SORT_RUST.highlightMap,
    source: TIM_SORT_RUST.source,
  },
  swift: {
    language: 'swift',
    lines: TIM_SORT_SWIFT.lines,
    regions: TIM_SORT_SWIFT.regions,
    highlightMap: TIM_SORT_SWIFT.highlightMap,
    source: TIM_SORT_SWIFT.source,
  },
  php: {
    language: 'php',
    lines: TIM_SORT_PHP.lines,
    regions: TIM_SORT_PHP.regions,
    highlightMap: TIM_SORT_PHP.highlightMap,
    source: TIM_SORT_PHP.source,
  },
  kotlin: {
    language: 'kotlin',
    lines: TIM_SORT_KOTLIN.lines,
    regions: TIM_SORT_KOTLIN.regions,
    highlightMap: TIM_SORT_KOTLIN.highlightMap,
    source: TIM_SORT_KOTLIN.source,
  },
};
