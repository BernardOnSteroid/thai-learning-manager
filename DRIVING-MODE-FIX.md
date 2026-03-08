# Driving Mode Troubleshooting Guide

## Issue: "Nothing to review" message

### Root Cause:
When you first register, you have no learning progress yet:
- **Recently Learned**: Empty (you haven't learned any words yet)
- **Due for Review**: Empty (no words to review yet)
- **Random Words**: Should work but may show this message

### Solution: Learn Some Words First!

Before using Driving Mode effectively, you need to:

1. **Browse the vocabulary**:
   - Click "Browse" in the top menu
   - You'll see 51 Thai words

2. **Start learning some words**:
   - Click "Learn" in the top menu
   - Study 5-10 words
   - This adds them to your learning progress

3. **Then use Driving Mode**:
   - **Recently Learned**: Reviews the words you just learned
   - **Due for Review**: Will work after you've practiced words
   - **Random Words**: Picks from all 51 available words

### Quick Test of Random Mode:

The Random mode should work even without progress. If it shows "Nothing to review", try:

1. **Check browser console** (F12)
2. Look for error messages when clicking Play
3. The API should return 51 entries

### Expected Behavior:

**First Time User** (Fresh account):
- ✅ **Random Words**: Should work (picks from 51 entries)
- ❌ **Recently Learned**: Empty (nothing learned yet)
- ❌ **Due for Review**: Empty (nothing to review yet)

**After Learning 10 Words**:
- ✅ **Random Words**: Works
- ✅ **Recently Learned**: Shows your 10 words
- ⏳ **Due for Review**: Works after review schedule kicks in

### Workaround for Testing:

To test Driving Mode immediately with Random mode:

1. Open browser console (F12)
2. Paste this to test the API:
```javascript
const token = localStorage.getItem('token');
fetch('/api/entries/random?limit=5', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Random entries:', d));
```

This should return 5 random Thai words. If it works, Driving Mode should work too!

### Alternative: Browse Mode

If Driving Mode isn't working, you can still:
- **Browse all 51 words** manually
- **Click 🔊 Listen** on each word to hear pronunciation
- **Learn words** individually using the Learn feature

---

**Status**: This is expected behavior for new users. Learn some words first, then Driving Mode becomes much more useful!
