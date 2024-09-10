const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/products', async (req, res) => {
    try {
        const response = await fetch('http://cloud-gateway-service:8888/v1/product/list-products');
        const data = await response.json();
        console.log('Products fetched from Cloud Gateway:', data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const response = await fetch(`http://cloud-gateway-service:8888/v1/product/${req.params.id}`);
        const data = await response.json();
        console.log('Product fetched from Cloud Gateway:', data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product' });
    }
});

router.post('/products', async (req, res) => {
    try {
        const response = await fetch('http://cloud-gateway-service:8888/v1/product/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const response = await fetch(`http://cloud-gateway-service:8888/v1/product/update/${req.params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        const response = await fetch(`http://cloud-gateway-service:8888/v1/product/delete/${req.params.id}`, {
            method: 'PUT',
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
});

module.exports = router;