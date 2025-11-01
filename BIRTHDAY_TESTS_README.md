# 🎂 Birthday Memorization Feature - Test Suite

This directory contains comprehensive tests for the birthday memorization feature.

## 📋 Test Files

### 1. `test-birthday-db-only.js` (Recommended)

**Direct database testing without server**

Tests database operations directly:

- ✅ Saving birthday with `birthdayConfirmed = true`
- ✅ Querying for saved birthday
- ✅ Updating to new birthday
- ✅ Verifying birthday is passed to analysis
- ✅ Checking `birthdayConfirmed` filter works correctly

**How to run:**

```bash
node test-birthday-db-only.js
```

**Requirements:**

- MongoDB connection string in `.env` file
- `MONGODB_URI` environment variable set

---

### 2. `test-birthday-memorization.js`

**Full end-to-end testing with running server**

Tests complete user flow via API calls:

- ✅ First-time user saves birthday
- ✅ Returning user sees saved birthday confirmation
- ✅ User chooses "1" (use saved birthday) - analysis generated
- ✅ User chooses "2" (enter new birthday) - new birthday saved
- ✅ New birthday persists in subsequent sessions

**How to run:**

```bash
# 1. Start your Next.js server in another terminal
npm run dev

# 2. In a new terminal, run the test
node test-birthday-memorization.js
```

**Requirements:**

- Server must be running on `http://localhost:3000`
- MongoDB connection active
- All API endpoints functional

---

## 🧪 What Each Test Verifies

### Test Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ TEST 1: First Time User - Save Birthday                    │
├─────────────────────────────────────────────────────────────┤
│ User: "我想測財運"                                           │
│   → System asks for birthday                                │
│ User: "1999-03-15"                                          │
│   → System saves to DB with birthdayConfirmed = true       │
│   → System generates analysis                               │
│                                                             │
│ ✅ Verify: userBirthday saved                               │
│ ✅ Verify: birthdayConfirmed = true                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TEST 2: Returning User - Detect Saved Birthday             │
├─────────────────────────────────────────────────────────────┤
│ User: "我想測工作" (new session, same email/userId)         │
│   → System queries DB                                       │
│   → Finds saved birthday: 1999-03-15                        │
│   → Shows confirmation message with two options:            │
│      1️⃣ Use this birthday                                  │
│      2️⃣ Enter new birthday                                 │
│                                                             │
│ ✅ Verify: Response includes "1999", "3", "15"              │
│ ✅ Verify: Response includes options "1️⃣" and "2️⃣"         │
│ ✅ Verify: conversationState = "birthday_collection"        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TEST 3: User Chooses "1" - Use Saved Birthday              │
├─────────────────────────────────────────────────────────────┤
│ User: "1"                                                   │
│   → System retrieves saved birthday (1999-03-15)            │
│   → Generates work analysis using that birthday             │
│   → Updates state to asking_detailed_report                 │
│                                                             │
│ ✅ Verify: Analysis generated (response length > 100)       │
│ ✅ Verify: Analysis about "工作" topic                       │
│ ✅ Verify: conversationState = "asking_detailed_report"     │
│ ✅ Verify: Birthday unchanged (still 1999-03-15)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TEST 4A: User Chooses "2" - Request New Birthday           │
├─────────────────────────────────────────────────────────────┤
│ User: "我想測健康"                                           │
│   → System shows birthday confirmation                      │
│ User: "2"                                                   │
│   → System asks for new birthday                            │
│   → Shows format examples                                   │
│                                                             │
│ ✅ Verify: Response asks for birthday                       │
│ ✅ Verify: Mentions "新" or "其他"                           │
│ ✅ Verify: Shows format examples                            │
│ ✅ Verify: conversationState = "birthday_collection"        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TEST 4B: Save New Birthday & Generate Analysis             │
├─────────────────────────────────────────────────────────────┤
│ User: "2000-05-20"                                          │
│   → System saves new birthday                               │
│   → Sets birthdayConfirmed = true                           │
│   → Generates health analysis                               │
│                                                             │
│ ✅ Verify: New birthday saved (2000-05-20)                  │
│ ✅ Verify: birthdayConfirmed = true                         │
│ ✅ Verify: Analysis generated about "健康"                   │
│ ✅ Verify: conversationState = "asking_detailed_report"     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TEST 5: Verify New Birthday Persisted                      │
├─────────────────────────────────────────────────────────────┤
│ User: "我想測學業" (new session)                             │
│   → System queries DB                                       │
│   → Finds NEW birthday: 2000-05-20                          │
│   → Shows confirmation with NEW birthday                    │
│                                                             │
│ ✅ Verify: Response includes "2000", "5", "20"              │
│ ✅ Verify: Does NOT include old date "1999"                 │
│ ✅ Verify: Shows confirmation options                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Database Queries Being Tested

### Query Pattern (from helper function)

```javascript
await SmartUserIntent.findOne({
	$or: [{ userEmail: userEmail }, { userId: userId }],
	userBirthday: { $exists: true, $ne: null },
	birthdayConfirmed: true, // ← Critical filter
}).sort({ updatedAt: -1 }); // ← Get most recent
```

