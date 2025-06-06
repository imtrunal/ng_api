const express = require("express");
const router = express.Router();
const Statistics = require("../Model/statistics");
const { default: status } = require("http-status");

router.get('/',async(req,res)=>{
    try {
        const statistics=await Statistics.find();
        return res.status(status.OK).send({
            message:"Statistics retrieved successfully",
            data:statistics
        }) 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
})