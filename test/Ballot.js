const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");

describe ("Ballot", async()=>{

    let ballot; let add0; let add1; let add2; let add3; let add4; let add5;
    const proposals = [
        "0x6100000000000000000000000000000000000000000000000000000000000000","0x6200000000000000000000000000000000000000000000000000000000000000","0x6300000000000000000000000000000000000000000000000000000000000000"
    ]

    beforeEach(async ()=>{

    [add0, add1, add2, add3, add4, add5, adds] = await ethers.getSigners();
    
    const Ballot = await ethers.getContractFactory("Ballot");
    ballot = await Ballot.deploy(proposals)

    })
    it("Should return the deployer as owner", async()=>{
        const owner = await ballot.chairperson();
        expect(add0.address).to.equal(owner) 
    });

    it("Should allow chairperson to give right to vote", async()=>{
        
        await ballot.giveRightToVote(add1);
        const rightVote = await ballot.voters(add1.address); 
        expect(rightVote.weight).to.equal(1)

    });

    it("Should allow only chairperson to give right to vote", async()=>{
        await expect(ballot.connect(add1).giveRightToVote(add2)).to.revertedWith("Only chairperson can give right to vote.")
    });

    it("Should not allow give right to vote to the address if it already voted", async()=>{
        await ballot.giveRightToVote(add1);
        await ballot.connect(add1).vote(1);
        await expect(ballot.giveRightToVote(add1)).to.revertedWith("The voter already voted.")
    });

    it("Should allow voter to delegate right to vote", async()=>{
        await ballot.giveRightToVote(add1);
        await ballot.connect(add1).delegate(add2);
        const rightVote = await ballot.voters(add2.address);
        expect(rightVote[0]).to.equal(1);
        
    });

    it("Should not allow voter to self-delegate and to delegate if voted already", async()=>{
        await ballot.giveRightToVote(add1);
        await expect(ballot.connect(add1).delegate(add1)).to.revertedWith("Self-delegation is disallowed.");
        await ballot.connect(add1).vote(1);
        await expect(ballot.connect(add1).delegate(add2)).to.revertedWith("You already voted.")

    });

    it("Should allow delegator to vote", async()=>{
        await ballot.giveRightToVote(add1);
        await ballot.connect(add1).delegate(add2);
        const rightVote = await ballot.voters(add2.address);
        expect(rightVote[0]).to.equal(1)
        

    });

    it("Should not allow voter to vote if delegated", async()=>{
        await ballot.giveRightToVote(add1);
        await ballot.connect(add1).delegate(add2);
        await expect(ballot.connect(add1).vote(1)).to.be.reverted
    });

    it("Should not allow address to vote if it is not a voter", async()=>{
        await expect(ballot.connect(add1).vote(1)).to.be.revertedWith("Has no right to vote")
    });

    it("Should not allow voter to vote twice", async()=>{
        await ballot.giveRightToVote(add1);
        await ballot.connect(add1).vote(1);
        await expect(ballot.connect(add1).vote(1)).to.be.revertedWith("Already voted.");
    });

    it("Should return the winning proposal index", async()=>{
        await ballot.giveRightToVote(add1);
        await ballot.connect(add1).vote(2);
        const winningProposalIndex = await ballot.winningProposal()
        expect(winningProposalIndex).to.be.equal(2)
    });

    it("Should return the winning proposal name", async()=>{
        await ballot.giveRightToVote(add1);
        await ballot.connect(add1).vote(2);
        const winningProposalName = await ballot.winnerName()
        expect(winningProposalName).to.be.equal(proposals[2])

    });
})