# Murimi App - Readiness Guide 🚜

Follow these steps to get your app "Demo Ready" on a physical phone within minutes.

## 1. Local Database Setup (PostgreSQL)
Ensure PostgreSQL is running on your PC. You need a database named `murimi`.

```bash
# 1. Create the database (if not already done)
cd backend
npm install
npm run seed
```

## 2. Connect Your Phone to Your PC
Since you're demoing on a mobile phone, it needs to be able to talk to your computer.

1. Connect your phone and PC to the **same Wi-Fi network**.
2. Run this script I created in the `mobile-app` folder:
   ```bash
   cd mobile-app
   node update-ip.js
   ```
   *This automatically detects your IP and updates the app's backend link.*

## 3. Launch the Backend
```bash
cd backend
npm run dev
```
*Keep this terminal open during your demo.*

## 4. Launch the Mobile App
```bash
cd mobile-app
npm install
npm start
```
*Scan the QR code with the **Expo Go** app on your phone.*

---

### 🚨 Critical Success Factors:
- **Gemini API Key**: Your `.env` already has a key, but ensure it hasn't expired!
- **PostGIS**: The schema requires the PostGIS extension. Ensure it's active in your PostgreSQL install.
- **Firewall**: If the phone can't connect, ensure your PC firewall allows traffic on port `3001`.
