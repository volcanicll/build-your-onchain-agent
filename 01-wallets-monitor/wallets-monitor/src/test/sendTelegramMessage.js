import { sendTelegramMessage } from "../utils/telegram.js";
import WeChatBot from '../utils/wechatBot.js';



const runmain = async () => {
  const message = "Hello, World!";
  // const response = await sendTelegramMessage(message);
  await WeChatBot.sendHtml(`
🐶 Multi Buy Token: <b>$PROMETHEUS</b>
<code>DTPUUPRxnHAdM3DoiDiUf7M3mym8GXdp6A97AJEZpump</code>
🤍 <b>Solana</b>
💛 <b>MC:</b> <code>$1.3M</code>
🤎 <b>Vol/24h:</b> <code>$32.4M</code>
🤍 <b>Vol/1h:</b> <code>$457K</code>
💛 <b>Liq:</b> <code>$153K</code>
🤎 <b>USD:</b> <code>$0.001273</code>
🤍 <b>Age:</b> <code>17h ago</code>
💛 <b>6H:</b> <code>-51.03%</code>
🤎 <b>SmartMoney:</b>
  4 wallets bought $PROMETHEUS
  ▫<a href=" ">Unknown</a > bought $2K at MC $1.7M(10s ago), Holds: 25.76%
  ▫<a href="https://solscan.io/account/8MaVa9kdt3NW4Q5HyNAm1X5LbR8PQRVDc1W8NMVK88D5">Unknown</a > bought $8K at MC $2.6M(16h ago), Holds: 0.00%
  ▫<a href="https://solscan.io/account/4q7rNU1nRUWY14vaLPpzpc2C756UQE36vaDwphBpLf2s">Unknown</a > bought $743 at MC $4.9M(15h ago), Holds: 1.00%
  ▫<a href="https://solscan.io/account/8deJ9xeUvXSJwicYptA9mHsU2rN2pDx37KWzkDkEXhU6">Unknown</a > bought $9K at MC $3.5M(14h ago), Holds: 0.00%
  <a href="https://dexscreener.com/solana/DTPUUPRxnHAdM3DoiDiUf7M3mym8GXdp6A97AJEZpump">DexScreener</a > | <a href="https://gmgn.ai/sol/token/DTPUUPRxnHAdM3DoiDiUf7M3mym8GXdp6A97AJEZpump">GMGN</a > | <a href="https://x.com/AndyAyrey/status/1899577994710249805">Twitter</a >`);
  // console.log(response);
};

runmain();
