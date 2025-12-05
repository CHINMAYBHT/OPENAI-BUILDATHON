# Judge0 Quick Reference

## Setup in 3 Steps

### Step 1: Get API Key
```
1. Visit https://rapidapi.com/judge0-official/api/judge0-ce
2. Click "Start Free"
3. Copy your API Key
```

### Step 2: Configure Environment
Edit `Backend/.env`:
```env
JUDGE0_API_KEY=your_key_here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

### Step 3: Install & Run
```bash
cd Backend
npm install
npm run dev
```

## How to Use

1. Open Code Editor with a problem
2. Write your solution code
3. Click **"Run Code"** button
4. See real test execution results!

## What Happens Under the Hood

```
User Code + Test Cases
         ↓
    Judge0 API
         ↓
Code Compilation & Execution
         ↓
Compare Output vs Expected
         ↓
Display Results in UI
```

## Test Case Format

Test cases are stored in database as:
```
input: "5 3"
expected_output: "8"
```

The system:
1. Sends input to program's stdin
2. Captures stdout
3. Compares with expected_output

## Supported Languages

| Language | ID |
|----------|-----|
| JavaScript | 63 |
| Python | 71 |
| C++ | 54 |
| Java | 62 |
| Go | 60 |
| Rust | 73 |

## Result Fields

```javascript
{
  passed: boolean,              // Test passed?
  actualOutput: string,         // What code produced
  expectedOutput: string,       // What was expected
  compilationError: string,     // Compile errors
  stderr: string,               // Runtime errors
  runtime: string,              // "45ms"
  statusDescription: string     // "Accepted" or "Wrong Answer"
}
```

## Error Types

| Error | Shown In | Cause |
|-------|----------|-------|
| Compilation Error | Red Box | Code won't compile |
| Runtime Error | Yellow Box | Error during execution |
| Wrong Answer | Red Test Badge | Output doesn't match |

## Example Workflow

### 1. Write Code
```javascript
function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}
```

### 2. Click Run Code
- Frontend sends to backend
- Backend submits to Judge0
- Judge0 executes code

### 3. See Results
- Green checkmark: Test passed
- Red X: Test failed
- Error messages show compilation/runtime issues
- AI provides debugging hints

## API Endpoint

**Endpoint**: `POST /api/gemini/run-code`

**Request**:
```json
{
  "code": "your code here",
  "language": "javascript",
  "testCases": [
    {
      "input": "5 3",
      "expectedOutput": "8"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "input": "5 3",
      "expectedOutput": "8",
      "actualOutput": "8",
      "passed": true,
      "runtime": "45ms",
      "compilationError": "",
      "stderr": ""
    }
  ],
  "summary": {
    "totalTests": 1,
    "passedTests": 1,
    "failedTests": 0,
    "allPassed": true
  }
}
```

## Troubleshooting

### "Failed to execute code"
✓ Check `.env` has `JUDGE0_API_KEY`
✓ Verify RapidAPI account is active
✓ Check internet connection

### No results appearing
✓ Ensure test cases exist in database
✓ Test input/output format is correct
✓ Check browser console for errors

### Rate limit exceeded
✓ Free tier: 100 requests/month
✓ Upgrade RapidAPI plan for more
✓ Wait for monthly reset

## Tips & Tricks

**💡 Test simple code first**
```python
print("Hello World")
```

**💡 Use blank input for no-input programs**
```
input: ""
expectedOutput: "result"
```

**💡 Include newlines in expected output**
```
input: "5"
expectedOutput: "10\n"
```

**💡 Check output formatting**
Judge0 checks exact string match - watch for spaces/newlines!

## Performance

- Average execution time: **100-500ms per test**
- Network latency: **50-200ms**
- Total time for 3 tests: **~1-2 seconds**

## Limitations

- Free tier: 100 requests/month
- Max code size: ~64KB
- Max input size: ~64KB
- Timeout: ~15 seconds per submission

## Support

- 📚 [Judge0 Docs](https://rapidapi.com/judge0-official/api/judge0-ce)
- 🐛 [Report Issues](https://github.com/judge0/judge0)
- 💬 [RapidAPI Support](https://rapidapi.com/support)

---

**Last Updated**: December 5, 2025
**Status**: ✅ Production Ready
