# S3 Shop Upload Implementation

Shop product image uploads use AWS S3; returned URLs use CloudFront when configured.

## Env vars (required for S3)

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g. `ap-northeast-1`)
- `AWS_S3_BUCKET` (e.g. `fengshuifrontend`)
- `AWS_S3_CDN_URL` (optional; e.g. `https://d3cbeloe0vn1bb.cloudfront.net`) – when set, upload API returns CloudFront URL instead of direct S3 URL.

## Behavior

- **Upload** (`/api/shop/upload`): If S3 env is set, uploads to `s3://bucket/shop/product_xxx.jpg` and returns `AWS_S3_CDN_URL/shop/product_xxx.jpg` (or direct S3 URL if CDN not set). Otherwise falls back to local `public/images/shop/`.
- **Product delete**: If image URL is `https://...`, deletes from S3 by key. If URL is `/images/shop/...`, deletes from local filesystem.
- **Validation**: Allowed types JPEG/PNG/WebP/GIF; max 10 MB. MIME is inferred from file extension when browser sends wrong/empty type (e.g. PNG on Edge/Windows).

## Dependencies

- `@aws-sdk/client-s3`
