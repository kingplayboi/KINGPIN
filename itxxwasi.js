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

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

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

app.get(
    '/login/github',
    passport.authenticate('github', { scope: ['read:user'] })
);

app.get(
    '/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/'
    }),
    (req, res) => {
        res.redirect('/deploy');
    }
);

app.get('/deploy', async (req, res) => {

    if (!req.user) {
        return res.redirect('/login/github');
    }

    const username = req.user.username;
    const owner = process.env.REPO_OWNER;
    const repo = process.env.REPO_NAME;

    try {

        // Allow the owner to test without forking
        if (username === owner) {
            return res.redirect(
                `https://vercel.com/new/clone?repository-url=https://github.com/${owner}/${repo}`
            );
        }

        const response = await fetch(
            `https://api.github.com/repos/${username}/${repo}`,
            {
                headers: {
                    'User-Agent': 'ISAAC-MD',
                    'Accept': 'application/vnd.github+json'
                }
            }
        );

        if (response.status === 404) {
            return res.send(`
                <h1>❌ Fork Required</h1>
                <p>You must fork ${owner}/${repo} before deploying.</p>
                <a href="https://github.com/${owner}/${repo}/fork">
                    🍴 Fork ISAAC
                </a>
            `);
        }

        const data = await response.json();

        console.log('User:', username);
        console.log('Repo:', data.full_name);
        console.log('Fork:', data.fork);

        if (!data.fork) {
            return res.send(`
                <h1>❌ Fork Required</h1>
                <p>${username}/${repo} exists but is not a fork.</p>
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

        return res.status(500).send(`
            <h1>Internal Server Error</h1>
            <p>${err.message}</p>
        `);
    }
});

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
    console.log(`
Don't Forget To Give Star

Server running on http://localhost:${PORT}
`);
});

module.exports = app;
