# MediManager

**MediManager** is a comprehensive inventory management and Point of Sale (POS) system designed specifically for medical professionals and pharmacies. It bridges the gap between bulk storage (Main Store) and retail operations (Pharmacy), providing real-time insights into stock levels, costs, and profitability.

Key focused areas include efficient stock transfer, detailed financial tracking (Cost vs. Retail price), and data-driven decision-making through analytics.

---

## 🚀 Key Features

### 🏢 Multi-Tier Inventory Management
- **Main Store (Bulk)**: Manage bulk inventory with tracking for pack quantities and pill counts.
- **Pharmacy (Retail)**: Dedicated retail inventory for day-to-day dispensing.
- **Stock Transfer**: Seamlessly move items from the Main Store to the Pharmacy while maintaining accurate records.

### 💰 Cost & Profit Analysis
- **Automatic Calculation**: The system specifically tracks `buy_price` (Cost) and `retail_price` to automatically calculate margins.
- **Profit Tracking**: View real-time data on gross profits per item and per transaction.

### 🏪 Point of Sale (POS)
- **Fast Billing**: Streamlined interface for quick checkout and billing.
- **Real-Time Updates**: Immediate deduction from Pharmacy stock upon sale.

### 📊 Analytics & Reporting
- **Dashboard**: Visual insights into sales trends, low stock alerts, and financial performance using **Recharts**.
- **Reports**: Generate and export detailed inventory and sales reports (Excel support via `exceljs`).
- **Low Stock Alerts**: Automated notifications when stock levels dip below defined thresholds.

### 🔐 Secure & Scalable
- **Authentication**: Secure user access control managed via **Supabase Auth**.
- **Database**: Robust PostgreSQL database hosted on **Supabase** for data integrity and speed.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 💻 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/medimanager.git
   cd medimanager/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root of the `client` directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```bash
client/
├── app/                # Next.js App Router pages
│   ├── analytics/      # Analytics dashboard
│   ├── main-store/     # Bulk inventory management
│   ├── pharmacy/       # Retail inventory management
│   ├── point-of-sale/  # POS interface
│   ├── login/          # Authentication
│   └── ...
├── components/         # Reusable UI components
├── utils/              # Helper functions & Supabase client
├── public/             # Static assets
└── sql-schema.sql      # Database schema definition
```

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).
