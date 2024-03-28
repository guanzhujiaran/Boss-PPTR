/*
 * @Author: 星瞳 1944637830@qq.com
 * @Date: 2023-07-23 23:47:08
 * @LastEditors: 星瞳 1944637830@qq.com
 * @LastEditTime: 2024-03-28 13:35:10
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
 * @typedef {Object} clickConf
 * @property {string} domain - 网址包含内容
 * @property {string[]} ignore_words - 屏蔽关键词
 */
/**
 * @typedef {Object} jobClickOption
 * @property {boolean} isSendMsg - 是否直接点击“立即沟通”按钮
 * @property {clickConf[]} conf
 */

const elementMap = {
	start_chat_btn: ".info-public",
	job_card: ".job-card-wrapper",
	chat_block_dialog: ".chat-block-dialog",
	job_name: ".job-name",
};

/**
 * 在网站里面点击职业页面，然后关闭
 * @param {String} url
 * @param {import('./pptrHelper')} pptr
 * @param {jobClickOption} options
 */
async function job_click(url, pptr, options = {}) {
	let { isSendMsg, conf } = options;
	let myconf = conf?.find((el) => url.includes(el.domain));
	let click_element = isSendMsg
		? elementMap.start_chat_btn
		: elementMap.job_card;
	let job_apply_succ_counter = 0;
	try {
		if (pptr && url) {
			let bs = pptr.page.browser();
			let list_json_resp;
			pptr.page.goto(url);
			list_json_resp = await (
				await pptr.page.waitForResponse((resp) =>
					resp.url().includes("joblist.json?")
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
			if (
				now_url.includes("https://www.zhipin.com/web/user/") ||
				(await pptr.page.$(`.btn.btn-outline.header-login-btn`))
			) {
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
				console.debug("无需点击安全弹窗关闭按钮！");
			}
			for (let i = 0; i < pagenum; i++) {
				await pptr.page
					.$$(elementMap.job_card)
					.then(async (job_cards) => {
						for (let job_card of job_cards) {
							let job_name;
							try {
								job_name = await job_card.$eval(
									elementMap.job_name,
									(_) => _.innerText
								);
							} catch (e) {
								console.error(`获取职位名称失败！${e}`);
							}
							if (
								myconf &&
								typeof job_name === "string" &&
								myconf.ignore_words.some((word) =>
									job_name.includes(word)
								)
							) {
								console.debug(`${job_name} 遇到屏蔽职位名称！`);
								continue;
							}
							await job_card
								.$eval(
									`.start-chat-btn`,
									(elm, jbn) => {
										if (elm.innerText == "继续沟通") {
											console.log(`${jbn} 点击过的职位`);
											return false;
										}
										return true;
									},
									{
										jbn: job_name,
									}
								)
								.then(async (res) => {
									if (res) {
										await job_card
											.$(elementMap.start_chat_btn)
											.then(async (btn) => {
												await btn.click();
												for (let p of await bs.pages()) {
													let u = await p.url();
													if (u.includes(url)) {
														//关闭之前点击开的页面
													} else {
														await p.close();
													}
												}
											})
											.catch((err) => {
												console.error(
													`${job_name} 点击沟通职位失败！${err}`
												);
											});
										if (
											(
												await pptr.page.$$(
													`.side-slogan-box`
												)
											).length > 0
										) {
											console.log(`账号未登录`);
											return;
										}
										console.log(
											`${job_name} 点击了${click_element}`
										);
										job_apply_succ_counter++;
										await tool.sleep(3e3);
										await pptr.page
											.$(
												`.greet-boss-container .icon-close`
											)
											.then(async (icon_close) => {
												for (let p of await bs.pages()) {
													let u = p.url();
													if (
														u.includes(
															new URL(url)
																.pathname
														)
													) {
														//关闭之前点击开的页面
													} else {
														await p.close();
													}
												}
												console.log(`点击了关闭提示框`);
												await icon_close.click();
											})
											.catch((e) => {
												console.error(
													`关闭提示框失败！${e}`
												);
											});
									}
								})
								.catch((e) => {
									console.error(`点击沟通元素失败！\n${e}`);
								});
							if (
								(
									await pptr.page.$$(
										elementMap.chat_block_dialog
									)
								).length > 0
							) {
								console.warn(`无法继续沟通`);
								return;
							}
							console.log(
								`执行完成第${job_cards.indexOf(job_card)}/${
									job_cards.length
								}张职业卡片`
							);
						}
					});
				if ((await pptr.page.$$(`.side-slogan-box`)).length > 0) {
					console.log(`账号未登录`);
					return;
				}
				if (
					(await pptr.page.$$(elementMap.chat_block_dialog)).length >
					0
				) {
					console.warn(
						`无法继续沟通，退出执行！本轮共点击${job_apply_succ_counter}个职业卡片！`
					);
					return;
				}
				for (let p of await bs.pages()) {
					let u = await p.url();
					if (u.includes(url)) {
						//关闭之前点击开的页面
					} else {
						await p.close();
					}
				}
				await pptr.page.click(".ui-icon-arrow-right");
				console.log(`点击下一页`);
				await tool.sleep(10e3);
				url = pptr.page.url();
			}
			console.log(`本轮共点击${job_apply_succ_counter}个职业卡片！`);
		} else {
			throw "invalid params!";
		}
	} catch (e) {
		console.warn(e);
	}
}

module.exports = job_click;
