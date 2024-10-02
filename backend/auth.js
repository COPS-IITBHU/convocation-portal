const express = require('express');
const authRouter = express.Router();
const { Alum } = require('./model');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');

// const { locationSchema, Room, Alum } = require('./model');

dotenv.config()

const key = process.env.KEY
if(!key){
    console.error("please add a KEY in the env variables")
}

authRouter.post('/register', async (req, res) => {
    try {
        const { email, unhashedPassword, name, branch, rollNumber } = req.body;

        const domain = email.split('@')[1];
        if (domain !== "iitbhu.ac.in" && domain !== "itbhu.ac.in") {
            return res.status(400).json({ message: "Invalid email" });
        }

        const password = await bcrypt.hash(unhashedPassword, 10);

        const existingUser = await Alum.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already registered" });
        }

        const newUser = new Alum({
            email,
            password,
            name,
            branch,
            rollNumber
        });
        await newUser.save();
        // await Alum.create(newUser);

        const token = jwt.sign({ email, rollNumber, name, branch }, key);
        // localStorage.setItem('token', token);  

        return res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

authRouter.post('/login' , async (req, res) => {
    try{
        const { email, unhashedPassword } = req.body
        const user = await Alum.findOne({
            email
        })

        if(!user){
            return res.json({
                message: "user not found"
            })
        }
        const acceptLogin = await bcrypt.compare(unhashedPassword, user.password)

        if(acceptLogin){

            const token = jwt.sign({
                email,
                name: user.name,
                rollNumber: user.rollNumber,
                branch: user.branch
            }, key)
            // localStorage.setItem('token', token);

            return res.json({token})
        }else{
            return res.json({
                msg:'invalid credentials'
            })
        }
    }catch(error){
        return res.json({
            error: error.message
        })
    }
})


module.exports = { authRouter };
