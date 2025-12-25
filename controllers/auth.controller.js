// import jwt from "jsonwebtoken";
// import crypto from "crypto";
// import User from "../models/user.models.js";

// // ---------------------------------------
// // Generate JWT Token
// // ---------------------------------------
// const signToken = (user) => {
//   return jwt.sign(
//     { id: user._id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
//   );
// };

// // ---------------------------------------
// // REGISTER USER
// // ---------------------------------------
// export const register = async (req, res, next) => {
//   try {
//     const { 
//       name, 
//       email, 
//       password,
//       role, 
//       profile,
//       membershipStatus
//     } = req.body;

//     // 1️⃣ Validate required fields
//     if (!name || !email || !password)
//       return res.status(400).json({ message: "Name, Email & Password required" });

//     // 2️⃣ Check if user already exists
//     const exists = await User.findOne({ email });
//     if (exists)
//       return res.status(400).json({ message: "Email already in use" });

//     // 3️⃣ Create user with full profile data
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || "user",

//       profile: {
//         headline: profile?.headline || "",
//         bio: profile?.bio || "",
//         phone: profile?.phone || "",
//         location: profile?.location || "",
//         skills: profile?.skills || [],
//         education: profile?.education || [],
//         experience: profile?.experience || [],
//         avatar: profile?.avatar || ""
//       },

//       membershipStatus: membershipStatus || "pending"
//     });

//     // 4️⃣ Generate JWT token
//     const token = signToken(user);

//     res.status(201).json({
//       message: "Registration successful",
//       token,
//       user,
//     });

//   } catch (err) {
//     next(err);
//   }
// };


// // ---------------------------------------
// // LOGIN USER
// // ---------------------------------------
// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password)
//       return res.status(400).json({ message: "Missing credentials" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(401).json({ message: "Invalid credentials" });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Invalid credentials" });

//     const token = signToken(user);

//     res.json({
//       message: "Login successful",
//       token,
//       user,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ---------------------------------------
// // FORGOT PASSWORD
// // ---------------------------------------
// export const forgotPassword = async (req, res, next) => {
//   try {
//     const { email } = req.body;

//     if (!email)
//       return res.status(400).json({ message: "Email is required" });

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "No user found with that email" });

//     // Generate token
//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // Save encrypted token in DB
//     user.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min

//     await user.save({ validateBeforeSave: false });

//     // Send token in response (You can integrate email service later)
//     res.json({
//       message: "Password reset token generated",
//       resetToken, // send to frontend
//       expiresIn: "10 minutes",
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // ---------------------------------------
// // RESET PASSWORD
// // ---------------------------------------
// export const resetPassword = async (req, res, next) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!password)
//       return res.status(400).json({ message: "Password is required" });

//     // encrypt token
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(token)
//       .digest("hex");

//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user)
//       return res
//         .status(400)
//         .json({ message: "Token invalid or expired" });

//     user.password = password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;

//     await user.save();

//     const jwtToken = signToken(user);

//     res.json({
//       message: "Password reset successful",
//       token: jwtToken,
//       user,
//     });
//   } catch (err) {
//     next(err);
//   }
// };


import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.models.js";

// Helper function to convert YYYY/MM to Date
const convertYYYYMMtoDate = (dateString) => {
  if (!dateString || dateString.toLowerCase() === 'present') return null;
  
  // If already in YYYY/MM format
  if (dateString.match(/^\d{4}\/\d{2}$/)) {
    const [year, month] = dateString.split('/');
    return new Date(year, month - 1, 1); // Create date with 1st day of month
  }
  
  // If in YYYY-MM format
  if (dateString.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = dateString.split('-');
    return new Date(year, month - 1, 1);
  }
  
  // If full date string, try to parse
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
};

// ---------------------------------------
// Generate JWT Token
// ---------------------------------------
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ---------------------------------------
// REGISTER USER
// ---------------------------------------
export const register = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      password,
      role, 
      profile,
      membershipStatus
    } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, Email & Password required" });

    // 2️⃣ Check if user already exists
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already in use" });

    // 3️⃣ Format experience dates if provided
    let formattedExperience = [];
    if (profile?.experience && Array.isArray(profile.experience)) {
      formattedExperience = profile.experience.map(exp => ({
        company: exp.company,
        position: exp.position,
        from: convertYYYYMMtoDate(exp.from),
        to: convertYYYYMMtoDate(exp.to),
        description: exp.description || ''
      }));
    }

    // 4️⃣ Format education dates if provided
    let formattedEducation = [];
    if (profile?.education && Array.isArray(profile.education)) {
      formattedEducation = profile.education.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        from: convertYYYYMMtoDate(edu.from),
        to: convertYYYYMMtoDate(edu.to)
      }));
    }

    // 5️⃣ Handle category with "Other" option
    let finalCategory = '';
    if (profile?.category) {
      if (profile.category === 'Other' && profile.otherCategory) {
        finalCategory = profile.otherCategory.trim();
      } else {
        finalCategory = profile.category;
      }
    }

    // 6️⃣ Create user with formatted profile data
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",

      profile: {
        headline: profile?.headline || "",
        bio: profile?.bio || "",
        phone: profile?.phone || "",
        countryCode: profile?.countryCode || '+91',
        location: profile?.location || "",
        nativeAddition: profile?.nativeAddition || "",
        category: finalCategory,
        country: profile?.country || 'IN',
        branch: profile?.branch || 'Bangalore',
        skills: profile?.skills || [],
        education: formattedEducation,
        experience: formattedExperience,
        position: profile?.position || "",
        company: profile?.company || "",
        yearsOfExperience: profile?.yearsOfExperience || "",
        avatar: profile?.avatar || "",
        resumeUrl: profile?.resumeUrl || "",
        socialLinks: profile?.socialLinks || {
          linkedin: '',
          github: '',
          twitter: '',
          website: ''
        }
      },

      membershipStatus: membershipStatus || "pending"
    });

    // 7️⃣ Generate JWT token
    const token = signToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });

  } catch (err) {
    next(err);
  }
};


// ---------------------------------------
// LOGIN USER
// ---------------------------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------
// FORGOT PASSWORD
// ---------------------------------------
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user found with that email" });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save encrypted token in DB
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save({ validateBeforeSave: false });

    // Send token in response (You can integrate email service later)
    res.json({
      message: "Password reset token generated",
      resetToken, // send to frontend
      expiresIn: "10 minutes",
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------
// RESET PASSWORD
// ---------------------------------------
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    // encrypt token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Token invalid or expired" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const jwtToken = signToken(user);

    res.json({
      message: "Password reset successful",
      token: jwtToken,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  forgotPassword,
  resetPassword
};