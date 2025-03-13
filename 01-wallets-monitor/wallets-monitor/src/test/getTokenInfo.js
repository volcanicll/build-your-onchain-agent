import fetch from "node-fetch";
import axios from "axios";
import axiosClient from "../utils/axiosClient.js";

const runTest = async () => {
  //   const tokenInfo = await DexScreener.getTokenInfo(
  //     "solana",
  //     "7GzT54V4jN5u5SsWeFmbUwYFkqCRUxafAS14bvVJpump"
  //   );
  const tokenInfo = await axiosClient.get(
    "https://api.dexscreener.com/tokens/v1/solana/6L8WXr2JeY1U6Hyv4NJBwZNrWHmmADAPjnYbAkS3pump",
    {
      timeout: 30000,
      headers: {
        "Content-Type": "*/*",
      },
    }
  );
  console.log(tokenInfo);
};

runTest();
