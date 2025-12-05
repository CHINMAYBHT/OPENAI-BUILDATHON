# Judge0 Integration - Visual Setup & Usage Guide

## 🚀 Quick Setup (3 Steps)

### Step 1️⃣: Get Free API Key

```
https://rapidapi.com/judge0-official/api/judge0-ce
                    ↓
            Click "Start Free"
                    ↓
            Sign up (GitHub/Google/Email)
                    ↓
            Copy API Key from dashboard
```

**Takes**: ~2 minutes

### Step 2️⃣: Update Backend Config

**File**: `Backend/.env`

```env
GEMINI_API_KEY=AIzaSyD4eqwH7mYe_q5XcsCl0jxjR3HHLJsLfGw
GEMINI_API_URL=https://generativelanguage.googleapis.com/...
SUPABASE_URL=https://oaenyrcwkcemweyfjrwr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# 👇 ADD THESE LINES:
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_key_from_step_1_here
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

**Takes**: ~1 minute

### Step 3️⃣: Install & Run

```bash
cd Backend
npm install          # Installs axios package
npm run dev          # Starts backend
```

**Takes**: ~2 minutes

**Output**:
```
Server is running on port 5000
```

✅ **Setup Complete!**

---

## 📝 Usage Guide

### Writing & Running Code

```
┌─────────────────────────────────────────────┐
│                                             │
│  1. Open Code Editor (any problem)          │
│                                             │
│  2. Write your solution code                │
│                                             │
│  3. Click "Run Code" button                 │
│                                             │
│         🟢 RUN CODE                         │
│                                             │
│  4. Wait for results (~1-2 seconds)         │
│                                             │
│  5. See detailed test results               │
│                                             │
│  6. Read AI debugging hints                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Example: Simple Python Program

**Your Code**:
```python
a = 5
b = 3
print(a + b)
```

**Test Case**:
```
Input:    ""
Expected: "8"
```

**After Clicking Run Code**:
```
✅ Test Case 1:                         PASSED    23ms

Input:           ""
Expected Output: "8"
Your Output:     "8"

AI Analysis:
"Great! Your code correctly solves this problem. 
The logic is sound and handles the basic case well."
```

---

## 🎯 How It Works (Visual)

```
YOUR CODE                   JUDGE0 SERVER              YOUR BROWSER
    │                            │                          │
    │──(1) Send Code────────────►│                          │
    │  + Input                   │                          │
    │  + Language                │                          │
    │                            │                          │
    │                      (2) Compile                      │
    │                            │                          │
    │                      (3) Execute                      │
    │                            │                          │
    │                      (4) Get Output                   │
    │◄─────(5) Return Result────│                          │
    │                            │                          │
    ├──────(6) Compare Output──────────────────►│
    │                            │         Display Results  │
    │                            │         + AI Analysis    │
    │                            │                          │
    └────────────────────────────────────────────────────────┘
                          (~500ms total)
```

---

## ✅ Test Result Scenarios

### ✅ All Tests Pass

```
┌─────────────────────────────────────────┐
│  Test Case 1                 ✅ PASSED  │
├─────────────────────────────────────────┤
│  Input:       "5 3"                     │
│  Expected:    "8"                       │
│  Your Output: "8"              23ms     │
│                                         │
│  Test Case 2                 ✅ PASSED  │
├─────────────────────────────────────────┤
│  Input:       "10 5"                    │
│  Expected:    "15"                      │
│  Your Output: "15"             19ms     │
│                                         │
│  Summary: 2/2 tests passed! ✨          │
└─────────────────────────────────────────┘

AI: "Excellent work! Your solution is correct..."
```

### ❌ Wrong Answer

```
┌─────────────────────────────────────────┐
│  Test Case 1                  ❌ FAILED │
├─────────────────────────────────────────┤
│  Input:           "5 3"                 │
│  Expected Output: "8"                   │
│  Your Output:     "5"          25ms     │
│                                         │
│  Test Case 2                 ✅ PASSED  │
├─────────────────────────────────────────┤
│  Input:           "10 5"                │
│  Expected Output: "15"                  │
│  Your Output:     "10"         18ms     │
│                                         │
│  Summary: 1/2 tests passed              │
└─────────────────────────────────────────┘

AI: "I see you're returning the first number. 
You need to add both numbers together..."
```

### 🔴 Compilation Error

```
┌─────────────────────────────────────────┐
│  🔴 Compilation Error:                  │
│  ────────────────────────────────────   │
│  SyntaxError: unexpected token '<'      │
│  at line 3                              │
└─────────────────────────────────────────┘

Your Code:
  1 | a = 5
  2 | b = 3
  3 | print(a b +)  ← Syntax Error!

Fix: print(a + b)
```

### ⚠️ Runtime Error

```
┌─────────────────────────────────────────┐
│  ⚠️ Runtime Error:                      │
│  ────────────────────────────────────   │
│  IndexError: list index out of range    │
│  at line 5                              │
└─────────────────────────────────────────┘

Your Code:
  arr = [1, 2, 3]
  print(arr[10])  ← Index doesn't exist!

Fix: Make sure index is within array bounds
```

---

## 🌍 Supported Languages

### Quick Reference Table

| Language | Status | Example |
|----------|--------|---------|
| JavaScript | ✅ Ready | `console.log(5 + 3)` |
| Python | ✅ Ready | `print(5 + 3)` |
| C++ | ✅ Ready | `cout << 5 + 3` |
| Java | ✅ Ready | `System.out.println(5 + 3)` |
| Go | ✅ Ready | `fmt.Println(5 + 3)` |
| Rust | ✅ Ready | `println!("{}", 5 + 3)` |

