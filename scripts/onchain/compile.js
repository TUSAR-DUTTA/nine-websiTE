const fs = require('fs');
const path = require('path');
const solc = require('solc');

function compileContracts() {
  console.log('[COMPILER] Compiling NineToken.sol with solc 0.8.20...');

  const tokenPath = path.join(__dirname, '..', '..', 'contracts', 'NineToken.sol');
  const tokenSource = fs.readFileSync(tokenPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'NineToken.sol': { content: tokenSource }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const hasError = output.errors.some(e => e.severity === 'error');
    output.errors.forEach(err => console.log(err.formattedMessage));
    if (hasError) {
      throw new Error('Compilation failed with errors');
    }
  }

  const artifactsDir = path.join(__dirname, 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const tokenContract = output.contracts['NineToken.sol']['NineToken'];

  fs.writeFileSync(
    path.join(artifactsDir, 'NineToken.json'),
    JSON.stringify({
      contractName: 'NineToken',
      abi: tokenContract.abi,
      bytecode: tokenContract.evm.bytecode.object
    }, null, 2)
  );

  console.log('[COMPILER] Compilation successful! Artifacts written to scripts/onchain/artifacts/');
}

if (require.main === module) {
  compileContracts();
}

module.exports = { compileContracts };
