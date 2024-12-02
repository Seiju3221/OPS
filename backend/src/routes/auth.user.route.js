const express = require('express');

const User = require('../model/user.model');
const generateToken = require('../middleware/generateToken');

const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const cloudinary = require('../utils/cloudinaryConfig.js');
const multer = require('multer');

const storage = multer.memoryStorage();

const OTP = require('../model/otp.model');
const { sendOTPEmailPasswordReset } = require('../utils/emailServicePasswordReset');
const { sendOTPEmailRegistration } = require('../utils/emailServiceRegistration');

// register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: 'Email, password, and username are required' 
      });
    }

    // Check for existing email and username
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ 
          message: 'User with this email already exists' 
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ 
          message: 'Username is already taken' 
        });
      }
    }

    // Create and save new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      username
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      message: "User registered successfully!", 
      user: userResponse 
    });

  } catch (error) {
    console.error("Failed to register:", error);
    
    // Better error handling for MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'email' ? 'Email' : 'Username'} already exists` 
      });
    }
    
    res.status(500).json({ 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// User login
router.post("/login", async (req,res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({email});

    if(!user) {
      return res.status(404).send({ message: "User not found!" })
    }

    const isMatch = await user.comparePassword(password)

    if(!isMatch) {
      return res.status(401).send({message: 'Invalid password!'})
    }

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true, // enable this only when you have https://
      secure: true,
      sameSite: true
    })

    res.status(200).send({ message:"Login success!", token, user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    }})

  } catch (error) {
    console.error("Failed to login", error);
    res.status(500).json({ message: 'Login failed!' })
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).send({ message: 'Logout success!' })
  } catch (error) {
    console.error("Failed to log out", error);
    res.status(500).json({ message: 'Logout failed!' })
  }
})

// get all users
router.get('/users', async (req, res) => {
  try {
    // Remove the field restriction and get all user fields
    const users = await User.find()
                           .select('_id email username role')
                           .lean(); // Added lean() for better performance
    
    console.log('Users being sent from backend:', users); // Debug log
    res.status(200).send({message: "Users retrieved successfully", users});
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).json({ message: 'Failed to fetch users!' })
  }
});

// Current user route
router.get('/current-user', verifyToken, async (req, res) => {
  try {
    // req.user is now available from verifyToken middleware
    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        profileImg: req.user.profileImg || null
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch current user' 
    });
  }
});

// delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const user = await User.findByIdAndDelete(id);

    if(!user) {
      return res.status(404).send({ message: "User not found!" })
    }

    res.status(200).send({ message: "User  deleted successfully" })

  } catch (error) {
    console.error("Error deleting user", error);
    res.status(500).json({ message: 'Failed to delete user!' })
  }
})

// update user role
router.put('/users/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const {role, username} = req.body;
    const updateData = {};
    
    if (role) updateData.role = role;
    if (username) updateData.username = username;

    const user = await User.findByIdAndUpdate(id, updateData, {new: true});
    if(!user) {
      return res.status(404).send({ message: "User not found" })
    }

    res.status(200).send({ message: "User updated successfully!", user });

  } catch (error) {
    console.error("Error updating user", error);
    res.status(500).json({ message: 'Error updating user!' })
  }
});

// Generate and send OTP (Email Registration)
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    await OTP.findOneAndDelete({ email }); // Remove any existing OTP
    await new OTP({ email, otp }).save();

    // Send OTP via email
    await sendOTPEmailRegistration(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Generate and send OTP (Password Reset)
router.post('/reset-password/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    await OTP.findOneAndDelete({ email }); // Remove any existing OTP
    await new OTP({ email, otp }).save();

    // Send OTP via email
    await sendOTPEmailPasswordReset(email, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ email }); // Delete used OTP
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Verify OTP and allow password reset
router.post('/reset-password/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ email }); // Delete used OTP
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Reset password
router.post('/reset-password/new-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// update profile
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password if updating password
    if (newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    // Handle avatar upload to Cloudinary
    if (avatar) {
      try {
        // If user already has a profile image, delete the old one
        if (user.profileImg) {
          // Extract public ID from the existing Cloudinary URL
          const publicId = user.profileImg.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }

        // Upload new image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(avatar, {
          folder: 'profile_images',
          transformation: [
            { width: 500, height: 500, crop: "fill" },
            { quality: "auto" }
          ]
        });

        user.profileImg = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile image' });
      }
    }

    // Update other fields
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Failed to update profile:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'email' ? 'Email' : 'Username'} already exists` 
      });
    }
    
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;