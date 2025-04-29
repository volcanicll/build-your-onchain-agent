import { axiosClient } from './axiosClient.js';

export async function analyzeTokenRisk(address) {
  try {
    const response = await axiosClient.get(`https://api.rugcheck.xyz/v1/tokens/${address}/report`);

    if (response.status != 200) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = response.data;

    // 构建 HTML 字符串

    let html = ``;

    // Top Holders (Concise)
    if (data.topHolders?.length > 0) {
      let top10Pct = data.topHolders.slice(0, 10).reduce((sum, h) => sum + h.pct, 0);
      html += `<b>👥 Top 10 Holders:</b> ${top10Pct.toFixed(2)}%\n`;
      // Show only the top 3, with last 4 digits of address
      data.topHolders.slice(0, 10).forEach(holder => {
        html += `   -- <a href="https://gmgn.ai/sol/address/${holder.owner}">${holder.owner.slice(0, 4)}......${holder.owner.slice(-4)}: </a>${holder.pct.toFixed(2)}%${holder.insider ? ' ⚠️' : ''}\n`;
      });

    }

    html += `<b>👤 Holders:</b> ${data.totalHolders || 'N/A'}\n`;

    // Liquidity (Simplified)
    if (data.markets?.[0]?.lp) { // Check if at least one market and LP data exists
      const lp = data.markets[0].lp;
      html += `<b>💧 LP Locked:</b> $${lp.lpLockedUSD.toFixed(2)} (${lp.lpLockedPct.toFixed(2)}%)\n`;
    }

    //Risks (Concise and with Emojis)
    let riskStr = "";
    if (data.risks && data.risks.length > 0) {
      data.risks.forEach(risk => {
        if (risk.level === "high") {
          riskStr += "🔴 "; // High risk
        } else if (risk.level === "medium") {
          riskStr += "🟠 "; // Medium risk
        } else if (risk.level === "low") {
          riskStr += "🟡 ";  //low risk
        }
        else {
          riskStr += "🟢 ";  // No risk
        }
      });
    }
    else {
      riskStr = "🟢";
    }

    html += `<b>⚠️ Risks:</b> ${riskStr}\n`;

    // Rugged Status (with Emoji)
    html += `<b>🚨 Rugged:</b> ${data.rugged ? 'Yes' : 'No'}\n`;


    // Transfer Fee (if applicable)
    if (data.transferFee?.pct) {
      html += `<b>💸 Transfer Fee:</b> ${data.transferFee.pct.toFixed(2)}%\n`;
    }


    return html;

  } catch (error) {
    console.error("Error fetching or processing token info:", error);
    return `<b>Error:</b> Could not retrieve token information.`;
  }
}



