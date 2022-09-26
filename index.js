const fs = require('fs/promises')
const fso = require('fs');
const pup = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
pup.use(StealthPlugin());
pup.use(
    AdblockerPlugin({
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
    })
)

if (process.argv[2] && process.argv[3])
    start(process.argv[2], process.argv[3]);
else
    start();

async function start(user = null, pass = null) {
    const browser = await pup.launch(/*{ headless: false }*/);
    const page = await browser.newPage();
    await page.setUserAgent('Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');

    if (fso.existsSync('cookies.json'))
        try {
            await loadCookie(page);
            await page.goto('https://www.ruten.com.tw/event/daily_mission.php', { waitUntil: 'networkidle0' });
        } catch (e) { console.log(e) }
    else if (user != null && pass != null) {
        console.log("NO COOKIES - login")
        try {
            await page.goto("https://member.ruten.com.tw/user/login.htm?refer=https://www.ruten.com.tw/event/daily_mission.php", { waitUntil: 'networkidle2' });
            await page.type('#userid', user);
            await page.type('#pass', pass);
            await Promise.all([
                page.click('#btn-login'),
                page.waitForNavigation({
                    waitUntil: 'networkidle0',
                }),
            ]);
        } catch (error) {
            if (error.name === "TimeoutError") {
                console.log(error.name + ": some kind of error, check error.png")
                await page.screenshot({ path: "error.png", fullPage: true })
            } else {
                console.log(error)
                await page.screenshot({ path: "error.png", fullPage: true })
            }
            await browser.close();
            return;
        }
    }
    else {
        console.log("no cookies and no credential, can't do anything");
        await browser.close();
        return;
    }

    const smsveri = await page.$('.rt-button-primary') == null;
    if (smsveri && process.argv[4] == null) {
        console.log("SMS error?");
        console.log("run again and add sms/auth code as third argument");
        await page.click('#btn_send_sms');
        await page.screenshot({ path: "error.png", fullPage: true });
        await browser.close();
        return;
    }
    else if (smsveri && process.argv[4] != null) {
        await page.type('#totp_code', process.argv[4]);
        await Promise.all([
            page.click('.rt-submit-button'),
            page.waitForNavigation({
                waitUntil: 'networkidle0',
            }),
        ]);
    }
    await page.waitForSelector('.mission-card-wrap');
    await saveCookie(page);
    if ((await page.$('button.rt-button-primary')) !== null) {
        const el = await page.$('button.rt-button-primary');
        const className = await (await el.getProperty('className')).jsonValue();
        if (className.includes('disabled')) {
            console.log('already redeemed');
        }
        else {
            console.log(await (await page.$('button.rt-button-primary')).evaluate(b => b.textContent))
            const b = await page.$('button.rt-button-primary');
            await b.click();
            console.log('✔ check in -n- got');
        }
        await page.waitForTimeout(2000)
        await page.screenshot({ path: "result.png", fullPage: true });
    }
    else {
        throw 'no buttons for claiming';
    }

    await browser.close();
}

//save cookie function
const saveCookie = async (page) => {
    console.log("Saving cookies");
    const cookies = await page.cookies();
    const cookieJson = JSON.stringify(cookies, null, 2);
    await fs.writeFile('cookies.json', cookieJson);
    console.log("Cookies saved");
}

//load cookie function
const loadCookie = async (page) => {
    const cookieJson = await fs.readFile('cookies.json');
    const cookies = JSON.parse(cookieJson);
    await page.setCookie(...cookies);
    console.log("Cookies loaded");
}
