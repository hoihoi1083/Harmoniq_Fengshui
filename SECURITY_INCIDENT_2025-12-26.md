# Security Incident Report - Malicious Code Injection

**Date:** December 26, 2025  
**Severity:** CRITICAL  
**Status:** RESOLVED

## Summary
Malicious obfuscated JavaScript code was discovered in `next.config.js` that was hijacking HTTP responses and returning 403 Forbidden errors to API requests.

## Timeline

1. **10:19 UTC** - User reported "AI not responding" in chatbot
2. **Investigation** - Server logs showed AI API working correctly, but browser console showed 403 errors
3. **Root Cause Found** - Discovered 27KB obfuscated malicious code in `next.config.js`
4. **10:28 UTC** - Removed malicious file, restored clean configuration, rebuilt application
5. **10:29 UTC** - AI responses confirmed working

## Technical Details

### Malicious Code Location
- **File:** `next.config.js`
- **Size:** 27,108 bytes (vs clean config: 546 bytes)
- **Type:** Obfuscated JavaScript with eval() statements

### Attack Mechanism
The malicious code:
1. Hijacked `http.ServerResponse.prototype` methods: `writeHead`, `write`, `end`, `setHeader`
2. Intercepted all HTTP responses at Node.js level
3. Evaluated arbitrary code via `eval()` statements
4. Returned 403 status codes based on specific conditions
5. Manipulated response headers and content

### Why Direct Server Tests Worked
- `curl` tests bypassed the Next.js layer where the malware resided
- Browser requests went through Next.js and were intercepted by hijacked response methods
- This created confusion as the API backend was functional

## Evidence

### Malicious Code Snippet
```javascript
const _0x51fc41=_0x1d50a2[_0xf9fa0d(0xd3)][_0xf9fa0d(0xfa)],
_0x217a77=_0x51fc41[_0xf9fa0d(0x11f)]||_0x51fc41[_0xf9fa0d(0xf5)],
_0x11e60f=_0x51fc41[_0xf9fa0d(0x119)]||_0x51fc41[_0xf9fa0d(0x10c)],
_0x1a9568=_0x51fc41[_0xf9fa0d(0x102)]||_0x51fc41[_0xf9fa0d(0xd8)],
// ... intercepts and overrides response methods
```

### Browser Error Observed
```
Failed to load resource: the server responded with a status of 403 () (smart-chat2, line 0)
SyntaxError: The string did not match the expected pattern
```

## Resolution

1. **Removed malicious file:**
   ```bash
   rm ./fengshui-layout/next.config.js
   ```

2. **Restored clean configuration** (CommonJS format):
   ```javascript
   const createNextIntlPlugin = require('next-intl/plugin');
   const nextConfig = { /* clean config */ };
   module.exports = withNextIntl(nextConfig);
   ```

3. **Rebuilt application:**
   ```bash
   pnpm build
   pm2 restart fengshui-app
   ```

4. **Verified functionality:** AI responses working correctly

## Backup Files
- **Malicious file removed:** Previously at `next.config.js` (27KB)
- **Clean backup:** `next.config.ts.backup` (762 bytes)
- **Current clean config:** `next.config.js` (546 bytes)

## Recommendations

### Immediate Actions (Done)
- ✅ Removed malicious code
- ✅ Restored clean configuration
- ✅ Restarted application

### Follow-up Security Measures

1. **File Integrity Monitoring**
   - Set up file integrity monitoring for critical config files
   - Alert on unexpected changes to `next.config.js`, `package.json`, etc.

2. **Access Control Review**
   - Review who has write access to production server
   - Audit recent SSH/deployment activities
   - Check for unauthorized access in `/var/log/secure`

3. **Code Review**
   - Scan all JavaScript files for similar obfuscated code:
     ```bash
     grep -r "_0x[0-9a-f]\{6\}" .
     grep -r "eval(" . --include="*.js"
     ```

4. **Deployment Process**
   - Implement code signing for deployments
   - Use read-only file systems where possible
   - Add checksum verification for critical files

5. **Monitoring**
   - Set up alerts for unexpected 403 responses
   - Monitor for eval() usage in production logs
   - Track config file modifications

## Investigation Questions

1. **How was the malicious code injected?**
   - Check Git history: `git log next.config.js`
   - Review deployment logs
   - Check for compromised CI/CD pipeline

2. **When was it injected?**
   - File timestamp: `ls -la next.config.js`
   - Git blame analysis
   - Server access logs correlation

3. **Who had access?**
   - Review SSH logs: `/var/log/secure`
   - Check deployment credentials
   - Audit team access permissions

## Lessons Learned

1. **Always investigate root cause first** - Initial attempt to add CORS headers was premature
2. **Test at multiple layers** - curl working but browser failing indicated middleware issue
3. **Suspicious file sizes** - 27KB config file vs 546 bytes clean version was a red flag
4. **Obfuscation = malicious** - No legitimate reason for obfuscated code in config files

## Contact
If you have information about this incident or discover similar issues, please contact the security team immediately.

---
*Report generated: 2025-12-26*
*Incident resolved: YES*
*Production impact: Temporary API 403 errors*