### Fields Being Verified

```javascript
{
    userBirthday: Date,           // The actual birthday
    birthdayConfirmed: Boolean,   // Must be true
    primaryConcern: String,       // Topic (e.g., "財運", "工作")
    conversationState: String,    // Current state
    userEmail: String,            // For cross-session lookup
    userId: String,               // Alternative lookup
    updatedAt: Date              // For sorting (most recent first)
}
```

---

## 📊 Expected Test Results

### All Tests Pass ✅

```
🎉 ALL TESTS PASSED! (6/6)

✅ TEST 1: First Time User - Save Birthday
✅ TEST 2: Returning User - Detect Saved Birthday
✅ TEST 3: User Chooses "1" - Use Saved Birthday
✅ TEST 4A: User Chooses "2" - Request New Birthday
✅ TEST 4B: Save New Birthday & Generate Analysis
✅ TEST 5: Verify New Birthday Persisted
```

### If Tests Fail ❌

Check:

1. MongoDB connection string is correct
2. SmartUserIntent model has `birthdayConfirmed` field
3. Helper function `checkSavedBirthdayAndGenerateMessage()` exists
4. Birthday saving logic includes `birthdayConfirmed = true`
5. `await userIntent.save()` is called after setting birthday

---

## 🐛 Debugging Tips

### Enable Detailed Logging

The tests include colored output showing:

- 🧪 Test descriptions (yellow)
- ✅ Successful checks (green)
- ❌ Failed checks (red)
- 📊 Data values (blue)
- ℹ️ Info messages (cyan)

### Common Issues

**Issue 1: "locale is not defined"**

```
Solution: Ensure detectTopicAndBirthday(message, locale)
receives locale parameter
```

**Issue 2: Birthday not saved**

```
Solution: Check isBirthdayInput flow includes:
- userIntent.userBirthday = new Date(standardDate)
- userIntent.birthdayConfirmed = true
- await userIntent.save()
```

**Issue 3: Old birthday shown instead of new**

```
Solution: Verify query sorts by updatedAt: -1 (most recent first)
```

---

## 🎯 Test Coverage

| Scenario                                       | Covered |
| ---------------------------------------------- | ------- |
| First-time user saves birthday                 | ✅      |
| Birthday saved with `birthdayConfirmed = true` | ✅      |
| Returning user sees saved birthday             | ✅      |
| User chooses option "1" (use saved)            | ✅      |
| Analysis uses correct birthday                 | ✅      |
| User chooses option "2" (new birthday)         | ✅      |
| New birthday replaces old                      | ✅      |
| New birthday persists in next session          | ✅      |
| Query filters by `birthdayConfirmed`           | ✅      |
| Cross-session lookup by email/userId           | ✅      |

---

## 🚀 Quick Start

**Option 1: Database-only test (Fastest)**

```bash
node test-birthday-db-only.js
```

**Option 2: Full integration test**

```bash
# Terminal 1
npm run dev

# Terminal 2
node test-birthday-memorization.js
```

---

## 📝 Manual Testing Checklist

If you prefer manual testing:

1. **First Session**

    - [ ] Type: "我想測財運"
    - [ ] System asks for birthday
    - [ ] Type: "1999/3/15"
    - [ ] Check database: `birthdayConfirmed` should be `true`

2. **Second Session (same user)**

    - [ ] Type: "我想測工作"
    - [ ] System shows: "你上次的生日是：1999年3月15日"
    - [ ] System shows options: "1️⃣ 使用這個生日" and "2️⃣ 我想使用其他生日"

3. **Choose Option 1**

    - [ ] Type: "1"
    - [ ] System generates work analysis
    - [ ] No need to re-enter birthday

4. **Choose Option 2 (new session)**

    - [ ] Type: "我想測健康"
    - [ ] Type: "2"
    - [ ] System asks for new birthday
    - [ ] Type: "2000/5/20"
    - [ ] Check database: new birthday saved with `birthdayConfirmed = true`

5. **Verify Persistence**
    - [ ] Start new session
    - [ ] Type: "我想測學業"
    - [ ] System should show NEW birthday (2000-05-20)
    - [ ] Should NOT show old birthday (1999-03-15)

---

## 📧 Test User Cleanup

To remove test data:

```javascript
// In MongoDB shell or via script
db.smartuserintents.deleteMany({
	userEmail: "test-birthday-memorization@test.com",
});
```

The test scripts automatically clean up after completion.

---

## ✅ Success Criteria

All tests pass when:

1. Birthday is saved to database with `birthdayConfirmed = true`
2. Saved birthday is detected in new sessions
3. User can choose to use saved birthday (option "1")
4. User can choose to enter new birthday (option "2")
5. New birthday replaces old and persists
6. Analysis correctly uses the selected birthday

---

**Last Updated:** 2025-10-27
**Test Suite Version:** 1.0
**Feature:** Birthday Memorization
