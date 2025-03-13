import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserById,
  findUserByEmail,
  updateUserVerification,
  updateUserOTP,
  updateUserPassword,
} from "../repositories/authRepositories.js";
import {
  sendOtp,
  generateOTP,
  sendResetPasswordEmail,
} from "../utils/email.js";

const registerUser = async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    const user = await findUserByEmail(email);
    if (user && user.isVerified) {
      return res.status(400).json({
        message: "Pengguna dengan email ini sudah terdaftar",
      });
    }

    const otp = generateOTP();
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const createUser = await prisma.user.upsert({
      where: { email },
      update: {
        nama,
        password: hashedPassword,
        otp,
        isVerified: false,
      },
      create: {
        nama,
        email,
        password: hashedPassword,
        otp,
        isVerified: false,
      },
    });

    try {
      await sendOtp(email, otp);
      return res.status(200).json({
        message: "Silahkan cek email anda untuk verifikasi",
      });
    } catch (emailError) {
      console.error("Error saat mengirim email:", emailError);
      return res.status(500).json({
        message: "Gagal mengirim email verifikasi",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email dan OTP harus diisi",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Akun sudah terverifikasi",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "OTP tidak valid",
      });
    }

    await updateUserVerification(email);

    return res.status(200).json({
      message: "Verifikasi berhasil, silahkan login",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email harus diisi",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Akun sudah terverifikasi",
      });
    }

    const otp = generateOTP();
    await updateUserOTP(email, otp);

    try {
      await sendOtp(email, otp);
      return res.status(200).json({
        message: "OTP baru telah dikirim ke email anda",
      });
    } catch (emailError) {
      console.error("Error saat mengirim email:", emailError);
      return res.status(500).json({
        message: "Gagal mengirim email OTP baru",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password harus diisi",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message:
          "Akun belum terverifikasi, silahkan verifikasi terlebih dahulu",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Password salah",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email harus diisi",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message:
          "Akun belum terverifikasi, silahkan verifikasi terlebih dahulu",
      });
    }

    const resetOtp = generateOTP();
    await updateUserOTP(email, resetOtp);

    try {
      await sendResetPasswordEmail(email, resetOtp);
      return res.status(200).json({
        message: "Kode reset password telah dikirim ke email anda",
      });
    } catch (emailError) {
      console.error("Error saat mengirim email reset password:", emailError);
      return res.status(500).json({
        message: "Gagal mengirim email reset password",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email dan OTP harus diisi",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "OTP tidak valid",
      });
    }

    return res.status(200).json({
      message: "OTP valid, silahkan reset password anda",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP dan password baru harus diisi",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "OTP tidak valid",
      });
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await updateUserPassword(email, hashedPassword);

    return res.status(200).json({
      message: "Password berhasil direset, silahkan login",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Pengguna tidak ditemukan",
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const userController = {
  registerUser,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getUserProfile,
};

export default userController;
