# Image Upload Workaround for Production

## Issue
Next.js in production mode caches the public folder at build/startup time. New images uploaded after the server starts won't be served until PM2 is restarted.

## Root Cause
- Server runs custom `server.js` from root directory
- Next.js serves public files from `/public/` folder
- Next.js caches public folder contents on startup
- New files added to `/public/images/shop/` after startup return 404

## Temporary Solution
After uploading new product images, restart PM2:

```bash
ssh fs 'pm2 restart fengshui-app'
```

This takes ~3 seconds and makes new images immediately accessible.

## Permanent Solutions (Choose One)

### Option 1: Auto-restart after upload (Recommended)
Modify the upload API to trigger PM2 graceful reload:

```javascript
// After saving file, trigger PM2 reload
const { exec } = require('child_process');
exec('pm2 reload fengshui-app --update-env', (error) => {
  if (error) console.error('PM2 reload failed:', error);
});
```

### Option 2: Store images in a CDN/S3
- Upload to AWS S3 or CloudFront instead of local filesystem
- Images immediately accessible without server restart
- Better for scalability and performance

### Option 3: Use unoptimized images
Add `unoptimized={true}` to Image components for shop images:

```jsx
<Image 
  src={product.images[0]} 
  unoptimized={true}
  // ... other props
/>
```

This bypasses Next.js image optimization and serves files directly.

### Option 4: Separate static file server
- Run a separate nginx or simple HTTP server for `/public/images/shop/`
- Configure Next.js to proxy image requests to static server
- No restart needed for new files

## Current Status
- Upload route: Saves to `/home/ec2-user/fengshui-layout/public/images/shop/`
- Images accessible after: PM2 restart (manual)
- Existing images: Work fine (loaded at startup)
- New images: Require restart to become accessible
