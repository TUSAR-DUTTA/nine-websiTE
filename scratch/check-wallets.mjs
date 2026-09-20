const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function checkWallets() {
  const wallets = [
    { name: 'Trader 1', address: '0x48a097df16c7844a33b1c3d11ab353457846e13f' },
    { name: 'Trader 2', address: '0xb2b197c755dbc5db7b910784ab3b25614857ed4a' },
    { name: 'Trader 3', address: '0x503abcab77a67eee41dc144d1ce37f6e79e72205' },
    { name: 'Trader 4', address: '0x1944d7a35fde8a866357048e4082d2b06884f5ae' },
    { name: 'Trader 5', address: '0xe0925f03fe811a1c032ee18b72c6498c16105f56' },
    { name: 'Trader 6', address: '0xa2ee0dfcba343b2f54a86f917228807d9bb60b13' },
    { name: 'Trader 7', address: '0xc4a21f9d6485fc5893dd4a491b320a83daf4da1d' }
  ];

  for (const w of wallets) {
    await sleep(1500);
    const padded = '0x000000000000000000000000' + w.address.slice(2);
    try {
      const res = await fetch('https://rpc.mainnet.chain.robinhood.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getLogs',
          params: [{
            address: '0x2E8c31162b855A2ffa90F6F8634643Ad6F111e18',
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              padded
            ],
            fromBlock: '0x' + (53315760).toString(16),
            toBlock: '0x' + (67140000).toString(16)
          }]
        })
      }).then(r => r.json());

      if (res.result && Array.isArray(res.result)) {
        let totalTokens = 0n;
        res.result.forEach(l => { totalTokens += BigInt(l.data); });
        const tokens = Number(totalTokens / 1000000000000000000n);
        const athWorth = tokens * 0.3609;
        console.log(`[${w.name}] Wallet: ${w.address} | Txs: ${res.result.length} | Dumped: ${Math.round(tokens).toLocaleString()} $AI | ATH Worth: $${Math.round(athWorth).toLocaleString()}`);
      } else {
        console.log(`[${w.name}] Error:`, res.error?.message);
      }
    } catch(err) {
      console.error(err.message);
    }
  }
}
checkWallets();
