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
        profile.accessToken = accessToken;
        return done(null, profile);
    }
));

app.get(
    '/login/github',
    passport.authenticate('github', { scope: ['read:user', 'public_repo'] })
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

const HEROKU_URL = (username, repo) =>
    `https://dashboard.heroku.com/new-app?template=https://github.com/${username}/${repo}`;

app.get('/deploy', async (req, res) => {

    if (!req.user) {
        return res.redirect('/login/github');
    }

    const username = req.user.username;
    const token = req.user.accessToken;
    const owner = process.env.REPO_OWNER;
    const repo = process.env.REPO_NAME;

    try {

        if (username === owner) {
            return res.redirect(HEROKU_URL(username, repo));
        }

        const checkResponse = await fetch(
            `https://api.github.com/repos/${username}/${repo}`,
            {
                headers: {
                    'User-Agent': 'ISAAC-MD',
                    'Accept': 'application/vnd.github+json'
                }
            }
        );

        if (checkResponse.status === 200) {
            const data = await checkResponse.json();

            console.log('User:', username);
            console.log('Repo:', data.full_name);
            console.log('Fork:', data.fork);

            if (data.fork && data.parent && data.parent.full_name === `${owner}/${repo}`) {
                return res.redirect(HEROKU_URL(username, repo));
            }

            if (!data.fork) {
                return res.send(`
                    <h1>❌ Name Conflict</h1>
                    <p>You already have a repo named "${repo}" that isn't a fork of ${owner}/${repo}.</p>
                    <p>Please delete or rename it, then <a href="/deploy">try again</a>.</p>
                `);
            }
        }

        const forkResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/forks`,
            {
                method: 'POST',
                headers: {
                    'User-Agent': 'ISAAC-MD',
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `token ${token}`
                }
            }
        );

        if (forkResponse.status !== 202) {
            const errBody = await forkResponse.text();
            console.error('Fork failed:', forkResponse.status, errBody);
            return res.status(500).send(`
                <h1>Fork failed</h1>
                <p>GitHub returned status ${forkResponse.status}. Please try again, or fork manually:</p>
                <a href="https://github.com/${owner}/${repo}/fork">🍴 Fork ISAAC</a>
            `);
        }

        let ready = false;
        for (let i = 0; i < 8; i++) {
            await new Promise(r => setTimeout(r, 1500));
            const poll = await fetch(
                `https://api.github.com/repos/${username}/${repo}`,
                {
                    headers: {
                        'User-Agent': 'ISAAC-MD',
                        'Accept': 'application/vnd.github+json'
                    }
                }
            );
            if (poll.status === 200) {
                ready = true;
                break;
            }
        }

        if (!ready) {
            return res.redirect(`https://github.com/${username}/${repo}`);
        }

        return res.redirect(HEROKU_URL(username, repo));

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
