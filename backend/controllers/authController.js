const { rtdb } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, password, name, role, skills } = req.body;
    
    // Check if user exists
    const usersRef = rtdb.ref('users');
    const snapshot = await usersRef.orderByChild('username').equalTo(username).once('value');
    
    if (snapshot.exists()) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserRef = usersRef.push();
    const user = {
      id: newUserRef.key,
      username,
      password: hashedPassword,
      name,
      role: role || 'member',
      skills: skills || [],
      createdAt: new Date().toISOString()
    };

    await newUserRef.set(user);
    res.status(201).json({ message: 'User created successfully', userId: newUserRef.key });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const usersRef = rtdb.ref('users');
    const snapshot = await usersRef.orderByChild('username').equalTo(username).once('value');
    
    if (!snapshot.exists()) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // snapshot.val() will be a map of { key: user }
    const usersData = snapshot.val();
    const userId = Object.keys(usersData)[0];
    const userData = usersData[userId];

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: userId, username: userData.username, name: userData.name, role: userData.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ id: req.user._id, username: req.user.username, name: req.user.name, role: req.user.role });
};
