# Admin Account - Quick Reference

## 🔑 Single Admin Account

**Username:** `harmoniqadmin`  
**Email:** `harmoniqadmin@harmoniq.com`  
**Password:** `harmoniq888`

---

## 🚀 Setup Instructions

### 1. Create the Admin Account

Run this command to create/update the admin account:

```bash
node scripts/make-admin.js
```

**Output:**
```
✅ Connected to MongoDB
✅ Admin account created successfully!

📝 Admin Account Details:
  Username: harmoniqadmin
  Email: harmoniqadmin@harmoniq.com
  Password: harmoniq888

🔐 Login URL: http://localhost:3000/zh-TW/auth/login
📊 Admin Panel: http://localhost:3000/zh-TW/admin/shop
```

### 2. Login to Admin Account

1. Visit: `http://localhost:3000/zh-TW/auth/login`
2. Click "使用電子郵件登入" (Email Login)
3. Enter:
   - **Email:** `harmoniqadmin@harmoniq.com`
   - **Password:** `harmoniq888`
4. Click "登入" (Login)

### 3. Access Admin Panel

After logging in, visit: `http://localhost:3000/zh-TW/admin/shop`

---

## ✅ What Has Been Implemented

### Single Admin Account System
- **Only one admin account:** `harmoniqadmin`
- **Hardcoded credentials** - no role system needed
- **Simple authentication check** - only this account can access admin features

### Protected Pages
- `/admin/shop` - Only accessible by harmoniqadmin account
- Redirects non-admin users to shop page with error message

### Protected API Endpoints
All product management APIs require harmoniqadmin authentication:
- **POST** `/api/shop/products` - Create product
- **PUT** `/api/shop/products/[productId]` - Update product  
- **DELETE** `/api/shop/products/[productId]` - Delete product

Returns `403 Forbidden` if accessed by any other account.

---

## 📊 MongoDB Product Storage

**Yes, all products are saved in MongoDB!**

### Product Collection Details:
- **Database:** Your MongoDB database (from `MONGODB_URI`)
- **Collection Name:** `products`
- **Schema:** Defined in [src/models/Product.js](../src/models/Product.js)

### What Gets Saved:
```javascript
{
  productId: "PROD-1234567890-abc123",
  name: { zh_TW: "...", zh_CN: "...", en: "..." },
  description: { zh_TW: "...", zh_CN: "..." },
  price: 488,
  currency: "HKD",
  category: "charm",
  elementType: "earth",
  stock: 50,
  images: ["https://..."],
  tags: ["財運", "開運"],
  benefits: ["招財進寶", "增強財運"],
  specifications: { material: "...", size: "...", weight: "..." },
  discount: { percentage: 20, validUntil: Date },
  isDigital: false,
  isFeatured: true,
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing the Admin System

1. **Create admin account:**
   ```bash
   node scripts/make-admin.js
   ```

2. **Login with admin credentials:**
   - Email: `harmoniqadmin@harmoniq.com`
   - Password: `harmoniq888`

3. **Access admin panel:**
   - Visit: `http://localhost:3000/zh-TW/admin/shop`
   - You should see the product management interface

4. **Add a product:**
   - Click "新增商品" button
   - Fill out the form
   - Submit to create product

5. **Verify in shop:**
   - Visit: `http://localhost:3000/zh-TW/shop`
   - Your product should appear

6. **Check MongoDB:**
   - Use MongoDB Compass or shell
   - Look in `products` collection
   - See your saved product data

---

## 🔒 Security Features

✅ **Single admin account** - Only harmoniqadmin can access admin features  
✅ **Protected routes** - Admin pages redirect unauthorized users  
✅ **API authentication** - All product CRUD requires admin login  
✅ **Password hashing** - bcryptjs encryption for security  
✅ **Session validation** - Uses NextAuth for secure sessions  

---

## 🛠️ Troubleshooting

**Problem:** Can't login with admin credentials  
**Solution:** Make sure you ran `node scripts/make-admin.js` first

**Problem:** "您沒有權限訪問此頁面" error  
**Solution:** Only the harmoniqadmin account can access admin panel

**Problem:** Regular users can't access shop  
**Solution:** Shop is public - only admin panel requires harmoniqadmin account

**Problem:** Forgot admin password  
**Solution:** Run `node scripts/make-admin.js` again to reset password to `harmoniq888`

---

## 📝 Quick Commands

```bash
# Create/reset admin account
node scripts/make-admin.js

# Seed demo products (after logging in as admin)
node scripts/seed-shop-data.js

# Check if admin exists in MongoDB
mongosh "your-mongodb-uri"
use your_database_name
db.users.findOne({ userId: "harmoniqadmin" })
```

---

## 🎯 Next Steps

1. ✅ Run `node scripts/make-admin.js`
2. ✅ Login at `/zh-TW/auth/login` with admin credentials
3. ✅ Access admin panel at `/zh-TW/admin/shop`
4. ✅ Add your first product
5. ✅ View it in the shop at `/zh-TW/shop`
6. ✅ Check MongoDB to see saved data
