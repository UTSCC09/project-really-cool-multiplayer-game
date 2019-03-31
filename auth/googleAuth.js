const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
            clientID: "493612790648-j862qtgn7uua2g4v0v61q0s8j8n6093t.apps.googleusercontent.com",
            clientSecret: "2JOBeVqUqFzIw9LEmgZK_Nup",
            callbackURL: (process.env.MONGODB_URI+"auth/google/callback" || "http://localhost:5000/auth/google/callback")
        },
        (token, refreshToken, profile, done) => {
            return done(null, {
                profile: profile,
                token: token
            });
        }));
};
