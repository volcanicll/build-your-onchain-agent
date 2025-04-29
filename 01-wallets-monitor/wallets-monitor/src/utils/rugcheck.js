import { axiosClient } from './axiosClient.js';

// Token information class to parse and store RugCheck data
export class TokenInfo {
  constructor(data) {
    this.address = data.mint;
    this.name = data.tokenMeta?.name;
    this.symbol = data.tokenMeta?.symbol;
    this.creator = data.creator;
    this.uri = data.tokenMeta?.uri;

    // Token details
    this.supply = data.token?.supply;
    this.decimals = data.token?.decimals;
    this.mintAuthority = data.token?.mintAuthority;
    this.freezeAuthority = data.token?.freezeAuthority;
    // Convert ISO string to timestamp in seconds
    this.createdAt = data.detectedAt ? Math.floor(new Date(data.detectedAt).getTime() / 1000) : 0;

    // Calculate market metrics
    this.rugged = data.rugged ? "Yes" : "No";
    this.holders = data.totalHolders;
    this.priceUSD = data.price;
    this.marketCap = data.totalMarketLiquidity;
    this.liquidity = data.price * data.supply;

    // Top holders analysis
    this.topHolders = data.topHolders?.map(holder => ({
      address: holder.address,
      amount: holder.amount,
      percentage: holder.pct,
      owner: holder.owner,
      isInsider: holder.insider
    }));

    // Risk metrics
    this.insiderCount = data.graphInsidersDetected;
    this.risks = data.risks;
    this.score = data.score;
    this.normalizedScore = data.score_normalised;
  }
}

// RugCheck API wrapper class
export class RugCheck {
  static async getTokenInfo(tokenAddress) {
    const url = `https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report`;

    const response = await axiosClient.get(url).catch(error => {
      console.error('RugCheck API Error:', error.message);
      throw error;
    });

    console.log(response.data);

    if (!response.data) {
      throw new Error('No data returned from RugCheck');
    }

    return new TokenInfo(response.data);
  }
}

