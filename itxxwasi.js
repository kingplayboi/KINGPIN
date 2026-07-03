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

// Deploy route with improved fork verification
app.get('/deploy', async (req, res) => {

    if (!req.user) {
        return res.redirect('/login/github');
    }

    const username = req.user.username;
    const owner = process.env.REPO_OWNER;
    const repo = process.env.REPO_NAME;

    // Allow repo owner to bypass checks
    if (username === owner) {
        return res.redirect(
            `https://vercel.com/new/clone?repository-url=https://github.com/${owner}/${repo}`
        );
    }

    try {

        const response = await fetch(
            `https://api.github.com/users/${username}/repos?per_page=100`,
            {
                headers: {
                    'User-Agent': 'ISAAC-MD'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const repos = await response.json();

        const hasFork = repos.some(r => {
    return r.fork === true;
});
console.log(`User: ${username}`);
console.log(`Found fork: ${hasFork}`);

        if (!hasFork) {
            return res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Fork Required</title>
<style>
body{
    background:#0d1117;
    color:white;
    font-family:Arial,sans-serif;
    text-align:center;
    padding-top:100px;
}
a{
    display:inline-block;
    margin-top:20px;
    padding:14px 28px;
    background:#238636;
    color:white;
    text-decoration:none;
    border-radius:8px;
    font-weight:bold;
}
</style>
</head>
<body>

<h1>❌ Fork Required</h1>
<p>You must fork <b>${owner}/${repo}</b> before deploying.</p>

<a href="https://github.com/${owner}/${repo}/fork">
🍴 Fork ISAAC
</a>

</body>
</html>
            `);
        }

        return res.redirect(
            `https://vercel.com/new/clone?repository-url=https://github.com/${username}/${repo}`
        );

    } catch (err) {

        console.error(err);

        return res.status(500).send(`
<h1>Internal Server Error</h1>
<p>Unable to verify repository fork.</p>
        `);
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
    console.log(`
Don't Forget To Give Star

Server running on http://localhost:${PORT}
`);
});

module.exports = app;
