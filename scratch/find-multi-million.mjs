const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function findMultiMillionFumbles() {
  // Let's sample blocks across the major volume spikes (DexScreener showed 17 days of OHLCV)
  // Day 1 to Day 16 block ranges:
  // Day 1: 53315760 - 54000000
  // Day 3: 54900000 - 55500000
  // Day 6: 57000000 - 58000000
  // Day 8: 59000000 - 60000000
  // Day 10: 61000000 - 62000000
  // Day 12: 63000000 - 64000000
  // Day 14: 65000000 - 66000000
  // Day 16: 67000000 - 67140000

  const samples = [
    { name: 'Day 1 Launch High Vol', start: 53318000 },
    { name: 'Day 1 Post Launch', start: 53340000 },
    { name: 'Day 2 Surge', start: 54150000 },
    { name: 'Day 3 Expansion', start: 55100000 },
    { name: 'Day 4 Run', start: 55800000 },
    { name: 'Day 6 Breakout', start: 57500000 },
    { name: 'Day 8 Whale Moves', start: 59200000 },
    { name: 'Day 9 Big Dump', start: 60005000 },
    { name: 'Day 10 Surge', start: 61200000 },
    { name: 'Day 12 Peak MC', start: 63100000 },
    { name: 'Day 13 Major Vol', start: 63600000 },
    { name: 'Day 14 ATH Vol', start: 65200000 }
  ];

  const bigTxs = [];

  for (const s of samples) {
    await sleep(800);
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
            topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
            fromBlock: '0x' + s.start.toString(16),
            toBlock: '0x' + (s.start + 2500).toString(16)
          }]
        })
      }).then(r => r.json());

      if (res.result && Array.isArray(res.result)) {
        res.result.forEach(l => {
          try {
            const raw = BigInt(l.data);
            const tokens = Number(raw / 1000000000000000000n);
            if (tokens >= 1500000) { // 1.5M+ tokens ($540K to $4M+ at peak!)
              bigTxs.push({
                sample: s.name,
                block: parseInt(l.blockNumber, 16),
                txHash: l.transactionHash,
                from: '0x' + l.topics[1].slice(26),
                to: '0x' + l.topics[2].slice(26),
                tokens: Math.round(tokens)
              });
            }
          } catch(e) {}
        });
        console.log(`[${s.name}] Checked ${res.result.length} logs. Found so far: ${bigTxs.length}`);
      } else {
        console.log(`[${s.name}] Error or rate limit:`, res.error?.message);
      }
    } catch(err) {
      console.error(`[${s.name}] Fetch error:`, err.message);
    }
  }

  console.log('\n=== ALL LARGE TRANSFERS FOUND ===');
  console.log(JSON.stringify(bigTxs, null, 2));
}

findMultiMillionFumbles();
