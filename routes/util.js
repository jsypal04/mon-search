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

module.exports = {
  checkAuthenticated: checkAuthenticated,
  checkNotAuthenticated: checkNotAuthenticated
}
