# Judge0 Integration Setup Guide

## Overview
Judge0 is integrated into the application for real-time code execution and validation. When users click "Run Code" in the Code Editor, their code is sent to Judge0 for compilation and execution against test cases.

## Features
- **Real Code Execution**: Code is actually compiled and executed on Judge0 servers
- **Multiple Language Support**: JavaScript, Python, C++, Java, Go, Rust
- **Detailed Test Results**: Shows input, expected output, actual output, runtime, and errors
- **Error Detection**: Captures compilation errors and runtime errors
- **Test Case Comparison**: Automatically compares actual output against expected output

## Prerequisites

### 1. Get Judge0 API Credentials

You have two options:

#### Option A: Free Tier (Recommended for Development)
1. Go to [RapidAPI Judge0 Page](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click "Start Free" or sign up
3. Copy your API Key from the dashboard
4. The API Host is: `judge0-ce.p.rapidapi.com`
5. The API URL is: `https://judge0-ce.p.rapidapi.com`

#### Option B: Self-Hosted Judge0
1. Deploy Judge0 locally or on a server
2. Update `JUDGE0_API_URL` to your server URL
3. You may not need API credentials for self-hosted version

### 2. Configure Environment Variables

Update `Backend/.env`:

```env
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

### 3. Install Dependencies

The backend already has `axios` added to handle HTTP requests. If needed, install:

```bash
cd Backend
npm install
```

## How It Works

### Frontend Flow
1. User clicks **Run Code** button in Code Editor
2. Frontend collects all non-hidden test cases
3. Sends code, language, and test cases to backend endpoint: `/api/gemini/run-code`

### Backend Flow
1. Receives code, language, and test cases
2. Maps language to Judge0 language ID
3. For each test case:
   - Submits code + input to Judge0
   - Waits for execution result
   - Compares actual output with expected output
4. Returns detailed results to frontend

### Response Format

```json
{
  "success": true,
  "results": [
    {
      "input": "test input",
      "expectedOutput": "expected",
      "actualOutput": "actual",
      "passed": true,
      "runtime": "45ms",
      "statusId": 3,
      "statusDescription": "Accepted",
      "stderr": "",
      "compilationError": ""
    }
  ],
  "summary": {
    "totalTests": 3,
    "passedTests": 3,
    "failedTests": 0,
    "allPassed": true
  }
}
```

## Language Mappings

Judge0 Language IDs (built-in):
- JavaScript: 63
- Python: 71
- C++: 54
- Java: 62
- Go: 60
- Rust: 73

To add more languages, update the `LANGUAGE_IDS` object in `Backend/routes/gemini.js`:

```javascript
const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
  go: 60,
  rust: 73,
  // Add more here
};
```

## Test Case Format

Test cases in the database should have:
- `input` (string): Standard input for the program
- `expected_output` (string): Expected console output

Example:
```
Input: "5\n3"
Expected Output: "8"
```

## Error Handling

### Compilation Errors
Shown when code fails to compile. Example:
```
SyntaxError: Unexpected token
```

### Runtime Errors
Shown when code compiles but fails during execution. Example:
```
IndexError: list index out of range
```

### Timeout/Network Errors
If Judge0 is unreachable or times out, a user-friendly error is shown.

## UI Display

Test results are displayed in the **Sample Tests** tab with:
- ✅ Green badge for passed tests
- ❌ Red badge for failed tests
- Runtime duration
- Comparison of input, expected, and actual output
- Error messages if any

## Troubleshooting

### "Failed to execute code" Error
1. Check if `JUDGE0_API_KEY` is set in `.env`
2. Verify RapidAPI account is active
3. Check API rate limits (free tier has limits)
4. Ensure internet connection to RapidAPI

### Test Cases Not Running
1. Verify test cases exist in the database
2. Check format: `input` and `expected_output` fields
3. Run a simple test case first (e.g., "Hello World")

### Inconsistent Results
Judge0 may have slight variations due to:
- Server load
- Time limits
- Resource constraints
- Output whitespace differences

## Future Enhancements

- Submission (Submit Code) integration with Judge0
- Hidden test cases execution
- Performance metrics (memory usage, CPU time)
- Code optimization suggestions
- Multiple file submissions

## References

- [Judge0 Official Website](https://judge0.com)
- [Judge0 API Documentation](https://rapidapi.com/judge0-official/api/judge0-ce)
- [Judge0 GitHub](https://github.com/judge0/judge0)
