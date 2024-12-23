const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    } 
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });   

        if (!user) {
            return res.status(400).json({ message: "Username not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie(
            "authToken", 
            token, 
            { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 3600000 //1h
            }
        );

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = {  
    register,  
    login
};