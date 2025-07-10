import nodemailer from "nodemailer";
import { professionalReportEmailTemplate } from "../.././../lib/templates/confirmationEmail.ts"

export async function POST(req) {
  const { stockData, productWiseRevenue } = await req.json();

  const recieverEmails = [
    "gm@devagiri-estate.com",
    "mike@devagiri-teas.com",
    "rosh@devagiri-teas.com",
    "bimsarats@gmail.com"
  ];

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "localsalesdevagiri@gmail.com",
      pass: "blknfnoyddgkydsj",
    },
  });

  const html = professionalReportEmailTemplate({ stockData, productWiseRevenue });

  try {
    const info = await transporter.sendMail({
      from: "localsalesdevagiri@gmail.com",
      to: recieverEmails.join(", "),
      subject: "Monthly Sales & Inventory Report",
      html,
    });

    return Response.json({ success: true, info });
  } catch (err) {
    return Response.json({ success: false, error: (err).message }, { status: 500 });
  }
}
