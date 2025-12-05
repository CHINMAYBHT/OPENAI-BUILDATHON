// scripts/extract_and_print_increasing.js
// Extracts JSON objects with a `nums` array from a text block, computes the
// length of the longest strictly-increasing contiguous subarray, and prints results.

const inputText = `
"nums":[1,3,5,4,7]}
Expected Output:
3
Test Case 2
Input:
{"nums":[2,2,2]Example 1:
Input: { "nums": [ 1, 3, 5, 4, 7 ] }
Output: 3
Explanation:
Example 2:
Input: { "nums": [ 2, 2, 2 ] }
Output: 1
`;

const jsonRegex = /\{[^}]*"nums"\s*:\s*\[[^\]]*\][^}]*\}?/gs;

function extractJsonObjects(text) {
  const matches = text.match(jsonRegex) || [];
  return matches.map(s => s.trim());
}

function safeParse(jsonStr) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Try to add missing closing brace if JSON looks truncated
    let fixed = jsonStr;
    if (!/\}$/.test(fixed)) fixed = fixed + '}';
    fixed = fixed.replace(/,\s*\]/g, ']');
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      return null;
    }
  }
}

function longestIncreasingContiguousLength(nums) {
  if (!Array.isArray(nums) || nums.length === 0) return 0;
  let maxLen = 1;
  let curLen = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i-1]) {
      curLen++;
      if (curLen > maxLen) maxLen = curLen;
    } else {
      curLen = 1;
    }
  }
  return maxLen;
}

function main() {
  const objs = extractJsonObjects(inputText);
  if (objs.length === 0) {
    console.log('No JSON objects with a `nums` array were found.');
    return;
  }

  objs.forEach((raw, idx) => {
    const parsed = safeParse(raw);
    console.log(`--- Found JSON #${idx + 1} ---`);
    console.log('Raw:', raw);
    if (!parsed) {
      console.log('Could not parse this JSON object.');
      return;
    }

    if (!Array.isArray(parsed.nums)) {
      console.log('No `nums` array found in the parsed object. Parsed object:', parsed);
      return;
    }

    console.log('Input:', JSON.stringify(parsed));
    const result = longestIncreasingContiguousLength(parsed.nums);
    console.log('Output:', result);
    console.log();
  });
}

if (require.main === module) main();

module.exports = { extractJsonObjects, safeParse, longestIncreasingContiguousLength };
