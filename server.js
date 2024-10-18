const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const Schema = mongoose.Schema;

// const uploads = multer({dest: "uploads/"})
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        console.log(file);
        const ext = path.extname(file.originalname);
        console.log("EXT", ext);
        // if(ext !== ".png" || ext !== ".jpg") {
        //     return cb(new Error("Only PNG FILES allowed, stay away Martin!"))
        // } 
        const fileName = file.originalname + ".png"
        cb(null, fileName)
    }

})
const uploads = multer({
    storage: diskStorage,

})

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/helpdesk")
    .then(() => console.log("connected!"))
    .catch((error) => console.log("error", error))


const saltRounds = 10;


app.get("/", (req, res) => {
    res.render("index")
})


app.get("/login", (req, res) => {
    res.render("loginn")
});

app.post("/login", (req, res) => {
    console.log("LOGGER UT HER", req.body);
    const { brukernavn, password } = req.body;

    User.findOne({ email: brukernavn }).then((user) => {
        console.log("result", user);

        bcrypt.compare(password, user.password).then((result) => {
            if (result) {
                res.status(200).redirect("/dashboard")

            }
        })



    }).catch((error) => {
        console.log("Error", error)
    })



    console.log(brukernavn);
})

app.get("/createuser", (req, res) => {
    res.render("createUser")
});
const userSchema = new Schema({
    email: String,
    password: String
})

const brukerSchema = new Schema({
    tittel: String,
    tag: String,
    overskrift: Array,
    beskrivelse: Array,
    bilde: Array,
})

const User = mongoose.model("User", userSchema);
const BrukerGuide = mongoose.model("BrukerGuide", brukerSchema);
app.post("/createuser", async (req, res) => {
    console.log("LOGGER UT HER", req.body);
    const { brukernavn, password, repeatPassword } = req.body;
    console.log(password, repeatPassword, password == repeatPassword);
z
    if (password == repeatPassword) {

        bcrypt.hash(password, saltRounds, async function (error, hash) {
            const newUser = new User({ email: brukernavn, password: hash })
            const result = await newUser.save();
            console.log(result);

            if (result._id) {
                res.redirect("/dashboard");
            }

        })

    } else {
        res.status(500).json({ message: "Passord stemmer ikke overens" })
    }


})
app.get("/dashboard", (req, res) => {
    res.render("dashboard");
})

app.get("/guide", (req, res) => {
    res.render("guide")
})
app.get("/newGuide", (req, res) => {
    res.render("addNewGuide")
})


app.post("/newGuide", uploads.array("bilde"), async (req, res) => {
    console.log(req.body, "BODY");
    console.log(req.files, "FILE");

    const newBrukerGuide = new BrukerGuide({ 
        tittel: req.body.tittel, 
        tag: req.body.tag,
         overskrift: req.body.overskrift, 
         beskrivelse: req.body.beskrivelse })
    const result = await newBrukerGuide.save();
})

app.listen(process.env.PORT);