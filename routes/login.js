// imports modules and dependencies
const express = require("express")
const passport = require("passport")
const util = require("./util")

// initializes the router
const router = express.Router()

router.get("/", util.checkNotAuthenticated, function(req, res) {
  res.render("login.ejs")
})

router.post("/", util.checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}))

module.exports = router
