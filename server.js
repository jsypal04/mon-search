if (process.env.NODE_ENV != "production") {
  require("dotenv").config()
}

const express = require("express")
const request = require("request")
const session = require("express-session")
const passport = require("passport")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const bcrypt = require("bcrypt")
const User = require("./models/user")
const initPassport = require("./passport-config")
const util = require("./util")
const app = express()

initPassport(passport,
  async (email) => {
    const user = await User.find({email: email})
    return user
  },
  async (id) => {
    const user = await User.find({_id: id})
    return user
  })

let results = []

app.set("view-engine", "ejs")
app.use(express.urlencoded({extended: false}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
db.on("error", error => console.error(error))

// index route
app.get("/", util.checkAuthenticated, async function(req, res) {
  try {
    const users = await User.find({})
    res.render("index.ejs", {users: users})
  } catch (e) {
    console.log(e)
  }
})

app.post("/", util.checkAuthenticated, function(req, res) {
  let poke = req.body.poke.toLowerCase().trim()
  let url = "https://pokeapi.co/api/v2/pokemon/" + poke + "/"

  request(url, function(error, response, body) {
    if (body == "Not Found") {
      results.push({name: "Pokemon Not Found."})
      res.redirect("/results")
    } else {
      let data = JSON.parse(body)
      let url = data.species.url

      request(url, function(error, response, body) {
        //if (error) console.log(error)
        let pData = JSON.parse(body)

        let name = pData.name
        let habitat
        if (pData.habitat != null) {
          habitat = "Habitat: " + pData.habitat.name
        }
        else {
          habitat = "No habitat data available."
        }
        let image = data.sprites.front_default

        let description
        for (let i = 0; i < pData.flavor_text_entries.length; i++) {
          if (pData.flavor_text_entries[i].language.name == "en") {
            description = pData.flavor_text_entries[i].flavor_text
            break
          }
        }

        let pokemon = {
          name: name,
          habitat: habitat,
          image: image,
          description: description
        }
        results.push(pokemon)
        res.redirect("/results")
      })
    }
  })
})

app.delete("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {return err}
    res.redirect("/login")
  })
})

// results route
app.get("/results", util.checkAuthenticated, function(req, res) {

  res.render("results.ejs", {
    image: results[0].image,
    name: results[0].name,
    habitat: results[0].habitat,
    description: results[0].description
  })
  results = []
})

// login route
app.get("/login", util.checkNotAuthenticated, function(req, res) {
  res.render("login.ejs")
})

app.post("/login", util.checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}))

// register route
app.get("/register", util.checkNotAuthenticated, function(req, res) {
  res.render("register.ejs")
})

app.post("/register", util.checkNotAuthenticated, async function(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    try {
      const newUser = await user.save()
      res.redirect("/login")
    } catch (e) {
      console.log(e)
      res.redirect("/register")
    }
  } catch (e) {
    console.log(e)
    res.redirect("/register")
  }
})


app.listen(process.env.PORT || 5000)
