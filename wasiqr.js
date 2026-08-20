const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
const pino = require('pino');
const {
    default: Isak_Kingpin,
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

    async function ISAAC_MD_QR_CODE() {
        const { version } = await fetchLatestBaileysVersion();
        console.log(version);
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const Qr_Code_By_Isak_Kingpin = Isak_Kingpin({
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
            });

            Qr_Code_By_Isak_Kingpin.ev.on('creds.update', saveCreds);
            Qr_Code_By_Isak_Kingpin.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr && !res.headersSent) {
                    await res.end(await QRCode.toBuffer(qr));
                }

                if (connection === 'open') {
                    await Qr_Code_By_Isak_Kingpin.sendMessage(Qr_Code_By_Isak_Kingpin.user.id, { text: '𝐀 𝐦𝐨𝐦𝐞𝐧𝐭 𝐰𝐚𝐢𝐭 𝐟𝐨𝐫 𝐲𝐨𝐮𝐫 𝐬𝐞𝐬𝐬𝐢𝐨𝐧...' });
                    await delay(50000);
                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(8000);
                    const b64data = Buffer.from(data).toString('base64');
                    const session = await Qr_Code_By_Isak_Kingpin.sendMessage(Qr_Code_By_Isak_Kingpin.user.id, { text: 'ISAAC-MD:~' + b64data });

                    const ISAAC_MD_TEXT = `
┏━━━━━━━━━━━━━━
┃ISAAC-MD SESSION IS
┃SUCCESSFULLY
┃CONNECTED ✅
┗━━━━━━━━━━━━━━━
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❶ || Creator = 𖥘OFFICIAL-ISAAC𖥘
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
❷ || WhatsApp Group = https://chat.whatsapp.com/JPH5gho7uxfBMviXg7sNNs
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
Please Join My WhatsApp Group
FOR FAST REPLY +254754574642
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
©*OFFICIAL-ISAAC*
_____________________________________

_Don't Forget To Give Star To My Repo_`;

                    await Qr_Code_By_Isak_Kingpin.sendMessage(Qr_Code_By_Isak_Kingpin.user.id, { text: ISAAC_MD_TEXT }, { quoted: session });

                    await delay(100);
                    await Qr_Code_By_Isak_Kingpin.ws.close();
                    removeFile('./temp/' + id);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output?.statusCode !== 401) {
                    await delay(10000);
                    ISAAC_MD_QR_CODE();
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

    await ISAAC_MD_QR_CODE();
});

module.exports = router;

