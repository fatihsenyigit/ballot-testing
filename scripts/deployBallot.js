const hre = require("hardhat");

async function main() {
    const proposals = [
        "0x6100000000000000000000000000000000000000000000000000000000000000","0x6200000000000000000000000000000000000000000000000000000000000000","0x6300000000000000000000000000000000000000000000000000000000000000"
    ]
    const ballot = await hre.ethers.deployContract("Ballot",[proposals]);
    await ballot.waitForDeployment();
    console.log(ballot.target);
    console.log(ballot.runner.address);

}

main();