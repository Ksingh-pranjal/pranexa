const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
    try{
        const { name, email, password } = req.body;

        if(!name || !email || !password ){
            return res.status(400).json({ error: 'All fields are required' })
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email }})
    } catch(err){
        console.error('Signup error: ', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

router.post('/login', async(req, res) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ error: 'Invalid email or password'});
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d'});
        res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
    } catch(err){
        console.error('Login error:', err);
        res.status(500).json({ error: 'login failed' });
    }
});

module.exports = router;