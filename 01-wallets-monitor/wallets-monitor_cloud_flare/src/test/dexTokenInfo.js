
import { axiosClient } from '../utils/axiosClient.js';
import { checkFilter } from '../strategy/checkFilter.js';

const tokenOutAddress = '9gyfbPVwwZx4y1hotNSLcqXCQNpNqqz6ZRvo8yTLpump';
const runmain = async () => {
  // const response = await axiosClient.get(`https://api.dexscreener.com/tokens/v1/solana/2VKBwYWzUbCUt8whqe3iA8TafXrMeE9MaLHcXqSrpump`);
  // console.log('Token Info:', response.data);
  await checkFilter(tokenOutAddress);
};

runmain();
