const fs = require('fs');
const { Page } = require('puppeteer-core');



/**
 * 封装了使用 Puppeteer 进行浏览器操作的工具类
 */
class PuppeteerActions {
    /**
     * 创建一个 PuppeteerActions 实例
     * @param {Page} page - Puppeteer 页面对象
     */
    constructor(page) {
        /**@prop {Page} page - 浏览器页面handler*/
        this.page = page;
        this.defaultDelay = 1000; // 默认等待时间（毫秒）
        this.defaultTimeout = 5000; // 默认超时时间（毫秒）
        this.errorLogFile = 'error.log'; // 错误日志文件名
        this.waitAfterAction = this.defaultDelay; // 操作完成后的等待时间
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟时间（毫秒）
     */
    async delay(ms) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 等待指定元素出现
     * @param {string} selector - 元素选择器
     * @param {Object} [options={}] - 配置选项
     * @param {number} [options.delay] - 操作完成后的等待时间（毫秒）
     * @param {number} [options.timeout] - 超时时间（毫秒）
     * @param {number} [options.index] - 要操作的元素的索引
     */
    async waitFor(selector, options = {}) {
        const { delay = this.waitAfterAction, timeout = this.defaultTimeout, index } = options;

        try {
            const elements = await this.page.$$(selector);
            if (elements.length > 0) {
                if (index !== undefined) {
                    const element = elements[index - 1];
                    if (!element) {
                        throw new Error(`No element found at index ${index}`);
                    }
                    await element.waitForSelector(selector, { timeout });
                    await this.delay(delay);
                } else {
                    for (const element of elements) {
                        await element.waitForSelector(selector, { timeout });
                        await this.delay(delay);
                    }
                }
            } else {
                throw new Error(`No elements found with selector: ${selector}`);
            }
        } catch (error) {
            const errorMessage = `Error waiting for selector ${selector} on page ${this.page.url()}: ${error.message}`;
            console.error(errorMessage);
            this.writeErrorLog(errorMessage);
            throw error;
        }
    }

    /**
     * 点击指定元素或多个匹配元素
     * @param {string} selector - 元素选择器
     * @param {Object} [options={}] - 配置选项
     * @param {number} [options.delay] - 操作完成后的等待时间（毫秒）
     * @param {number} [options.timeout] - 超时时间（毫秒）
     * @param {number} [options.index] - 要操作的元素的索引
     * @param {number} [options.ctrl_click] - 是否需要按ctrl去点击
     */
    async click(selector, options = {}) {
        const { delay = this.waitAfterAction, timeout = this.defaultTimeout, index, ctrl_click } = options;

        try {
            const elements = await this.page.$$(selector);
            if (elements.length > 0) {
                if (index !== undefined) {
                    const element = elements[index - 1];
                    if (!element) {
                        throw new Error(`No element found at index ${index}`);
                    }
                    if (ctrl_click) {
                        this.page.keyboard.press('ControlLeft', { delay: delay / 2 });
                        await element.click();
                        await this.delay(delay / 2);
                    }
                    else {
                        await element.click();
                    }
                    await this.delay(delay / 2);
                    await this.page.bringToFront();
                    await this.delay(delay / 2);
                    console.log(`Clicked on element at index ${index} with selector: ${selector}`);
                } else {
                    for (const element of elements) {
                        if (ctrl_click) {
                            this.page.keyboard.press('ControlLeft', { delay: delay / 2 });
                            await element.click();
                            await this.delay(delay / 2);
                        }
                        else {
                            await element.click();
                        }
                        await this.delay(delay / 2);
                        await this.page.bringToFront();
                        await this.delay(delay / 2);
                    }
                    console.log(`Clicked on elements with selector: ${selector}`);
                }
            } else {
                throw new Error(`No elements found with selector: ${selector}`);
            }
        } catch (error) {
            const errorMessage = `Error clicking on elements with selector ${selector} on page ${this.page.url()}: ${error.message}`;
            console.error(errorMessage);
            this.writeErrorLog(errorMessage);
            throw error;
        }
    }

    /**
     * 在指定元素上输入文本
     * @param {string} selector - 元素选择器
     * @param {string} text - 要输入的文本
     * @param {Object} [options={}] - 配置选项
     * @param {number} [options.delay] - 操作完成后的等待时间（毫秒）
     * @param {number} [options.timeout] - 超时时间（毫秒）
     * @param {number} [options.index] - 要操作的元素的索引
     */
    async type(selector, text, options = {}) {
        const { delay = this.waitAfterAction, timeout = this.defaultTimeout, index } = options;

        try {
            const elements = await this.page.$$(selector);
            if (elements.length > 0) {
                if (index !== undefined) {
                    const element = elements[index - 1];
                    if (!element) {
                        throw new Error(`No element found at index ${index}`);
                    }
                    await element.type(text);
                    await this.delay(delay);
                    console.log(`Typed "${text}" into element at index ${index} with selector: ${selector}`);
                } else {
                    for (const element of elements) {
                        await element.type(text);
                        await this.delay(delay);
                    }
                    console.log(`Typed "${text}" into elements with selector: ${selector}`);
                }
            } else {
                throw new Error(`No elements found with selector: ${selector}`);
            }
        } catch (error) {
            const errorMessage = `Error typing into elements with selector ${selector} on page ${this.page.url()}: ${error.message}`;
            console.error(errorMessage);
            this.writeErrorLog(errorMessage);
            throw error;
        }
    }

    /**
     * 悬停在指定元素上
     * @param {string} selector - 元素选择器
     * @param {Object} [options={}] - 配置选项
     * @param {number} [options.delay] - 操作完成后的等待时间（毫秒）
     * @param {number} [options.timeout] - 超时时间（毫秒）
     * @param {number} [options.index] - 要操作的元素的索引
     */
    async hover(selector, options = {}) {
        const { delay = this.waitAfterAction, timeout = this.defaultTimeout, index } = options;


        try {
            const elements = await this.page.$$(selector);
            if (elements.length > 0) {
                if (index !== undefined) {
                    const element = elements[index - 1];
                    if (!element) {
                        throw new Error(`No element found at index ${index}`);
                    }
                    await element.hover();
                    await this.delay(delay);
                    console.log(`Hovered over element at index ${index} with selector: ${selector}`);
                } else {
                    for (const element of elements) {
                        await element.hover();
                        await this.delay(delay);
                    }
                    console.log(`Hovered over elements with selector: ${selector}`);
                }
            } else {
                throw new Error(`No elements found with selector: ${selector}`);
            }
        } catch (error) {
            const errorMessage = `Error hovering over elements with selector ${selector} on page ${this.page.url()}: ${error.message}`;
            console.error(errorMessage);
            this.writeErrorLog(errorMessage);
            throw error;
        }
    }

    /**
    
    跳转到指定 URL
    @param {string} url - 要跳转的 URL
    @param {Object} [options={}] - 配置选项
    @param {number} [options.delay] - 操作完成后的等待时间（毫秒）
    @param {number} [options.timeout] - 超时时间（毫秒）
    */
    async goto(url, options = {}) {
        const { delay = this.waitAfterAction, timeout = this.defaultTimeout } = options;
        try {
            await this.page.goto(url, { timeout });
            await this.delay(delay);
            console.log(`Navigated to URL: ${url}`);
        } catch (error) {
            const errorMessage = `Error navigating to URL ${url}: ${error.message}`;
            console.error(errorMessage);
            this.writeErrorLog(errorMessage);
            throw error;
        }
    }

    /**
    
    将错误信息写入日志文件
    @param {string} errorMessage - 错误信息
    */
    writeErrorLog(errorMessage) {
        const logEntry = `${new Date().toISOString()} - ${errorMessage} \n`;
        fs.appendFileSync(this.errorLogFile, logEntry);
    }
}
module.exports = PuppeteerActions;
