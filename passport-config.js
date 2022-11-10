// imports modules and dependencies
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")

// defines the function to initialize the passport
function init(passport, getUserByEmail, getUserById) {
  // defines the function to authenticate users
  const authUser = async (email, password, done) => {
    // gets the user
    const user = await getUserByEmail(email)
    // if no user was found, return an error message
    if (user.length == 0) {
      return done(null, false, {message: "No user with that email"})
    }
    try {
      // if a user was found check the password
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      }
      else {
        // returns an error message if the password is incorrect
        return done(null, false, {message: "Password incorrect"})
      }
    }
    catch (e) {
      console.log(e)
    }
  }

  // initialize passport and pass it the authentication function
  passport.use(new LocalStrategy({usernameField: "email"}, authUser))
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = init
