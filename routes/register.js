const express = require("express")
const bcrypt = require("bcrypt")
const util = require("./util")
const User = require("../models/user")

const router = express.Router()

router.get("/", util.checkNotAuthenticated, function(req, res) {
  res.render("register.ejs")
})

router.post("/", util.checkNotAuthenticated, async function(req, res) {
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

module.exports = router
