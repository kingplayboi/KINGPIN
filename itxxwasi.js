const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8000;
const __path = process.cwd();

const server = require('./wasiqr');
const code = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// GitHub OAuth
passport.use(new GitHubStrategy(
{
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://kingpin-sjlx.onrender.com/auth/github/callback'
},
(accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}
));

// Login route
app.get(
    '/login/github',
    passport.authenticate('github', { scope: ['read:user'] })
);

// OAuth callback
app.get(
    '/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/'
    }),
    (req, res) => {
        res.redirect('/deploy');
    }
);

// Deploy route with fork verification
app.get('/deploy', async (req, res) => {

    if (!req.user) {
        return res.redirect('/login/github');
    }

    const username = req.user.username;
    const repo = process.env.REPO_NAME;
    const owner = process.env.REPO_OWNER;

    try {

        const response = await fetch(
            `https://api.github.com/repos/${username}/${repo}`,
            {
                headers: {
                    'User-Agent': 'ISAAC-MD'
                }
            }
        );

        if (!response.ok) {
            return res.send(`
                <h1>❌ Fork Required</h1>
                <p>You must fork ${owner}/${repo} before deploying.</p>

                <a href="https://github.com/${owner}/${repo}/fork">
                    🍴 Fork ISAAC
                </a>
            `);
        }

        const data = await response.json();

        if (!data.fork) {
            return res.send(`
                <h1>❌ Fork Required</h1>
                <p>${username}/${repo} is not a fork.</p>

                <a href="https://github.com/${owner}/${repo}/fork">
                    🍴 Fork ISAAC
                </a>
            `);
        }

        return res.redirect(
            `https://vercel.com/new/clone?repository-url=https://github.com/${username}/${repo}`
        );

    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

// Existing routes
app.use('/wasiqr', server);
app.use('/code', code);

app.use('/pair', (req, res) => {
    res.sendFile(__path + '/pair.html');
});

app.use('/', (req, res) => {
    res.sendFile(__path + '/wasipage.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