---

## 🐛 Troubleshooting

### "Failed to execute code"

**Problem**: 
```
❌ Failed to execute code
   Unknown error occurred
```

**Solutions** (in order):
1. Check `Backend/.env` has `JUDGE0_API_KEY`
2. Verify API key is valid on RapidAPI
3. Check internet connection
4. Restart backend server
5. Try simple code first: `print("test")`

### "Code not compiling"

**Problem**:
```
🔴 Compilation Error: SyntaxError
```

**Solution**:
- Review the error message
- Check line number mentioned
- Test code in IDE first
- Common issues:
  - Missing parentheses: `print 5` → `print(5)`
  - Wrong syntax: `console.print()` → `console.log()`
  - Unclosed brackets: `arr = [1, 2` → `arr = [1, 2]`

### "Test running slowly"

**Expected**: 1-2 seconds for 3 tests

**If slower**:
- Judge0 API might be busy
- Your internet connection is slow
- Try again in a few seconds
- Check RapidAPI status page

### "Rate limit exceeded"

**Problem**: 
```
429 Too Many Requests
```

**Cause**: Exceeded 100 requests/month on free tier

**Solution**:
- Wait for monthly reset, or
- Upgrade to paid tier at RapidAPI

---

## 💡 Tips & Best Practices

### 1. Test Simple Code First
```python
# Good first test
print("Hello World")

# Expected: "Hello World"
```

### 2. Check Input/Output Format
```
Input must match what program expects:
- Numbers: "5 3" (space-separated)
- Multiple lines: "5\n3" (\n for newline)
- Empty input: "" (blank string)

Output must be exact match:
- Case matters: "Hello" ≠ "hello"
- Whitespace matters: "8 " ≠ "8"
- Newlines matter: "8\n" ≠ "8"
```

### 3. Use AI Hints
```
If test fails:
1. Read the error message
2. Check AI debugging hints
3. Fix specific issues mentioned
4. Run code again
5. Iterate until passing
```

### 4. Test Incrementally
```
DON'T do this:
- Write 50 lines of code
- Run and see 10 errors
- Get confused

DO this:
- Write 5 lines of code
- Run code - should pass
- Add 5 more lines
- Run code - should pass
- Repeat until done
```

---

## 📊 Understanding Test Results

### Test Passed (✅)

```
✅ PASSED means:
  • Code compiled successfully
  • Executed without errors
  • Output matched expected output exactly
  • Ready to move to next test
```

### Test Failed (❌)

```
❌ FAILED means one of:
  1. Wrong Answer - Output doesn't match
  2. Compilation Error - Code won't compile
  3. Runtime Error - Code crashes during execution
```

### Runtime Metric

```
"23ms" = Code executed in 23 milliseconds
• Faster is better, but not critical
• Usually between 10-500ms
• Depends on Judge0 server load
```

---

## 🎓 Learning Flow

```
1. READ problem statement
   └─► Understand what's needed

2. WRITE code
   └─► Implement your solution

3. RUN code
   └─► Check against test cases

4. FIX errors
   ├─► If compilation error: Fix syntax
   ├─► If runtime error: Fix logic
   └─► If wrong answer: Improve algorithm

5. OPTIMIZE
   └─► Make code faster/cleaner

6. SUBMIT
   └─► Final submission with feedback
```

---

## 🚀 Performance Expectations

| Scenario | Time |
|----------|------|
| Single test case | 300-500ms |
| 3 test cases | 1-2 seconds |
| 5 test cases | 2-3 seconds |
| 10 test cases | 4-5 seconds |

**Network**: ~100-200ms (RapidAPI latency)  
**Execution**: ~50-200ms per test  
**Processing**: ~10-50ms per result  

---

## 📞 Getting Help

### If Something Goes Wrong

1. **Check the Error Message**
   - Read it carefully
   - Most are self-explanatory

2. **Consult Documentation**
   - See `JUDGE0_SETUP.md` for setup
   - See `JUDGE0_QUICK_REFERENCE.md` for reference
   - See troubleshooting section above

3. **Test with Simple Code**
   - `print("test")` in Python
   - `console.log("test")` in JavaScript
   - This isolates problems

4. **Check API Credentials**
   - Verify key in `Backend/.env`
   - Verify on RapidAPI dashboard

5. **Restart Backend**
   ```bash
   # Press Ctrl+C to stop
   # Then run again:
   npm run dev
   ```

---

## ✨ Summary

**Judge0 Integration brings you**:
- ✅ Real code execution
- ✅ Accurate test validation
- ✅ Clear error messages
- ✅ AI-powered debugging hints
- ✅ Fast results (~1-2 seconds)
- ✅ Support for 6 major languages

**You can now**:
- Write code with confidence
- Get instant feedback
- Understand exactly what's wrong
- Learn from AI suggestions
- Improve your coding skills

**Start using it right now**:
1. Get API key (2 min)
2. Add to `.env` (1 min)
3. Run backend (1 min)
4. Write code and click "Run Code"!

---

**Happy coding! 🎉**

For detailed help, see:
- `JUDGE0_SETUP.md` - Full setup guide
- `JUDGE0_QUICK_REFERENCE.md` - Quick commands
- `JUDGE0_DEPLOYMENT_CHECKLIST.md` - Deployment steps
