// enables .env if in production
if (process.env.NODE_ENV != "production") {
  require("dotenv").config()
}

// imports modules and dependencies
const express = require("express")
const session = require("express-session")
const flash = require("express-flash")
const passport = require("passport")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const User = require("./models/user")
const initPassport = require("./passport-config")

// initializes the app
const app = express()

// imports router modules
const indexRouter = require("./routes/index")
const loginRouter = require("./routes/login")
const registerRouter = require("./routes/register")

// initializes the app's passport system
initPassport(passport,
  async (email) => {
    const user = await User.find({email: email})
    return user[0]
  },
  async (id) => {
    const user = await User.find({_id: id})
    return user[0]
  })

// app setup
app.set("view-engine", "ejs")
app.use(express.urlencoded({extended: false}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(methodOverride("_method"))

// connect to a database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on("error", error => console.error(error))

// use the routes
app.use("/", indexRouter)
app.use("/login", loginRouter)
app.use("/register", registerRouter)


app.listen(process.env.PORT || 5000)
