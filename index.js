/*
 * @Author: 星瞳 1944637830@qq.com
 * @Date: 2023-07-18 10:30:42
 * @LastEditors: 星瞳 1944637830@qq.com
 * @LastEditTime: 2024-03-18 21:09:06
 * @FilePath: \Boss直聘爬虫\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
let pptraction = require("./utl/pptrHelper");
let launchBrowser = require("./utl/pptrBrowserLauncher");
let my_job_click = require("./utl/boss_job_click");
let job_click_timer = 0;
const fs = require('fs');

/**
 * 主函数
 * @param {pptraction} pptr
 */
async function main(pptr) {
	try {
		let click_conf
		try{
			click_conf= JSON.parse(fs.readFileSync('./conf/globalconfig.json', 'utf8'));
			if (typeof click_conf !='object' && click_conf.lenth==0){
				throw new Error('配置文件格式错误！')
			}
		}
		catch(e){
			console.error(`读取点击配置失败！`)
		
		}
		await my_job_click(
			"https://www.zhipin.com/web/geek/job?city=101020100&experience=102,101,103&degree=203,202&areaBusiness=310101,310109,310106,310107,310105,310110",
			pptr,
			{
				isSendMsg: true, //是否直接点“直接沟通按钮”发送消息
				conf:click_conf
			}
		);
		job_click_timer++;
		console.log(
			`第${job_click_timer}轮已跑完！————${new Date().toLocaleString(
				"fr-CA"
			)}`
		);
		await pptr.page.goto("about:blank");
	} catch (e) {
		console.error(`执行失败！\n${e}`);
	}
}

(async function () {
	let bs = await launchBrowser("Browser_data", "Default");
	let page = await bs.newPage();
	let pptr = new pptraction(page);
	pptr.waitAfterAction = 5 * 1e3; //每次操作之后的等待时间
	await main(pptr);
	setInterval(async () => {
		await main(pptr);
	}, 6 * 3600 * 1000);
})();
