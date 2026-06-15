import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";
const { ethers } = hre;

describe("PSLToken", function () {
  // Fixture to deploy the contract for each test
  async function deployPSLTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const PSLToken = await ethers.getContractFactory("PSLToken");
    const token = await PSLToken.deploy(owner.address);
    await token.waitForDeployment();
    
    return { token, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set correct name", async function () {
      const { token } = await loadFixture(deployPSLTokenFixture);
      expect(await token.name()).to.equal("PSL Token");
    });

    it("Should set correct symbol", async function () {
      const { token } = await loadFixture(deployPSLTokenFixture);
      expect(await token.symbol()).to.equal("PSL");
    });

    it("Should set correct decimals (18)", async function () {
      const { token } = await loadFixture(deployPSLTokenFixture);
      expect(await token.decimals()).to.equal(18);
    });

    it("Should set correct max supply (1 billion PSL)", async function () {
      const { token } = await loadFixture(deployPSLTokenFixture);
      const maxSupply = await token.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.parseEther("1000000000")); // 1 billion
    });

    it("Should mint initial supply to owner", async function () {
      const { token, owner } = await loadFixture(deployPSLTokenFixture);
      const totalSupply = await token.totalSupply();
      const ownerBalance = await token.balanceOf(owner.address);
      
      // Initial supply should be 100M PSL
      expect(totalSupply).to.equal(ethers.parseEther("100000000"));
      expect(ownerBalance).to.equal(ethers.parseEther("100000000"));
    });

    it("Should set deployer as owner", async function () {
      const { token, owner } = await loadFixture(deployPSLTokenFixture);
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const { token, owner, addr1 } = await loadFixture(deployPSLTokenFixture);
      
      await expect(token.mint(addr1.address, ethers.parseEther("1000")))
        .to.emit(token, "TokensMinted")
        .withArgs(addr1.address, ethers.parseEther("1000"));
      
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
      expect(await token.totalSupply()).to.equal(ethers.parseEther("100001000")); // 100M + 1000
    });

    it("Should not allow non-owner to mint", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployPSLTokenFixture);
      
      await expect(
        token.connect(addr1).mint(addr2.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should not allow minting beyond max supply", async function () {
      const { token, addr1 } = await loadFixture(deployPSLTokenFixture);
      
      // Try to mint more than remaining supply
      const remainingSupply = await token.remainingMintableSupply();
      const excessAmount = remainingSupply + ethers.parseEther("1");
      
      await expect(
        token.mint(addr1.address, excessAmount)
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("Should allow owner to batch mint", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployPSLTokenFixture);
      
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.parseEther("5000"), ethers.parseEther("3000")];
      
      await expect(token.batchMint(recipients, amounts))
        .to.emit(token, "TokensMinted")
        .withArgs(addr1.address, ethers.parseEther("5000"));
      
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("5000"));
      expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseEther("3000"));
      expect(await token.totalSupply()).to.equal(ethers.parseEther("100008000")); // 100M + 8000
    });

    it("Should revert batch mint with mismatched arrays", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployPSLTokenFixture);
      
      const recipients = [addr1.address, addr2.address];
      const amounts = [ethers.parseEther("5000")]; // Only 1 amount for 2 recipients
      
      await expect(
        token.batchMint(recipients, amounts)
      ).to.be.revertedWith("Array length mismatch");
    });
  });

  describe("Burning", function () {
    it("Should allow holders to burn their tokens", async function () {
      const { token, owner } = await loadFixture(deployPSLTokenFixture);
      
      const initialSupply = await token.totalSupply();
      const burnAmount = ethers.parseEther("1000");
      
      await token.burn(burnAmount);
      
      expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
      expect(await token.balanceOf(owner.address)).to.equal(initialSupply - burnAmount);
    });

    it("Should allow holders to burn from allowance", async function () {
      const { token, owner, addr1 } = await loadFixture(deployPSLTokenFixture);
      
      // Mint some tokens to addr1
      await token.mint(addr1.address, ethers.parseEther("10000"));
      
      // Approve owner to burn from addr1
      await token.connect(addr1).approve(owner.address, ethers.parseEther("5000"));
      
      // Owner burns from addr1's allowance
      await token.connect(owner).burnFrom(addr1.address, ethers.parseEther("5000"));
      
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("5000"));
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployPSLTokenFixture);
      
      // Mint tokens to addr1 first
      await token.mint(addr1.address, ethers.parseEther("10000"));
      
      // Transfer from addr1 to addr2
      await token.connect(addr1).transfer(addr2.address, ethers.parseEther("3000"));
      
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("7000"));
      expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseEther("3000"));
    });

    it("Should not allow transfer exceeding balance", async function () {
      const { token, addr1, addr2 } = await loadFixture(deployPSLTokenFixture);
      
      await expect(
        token.connect(addr1).transfer(addr2.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });
  });

  describe("Allowance", function () {
    it("Should approve and transferFrom correctly", async function () {
      const { token, owner, addr1, addr2 } = await loadFixture(deployPSLTokenFixture);
      
      // Mint tokens to owner
      const mintAmount = ethers.parseEther("10000");
      await token.mint(owner.address, mintAmount);
      
      // Approve addr1 to spend owner's tokens
      await token.approve(addr1.address, mintAmount);
      
      // addr1 transfers from owner to addr2
      await token.connect(addr1).transferFrom(owner.address, addr2.address, ethers.parseEther("3000"));
      
      expect(await token.balanceOf(owner.address)).to.equal(
        (await token.totalSupply()) - ethers.parseEther("3000")
      );
      expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseEther("3000"));
      expect(await token.allowance(owner.address, addr1.address)).to.equal(
        mintAmount - ethers.parseEther("3000")
      );
    });
  });

  describe("Remaining supply", function () {
    it("Should return correct remaining mintable supply", async function () {
      const { token, addr1 } = await loadFixture(deployPSLTokenFixture);
      
      const initialRemaining = await token.remainingMintableSupply();
      const mintAmount = ethers.parseEther("50000");
      
      await token.mint(addr1.address, mintAmount);
      
      expect(await token.remainingMintableSupply()).to.equal(
        initialRemaining - mintAmount
      );
    });
  });
});