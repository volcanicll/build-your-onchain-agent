import { sendTelegramMessage } from "../utils/telegram.js";

const runTest = async () => {
  //   const tokenInfo = await DexScreener.getTokenInfo(
  //     "solana",
  //     "7GzT54V4jN5u5SsWeFmbUwYFkqCRUxafAS14bvVJpump"
  //   );
  const response = await sendTelegramMessage("❤️ Hello from test ❤💘   ", null);
  console.log(response);
};

runTest();
