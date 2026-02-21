# Price folder – image variants (CNY / HKD / TWD)

## File naming

Each report type has three image variants by currency:

- **`{type}-CNY.png`** – China (Simplified) / CNY (¥)
- **`{type}-HKD.png`** – Hong Kong / HKD (HK$)
- **`{type}-TWD.png`** – Taiwan / TWD (NT$)

Types: `fengshui`, `life`, `relationship`, `couple`, `wealth`, `health`, `career`.

## What the images show

Each image shows:

- **Original price** (strikethrough) and **discount price** (prominent), in the currency for that variant.
- The numbers are drawn in the image, so they must match the prices shown on the site for that region.

## Display prices (for reference)

These are the values used in the app (see `src/utils/regionalPricing.js` → `getDisplayPrices`) so the **report-preview** and **price** pages show the same as the images:

| Report type   | CNY (¥)      | HKD (HK$)    | TWD (NT$)    |
|---------------|--------------|--------------|--------------|
| fengshui      | 188 / 388    | 188 / 388    | 740 / 1540   |
| life          | 88 / 168     | 88 / 168     | 340 / 660    |
| relationship  | 38 / 88      | 38 / 88      | 150 / 300    |
| couple        | 88 / 188     | 88 / 188     | 340 / 680    |
| wealth        | 38 / 88      | 38 / 88      | 150 / 300    |
| health        | 38 / 88      | 38 / 88      | 150 / 300    |
| career        | 38 / 88      | 38 / 88      | 150 / 300    |

(Format: discount / original.)

When the user’s region is **China**, **Hong Kong**, or **Taiwan**, the report-preview page uses these values and the correct symbol (¥, HK$, NT$) so the UI matches the corresponding -CNY, -HKD, or -TWD images.
