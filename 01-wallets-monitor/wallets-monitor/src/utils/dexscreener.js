import { axiosClient } from "./axiosClient.js";
import { requestQueue } from "./requestQueue.js";

// Token information class to parse and store token data
export class TokenInfo {
  constructor(data) {
    const pair = data[0];
    const baseToken = pair.baseToken;

    this.name = baseToken.name;
    this.symbol = baseToken.symbol;
    this.address = baseToken.address;
    this.chain = pair.chainId;
    this.liquidity = pair.liquidity?.usd;
    this.marketCap = pair.marketCap;
    this.priceUSD = pair.priceUsd;
    this.createdAt = Math.floor(pair.pairCreatedAt / 1000); // Convert to seconds timestamp

    // Volume data
    const volume = pair.volume || {};
    this.volumeH24 = volume.h24;
    this.volumeH6 = volume.h6;
    this.volumeH1 = volume.h1;
    this.volumeM5 = volume.m5;

    // Price changes
    this.changeH6 = pair.priceChange?.h6;

    // Website and social media info
    if (pair.info) {
      this.website = pair.info.websites?.[0]?.url;

      const twitter = pair.info.socials?.find((s) => s.type === "twitter");
      this.twitter = twitter?.url;
    }
  }
}

// DexScreener API wrapper class
export class DexScreener {
  constructor() {
    this.baseUrl = "https://api.dexscreener.com/latest/dex";
  }

  async getTokenInfo(address) {
    const requestKey = `token-${address}`;

    return requestQueue.addRequest(requestKey, async () => {
      try {
        console.log(`Fetching token info for ${address}`);
        const response = await axiosClient.get(
          `${this.baseUrl}/tokens/${address}`
        );

        if (
          !response.data ||
          !response.data.pairs ||
          response.data.pairs.length === 0
        ) {
          throw new Error(`No pairs found for token ${address}`);
        }

        return new TokenInfo(response.data.pairs);
      } catch (error) {
        console.error(
          `Failed to fetch token info for ${address}:`,
          error.message
        );
        throw error;
      }
    });
  }
}

// 创建单例实例
export const dexScreener = new DexScreener();
