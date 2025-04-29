import { axiosClient } from './axiosClient.js';

// Token information class to parse and store Solana token data
export class SolTokenInfo {
  constructor(data) {
    // Jupiter API response parsing
    this.name = data.name || '';
    this.symbol = data.symbol || '';
    this.address = data.address || '';
    this.chain = 'solana';
    this.decimals = data.decimals;
    this.priceUSD = data.price || 0;
    this.volume24h = data.volume24h || 0;
    this.marketCap = this.calculateMarketCap(data);
    this.totalSupply = data.supply || 0;

    // Additional metrics
    this.priceChange24h = data.priceChange24h || 0;
    this.priceChange7d = data.priceChange7d || 0;

    // Calculated metrics
    this.fullyDilutedValuation = this.calculateFDV(data);
  }

  calculateMarketCap(data) {
    if (data.price && data.supply) {
      return data.price * data.supply;
    }
    return 0;
  }

  calculateFDV(data) {
    if (data.price && data.maxSupply) {
      return data.price * data.maxSupply;
    }
    return 0;
  }
}

// SolanaTokenAPI class
export class SolanaTokenAPI {
  static async getTokenInfo(tokenAddress) {
    try {
      // Jupiter API endpoint
      const response = await axiosClient.get(
        `https://price.jup.ag/v4/price?ids=${tokenAddress}`
      );

      if (!response.data?.data?.[tokenAddress]) {
        throw new Error('No data returned for token');
      }

      // Get token metadata from Jupiter Token List
      const metadataResponse = await axiosClient.get(
        'https://token.jup.ag/strict'
      );

      const tokenMetadata = metadataResponse.data?.find(
        token => token.address === tokenAddress
      );

      if (!tokenMetadata) {
        throw new Error('Token metadata not found');
      }

      // Combine price and metadata
      const combinedData = {
        ...tokenMetadata,
        price: response.data.data[tokenAddress].price,
        volume24h: response.data.data[tokenAddress].volume24h,
        priceChange24h: response.data.data[tokenAddress].priceChange24h,
      };

      return new SolTokenInfo(combinedData);
    } catch (error) {
      console.error('Token API Error:', error.message);
      throw error;
    }
  }

  static async getMultipleTokensInfo(tokenAddresses) {
    try {
      const addresses = tokenAddresses.join(',');
      const response = await axiosClient.get(
        `https://price.jup.ag/v4/price?ids=${addresses}`
      );

      if (!response.data?.data) {
        throw new Error('No data returned');
      }

      const metadataResponse = await axiosClient.get(
        'https://token.jup.ag/strict'
      );

      return tokenAddresses.map(address => {
        const priceData = response.data.data[address];
        const metadata = metadataResponse.data?.find(
          token => token.address === address
        );

        if (!priceData || !metadata) {
          return null;
        }

        const combinedData = {
          ...metadata,
          price: priceData.price,
          volume24h: priceData.volume24h,
          priceChange24h: priceData.priceChange24h,
        };

        return new SolTokenInfo(combinedData);
      }).filter(Boolean);
    } catch (error) {
      console.error('Multiple Tokens API Error:', error.message);
      throw error;
    }
  }
}
