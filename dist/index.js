import express from "express";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_SECRET } from "./config.js";
import { userMiddleware } from "./middleware.js";
import { random } from "./util.js";
const app = express();
import cors from "cors";
app.use(cors());
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
    const type = req.body.type;
    ContentModel.create({
        title: req.body.title,
        type,
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
app.delete("/api/v1/content/:id", userMiddleware, async (req, res) => {
    try {
        const contentId = req.params.id;
        if (!contentId) {
            res.status(400).json({ message: "Content ID is required" });
            return;
        }
        const deletedContent = await ContentModel.findByIdAndDelete(contentId);
        if (!deletedContent) {
            res.status(404).json({ message: "Content not found" });
            return;
        }
        res.json({ message: "Content deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting content:", error);
        res.status(500).json({ message: "Error deleting content", error });
    }
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
app.post("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({
        hash
    });
    if (!link) {
        res.status(411).json({
            message: "sorry"
        });
        return;
    }
    const content = await ContentModel.find({
        userId: link.userId
    });
    const user = await UserModel.findOne({
        _id: link.userId
    });
    res.json({
        username: user?.username,
        content: content
    });
});
app.listen(3000);
