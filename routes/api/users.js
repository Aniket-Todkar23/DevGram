const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please provide a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('githubUsername', 'GitHub username is required').notEmpty(),
    check('githubUsername', 'GitHub username must be at least 1 character').isLength({ min: 1 }),
    // Optional: Add custom validation for GitHub username format
    check('githubUsername', 'GitHub username can only contain alphanumeric characters and hyphens')
      .matches(/^[a-zA-Z0-9-]+$/)
      .optional({ checkFalsy: true }),
  ],
  async (req, res) => {
    console.log('Registration request:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, githubUsername } = req.body;

    try {
      // Check if user already exists by email
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          errors: [{ msg: 'User with this email already exists' }] 
        });
      }

      // Check if GitHub username is already taken
      let existingGithubUser = await User.findOne({ githubUsername });
      if (existingGithubUser) {
        return res.status(400).json({ 
          errors: [{ msg: 'GitHub username is already taken' }] 
        });
      }

      // Get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200', // size
        r: 'pg',  // rating
        d: 'mm'   // default image
      });

      // Create new user instance
      user = new User({
        name,
        email,
        avatar,
        password,
        githubUsername: githubUsername.toLowerCase() // Store in lowercase for consistency
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to database
      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 }, // 10 hours
        (err, token) => {
          if (err) throw err;
          res.json({ 
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              githubUsername: user.githubUsername
            }
          });
        }
      );

    } catch (err) {
      console.error('Registration error:', err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;