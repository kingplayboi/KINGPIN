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
                    const qrBuffer = await QRCode.toBuffer(qr);
                    const qrBase64 = qrBuffer.toString('base64');

                    const htmlContent = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>ISAAC-MD | Scan QR</title>
                        <style>
                            * {
                                box-sizing: border-box;
                                margin: 0;
                                padding: 0;
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            }
                            body {
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                                background-size: cover;
                                background-position: center;
                                color: #fff;
                                text-align: center;
                                padding: 20px;
                            }
                            .container {
                                background: rgba(0, 0, 0, 0.65);
                                backdrop-filter: blur(10px);
                                padding: 30px 20px;
                                border-radius: 20px;
                                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                                border: 1px solid rgba(255, 255, 255, 0.18);
                                max-width: 400px;
                                width: 100%;
                            }
                            h1 {
                                font-size: 24px;
                                margin-bottom: 10px;
                                color: #00ffcc;
                                text-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
                            }
                            p {
                                font-size: 15px;
                                margin-bottom: 15px;
                                color: #e0e0e0;
                            }
                            .qr-box {
                                background: #fff;
                                padding: 15px;
                                border-radius: 15px;
                                display: inline-block;
                                margin: 15px 0;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                            }
                            .qr-box img {
                                display: block;
                                width: 230px;
                                height: 230px;
                            }
                            .timer-box {
                                font-size: 16px;
                                font-weight: bold;
                                color: #ff4757;
                                background: rgba(255, 71, 87, 0.15);
                                padding: 10px;
                                border-radius: 10px;
                                border: 1px solid rgba(255, 71, 87, 0.3);
                                margin-top: 10px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>ISAAC-MD SCANNER</h1>
                            <p>Scan this QR code using WhatsApp to connect your session.</p>
                            
                            <div class="qr-box">
                                <img src="data:image/png;base64,${qrBase64}" alt="WhatsApp QR Code">
                            </div>

                            <div class="timer-box">
                                QR code expires in <span id="timer">60</span>s
                            </div>
                        </div>

                        <script>
                            let timeLeft = 60;
                            const timerDisplay = document.getElementById('timer');
                            const countdown = setInterval(() => {
                                timeLeft--;
                                timerDisplay.textContent = timeLeft;
                                if (timeLeft <= 0) {
                                    clearInterval(countdown);
                                    window.location.reload();
                                }
                            }, 1000);
                        </script>
                    </body>
                    </html>`;

                    await res.send(htmlContent);
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

