# Judge0 Integration - Deployment Checklist

## Pre-Deployment (First Time Setup)

### RapidAPI Configuration
- [ ] Sign up at https://rapidapi.com/judge0-official/api/judge0-ce
- [ ] Copy API Key from RapidAPI dashboard
- [ ] Verify free tier provides 100 requests/month
- [ ] Note: Free tier is sufficient for development

### Backend Setup
- [ ] Open `Backend/.env`
- [ ] Add/update: `JUDGE0_API_KEY=your_key_here`
- [ ] Verify other config variables are set:
  - [ ] `JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com`
  - [ ] `JUDGE0_API_HOST=judge0-ce.p.rapidapi.com`
- [ ] Save `.env` file

### Dependencies Installation
```bash
cd Backend
npm install
```
- [ ] axios package installed successfully
- [ ] No installation errors
- [ ] `node_modules/axios` folder exists

## Pre-Deployment Testing

### Start Backend Server
```bash
npm run dev
```
- [ ] Server starts on port 5000
- [ ] No errors in console
- [ ] "Server is running on port 5000" message shown

### Manual Endpoint Test (Using curl/Postman)

**Test 1: Simple Python Code**
```bash
curl -X POST http://localhost:5000/api/gemini/run-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(5 + 3)",
    "language": "python",
    "testCases": [{"input": "", "expectedOutput": "8"}]
  }'
```
- [ ] Request succeeds (200 status)
- [ ] Response has `"success": true`
- [ ] Test marked as passed
- [ ] Output shows "8"

**Test 2: Error Handling**
```bash
curl -X POST http://localhost:5000/api/gemini/run-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "invalid syntax !!",
    "language": "python",
    "testCases": [{"input": "", "expectedOutput": "test"}]
  }'
```
- [ ] Request succeeds
- [ ] Response has `compilationError` field populated
- [ ] Test marked as failed
- [ ] Error message is clear

### Frontend Testing

#### Test 1: Run Simple Code
1. [ ] Open Code Editor (any problem)
2. [ ] Replace code with: `console.log(10);`
3. [ ] Language: JavaScript
4. [ ] Click "Run Code"
5. [ ] Verify:
   - [ ] "Running code with Judge0..." message appears
   - [ ] Results load within 2 seconds
   - [ ] Test shows "PASSED"
   - [ ] Output shows "10"
   - [ ] Runtime displayed (e.g., "45ms")

#### Test 2: Compilation Error
1. [ ] Code: `console.log(invalid syntax !!!)`
2. [ ] Click "Run Code"
3. [ ] Verify:
   - [ ] Compilation error displays in red box
   - [ ] Error message is visible
   - [ ] Test marked as FAILED
   - [ ] UI doesn't crash

#### Test 3: Wrong Answer
1. [ ] Code: `console.log(5);` (expects "10")
2. [ ] Test case: input="", expected="10"
3. [ ] Click "Run Code"
4. [ ] Verify:
   - [ ] Test shows FAILED
   - [ ] Shows: Input="", Expected="10", Actual="5"
   - [ ] Red badge indicates failure
   - [ ] User can see the mismatch

#### Test 4: Multiple Test Cases
1. [ ] Add 3 test cases to a problem
2. [ ] Click "Run Code"
3. [ ] Verify:
   - [ ] All 3 tests execute
   - [ ] Summary shows: "3/3 tests passed" (if all pass)
   - [ ] Each test case shows individual result
   - [ ] Results are accurate

#### Test 5: AI Analysis
1. [ ] After run, check AI Analysis section
2. [ ] Verify:
   - [ ] AI section shows feedback
   - [ ] Uses error context if tests failed
   - [ ] Message is helpful and relevant
   - [ ] Not saved to database (temporary only)

### All Supported Languages

Test one code example in each language:

#### JavaScript (ID: 63)
```javascript
console.log(5 + 3);
```
- [ ] Expected: "8"
- [ ] Status: PASSED

