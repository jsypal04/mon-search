const express = require("express")
const request = require("request")
const app = express()

let results = []

app.set("view-engine", "ejs")
app.use(express.urlencoded({extended: false}))

app.get("/", function(req, res) {
  res.render("index.ejs")
})

console.log("line 14")
app.post("/", function(req, res) {
  console.log("line 16")
  let poke = req.body.poke
  let url = "https://pokeapi.co/api/v2/pokemon/" + poke + "/"

  request(url, function(error, response, body) {
    console.log("line 21")
    if (body == "Not Found") {
      results.push({name: "Pokemon Not Found."})
      res.redirect("/results")
    } else {
      let data = JSON.parse(body)
      let url = data.species.url

      request(url, function(error, response, body) {
        console.log("line 30")
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

app.get("/results", function(req, res) {

  res.render("results.ejs", {
    image: results[0].image,
    name: results[0].name,
    habitat: results[0].habitat,
    description: results[0].description
  })
  results = []
})

app.listen(process.env.PORT || 5000)
