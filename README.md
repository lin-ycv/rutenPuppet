# rutenPuppet

Puppeteer for ruten.

> **DO NOT FORK THIS REPO AND USE ACTIONS DIRECTLY ON THE FORK<br>
> PRESS `Use this template` AND CREATE A NEW _PRIVATE_ REPO TO USE WITH ACTION**

## Requires
- NodeJS
  - puppeteer-extra
  - puppeteer-extra-plugin-stealth
- GPnuPG (to encrypt cookie file for online execution)

## Local execution
run `npm ci` at first run to download all the required modules (puppeteer and stealth plugin)

then, simply run (replace **USER** and **PASSWORD** with your ruten account username and password)
```
npm run claim -- USER PASSWORD
```
Cookie file is saved automatically after each run, so if `cookies.json` exists, username and password arguments can be omitted for future executions
```
npm run claim
```
you can still provide username and password with cookie file just in case the cookie has expired.

## Online execution
to execute online, username password option is unlikely to work, as most server IP's will be recognized as bot and require the completion of CAPTCHA, in this case use the cookie file to bypass login and CAPTCHA.

cookie files should not be uploaded online as is, please encrypt it with GnuPG
```
gpg --passphrase "PHRASE" --cipher-algo AES256 --batch --yes --symmetric cookies.json
```
replace **PHRASE** with the pass phrase you'd like to use to encrypt and decrypt with.
encrypted file has to be named `cookies.json.gpg`

For the encryption to be secure, **PHRASE** should follow all conventions for a strong password (symbols, numbers, upper and lower case ..etc)

USER, PASSWORD, and PHRASE should not be hardcoded, use secrets instead, the names for secrets should be:

 Secret name | value 
---|---
 USER | USER 
 PASS | PASSWORD 
 PHRASE | PHRASE 

 Included [workflow yml](.github/workflows/ruten.yml) requires you to pass in all 3 secrets, even if you plan to use cookie file, it can modified as needed.

Decryption of cookie file is done in the workflow and not the script, if you create your own workflow file, please make sure to include a decryption step
```
gpg --decrypt --passphrase "PHRASE" --batch --yes --output cookies.json cookies.json.gpg
```

 ## Screenshot
 A screenshot, `error.png`, will be created if login fails.
