const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")

function init(passport, getUserByEmail, getUserById) {
  const authUser = async (email, password, done) => {
    const user = await getUserByEmail(email)
    if (user == null) {
      return done(null, false, {message: "No user with that email"})
    }
    try {
      if (await bcrypt.compare(password, user[0].password)) {
        return done(null, user)
      }
      else {
        return done(null, false, {message: "Password incorrect"})
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  passport.use(new LocalStrategy({usernameField: "email"}, authUser))
  passport.serializeUser((user, done) => {
    done(null, user[0].id)
  })
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = init
