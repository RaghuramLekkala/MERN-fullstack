const express = require('express');
const { check, validationResult } = require('express-validator');
const gravator = require('gravatar');
const jwt = require('jsonwebtoken');

const config = require('config');

const bcryptjs = require('bcryptjs');

const User = require('../../models/User');

const router = express.Router();

//  @route  POST api/users
//  @desc   Register user
//  @access Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get users gravatar

      const avatar = gravator.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });
      // Encrypt password

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcryptjs.genSalt(10);

      user.password = await bcryptjs.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error('error', error);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
