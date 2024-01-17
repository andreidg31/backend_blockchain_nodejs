const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;
const router = express.Router();

app.use(cors());
app.use(express.json());

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

router.post("/nft_auction", (req, res) => {
    const { wallet_address, pem_secret, address, price } = req.body;
    // Check if wallet if valid
    if (!wallet_address || !pem_secret) {
        return res.status(400).send({ error: 'Invalid wallet!' });
    }

    // Check if address and price are valid
    if (!address || !price) {
        return res.status(400).send({ error: 'Missing fields: address or price' });
    }

    res.status(200).send({
        message: 'NFT auction created!',
        transaction_hash: '0x1234567890'
    });
});

app.use('/api/v1', router);

app.use('*', (req, res) => {
    res.status(404).send('Not Found');
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});