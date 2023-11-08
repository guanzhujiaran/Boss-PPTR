let pptraction = require('./utl/pptrHelper');
let launchBrowser = require('./utl/pptrBrowserLauncher');
let my_job_click = require('./utl/boss_job_click');


(async function () {
    let bs = await launchBrowser('Browser_data', 'Default');
    let page = await bs.newPage();
    let pptr = new pptraction(page);
    pptr.waitAfterAction = 0.5 * 1e3;
    let job_click_timer = 0;
    await my_job_click('https://www.zhipin.com/web/geek/recommend?ka=open_joblist&page=1&sortType=1&experience=102', pptr);
    await my_job_click('https://www.zhipin.com/web/geek/recommend?ka=open_joblist&page=1&sortType=2&experience=102', pptr);
    job_click_timer++;
    console.log(`第${job_click_timer}轮已跑完！————${new Date().toLocaleString('fr-CA')}`);
    setInterval(async () => {
        await my_job_click('https://www.zhipin.com/web/geek/recommend?ka=open_joblist&page=1&sortType=1', pptr);
        await my_job_click('https://www.zhipin.com/web/geek/recommend?ka=open_joblist&page=1&sortType=2', pptr);
        job_click_timer++;
        console.log(`第${job_click_timer}轮已跑完！————${new Date().toLocaleString('fr-CA')}`);
    }, 5 * 3600 * 1000);
})();
