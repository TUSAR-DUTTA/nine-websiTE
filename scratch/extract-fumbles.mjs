const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function extractHistoricalFumbles() {
  const milestones = [
    { era: 'GENESIS LAUNCH (DAY 1)', badge: 'DAY 1', daysAgo: 16, from: 53315760, to: 53330000, priceAtSale: 0.000015, mcAtSale: '$15K MC' },
    { era: 'DAY 2 EARLY SURGE', badge: 'DAY 2', daysAgo: 15, from: 54100000, to: 54115000, priceAtSale: 0.000085, mcAtSale: '$85K MC' },
    { era: 'DAY 4 MOMENTUM', badge: 'DAY 4', daysAgo: 13, from: 55600000, to: 55615000, priceAtSale: 0.00045, mcAtSale: '$450K MC' },
    { era: 'DAY 6 $1M MC CROSS', badge: 'DAY 6', daysAgo: 11, from: 57400000, to: 57415000, priceAtSale: 0.0018, mcAtSale: '$1.8M MC' },
    { era: 'DAY 9 $20M BREAKOUT', badge: 'DAY 9', daysAgo: 8, from: 60000000, to: 60015000, priceAtSale: 0.022, mcAtSale: '$22M MC' },
    { era: 'DAY 12 $100M SUPER-CYCLE', badge: 'DAY 12', daysAgo: 5, from: 62800000, to: 62815000, priceAtSale: 0.098, mcAtSale: '$98M MC' },
    { era: 'DAY 14 $200M ATH RUN', badge: 'DAY 14', daysAgo: 3, from: 65100000, to: 65115000, priceAtSale: 0.21, mcAtSale: '$210M MC' }
  ];

  const results = [];

  for (const m of milestones) {
    await sleep(1000); // Respect RPC rate limit
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
            fromBlock: '0x' + m.from.toString(16),
            toBlock: '0x' + m.to.toString(16)
          }]
        })
      }).then(r => r.json());

      if (res.result && Array.isArray(res.result)) {
        console.log(`[SUCCESS] ${m.era} - ${res.result.length} logs found`);
        const transfers = res.result.map(l => ({
          txHash: l.transactionHash,
          from: '0x' + l.topics[1].slice(26),
          to: '0x' + l.topics[2].slice(26),
          tokens: Number(BigInt(l.data) / 1000000000000000000n),
          blockNumber: parseInt(l.blockNumber, 16)
        })).filter(t => t.tokens >= 10000).sort((a,b) => b.tokens - a.tokens);

        transfers.slice(0, 3).forEach(t => {
          results.push({
            era: m.era,
            badge: m.badge,
            daysAgo: m.daysAgo,
            txHash: t.txHash,
            wallet: t.from,
            tokens: Math.round(t.tokens),
            priceAtSale: m.priceAtSale,
            mcAtSale: m.mcAtSale,
            blockNumber: t.blockNumber
          });
        });
      } else {
        console.log(`[FAILED] ${m.era}:`, res.error || 'No results');
      }
    } catch(e) {
      console.error(`[ERROR] ${m.era}:`, e.message);
    }
  }

  console.log('\n--- TOTAL VALID HISTORICAL TRANSFERS FOUND:', results.length, '---');
  console.log(JSON.stringify(results, null, 2));
}

extractHistoricalFumbles();
