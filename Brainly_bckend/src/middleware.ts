import { NextFunction ,Request,Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const userMiddleware = (req:Request , res:Response ,next :NextFunction)=>{

  console.log("sss");
  

  const header = req.headers["authorization"];
  console.log(header);
  
  const decoded = jwt.verify(header as string,JWT_SECRET);

  if(decoded){
    //@ts-ignore
    req.userId = decoded.id;
    next();
  }
  else{
    res.status(403).json({
      message : "you are not logged in"
    })
  }

}