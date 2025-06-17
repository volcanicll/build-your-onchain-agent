import { DexScreener } from '../utils/dexscreener.js';
import { sendTelegramMessage } from '../utils/telegram.js';
import { analyzeTokenTxs } from '../utils/txsAnalyzer.js';
import { createMsg } from './messageTemplate.js';
import { sendSumMessage } from '../utils/aiSummary.js';
import WeChatBot from '../utils/wechatBot.js';
import { analyzeTokenRisk } from '../utils/riskAnalysis.js';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

dotenv.config();

// Configuration constants
const MAX_AGE_DAYS = 7;
const MIN_MARKET_CAP = 100000; // 100k

const getTimeStamp = () => {
  return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
};


async function upsertAlertRecord(tokenInfo) {
  try {
    // 先查询是否存在记录
    const { data: existing } = await supabase
      .from('alerts')
      .select('alert_num')
      .eq('address', tokenInfo.address)
      .single();

    if (existing) {
      // 如果存在，更新 alert_num
      const { data, error } = await supabase
        .from('alerts')
        .update({
          alert_num: existing.alert_num + 1,
          symbol: tokenInfo.symbol  // 更新最新的symbol
        })
        .eq('address', tokenInfo.address);

      if (error) throw error;
      return data;
    } else {
      // 如果不存在，插入新记录
      const { data, error } = await supabase
        .from('alerts')
        .insert([{
          symbol: tokenInfo.symbol,
          address: tokenInfo.address,
          alert_num: 1,
          marketcap: tokenInfo.marketCap
        }]);

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error upserting alert record:', error);
    throw error;
  }
}

async function checkAlertHistory(tokenInfo) {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('alert_num')
      .eq('address', tokenInfo.address)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error checking alert history:', error);
    return null;
  }
}

// Check if token meets filtering criteria
export async function checkFilter(tokenAddress) {
  try {
    const tokenInfo = await DexScreener.getTokenInfo('solana', tokenAddress);
    if (!tokenInfo) return;

    const pairAge = (Date.now() / 1000 - tokenInfo.createdAt) / (60 * 60 * 24);
    if (pairAge <= MAX_AGE_DAYS && tokenInfo.marketCap >= MIN_MARKET_CAP) {


      const analysis = await analyzeTokenTxs(tokenAddress);

      // 监测代币风险
      const analyzeTokenInfo = await analyzeTokenRisk(tokenAddress);

      // Create and send message to Telegram
      const message = createMsg(tokenInfo, analysis, analyzeTokenInfo);
      const alertHistory = await checkAlertHistory(tokenInfo);

      let updatedMessage = message;

      if (alertHistory) {
        // 如果之前推送过，在消息开头添加推送次数信息
        const alertCount = alertHistory.alert_num + 1;
        updatedMessage = `🔄 第${alertCount}次推送提醒\n\n${message}`;
      }

      // 发送消息
      const tgResponse = await sendTelegramMessage(updatedMessage);
      WeChatBot.sendHtml(updatedMessage);

      if (tgResponse?.ok === true) {
        const messageId = tgResponse.result.message_id;
        // Send AI summary message
        if (!alertHistory) {
          await sendSumMessage(tokenInfo, messageId);
          console.log(`[${getTimeStamp()}] Successfully sent analysis for token ${tokenAddress} to Telegram`);
        }

        await upsertAlertRecord(tokenInfo);
      }
    }
  } catch (error) {
    console.error(`[${getTimeStamp()}] Error checking token ${tokenAddress}:`, error);
  }
}


