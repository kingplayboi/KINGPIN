const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const pino = require('pino');
const {
    default: Brasho_Kish,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    delay,
    Browsers,
    makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const router = express.Router();

// Helper function to remove files
function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
}

// Route handler
router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function ISAAC_MD_PAIR_CODE() {
        const { version } = await fetchLatestBaileysVersion();
        console.log(version);
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            const Pair_Code_By_Brasho_Kish = Brasho_Kish({
          auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
        version,
        printQRInTerminal: false,
        logger: pino({
          level: 'silent',
        }),
        browser: Browsers.windows('Edge'),
      })
            if (!Pair_Code_By_Brasho_Kish.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const custom = "BLIZZARD";
                const code = await Pair_Code_By_Brasho_Kish.requestPairingCode(num,custom);

                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Brasho_Kish.ev.on('creds.update', saveCreds);
            Pair_Code_By_Brasho_Kish.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await Pair_Code_By_Isaac_Kish.sendMessage(Pair_Code_By_Brasho_Kish.user.id, { text: '𝐀 𝐦𝐨𝐦𝐞𝐧𝐭 𝐰𝐚𝐢𝐭 𝐟𝐨𝐫 𝐲𝐨𝐮𝐫 𝐬𝐞𝐬𝐬𝐢𝐨𝐧...' });
                    await delay(50000);
                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(8000);
                    const b64data = Buffer.from(data).toString('base64');
                    const session = await Pair_Code_By_Brasho_Kish.sendMessage(Pair_Code_By_Brasho_Kish.user.id, { text: 'ISAAC-MD:~' + b64data });

                    // Send random message after session
                    const Textt = "```ISAAC-MD has been linked to your WhatsApp account! Above is your session.\n\nCopy and paste it on the SESSION string during deploy as it will be used for authentication.\n\nIncase you are facing Any issue reach me via here👇\n\nBlueBlizzard~~ +254754574642\n\nAnd don't forget to fork and star our repo🎃,\n\nhttps://github.com/kingplayboi/ISAAC/fork.\n\nGoodluck 🎉. ```"
                    await Pair_Code_By_Brasho_Kish.sendMessage(Pair_Code_By_Brasho_Kish.user.id, { text: Textt }, { quoted: session });

                    await delay(100);
                    await Pair_Code_By_Brasho_Kish.ws.close();
                    removeFile('./temp/' + id);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    ISAAC_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('service restarted', err);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }

    await ISAAC_MD_PAIR_CODE();
});

module.exports = router;
