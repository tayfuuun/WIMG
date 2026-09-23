# 💰 WIMG — Wo ist mein Geld?

**WIMG** (*Wo ist mein Geld?* / *Where is my money?*) is a comprehensive, privacy-first personal finance dashboard and wealth management application built with React, TypeScript, and Tailwind CSS. It empowers you to take full control of your finances, investments, debts, energy costs, and household budgeting in one unified, elegant interface.

<img width="1511" height="1270" alt="WIMG" src="https://github.com/user-attachments/assets/87f7191d-88f4-4077-ad07-5695b082521e" />

### ✨ Key Features
- **Financial Cockpit**: Real-time overview of your net worth, monthly cash flow, asset allocation, and financial health metrics.
- **Income & Expense Management**: Categorize and track recurring fixed costs, subscriptions, and multiple income streams.
- **Credit & Debt Tracker**: Monitor loans, annuity mortgages, bullet loans (*endfällige Darlehen*), and building society savings (*Bausparverträge*) with amortization schedules.
- **Portfolio & Investment Tracker**: Track stocks, ETFs, crypto, and cash reserves. Includes asset allocation charts and performance tracking.
- **Energy Consumption Log**: Track electricity and gas meter readings, annual costs, and provider details.
- **Salary History & Milestone Tracker**: Log your career progression, gross/net earnings, and professional milestones over the years.
- **Data Privacy & Local Backup**: Fully client-side architecture with easy JSON export/import functionality. No third-party data tracking. 

### 🚀 Tech Stack
- **Frontend**: React 18+, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts & D3
- **Icons**: Lucide React

---

### 💻 Local Setup & Hosting Guide

Follow these steps to run **WIMG** locally on your machine or self-host it on a local server.

#### 🛠️ Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher): [Download Node.js](https://nodejs.org/)
- **npm** (comes bundled with Node.js) or **pnpm** / **yarn**
- **Git** (optional, for cloning the repository)

---

#### 📥 Step 1: Download or Clone the Repository

**Option A — Using Git (Recommended):**
Open your terminal and run:
```bash
git clone https://github.com/YOUR_USERNAME/wimg.git
cd wimg
```

**Option B — Download ZIP:**
1. Go to the GitHub repository page.
2. Click on the green **Code** button and select **Download ZIP**.
3. Extract the ZIP archive on your computer and navigate into the extracted folder using your terminal:
```bash
cd wimg-main
```

---

#### 📦 Step 2: Install Dependencies

Run the following command in your terminal to install all required packages:
```bash
npm install
```

---

#### 🏃 Step 3: Run the Local Development Server

Start the local Vite development server by running:
```bash
npm run dev
```

Once the server starts, you will see output similar to this:
```text
  VITE v5.x.x  ready in 350 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open your browser and navigate to **`http://localhost:3000`** (or the port displayed in your terminal) to use the application!

---

#### 🏗️ Step 4: Build for Production / Local Hosting

If you want to build the optimized production files or host it on your local home network (e.g., on a Raspberry Pi or wall-mounted tablet server):

1. **Build the production bundle:**
   ```bash
   npm run build
   ```
   This generates a static build in the `dist/` directory.

2. **Preview or serve locally:**
   ```bash
   npm run preview
   ```
   Alternatively, you can serve the `dist/` folder using any static web server like `npx serve dist` or Nginx / Caddy.

---

#### 🔐 Data Privacy & Backup Note
- **100% Offline & Private**: All financial data entered into WIMG stays strictly inside your browser's `localStorage`. No data is ever transmitted to external servers.
- **Backup & Sync**: Use the **JSON Export** button in the app navigation to download a complete backup file, and use **JSON Import** to restore or transfer your data across devices.

---

### ⏳ How much time & effort did it take?
If I add up all the late nights, refactoring sessions, UI polishing, bug fixing, and wiring up all the financial calculators (loan schedules, portfolio allocations, and responsive tablet layouts), I've easily poured around 60 to 80+ hours of focused development time into this project over the past few weeks. It genuinely became a labor of love to get it clean, fast, and wife-approved!

### 🔗 Links & Live Demo
Live Demo: [Click here to test the live app!](https://wimg-khaki.vercel.app/)

### 💻 Local Setup & Hosting Guide

Follow these steps to run **WIMG** locally on your machine or self-host it on a local server.

#### 🛠️ Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher): [Download Node.js](https://nodejs.org/)
- **npm** (comes bundled with Node.js) or **pnpm** / **yarn**
- **Git** (optional, for cloning the repository)

#### 📥 Step 1: Download or Clone the Repository

**Option A — Using Git (Recommended):**
Open your terminal and run:
```bash
git clone https://github.com/YOUR_USERNAME/wimg.git
cd wimg
```

**Option B — Download ZIP:**
1. Go to the GitHub repository page.
2. Click on the green **Code** button and select **Download ZIP**.
3. Extract the ZIP archive on your computer and navigate into the extracted folder using your terminal:
```bash
cd wimg-main
```

#### 📦 Step 2: Install Dependencies

Run the following command in your terminal to install all required packages:
```bash
npm install
```

#### 🏃 Step 3: Run the Local Development Server

Start the local Vite development server by running:
```bash
npm run dev
```

Once the server starts, you will see output similar to this:
```text
  VITE v5.x.x  ready in 350 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open your browser and navigate to **`http://localhost:3000`** (or the port displayed in your terminal) to use the application!

#### 🏗️ Step 4: Build for Production / Local Hosting

If you want to build the optimized production files or host it on your local home network (e.g., on a Raspberry Pi or wall-mounted tablet server):

1. **Build the production bundle:**
   ```bash
   npm run build
   ```
   This generates a static build in the `dist/` directory.

2. **Preview or serve locally:**
   ```bash
   npm run preview
   ```
   Alternatively, you can serve the `dist/` folder using any static web server like `npx serve dist` or Nginx / Caddy.

#### 🔐 Data Privacy & Backup Note
- **100% Offline & Private**: All financial data entered into WIMG stays strictly inside your browser's `localStorage`. No data is ever transmitted to external servers.
- **Backup & Sync**: Use the **JSON Export** button in the app navigation to download a complete backup file, and use **JSON Import** to restore or transfer your data across devices.

### ☕ Support the Project
If you end up using WIMG for your own household or wall-mounted tablet setup and want to buy me a coffee for the hours spent building it, you can drop a tip here:
- **[PayPal (paypal.me/tayfunaksoy)](https://paypal.me/tayfunaksoy)**

Would love to hear your thoughts, feedback, or what features you might add!
Cheers! 🍻
