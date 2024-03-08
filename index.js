/*
 * @Author: 星瞳 1944637830@qq.com
 * @Date: 2023-07-18 10:30:42
 * @LastEditors: 星瞳 1944637830@qq.com
 * @LastEditTime: 2024-03-02 21:39:00
 * @FilePath: \Boss直聘爬虫\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
let pptraction = require('./utl/pptrHelper');
let launchBrowser = require('./utl/pptrBrowserLauncher');
let my_job_click = require('./utl/boss_job_click');
let job_click_timer = 0;

/**
 * 主函数
 * @param {pptraction} pptr 
 */
async function main(pptr) {

    await my_job_click('https://www.zhipin.com/web/geek/job?city=101020100&experience=101,102', pptr,{
        isSendMsg:true//是否直接点“直接沟通按钮”发送消息
    });
    job_click_timer++;
    console.log(`第${job_click_timer}轮已跑完！————${new Date().toLocaleString('fr-CA')}`);
    await pptr.page.goto('about:blank');
}

(async function () {
    let bs = await launchBrowser('Browser_data', 'Default');
    let page = await bs.newPage();
    let pptr = new pptraction(page);
    pptr.waitAfterAction = 5 * 1e3; //每次操作之后的等待时间
    await main(pptr);
    setInterval(async () => {
        await main(pptr);
    }, 6 * 3600 * 1000);
})();
