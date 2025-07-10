export function professionalReportEmailTemplate({
  productWiseRevenue,
  stockData,
}: {
  productWiseRevenue: Array<{
    id: number;
    name: string;
    kilos: number;
    revenue: number;
  }>;
  stockData: Array<{
    name: string;
    stock: number;
    category: string;
    price: number;
  }>;
}) {
  const currentDate = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Calculations
  const totalSales = productWiseRevenue.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalSalesKg = productWiseRevenue.reduce(
    (sum, item) => sum + item.kilos,
    0
  );
  const totalStockAmount = stockData.reduce(
    (sum, item) => sum + item.price * item.stock,
    0
  );
  const netSalesAverage = Number((totalSales / totalSalesKg).toFixed(2));

  // Filter stock data to exclude zero stock items
  const nonZeroStockData = stockData.filter((item) => item.stock > 0);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Monthly Sales & Inventory Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #334155;
          background-color: #f8fafc;
        }
        .container {
          max-width: screen;
          margin: 0 auto;
          background-color: white;
        }
        .header {
          min-width: screen;
          display: grid;
          background-color: #0f172a;
          color: white;
          padding: 24px 32px;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
        }
        .header-left h1 {
          font-size: 24px;
          font-weight: 300;
          letter-spacing: 0.025em;
          margin-bottom: 4px;
        }
        .header-divider {
          width: 64px;
          height: 2px;
          background-color: #60a5fa;
          margin-bottom: 12px;
        }
        .header-subtitle {
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
        }
        .header-right {
          text-align: right;
          flex-shrink: 0;
        }
        .header-date {
          font-size: 18px;
          font-weight: 500;
        }
        .header-generated {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 4px;
        }
        .content {
          padding: 24px 32px;
        }
        .section {
          margin-bottom: 32px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }
        .summary-card {
          flex: 1;
          min-width: 0;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid;
        }
        .summary-card.revenue {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #93c5fd;
        }
        .summary-card.volume {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border-color: #86efac;
        }
        .summary-card.average {
          background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
          border-color: #c4b5fd;
        }
        .summary-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .summary-card.revenue .summary-label { color: #2563eb; }
        .summary-card.volume .summary-label { color: #16a34a; }
        .summary-card.average .summary-label { color: #9333ea; }
        .summary-value {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
        }
        .section-header {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .section-description {
          font-size: 14px;
          color: #64748b;
          margin-top: 4px;
        }
        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .table-container {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          min-width: 600px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background-color: #f8fafc;
          padding: 16px 24px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        th.text-right {
          text-align: right;
        }
        td {
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          font-size: 14px;
        }
        tr:hover {
          background-color: #f8fafc;
        }
        .text-right {
          text-align: right;
        }
        .font-medium {
          font-weight: 500;
        }
        .font-semibold {
          font-weight: 600;
        }
        .text-slate-900 {
          color: #0f172a;
        }
        .text-slate-600 {
          color: #475569;
        }
        tfoot {
          background-color: #0f172a;
          color: white;
        }
        tfoot td {
          border-top: none;
          font-weight: 600;
        }
        .footer-section {
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
          margin-top: 32px;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-note {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
        }
        .footer-dot {
          width: 8px;
          height: 8px;
          background-color: #94a3b8;
          border-radius: 50%;
          margin-right: 8px;
        }
        .company-footer {
          background-color: #f8fafc;
          padding: 16px 32px;
          border-top: 1px solid #e2e8f0;
        }
        .company-footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #64748b;
        }
        
        /* Mobile Styles */
        @media (max-width: 768px) {
          .header {
            padding: 16px;
          }
          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          .header-right {
            text-align: left;
          }
          .header-left h1 {
            font-size: 20px;
          }
          .header-date {
            font-size: 16px;
          }
          .content {
            padding: 16px;
          }
          .summary-grid {
            display: grid;
            gap: 16px;
          }
          .summary-card {
            padding: 16px;
          }
          .summary-value {
            font-size: 20px;
          }
          .section-title {
            font-size: 16px;
          }
          .section-description {
            font-size: 13px;
          }
          .table-container {
            min-width: 100%;
          }
          .table-wrapper {
            margin: 0 -16px;
            padding: 0 16px;
          }
          th, td {
            padding: 12px 8px;
            font-size: 12px;
          }
          th {
            font-size: 10px;
          }
          .footer-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          .company-footer {
            padding: 12px 16px;
          }
          .company-footer-content {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
        }
        
        /* Small Mobile Styles */
        @media (max-width: 480px) {
          .header-left h1 {
            font-size: 18px;
          }
          .header-subtitle {
            font-size: 12px;
          }
          .header-date {
            font-size: 15px;
          }
          .header-generated {
            font-size: 11px;
          }
          .summary-value {
            font-size: 18px;
          }
          .section-title {
            font-size: 15px;
          }
          .table-wrapper {
            margin: 0 -16px;
            padding: 0 8px;
          }
          th, td {
            padding: 8px 4px;
            font-size: 11px;
          }
          th {
            font-size: 9px;
          }
        }
        
        /* Very Small Mobile (320px and below) */
        @media (max-width: 320px) {
          .content {
            padding: 12px;
          }
          .summary-card {
            padding: 12px;
          }
          .summary-value {
            font-size: 16px;
          }
          .summary-label {
            font-size: 10px;
          }
          .table-wrapper {
            margin: 0 -12px;
            padding: 0 4px;
          }
          th, td {
            padding: 6px 2px;
            font-size: 10px;
          }
          th {
            font-size: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Professional Header -->
        <div class="header">
          <div class="header-content">
            <div class="header-left">
              <h1>KAIRO TRADING</h1>
              <div class="header-divider"></div>
              <p class="header-subtitle">MONTHLY SALES & INVENTORY REPORT</p>
            </div>
            <div class="header-right">
              <div class="header-date">
                ${
                  monthNames[currentDate.getMonth()]
                } ${currentDate.getFullYear()}
              </div>
              <div class="header-generated">
                Report Generated: ${currentDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        <div class="content">
          <!-- Executive Summary -->
          <div class="summary-grid">
            <div class="summary-card revenue">
              <div class="summary-label">Total Revenue</div>
              <div class="summary-value">Rs. ${totalSales.toLocaleString()}</div>
            </div>
            <div class="summary-card volume">
              <div class="summary-label">Total Volume</div>
              <div class="summary-value">${totalSalesKg.toLocaleString()} KG</div>
            </div>
            <div class="summary-card average">
              <div class="summary-label">Avg. Price/KG</div>
              <div class="summary-value">Rs. ${netSalesAverage.toLocaleString()}</div>
            </div>
          </div>

          <!-- Sales Performance -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Sales Performance Analysis</h2>
              <p class="section-description">
                Product-wise revenue breakdown for ${
                  monthNames[currentDate.getMonth()]
                } ${currentDate.getFullYear()}
              </p>
            </div>

            <div class="table-wrapper">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th class="text-right">Volume (KG)</th>
                      <th class="text-right">Revenue (Rs.)</th>
                      <th class="text-right">Avg. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productWiseRevenue
                      .map(
                        (item) => `
                      <tr>
                        <td class="font-medium text-slate-900">${item.name}</td>
                        <td class="text-right font-medium text-slate-600">${item.kilos.toLocaleString()}</td>
                        <td class="text-right font-semibold text-slate-900">Rs. ${item.revenue.toLocaleString()}</td>
                        <td class="text-right text-slate-600">Rs. ${(
                          item.revenue / item.kilos
                        ).toFixed(2)}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="font-semibold">TOTAL</td>
                      <td class="text-right font-semibold">${totalSalesKg.toLocaleString()}</td>
                      <td class="text-right font-semibold">Rs. ${totalSales.toLocaleString()}</td>
                      <td class="text-right font-semibold">Rs. ${netSalesAverage.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Inventory Status -->
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Current Inventory Status</h2>
              <p class="section-description">
                Stock levels and valuation as of ${currentDate.toLocaleDateString()}
              </p>
            </div>

            <div class="table-wrapper">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th class="text-right">Category</th>
                      <th class="text-right">Stock</th>
                      <th class="text-right">Value (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${nonZeroStockData
                      .map(
                        (item) => `
                      <tr>
                        <td class="font-medium text-slate-900">${item.name}</td>
                        <td class="text-right text-slate-600">${
                          item.category
                        }</td>
                        <td class="text-right font-medium text-slate-600">${item.stock.toLocaleString()}</td>
                        <td class="text-right font-semibold text-slate-900">Rs. ${(
                          item.price * item.stock
                        ).toLocaleString()}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td class="font-semibold" colspan="3">TOTAL INVENTORY VALUE</td>
                      <td class="text-right font-semibold">Rs. ${totalStockAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer Section -->
          <div class="footer-section">
            <div class="footer-content">
              <div class="footer-note">
                <div class="footer-dot"></div>
                This report is auto-generated and confidential
              </div>
            </div>
          </div>
        </div>

        <!-- Company Footer -->
        <div class="company-footer">
          <div class="company-footer-content">
            <div>Kairo Trading Pvt. Ltd. • Monthly Business Report</div>
            <div>© ${currentDate.getFullYear()} All Rights Reserved</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}