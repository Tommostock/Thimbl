# ✓ PassCheck — Password Strength Simulator

A free, educational mobile web app that simulates real-world password attacks to help users understand password security.

**Live Demo:** Deploy to Vercel (see instructions below)

---

## What It Does

1. You type a **test password** (not your real one)
2. The app analyses it instantly — entropy, character variety, pattern detection
3. Click **Simulate Attacks** to run three attack simulations:
   - 📖 **Dictionary Attack** — checks against common/breached passwords
   - 🔀 **Hybrid Attack** — dictionary words combined with numbers & symbols
   - 💻 **Brute Force** — calculates how long every combination would take
4. After simulation, an educational **Feedback Panel** explains why the password is weak or strong

Everything runs **100% in your browser**. No passwords are stored or transmitted anywhere.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Language | TypeScript |
| Hosting | Vercel (free) |

---

## Run Locally

### Option A — Open directly (no Node.js needed)
```
Coming soon: a standalone index.html build
```

### Option B — Full development server

**Prerequisites:** [Node.js 18+](https://nodejs.org) installed

```bash
# 1. Navigate to the project folder
cd "C:\Users\Tom\Desktop\Apps I Built\PassCheck"

# 2. Install dependencies (first time only — takes ~30 seconds)
npm install

# 3. Start the development server
npm run dev

# 4. Open your browser to:
#    http://localhost:3000
```

The app hot-reloads — any changes you save instantly appear in the browser.

---

## Deploy to Vercel (Free Hosting)

### Method 1: Drag & Drop (Easiest — no account setup needed)
1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. On the dashboard, drag the entire `Clavis` folder onto the page
3. Vercel detects it's a Next.js app automatically
4. Click **Deploy** — your app is live in ~60 seconds!
5. You get a free URL like: `clavis-xyz.vercel.app`

### Method 2: Via GitHub (Best for ongoing updates)
1. Create a free [GitHub](https://github.com) account
2. Create a new repository and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/clavis.git
   git push -u origin main
   ```
3. On [vercel.com](https://vercel.com), click **Add New Project**
4. Import your GitHub repository
5. Vercel auto-configures everything — click **Deploy**
6. Future pushes to GitHub automatically redeploy the app!

---

## Project Structure

```
Clavis/
├── app/
│   ├── layout.tsx       # HTML shell — fonts, PWA metadata, viewport
│   ├── page.tsx         # Main app page — holds top-level state
│   └── globals.css      # Tailwind setup + custom CSS variables
├── components/
│   ├── PasswordInput.tsx    # Input field with show/hide toggle
│   ├── StrengthMeter.tsx    # Animated colour bar + entropy stats
│   ├── AnalysisBadges.tsx   # Character variety chips + warnings
│   ├── AttackCard.tsx       # Individual attack simulation card
│   ├── AttackSimulator.tsx  # Runs all 3 attacks in sequence
│   └── FeedbackPanel.tsx    # Educational tips after simulation
├── lib/
│   ├── analyzer.ts      # Core password analysis (entropy, patterns)
│   ├── crackTime.ts     # Crack time maths for 4 scenarios
│   ├── wordlists.ts     # Embedded common passwords + word lists
│   └── attacks.ts       # Attack simulation animation logic
├── public/
│   └── manifest.json    # PWA config (Add to Home Screen)
├── package.json
├── next.config.js
├── tailwind.config.js
└── vercel.json
```

---

## How the Analysis Works

### Entropy
**Entropy** measures how unpredictable a password is, in bits.

```
entropy = length × log₂(charset_size)
```

- `charset_size` = how many different characters you use:
  - Lowercase only: 26
  - + Uppercase: 52
  - + Digits: 62
  - + Symbols: 94

**Example:** `password` (8 chars, lowercase only) → 8 × log₂(26) = **37.6 bits**
**Example:** `X#9mK!vQ` (8 chars, all types) → 8 × log₂(94) = **52.4 bits**

Higher bits = harder to crack. Aim for 60+ bits.

### Attack Types

| Attack | How it works | Cracks what |
|--------|-------------|-------------|
| Dictionary | Tests a list of common passwords | "password", "123456", "letmein" |
| Hybrid | Dictionary words + numbers/symbols | "dragon123", "summer!" |
| Brute Force | Every possible combination | Eventually anything — time varies |

---

## Privacy & Security

- ✅ No passwords are ever stored
- ✅ No network requests made during simulation
- ✅ Runs entirely in your browser
- ✅ Open source — inspect every line
- ✅ No accounts, no tracking, no ads

---

## Customising

**Want to add more common passwords?**
Edit `lib/wordlists.ts` → `COMMON_PASSWORDS[]`

**Want to change the theme?**
Edit `tailwind.config.js` → `colors` section and `app/globals.css` → `:root` variables

**Want to add a new attack type?**
Add a new function in `lib/attacks.ts` and a new card in `components/AttackSimulator.tsx`

---

## License
Free to use, share, and modify for educational purposes.
