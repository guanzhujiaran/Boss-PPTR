const tool = require('./Tool');
/**
 * 在网站里面点击职业页面，然后关闭
 * @param {String} url 
 * @param {import('./pptrHelper')} pptr 
 */
async function job_click(url, pptr) {
    try {
        if (pptr && url) {
            let bs = await pptr.page.browser();
            pptr.goto(url);
            let list_json_resp = await (await pptr.page.waitForResponse(response => response.url().includes('joblist.json?') && response.status() === 200)).json();
            let pageSize = list_json_resp.zpData.pageSize ? list_json_resp.zpData.pageSize : list_json_resp.zpData.jobList.length;
            let pagenum = parseInt((list_json_resp.zpData.totalCount + list_json_resp.zpData.jobList.length + pageSize - 1) / pageSize)
            let now_url = await pptr.page.url();
            if (now_url.includes('https://www.zhipin.com/web/user/safe/verify-slider')) {
                console.error('遇到验证码，退出！');
                return;
            }
            if (now_url.includes('https://www.zhipin.com/web/user/')) {
                console.error('账号被强制登出，退出！');
                return
            }
            try {
                await pptr.waitFor('body > div.dialog-wrap.dialog-account-safe > div.dialog-container > div.dialog-title > a > i');
                await pptr.click('body > div.dialog-wrap.dialog-account-safe > div.dialog-container > div.dialog-title > a > i');
            } catch (e) {
                console.warn('无需点击安全弹窗关闭按钮！');
            }
            for (let i = 0; i < pagenum; i++) {
                await pptr.click('.job-card-wrapper', { ctrl_click: true });
                for (let p of await bs.pages()) {
                    let u = await p.url();
                    if (u.includes(url)) {//关闭之前点击开的页面
                    } else {
                        await p.close();
                    }
                }
                await pptr.click('.ui-icon-arrow-right');
                await tool.sleep(10e3)
                url = await pptr.page.url();
            }
        } else {
            throw ('invalid params!');
        }
    } catch (e) {
        console.warn(e)
    }

}

module.exports = job_click;