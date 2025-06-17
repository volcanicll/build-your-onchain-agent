import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

export async function sendWxMessage(config) {
  const { BOT_KEY } = process.env;
  const messageConfig = {
    msgtype: "text",
    text: { content: config },
  };
  try {
    const response = await fetch(
      `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${BOT_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageConfig),
      }
    );

    const result = await response.json();

    if (result.errcode === 0) {
      console.log("群机器人：消息发送成功！");
    }
  } catch (error) {
    console.error("群机器人：消息发送失败！", error);
  }
}
