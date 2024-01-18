// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//Ownable allows the transfer of ownership of NFTs

contract NFTAuction is ERC721, Ownable {
    struct Auction {
        address highestBidder;
        uint highestBid;
        uint endTime;
        bool isActive;
    }

    mapping(uint => Auction) public auctions;
    mapping(address => uint) pendingReturns;

    event AuctionCreated(uint tokenId, uint startingBid, uint duration);
    event BidPlaced(uint tokenId, address bidder, uint bid);
    event AuctionEnded(uint tokenId, address winner, uint bid);
    event Withdrawal(address bidder, uint amount);
    event AuctionCanceled(uint tokenId);


    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function createAuction(uint _tokenId, uint _startingBid, uint _duration) public onlyOwner {
        require(_duration > 0, "Duration must be greater than zero");
        require(_startingBid > 0, "Starting bid must be greater than zero");
        
        Auction memory newAuction = Auction({
            highestBidder: address(0),
            highestBid: _startingBid,
            endTime: block.timestamp + _duration,
            isActive: true
        });

        auctions[_tokenId] = newAuction;
        emit AuctionCreated(_tokenId, _startingBid, _duration);
    }

    function bid(uint _tokenId) public payable {
        Auction storage auction = auctions[_tokenId];
        
        require(block.timestamp < auction.endTime, "Auction already ended");
        require(msg.value > auction.highestBid, "There already is a higher bid");
        
        if (auction.highestBidder != address(0)) {
            // Refund the previous highest bidder
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }
        
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        emit BidPlaced(_tokenId, msg.sender, msg.value);
    }

    function endAuction(uint _tokenId) public {
        Auction storage auction = auctions[_tokenId];
        
        require(block.timestamp >= auction.endTime, "Auction not yet ended");
        require(auction.isActive, "Auction end has been called already");
        
        auction.isActive = false;

        if (auction.highestBidder != address(0)) {
            _transfer(owner(), auction.highestBidder, _tokenId);
            payable(owner()).transfer(auction.highestBid);
        } else {
            // No bids were placed; refund the starting bid to the owner
            payable(owner()).transfer(auction.highestBid);
        }
    
        emit AuctionEnded(_tokenId, auction.highestBidder, auction.highestBid);
    }

    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
            emit Withdrawal(msg.sender, amount);
        }
        return true;
    }

    function cancelAuction(uint _tokenId) public {
        Auction storage auction = auctions[_tokenId];

        // Only the owner or the creator of the auction should be able to cancel it
        require(msg.sender == owner() || msg.sender == auction.highestBidder, "Not authorized to cancel");

        // The auction should be active to be canceled
        require(auction.isActive, "Auction is not active");

        // Refund the highest bidder if there is one
        if (auction.highestBidder != address(0)) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        // Reset the auction
        auction.isActive = false;
        auction.endTime = 0;
        auction.highestBidder = address(0);
        auction.highestBid = 0;

        // Emit the cancellation event
        emit AuctionCanceled(_tokenId);
    }


    // Additional functionality:
    // - setAuctionEndTime: To allow the owner to change the auction duration
}
