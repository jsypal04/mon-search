// imports modules and dependencies
const express = require("express")
const request = require("request")
const util = require("./util")

// initializes the router
const router = express.Router()

let results = []

// the route to display the home page
router.get("/", util.checkAuthenticated, async function(req, res) {
  // extracts the name from the user object wierdly because the obj is weird
  let name = await util.getName(req)

  res.render("index.ejs", {name: name})
})

// route to process a poke search
router.post("/", util.checkAuthenticated, function(req, res) {
  // get the search term and set it in the url
  let poke = req.body.poke.toLowerCase().trim()
  let url = "https://pokeapi.co/api/v2/pokemon/" + poke + "/"

  // first request
  request(url, function(error, response, body) {
    if (body == "Not Found") {
      results.push({name: "Pokemon Not Found."})
      res.redirect("/results")
    } else {
      // gets the url for the second request
      let data = JSON.parse(body)
      let url = data.species.url

      // second request, this request contains all of the relevant information
      request(url, function(error, response, body) {
        //if (error) console.log(error)
        let pData = JSON.parse(body)

        // gets the name, habitat, image, and description from the data
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

        // packages up the data into an object and pushes to the results array, then redirects the results
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

// route to log out
router.delete("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {return err}
    res.redirect("/login")
  })
})

// results route
router.get("/results", util.checkAuthenticated, async function(req, res) {
  // extracts the name from the user object wierdly because the obj is weird
  let name = await util.getName(req)

  // passes the data from the results array to the page then resets the results array
  res.render("results.ejs", {
    userName: name,
    image: results[0].image,
    name: results[0].name,
    habitat: results[0].habitat,
    description: results[0].description
  })
  results = []
})

module.exports = router
