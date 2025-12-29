# 🚨 Alert System - Email Not Working Issue

## ❌ Problem: Emails Not Arriving

**Root Cause:** AWS EC2 blocks outbound SMTP (port 25) by default to prevent spam.  
This is why `mail` command succeeds but emails never arrive.

## ✅ Solution Options (Choose One)

### **Option 1: Telegram Bot (RECOMMENDED) ⚡**
**Pros:** Instant, reliable, free, works on EC2  
**Setup Time:** 5 minutes

#### Steps:
1. **Create Telegram Bot:**
   - Open Telegram app
   - Search for `@BotFather`
   - Send: `/newbot`
   - Follow prompts, get your `BOT_TOKEN`

2. **Get Your Chat ID:**
   - Search for `@userinfobot` in Telegram
   - Send: `/start`
   - Copy your chat ID number

3. **Configure Script:**
```bash
# Edit the file on server
ssh fs "nano ~/fengshui-layout/send-alert-telegram.sh"

# Replace these lines:
TELEGRAM_BOT_TOKEN="YOUR_ACTUAL_BOT_TOKEN"
TELEGRAM_CHAT_ID="YOUR_ACTUAL_CHAT_ID"
```

4. **Update Alert Scripts:**
```bash
ssh fs "cd ~/fengshui-layout && 
  sed -i 's/send-alert-email.sh/send-alert-telegram.sh/g' file-integrity-monitor.sh &&
  sed -i 's/send-alert-email.sh/send-alert-telegram.sh/g' security-audit.sh &&
  sed -i 's/send-alert-email.sh/send-alert-telegram.sh/g' server-health-check.sh"
```

5. **Test:**
```bash
ssh fs "cd ~/fengshui-layout && ./send-alert-telegram.sh 'Test' 'Testing alerts!'"
```

---

### **Option 2: AWS SES (Email via AWS) 📧**
**Pros:** Proper email delivery  
**Cost:** Free tier: 62,000 emails/month  
**Setup Time:** 15-20 minutes

#### Steps:
1. Go to AWS Console → SES (Simple Email Service)
2. Verify your email: hoihoi1083@gmail.com
3. Create SMTP credentials
4. Configure server with SMTP relay
5. Request production access (by default in sandbox mode)

#### Detailed Commands:
```bash
# Install packages
ssh fs "sudo yum install postfix cyrus-sasl-plain -y"

# Configure postfix with SES SMTP
ssh fs "sudo nano /etc/postfix/main.cf"
# Add:
relayhost = [email-smtp.us-east-1.amazonaws.com]:587
smtp_sasl_auth_enable = yes
smtp_sasl_security_options = noanonymous
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_use_tls = yes
smtp_tls_security_level = encrypt

# Add SMTP credentials
ssh fs "sudo nano /etc/postfix/sasl_passwd"
# Add:
[email-smtp.us-east-1.amazonaws.com]:587 YOUR_SMTP_USERNAME:YOUR_SMTP_PASSWORD

# Apply
ssh fs "sudo postmap /etc/postfix/sasl_passwd &&
        sudo chmod 600 /etc/postfix/sasl_passwd* &&
        sudo systemctl restart postfix"
```

---

### **Option 3: Ntfy.sh Push Notifications 📱**
**Pros:** Free, no signup, works instantly  
**Setup Time:** 2 minutes

#### Already Created! Just use it:
```bash
# Deploy ntfy script
chmod +x send-alert-ntfy.sh
scp send-alert-ntfy.sh fs:~/fengshui-layout/send-alert-email.sh

# Test
ssh fs "cd ~/fengshui-layout && ./send-alert-email.sh 'Test' 'Testing!'"

# Install ntfy app on your phone:
# - iOS: https://apps.apple.com/app/ntfy/id1625396347
# - Android: https://play.google.com/store/apps/details?id=io.heckel.ntfy

# Subscribe to your topic (get topic name from test output)
```

---

### **Option 4: Log File Only (Current Fallback) 📝**
**Pros:** Always works, no configuration  
**Cons:** You must manually check logs

#### Current Status:
Alerts are being logged to: `~/fengshui-layout/logs/critical-alerts.log`

#### Check alerts:
```bash
ssh fs "tail -50 ~/fengshui-layout/logs/critical-alerts.log"
```

---

## 🎯 My Recommendation

**Use Telegram Bot** - It's the easiest and most reliable for your use case:
- ✅ Instant notifications on your phone
- ✅ Works perfectly with AWS EC2
- ✅ Free forever
- ✅ 5-minute setup
- ✅ No AWS configuration needed

## 📊 Current Alert Setup

Right now, alerts are:
- ✓ Being detected by scripts
- ✓ Being logged to files
- ✗ NOT reaching your email (due to AWS SMTP blocking)

**To receive actual notifications, you must choose one of the options above.**

## 🔧 Quick Setup Commands

### For Telegram (after getting bot token):
```bash
# 1. Upload configured script
scp send-alert-telegram.sh fs:~/fengshui-layout/send-alert-email.sh

# 2. Update monitoring scripts  
ssh fs "cd ~/fengshui-layout && chmod +x send-alert-email.sh"

# 3. Test
ssh fs "cd ~/fengshui-layout && ./send-alert-email.sh 'Test Alert' 'If you see this in Telegram, alerts are working!'"
```

### For ntfy.sh (no configuration needed):
```bash
# Deploy and test
chmod +x send-alert-ntfy.sh
scp send-alert-ntfy.sh fs:~/fengshui-layout/send-alert-email.sh
ssh fs "cd ~/fengshui-layout && ./send-alert-email.sh 'Test' 'Testing ntfy alerts'"

# Install ntfy app, subscribe to the topic shown in output
```

---

## ❓ Which Should You Choose?

- **Want instant phone notifications?** → Telegram Bot
- **Must have email delivery?** → AWS SES  
- **Want zero configuration?** → ntfy.sh
- **Don't want notifications?** → Keep current log-only setup

Let me know which option you prefer and I'll help you set it up! 🚀
