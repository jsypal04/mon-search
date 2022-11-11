function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  else {
    res.redirect("login")
  }
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/")
  }
  else {
    next()
  }
}

async function getName(req) {
  try {
    let userStr = JSON.stringify(await req.user)
    let begin = userStr.indexOf("name\":\"")
    let end = userStr.indexOf("\",\"email")
    let name = userStr.slice(begin + 7, end)

    return name
  }
  catch (e) {
    console.log(e)
  }
}

async function getEmail(req) {
  try {
    let userStr = JSON.stringify(await req.user)
    let begin = userStr.indexOf("email\":\"")
    let end = userStr.indexOf("\",\"password")
    let name = userStr.slice(begin + 8, end)

    return name
  }
  catch (e) {
    console.log(e)
  }
}

module.exports = {
  checkAuthenticated: checkAuthenticated,
  checkNotAuthenticated: checkNotAuthenticated,
  getName: getName,
  getEmail: getEmail
}
