const express = require("express")
const bcrypt = require("bcrypt")
const util = require("./util")
const User = require("../models/user")

const router = express.Router()

router.get("/profile", util.checkAuthenticated, async (req, res) => {
  try {
    let name = await util.getName(req)
    let email = await util.getEmail(req)

    res.render("profile.ejs", {
      name: name,
      email: email
    })
  }
  catch (e) {
    console.log(e)
  }
})

router.get("/edit-profile", util.checkAuthenticated, async (req, res) => {
  try {
    let name = await util.getName(req)
    let email = await util.getEmail(req)

    res.render("edit-profile.ejs", {
      currentName: name,
      currentEmail: email
    })
  }
  catch (e) {
    console.log(e)
  }
})

router.post("/edit-profile", util.checkAuthenticated, async (req, res) => {
  try {

    if (req.body.name != "") {
      await User.findOneAndUpdate({_id: req.session.passport.user}, {name: req.body.name})
    }
    if (req.body.email != "") {
      await User.findOneAndUpdate({_id: req.session.passport.user}, {email: req.body.email})
    }
    if (req.body.password != "") {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      await User.findOneAndUpdate({_id: req.session.passport.user}, {password: hashedPassword})
    }
    res.redirect("/users/profile")
  }
  catch (e) {
    console.log(e)
    res.redirect("/users/edit-profile")
  }
})

module.exports = router
