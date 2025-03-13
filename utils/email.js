import nodemailer from "nodemailer";
import fs from "fs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (email, otp) => {
  try {
    const templatePath = join(__dirname, "email.html");
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");
    htmlTemplate = htmlTemplate.replace("{{OTP}}", otp);

    const mailOptions = {
      from: `APL Shoes Secondbrand <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verifikasi OTP",
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP dikirimkan ke email ${email}`);
  } catch (error) {
    console.error("Error saat mengirimkan OTP ke email: ", error);
    throw error;
  }
};

// Add function for reset password email
const sendResetPasswordEmail = async (email, otp) => {
  try {
    const templatePath = join(__dirname, "reset-password-email.html");
    // Check if the template exists, if not, use a default template
    let htmlTemplate;

    try {
      htmlTemplate = fs.readFileSync(templatePath, "utf8");
    } catch (err) {
      // Default template if the reset password template doesn't exist
      htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .otp-container { text-align: center; margin: 30px 0; }
            .otp { font-size: 24px; font-weight: bold; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Reset Password</h2>
            </div>
            <p>Kami menerima permintaan untuk reset password akun Anda. Gunakan kode OTP berikut:</p>
            <div class="otp-container">
              <div class="otp">{{OTP}}</div>
            </div>
            <p>Kode OTP ini berlaku selama 10 menit.</p>
            <p>Jika Anda tidak melakukan permintaan ini, abaikan email ini.</p>
            <div class="footer">
              <p>APL Shoes Secondbrand</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    htmlTemplate = htmlTemplate.replace("{{OTP}}", otp);

    const mailOptions = {
      from: `APL Shoes Secondbrand <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password",
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reset password OTP dikirimkan ke email ${email}`);
  } catch (error) {
    console.error(
      "Error saat mengirimkan reset password OTP ke email: ",
      error
    );
    throw error;
  }
};

export { transporter, generateOTP, sendOtp, sendResetPasswordEmail };
