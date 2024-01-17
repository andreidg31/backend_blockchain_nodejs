const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;
const router = express.Router();
const { UserSigner } = require("@multiversx/sdk-wallet");
const { Address, AddressValue, SmartContract, U64Value } = require("@multiversx/sdk-core");

app.use(cors());
app.use(express.json());

// const NFT_AUCTION_ADDRESS = new Address("0x123456789");
// const NFT_AUCTION_SMART_CONTRACT = new SmartContract({ address: NFT_AUCTION_ADDRESS });

router.get('/nft_auction', (req, res) => {

    let simpleNfts = [
        {
            "id": 1,
            "name": "NFT 1",
            "description": "This is NFT 1",
            "nft_address": "0x123456789",
            "price": 100,
        },
        {
            "id": 2,
            "name": "NFT 2",
            "description": "This is NFT 2",
            "nft_address": "0x123456789",
            "price": 200,
        },
        {
            "id": 3,
            "name": "NFT 3",
            "description": "This is NFT 3",
            "nft_address": "0x123456789",
            "price": 300,
        },
    ]

    res.status(200).send(simpleNfts);
});

router.post("/nft_auction", async (req, res) => {
    const { user_address, pem_content, address, bid } = req.body;
    // Check if wallet if valid
    if (!user_address || !pem_content) {
        return res.status(400).send({ error: 'Invalid wallet!' });
    }

    // Check if address and price are valid
    if (!address || !bid) {
        return res.status(400).send({ error: 'Missing fields: address or price' });
    }

    const signer = UserSigner.fromPem(pem_content);
    // TODO Interact with smart contract to place bid

    res.status(200).send({
        message: 'NFT auction created!',
        wallet_address: user_address,
        transaction_hash: '0x1234567890'
    });
});

router.post("/nft_auction/place_auction", async (req, res) => {
    const { user_address, pem_content, token_address, price } = req.body;
    // Check if wallet if valid
    if (!user_address || !pem_content) {
        return res.status(400).send({ error: 'Invalid wallet!' });
    }

    // Check if address and price are valid
    if (!token_address || !bid) {
        return res.status(400).send({ error: 'Missing fields: auction_id or bid' });
    }

    // Create auction
    const signer = UserSigner.fromPem(pem_content);
    const secret_key = signer.secretKey.buffer.toString("hex")

    //TODO Interact with smart contract to create the auction

    // Change response
    res.status(200).send({
        message: 'NFT auction created!',
        wallet_address: user_address,
        transaction_hash: '0x1234567890'
    })
});

app.use('/api/v1', router);

app.use('*', (req, res) => {
    res.status(404).send('Not Found');
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});