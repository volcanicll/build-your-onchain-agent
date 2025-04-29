import axios from 'axios';
import dotenv from "dotenv";
import TurndownService from 'turndown';

dotenv.config();

const { WX_BOT_KEY } = process.env;

// Initialize turndown service
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',  // 保持 - 作为列表标记
  br: '\n',              // 保持换行
  blankReplacement: function (content, node) {
    return node.isBlock ? '\n\n' : ' ';  // 保持段落间的空行
  }
});

// 添加自定义规则来处理 blockquote
turndownService.addRule('blockquote', {
  filter: 'blockquote',
  replacement: function (content) {
    // 保持原有缩进和换行
    return content.split('\n').map(line => `> ${line}`).join('\n');
  }
});

// Message Strategy Interface
class MessageStrategy {
  createMessage(content, options = {}) {
    throw new Error('createMessage method must be implemented');
  }
}

// Text Message Strategy
class TextMessageStrategy extends MessageStrategy {
  createMessage(content, options = {}) {
    const { mentionedList = [], mentionedMobileList = [] } = options;
    return {
      msgtype: 'text',
      text: {
        content,
        mentioned_list: mentionedList,
        mentioned_mobile_list: mentionedMobileList
      }
    };
  }
}

// Markdown Message Strategy
class MarkdownMessageStrategy extends MessageStrategy {
  createMessage(content) {
    return {
      msgtype: 'markdown',
      markdown: {
        content
      }
    };
  }
}

// Image Message Strategy
class ImageMessageStrategy extends MessageStrategy {
  createMessage(base64, md5) {
    return {
      msgtype: 'image',
      image: {
        base64,
        md5
      }
    };
  }
}

// News Message Strategy
class NewsMessageStrategy extends MessageStrategy {
  createMessage(articles) {
    return {
      msgtype: 'news',
      news: {
        articles
      }
    };
  }
}

/**
 * WeChat Work Bot message sender
 * Documentation: https://developer.work.weixin.qq.com/document/path/91770
 */
class WeChatBot {
  constructor() {
    if (!WX_BOT_KEY) {
      throw new Error('WX_BOT_KEY is required in environment variables');
    }
    this.webhook = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${WX_BOT_KEY}`;
    this.strategies = {
      text: new TextMessageStrategy(),
      markdown: new MarkdownMessageStrategy(),
      image: new ImageMessageStrategy(),
      news: new NewsMessageStrategy()
    };
  }

  /**
   * Convert HTML to Markdown and send
   * @param {string} html - HTML content
   * @param {Object} options - Additional options for markdown conversion
   * @returns {Promise}
   */
  async sendHtml(html, options = {}) {
    const markdown = turndownService.turndown(html);
    return this.send('markdown', markdown, options);
  }

  /**
   * Send message using specified strategy
   * @param {string} type - Message type (text, markdown, image, news)
   * @param {*} content - Message content
   * @param {Object} options - Additional options
   * @returns {Promise}
   */
  async send(type, content, options = {}) {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`Unsupported message type: ${type}`);
    }

    const message = strategy.createMessage(content, options);
    return this.sendMessage(message);
  }

  /**
   * Send message to WeChat Work bot
   * @param {Object} message - Message object
   * @returns {Promise}
   * @private
   */
  async sendMessage(message) {
    try {
      const response = await axios.post(this.webhook, message);
      if (response.data.errcode !== 0) {
        throw new Error(`WeChat Work bot error: ${response.data.errmsg}`);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to send message to WeChat Work bot:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const wechatBot = new WeChatBot();

// Export the instance directly
export default wechatBot; 
