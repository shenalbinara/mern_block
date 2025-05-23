import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password || username === '' || email === '' || password === ''){
        return next(errorHandler(400, 'All fields are required')); // Fixed typo "requires" to "required"
    }

    const hashPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashPassword,
    });

    try {
        await newUser.save();
        res.json({ success: true, message: 'Registration successful' }); // Better response
    } catch (error) {
        next(error);
    }
};


export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
      return next(errorHandler(400, 'All fields are required'));
    }

    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(400, 'Invalid password'));
    }

    const token = jwt.sign({ id: validUser._id, isAdmin: validUser.isAdmin }, process.env.JWT_SECRET);

    const userObj = validUser.toObject(); // 👈 safer than __doc
    const { password: pass, ...rest } = userObj;

    return res
  .status(200)
  .cookie('access_token', token, {
    httpOnly: true,
  })
  .json({ token, user: rest });  // ✅ Include token in response body

  } catch (error) {
    console.error('SIGNIN ERROR:', error); // log full error to debug
    return next(errorHandler(500, 'Internal Server Error'));
  }
};

export const google = async (req, res, next) => {
    const {email, name, googlePhotoUrl } = req.body;

    try {
        const user = await User.findOne({email});
        if(user){
            const token = jwt.sign({id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
            const {password, ...rest} = user._doc;
            res.status(200).cookie('access_token', token, {
                httpOnly: true,
            }).json(rest);

        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hshedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
                email,
                password: hshedPassword,
                profilePicture: googlePhotoUrl,

            });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id, isAdmin: newUser.isAdmin}, process.env.JWT_SECRET);
            const { password, ...rest } = newUser._doc;
            res.status(200).cookie('access_token', token, {
  httpOnly: true,
}).json({ token, user: rest });  // ✅ Include token in response body

        }

    } catch (error) {
        next(error)
    }
};

