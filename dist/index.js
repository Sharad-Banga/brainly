import express from "express";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_SECRET } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { random } from "./util.js";
const app = express();
app.use(express.json());
app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    await UserModel.create({
        username: username,
        password: password
    });
    res.json({
        "message": "user Signed Up"
    });
});
app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = await UserModel.findOne({
        username,
        password
    });
    if (existingUser) {
        const token = jwt.sign({ id: existingUser._id }, JWT_SECRET);
        res.json({
            token: token
        });
    }
    else {
        res.json({
            "message": "user do not exists , plz first signup"
        });
    }
});
app.post("/api/v1/content", userMiddleware, (req, res) => {
    const link = req.body.link;
    const title = req.body.title;
    ContentModel.create({
        title,
        link,
        //@ts-ignore
        userId: req.userId,
        tags: []
    });
    res.json({
        message: "content added"
    });
});
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId; // gets user id of the user 
    //finds all the content of user having user id = userId
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username");
    res.json({
        content
    });
});
app.delete("/api/v1/content", (req, res) => {
});
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const share = req.body.share;
    console.log("share : ", share);
    if (share) {
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: random(10)
        });
    }
    else {
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        });
    }
    res.json({
        message: "updated shared link"
    });
});
app.post("/api/v1/brain/:shareLink", (req, res) => {
});
app.listen(3000);
