import '@nomiclabs/hardhat-ethers'
import '@openzeppelin/hardhat-upgrades'
import { ethers, upgrades } from 'hardhat'

async function main() {

  const addressesJson = require(
    `../deployed-contracts/ethereum.json`,
  );

  // const addresses = addressesJson.amoyAddresses;
  const addresses = addressesJson.blockdagTestnetAddresses;

  const verifierAddress = addresses.TD3QueryProofVerifier;
  const registrationSMTAddress = addresses.RegistrationSMTReplicator;
  
  // Example timestamp upper bound (e.g., current time + 1 month)
  const identityCreationTimestampUpperBound = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  // Citizen whitelist example: ["CRI"]
  const citizenshipWhitelist = [
    0x435249, // CRI
  ];

  const senderBlacklist  = ["0xE100422ABa51537d8636c64ca594bC0813f3a554"];

  const destinationWhitelist = ["0x86E67a05324A55AF6B2b3bF1A5cBA1778C56A8bE"]

  // Example birth date lower bound (e.g., 18 years ago)
  const birthDateLowerbound = Math.floor(Date.now() / 1000) - 18 * 365 * 24 * 60 * 60;

  // Example expiration date lower bound (e.g., must expire after 2026)
  const expirationDateLowerBound = Math.floor(new Date("2026-01-01").getTime() / 1000);

  const identityCounterUpperBound = 1;

  const transferParams = {
        identityCreationTimestampUpperBound,
        identityCounterUpperBound,
        birthDateLowerbound,
        expirationDateLowerBound
  };

  console.log("transfer params: ", JSON.stringify(transferParams, null, 2));

  console.log(`verifier contract deployed to ${verifierAddress}`);

  const ZikuaniBlacklistTransferContract = await ethers.getContractFactory("ZikuaniBlacklistTransfer");

  const initLists = {
    nationalityWhitelist: citizenshipWhitelist,
    senderBlacklist,
    destinationWhitelist,
  };

  const ZikuaniBlacklistTransferProxy = await upgrades.deployProxy(
    ZikuaniBlacklistTransferContract,
    [
      transferParams,
      initLists,
      registrationSMTAddress,
      verifierAddress,
      // Selector bitmask must match the one used when building the proof
      // 2593 decimal == 0xA21
      2593,
    ],
    { initializer: "initialize" }
  );

  await ZikuaniBlacklistTransferProxy.waitForDeployment();

  console.log(`ZikuaniBlacklistTransfer proxy deployed at ${await ZikuaniBlacklistTransferProxy.getAddress()}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
})