#### Python (ID: 71)
```python
print(5 + 3)
```
- [ ] Expected: "8"
- [ ] Status: PASSED

#### C++ (ID: 54)
```cpp
#include <iostream>
using namespace std;
int main() {
  cout << 5 + 3;
  return 0;
}
```
- [ ] Expected: "8"
- [ ] Status: PASSED

#### Java (ID: 62)
```java
public class Main {
  public static void main(String[] args) {
    System.out.println(5 + 3);
  }
}
```
- [ ] Expected: "8"
- [ ] Status: PASSED

#### Go (ID: 60)
```go
package main
import "fmt"
func main() {
  fmt.Println(5 + 3)
}
```
- [ ] Expected: "8"
- [ ] Status: PASSED

#### Rust (ID: 73)
```rust
fn main() {
  println!("{}", 5 + 3);
}
```
- [ ] Expected: "8"
- [ ] Status: PASSED

## Post-Deployment

### Monitor & Verify

#### Daily Checks
- [ ] Judge0 API status on RapidAPI dashboard
- [ ] No error logs in backend console
- [ ] Frontend users report successful runs
- [ ] Test execution times are reasonable

#### Weekly Checks
- [ ] API usage stays below free tier limits (100/month)
- [ ] No compilation errors in logs
- [ ] All language executions working
- [ ] User feedback is positive

#### Monthly Checks
- [ ] Review API usage patterns
- [ ] Plan for paid tier if needed
- [ ] Update documentation if needed
- [ ] Check Judge0 for updates

### Performance Monitoring

Log these metrics:
- [ ] Average execution time per test
- [ ] Success rate of submissions
- [ ] Error rates by language
- [ ] API response times

**Expected Metrics**:
- Average execution: 1-2 seconds for 3 tests
- Success rate: >95% for valid code
- API response time: <500ms per test

### Troubleshooting During Deployment

| Issue | Check | Solution |
|-------|-------|----------|
| 401 Unauthorized | API Key valid? | Re-verify key in .env |
| 429 Too Many Requests | Rate limit exceeded? | Upgrade RapidAPI plan |
| Timeout | Judge0 slow? | Check API status page |
| Wrong results | Test case format? | Verify input/output |
| Missing errors | Error capture? | Check error fields |

## Success Criteria

### ✅ All Tests Pass
- [ ] Simple code executes correctly
- [ ] Error detection works
- [ ] All languages supported
- [ ] Multiple test cases run
- [ ] Results display properly
- [ ] AI analysis provides feedback

### ✅ Performance Acceptable
- [ ] Single test: <500ms
- [ ] Multiple tests: 1-2 seconds
- [ ] No timeout errors
- [ ] Consistent execution times

### ✅ Error Handling Robust
- [ ] Compilation errors captured
- [ ] Runtime errors displayed
- [ ] Network errors handled gracefully
- [ ] User sees clear error messages

### ✅ User Experience Good
- [ ] Results display clearly
- [ ] Pass/fail status obvious
- [ ] Output comparison helpful
- [ ] AI hints are useful
- [ ] No crashes or hangs

## Rollback Plan

If issues occur, rollback steps:

1. Disable Judge0 endpoint (backend maintenance)
2. Revert `Frontend/CodeEditor.jsx` to original `runCode()`
3. Display message: "Run Code feature temporarily unavailable"
4. Investigate root cause
5. Fix and re-deploy

**Rollback time**: ~5 minutes

## Documentation for Users

Provide to users:
- [ ] `JUDGE0_QUICK_REFERENCE.md` - Quick start
- [ ] Error messages reference
- [ ] Supported languages list
- [ ] Example test cases

## Final Sign-Off

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Team trained and ready
- [ ] Monitoring in place
- [ ] Rollback plan ready
- [ ] **APPROVED FOR DEPLOYMENT** ✅

---

## Notes

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Notes**: _______________

---

**Once all checks are complete, Judge0 integration is ready for production!**
