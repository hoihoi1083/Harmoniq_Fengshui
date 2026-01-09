# Quick Testing Guide - Category Filters

## How to Test

### 1. Navigate to Category Pages
Visit these URLs to test different categories:
- `http://localhost:3000/zh-TW/shop/earring`
- `http://localhost:3000/zh-TW/shop/bracelet`
- `http://localhost:3000/zh-TW/shop/necklace`
- `http://localhost:3000/zh-TW/shop/ring`
- `http://localhost:3000/zh-TW/shop/pendant`
- `http://localhost:3000/zh-TW/shop/feng-shui`

### 2. Test Product Type Filter
1. Click any product type in sidebar (耳飾, 手串, 項鏈, etc.)
2. **Expected:** Products filter instantly to show only that type
3. **Indicator:** Selected type turns green (#8B9F3A)
4. Click "全部" to clear
5. **Expected:** All products show again

### 3. Test Element Filter (五行)
1. Click any element (🔆金, 🌳木, 💧水, 🔥火, ⛰️土)
2. **Expected:** Products filter to show only that element
3. **Indicator:** Selected element turns green
4. Click "全部" to clear

### 4. Test Price Range Filter
1. Try preset ranges ($0-$100, $100-$300, etc.)
2. **Expected:** Products within that range show
3. **Indicator:** Active range has green background
4. Try custom values in the input fields
5. **Expected:** Products filter as you type

### 5. Test Combined Filters
1. Select product type: "手串"
2. Select element: "🔆金"
3. Select price range: "$100-$300"
4. **Expected:** Only products matching ALL three criteria show
5. **Counter:** Top of sidebar shows "3 個篩選器"

### 6. Test Clear Filters
1. Apply multiple filters
2. Click "清除全部" button
3. **Expected:** All filters reset, all products show again

### 7. Test Sorting
1. Apply some filters
2. Change sort dropdown:
   - Most Popular (最受歡迎)
   - Price: Low to High (價格：低至高)
   - Price: High to Low (價格：高至低)
   - Newest (最新上架)
3. **Expected:** Filtered products re-sort instantly

### 8. Verify Real Data
**Check that NO mock data appears:**
- ❌ No "黄水晶海蓝宝月光石手串" (mock product name)
- ✅ Real product names from database
- ✅ Real product images
- ✅ Real prices
- ✅ Real ratings

### 9. Test Loading State
1. Refresh page
2. **Expected:** Spinner shows while loading
3. **Expected:** Products appear after loading

### 10. Test Empty State
1. Apply very restrictive filters that match nothing
2. **Expected:** Sparkles icon with "暫無商品" message

## What to Look For

### ✅ Success Indicators
- Products change instantly when filters clicked
- Active filters highlighted in green
- Filter counter shows correct number
- Product count updates in header
- No mock data visible
- Images load correctly
- Prices display correctly
- Ratings render properly

### ❌ Issues to Report
- Products don't filter when clicking sidebar
- Mock data still visible
- Filters don't clear when clicking "全部"
- Product count doesn't match displayed items
- Images broken or missing
- Console errors

## Browser Console Check

Open DevTools (F12) and check:

### Network Tab
```
GET /api/shop/products?limit=100
Status: 200 OK
Response: { success: true, data: { products: [...] } }
```

### Console Tab
Should see NO errors like:
- ❌ "Cannot read property 'name' of undefined"
- ❌ "product.images is not iterable"
- ❌ "Invalid date"

## Mobile Testing

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or Android device
4. **Test:**
   - Sidebar appears at top
   - Products stack in 1 column
   - Filters still work
   - Touch interactions smooth

## Performance Check

### Expected Behavior
- Filter changes: **Instant** (<50ms)
- Page load: **Fast** (<2s)
- Smooth scrolling: **Yes**
- No UI freezing: **Yes**

### If Slow
- Check product count (should be <100)
- Check image sizes (should be optimized)
- Check console for errors

## Common Issues & Solutions

### Issue: No products show
**Solution:** Check API is running and returning data

### Issue: Filters don't work
**Solution:** Check browser console for JavaScript errors

### Issue: Wrong products shown
**Solution:** Check category matching logic in fetchProducts()

### Issue: Images broken
**Solution:** Check image URLs in database products

### Issue: Filters apply but counter doesn't update
**Solution:** Check activeFilterCount calculation

## Quick Debug Commands

Open browser console and run:

```javascript
// Check filtered products
console.log('Filtered:', filteredProducts.length);

// Check all products
console.log('All:', allProducts.length);

// Check active filters
console.log('Filters:', { selectedProductType, selectedElement, minPrice, maxPrice });
```

## Test Coverage

- [x] Category filtering (URL-based)
- [x] Product type filtering (sidebar)
- [x] Element type filtering (sidebar)
- [x] Price range filtering (sidebar)
- [x] Combined filters (multiple active)
- [x] Clear individual filters
- [x] Clear all filters
- [x] Sorting
- [x] Real data display
- [x] Loading states
- [x] Empty states
- [x] Mobile responsive

## Ready to Test!

1. Save all files
2. Make sure dev server is running: `npm run dev`
3. Navigate to `http://localhost:3000/zh-TW/shop/categories`
4. Click any category card
5. Start testing filters!
