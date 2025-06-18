import { createClient } from "@supabase/supabase-js";
import { processSwapData } from "../../src/utils/swapProcessor";
import { solParser } from "../../src/utils/txParser";
import { SOL_ADDRESS, USDC_ADDRESS } from "../../src/utils/swapProcessor.js";
import { checkFilter } from "../../src/strategy/checkFilter.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Handle Webhook request
export default async function handler(req, res) {
  // Check request method and authorization
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });
  if (req.headers.authorization !== `Bearer ${process.env.HELIUS_API_KEY}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Get transaction data
  const txData = Array.isArray(req.body) ? req.body[0] : req.body;
  if (!txData) {
    console.error("Empty transaction data received", txData);
    return res.status(200).json({ skipped: true, message: "Empty data" });
  }

  // Skip PUMP_FUN transactions or non-PUMP-AMM/METEORA_DLMM/JUPITER_V_6 transfer
  if (
    txData.source === "PUMP_FUN" ||
    (txData.type === "TRANSFER" &&
      txData.accountData?.some(
        (acc) => acc.account === "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
      )) ||
    (txData.type === "TRANSFER" &&
      !txData.accountData?.some(
        (acc) => acc.account === "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
      )) || //PUMP_AMM
    (txData.type === "TRANSFER" &&
      !txData.accountData?.some(
        (acc) => acc.account === "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"
      )) || //METEORA_DLMM
    (txData.type === "TRANSFER" &&
      !txData.accountData?.some(
        (acc) => acc.account === "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"
      ))
  ) {
    //JUPITER_V_6
    console.log(
      "Skipped PUMP_FUN related transaction or non-PUMP-AMM/METEORA_DLMM/JUPITER transfer:",
      txData.signature
    );
    return res.status(200).json({ skipped: true });
  }

  // Process transaction data
  let processedData = null;

  if (txData.events?.swap) {
    processedData = processSwapData(txData);
  } else if (txData.signature) {
    processedData = await solParser(txData.signature);
    if (!processedData) {
      console.error("Failed to parse tx:", txData.signature);
      return res.status(200).json({ skipped: true });
    }
  } else {
    console.log("No swap data:", txData.signature);
    return res.status(200).json({ skipped: true });
  }

  // Store to database
  const { error } = await supabase.from("txs").insert([
    {
      ...processedData,
      signature: txData.signature,
    },
  ]);
  if (error) {
    console.error("Error inserting into Supabase:", error);
    return res.status(500).json({ error: error });
  }

  // Post-insert monitoring check
  const postInsertCheck = async (processedData) => {
    const { token_out_address, account } = processedData;

    if (
      token_out_address !== SOL_ADDRESS &&
      token_out_address !== USDC_ADDRESS
    ) {
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

      const { data, error: queryError } = await supabase
        .from("txs")
        .select("id")
        .eq("token_out_address", token_out_address)
        .neq("account", account)
        .gte("timestamp", Math.floor(sixHoursAgo.getTime() / 1000))
        .limit(1);

      if (queryError) {
        console.error("Monitor query error:", queryError);
        return;
      }

      if (
        data?.length > 0 ||
        account === "DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm"
      ) {
        await checkFilter(token_out_address).catch(console.error);
      }
    }
  };

  // Execute monitoring check asynchronously
  postInsertCheck(processedData).catch(console.error);

  console.log(
    "Successfully processed and stored with parser:",
    txData.events?.swap ? "helius" : "shyft"
  );
  return res.status(200).json({
    success: true,
  });
}
