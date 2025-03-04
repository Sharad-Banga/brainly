import { NextFunction ,Request,Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

export const userMiddleware = (req:Request , res:Response ,next :NextFunction)=>{

  console.log("middleware reached");
  


  const header = req.headers["authorization"];
  console.log(header);
  
  const decoded = jwt.verify(header as string,JWT_SECRET);
console.log("decoding done");

  if(decoded){
    //@ts-ignore
    req.userId = decoded.id;
    console.log("middleware passed");
    
    next();
  }
  else{
    console.log("middle ware failed");
    
    res.status(403).json({
      message : "you are not logged in"
    })
  }

}