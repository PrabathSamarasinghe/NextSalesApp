# Sales Ledger Manager

A lightweight and efficient Next.js + Electron based sales tracking app that helps manage customer-wise and product-wise sales data using invoice inputs — as a desktop app or a hosted web app.

## 🚀 Features

- **Invoice-Based Entry**
  - Seamlessly record sales through structured invoice data.
- **Customer Account Management**
  - Auto-creates a sales page for new customers
  - Updates existing customers with new invoices
- **Detailed Customer History View**
  - Browse full sales history per customer including every invoice and transaction.
- **Product-Wise Sales Analytics**
  - Easily track sales per product and spot top-performing items.

## 🛠️ Built With

- **Next.js** – React framework with built-in backend API support
- **Electron.js** – Converts the web app into a native desktop application
- **API Routes** – Built-in backend handling for data & logic
- **MongoDB** – Backend database
- **Modular MVC Pattern** – Clean backend structure for scalability
- **Environment Variables** – .env.local for DB & secret credentials

## 🖥️ Desktop App with Electron.js

Sales Ledger Manager is also available as a desktop application thanks to Electron.
You can package and distribute .exe, .dmg, or .AppImage builds for Windows, macOS, and Linux.

### 💻 Benefits of Electron Integration:

- Works completely offline
- Local data storage or remote database support
- Electron handles the app shell, while Next.js powers the UI and logic

### 🛠️ Run Electron Locally:

```bash
# First, build the Next.js app
npm run build

# Then start Electron (assuming configured)
npm run electron
```

You can bundle it with electron-builder for distribution.

## 🤝 Contribute

Feel free to fork, contribute, or raise issues if you have ideas, suggestions, or improvements.
Let's build something awesome together! 💪
