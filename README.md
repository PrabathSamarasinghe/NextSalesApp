# Sales Ledger Manager
A lightweight and efficient Next.js based sales tracking web application that helps manage customer-wise and product-wise sales data using invoice inputs — deployed and hosted on Vercel.

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
- **API Routes** – Built-in backend handling for data & logic
- **MongoDB** – Backend database
- **Modular MVC Pattern** – Clean backend structure for scalability
- **Environment Variables** – .env.local for DB & secret credentials

## ☁️ Vercel Deployment
Sales Ledger Manager is deployed on Vercel for seamless hosting and continuous deployment.

### 💻 Benefits of Vercel Integration:
- Automatic deployments with Git integration
- Built-in CI/CD pipeline
- Serverless functions for backend API routes
- Global CDN for fast loading
- Environment variable management
- Easy preview deployments for testing

### 🚀 Deployment Instructions:
1. Push your code to GitHub, GitLab, or Bitbucket
2. Import your repository in Vercel:
   ```
   https://vercel.com/import
   ```
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - Add other required secrets
4. Deploy with a single click
5. Your app will be live at `your-project-name.vercel.app`

### 🛠️ Development Workflow:
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server locally
npm start
```

## 🤝 Contribute
Feel free to fork, contribute, or raise issues if you have ideas, suggestions, or improvements.
Let's build something awesome together! 💪
