// scripts/extract_and_print.js
// Finds JSON objects with a `nums` array in a text block, parses them,
// computes the maximum subarray (Kadane), and prints results.

const inputText = `
{ "nums": [ -2, 1, -3, 4, -1, 2, 1, -5, 4 ] }
Output: 6
Explanation:
Example 2:
Input: { "nums": [ 1 ] }
Output: 1
Test Case 1
Input:
{"nums":[-2,1,-3,4,-1,2,1,-5,4]}
Expected Output:
6
Test Case 2
Input:
{"nums":[1]}
Expected Output:
1
Test Case 3
Input:
{"nums":[5,4,-1,7,8]}
Expected Output:
23
`;

// Regex to capture JSON objects that contain a "nums" key and a bracketed array.
// This is permissive for reasonably formatted inputs.
const jsonRegex = /\{[^}]*"nums"\s*:\s*\[[^\]]*\][^}]*\}/gs;

function extractJsonObjects(text) {
  const matches = text.match(jsonRegex) || [];
  return matches.map(s => s.trim());
}

function safeParse(jsonStr) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Try to fix common issues: replace single quotes with double, remove trailing commas
    try {
      const fixed = jsonStr
        .replace(/(['"])\s*:\s*'([^']*)'/g, '"$1": "$2"')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']');
      return JSON.parse(fixed);
    } catch (e2) {
      return null;
    }
  }
}

function maxSubarray(nums) {
  if (!Array.isArray(nums) || nums.length === 0) return null;
  let maxEnding = nums[0];
  let maxSoFar = nums[0];
  for (let i = 1; i < nums.length; i++) {
    maxEnding = Math.max(nums[i], maxEnding + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEnding);
  }
  return maxSoFar;
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
    const result = maxSubarray(parsed.nums);
    console.log('Output:', result);
    console.log();
  });
}

if (require.main === module) main();

module.exports = { extractJsonObjects, safeParse, maxSubarray };
