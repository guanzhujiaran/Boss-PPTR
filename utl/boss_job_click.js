/*
 * @Author: 星瞳 1944637830@qq.com
 * @Date: 2023-07-23 23:47:08
 * @LastEditors: 星瞳 1944637830@qq.com
 * @LastEditTime: 2024-03-02 21:43:43
 * @FilePath: \Boss直聘爬虫\utl\boss_job_click.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: 星瞳 1944637830@qq.com
 * @Date: 2023-07-23 23:47:08
 * @LastEditors: 星瞳 1944637830@qq.com
 * @LastEditTime: 2024-02-25 22:05:21
 * @FilePath: \Boss直聘爬虫\utl\boss_job_click.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const tool = require("./Tool");
/**
 * @typedef {Object} jobClickOption
 * @property {boolean} isSendMsg - 是否直接点击“立即沟通”按钮
 */

const elementMap = {
	start_chat_btn: "info-public",
	job_card: ".job-card-wrapper",
};

/**
 * 在网站里面点击职业页面，然后关闭
 * @param {String} url
 * @param {import('./pptrHelper')} pptr
 * @param {jobClickOption} options
 */
async function job_click(url, pptr, options = {}) {
	let { isSendMsg } = options;
	let click_element = isSendMsg
		? elementMap.start_chat_btn
		: elementMap.job_card;
	try {
		if (pptr && url) {
			let bs = await pptr.page.browser();
			pptr.goto(url);
			let list_json_resp = await (
				await pptr.page.waitForResponse(
					(response) =>
						response.url().includes("joblist.json?") &&
						response.status() === 200
				)
			).json();
			let pageSize = list_json_resp.zpData.pageSize
				? list_json_resp.zpData.pageSize
				: list_json_resp.zpData.jobList.length;
			let pagenum = parseInt(
				(list_json_resp.zpData.totalCount +
					list_json_resp.zpData.jobList.length +
					pageSize -
					1) /
					pageSize
			);
			let now_url = await pptr.page.url();
			if (
				now_url.includes(
					"https://www.zhipin.com/web/user/safe/verify-slider"
				)
			) {
				console.error("遇到验证码，退出！");
				return;
			}
			if (now_url.includes("https://www.zhipin.com/web/user/")) {
				console.error("账号被强制登出，退出！");
				return;
			}
			try {
				await pptr.waitFor(
					"body > div.dialog-wrap.dialog-account-safe > div.dialog-container > div.dialog-title > a > i"
				);
				await pptr.click(
					"body > div.dialog-wrap.dialog-account-safe > div.dialog-container > div.dialog-title > a > i"
				);
			} catch (e) {
				console.warn("无需点击安全弹窗关闭按钮！");
			}
			for (let i = 0; i < pagenum; i++) {
				await pptr.click(click_element, { ctrl_click: true });
				for (let p of await bs.pages()) {
					let u = await p.url();
					if (u.includes(url)) {
						//关闭之前点击开的页面
					} else {
						await p.close();
					}
				}
				await pptr.click(".ui-icon-arrow-right");
				await tool.sleep(10e3);
				url = await pptr.page.url();
			}
		} else {
			throw "invalid params!";
		}
	} catch (e) {
		console.warn(e);
	}
}

module.exports = job_click;
