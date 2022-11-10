const express = require("express")
const util = require("./util")

const router = express.Router()

router.get("/profile", util.checkAuthenticated, (req, res) => {
  res.render("profile.ejs", {
    name: "Joe",
    email: "josephsypal@gmail.com"
  })
})

module.exports = router
