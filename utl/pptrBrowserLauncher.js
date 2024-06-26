/*
 * @Author: 星瞳 1944637830@qq.com
 * @Date: 2023-07-18 14:17:05
 * @LastEditors: 星瞳 1944637830@qq.com
 * @LastEditTime: 2024-06-15 16:09:07
 * @FilePath: \Boss直聘爬虫\utl\pptrBrowserLauncher.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { sleep } = require('./Tool');
const stealth = StealthPlugin();
stealth.enabledEvasions.delete('user-agent-override');
puppeteer.use(StealthPlugin());

/**
 * @typedef {import('puppeteer-extra').Browser} PuppeteerBrowser
 */

/**
 * 
 * @param {String} userDataDir file_path
 * @param {String} userProfile Default/Profile 1/...
 * @returns {PuppeteerBrowser} browser 
 */
async function launchBrowser(userDataDir, userProfile) {
    let err_times=0;
    while (1){
        try {
        let __args = [];
        __args.push(
            `--start-stack-profiler`,
            //`--load-extension=${ext1}`,
            '--disable-notifications=true',
            '--no-sandbox',
            '-–ignore-certificate-errors',
            '--disable-infobars',
            '--disable-session-crashed-bubble',
            '--disable-web-security',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--mute-audio',
            '--disable-extensions',
            '--no-zygote',
            "--disable-xss-auditor",
            '--disable-popup-blocking',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            // '--single-process',
            `--profile-directory=${userProfile}`,
            // "--disable-features=IsolateOrigins,site-per-process",
            `--start-maximized`,
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certifcate-errors',
            '--ignore-certifcate-errors-spki-list',
        )
        let browser = await puppeteer.launch(
            {
                executablePath: `C:\\Users\\Acer\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe`,//浏览器路径
                //executablePath:`C:\\Program Files\\Google\\Chrome Dev\\Application\\chrome.exe`,
                headless: false,//false为显示浏览器界面
                defaultViewport: {//分辨率
                    width: 1920,
                    height: 1080,
                },
                args: __args,
                userDataDir: "UserData\\" + userDataDir,
                ignoreDefaultArgs: [
                    '--enable-automation',
                    '--disable-extensions',
                    '--disable-client-side-phishing-detection',
                    '--disable-sync',
                ],
                dumpio:true,
                pipe:true,
                ignoreHTTPSErrors: true,
                protocol:'webDriverBiDi'
            });
        //await global_var.page.setUserAgent(useragent);
        return browser;
    }
    catch (e) {
        console.log(userDataDir, "浏览器启动失败");
        console.error(e);
        await sleep(100e3)
        err_times++
        if (err_times>3){
            throw Error(e)
        }
    }
    }
    
}
module.exports = launchBrowser;