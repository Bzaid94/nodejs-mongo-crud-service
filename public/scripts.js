document.addEventListener('DOMContentLoaded', () => {
    let fieldCount = 0;
    const form = document.getElementById('create-product-form') || document.getElementById('edit-product-form');
    const addFieldBtn = document.getElementById('add-field-btn');
    const additionalFields = document.getElementById('additional-fields');

    if (form) {
        addFieldBtn.addEventListener('click', () => {
            fieldCount++;
            const fieldId = `custom-field-${fieldCount}`;

            const fieldHTML = `
                <div class="form-group" id="${fieldId}">
                    <label for="field-name-${fieldCount}">Field Name:</label>
                    <input type="text" class="form-control" id="field-name-${fieldCount}" placeholder="Enter field name">
                    <label for="field-value-${fieldCount}" class="mt-2">Field Value:</label>
                    <input type="text" class="form-control" id="field-value-${fieldCount}" placeholder="Enter field value">
                    <button type="button" class="btn btn-danger mt-2" onclick="removeField('${fieldId}')">Remove</button>
                </div>
            `;
            additionalFields.insertAdjacentHTML('beforeend', fieldHTML);
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const sku = document.getElementById('sku').value;
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            const price = parseFloat(document.getElementById('price').value);

            const additionalDetails = {};
            for (let i = 1; i <= fieldCount; i++) {
                const fieldName = document.getElementById(`field-name-${i}`)?.value;
                const fieldValue = document.getElementById(`field-value-${i}`)?.value;
                if (fieldName && fieldValue) {
                    additionalDetails[fieldName] = fieldValue;
                }
            }

            const productDetails = { name, description, price, ...additionalDetails };

            if (form.id === 'create-product-form') {
                await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sku, status: true, detail: productDetails })
                });
                location.href = 'list-products.html';
            } else if (form.id === 'edit-product-form') {
                const productId = getProductIdFromUrl();
                await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sku, detail: productDetails })
                });
                location.href = 'list-products.html';
            }
        });
    }
});

function removeField(fieldId) {
    const fieldElement = document.getElementById(fieldId);
    fieldElement.remove();
}

async function loadProducts() {
    console.log('Starting to fetch products from backend');

    try {
        const response = await fetch('/api/products', {
            method: 'GET',
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Error fetching products:', response.statusText);
            return;
        }

        const result = await response.json();
        console.log('Products received from backend:', result);

        const tbody = document.getElementById('product-list');
        tbody.innerHTML = '';

        if (result && result.success && result.data) {
            result.data.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.sku}</td>
                    <td>${product.detail.name}</td>
                    <td>${product.detail.description}</td>
                    <td>$${product.detail.price.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="redirectToEditPage('${product.id}')">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.warn('No products found or `data` field is missing');
        }
    } catch (error) {
        console.error('Error during fetching products:', error);
    }
}

async function deleteProduct(id) {
    await fetch(`/api/products/${id}`, {
        method: 'DELETE',
    });
    await loadProducts();
}

function redirectToEditPage(id) {
    location.href = `edit-product.html?id=${id}`;
}

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadProductDetails() {
    const productId = getProductIdFromUrl();
    if (!productId) {
        console.error('No product ID found in URL');
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            console.error('Error fetching product details:', response.statusText);
            return;
        }

        const result = await response.json();
        console.log('Product details received:', result);

        const product = result.data;
        const details = product.detail;

        document.getElementById('sku').value = product.sku;
        document.getElementById('name').value = details.name;
        document.getElementById('description').value = details.description;
        document.getElementById('price').value = details.price;

        for (const [key, value] of Object.entries(details)) {
            if (!['name', 'description', 'price'].includes(key)) {
                fieldCount++;
                const fieldId = `custom-field-${fieldCount}`;
                const fieldHTML = `
                    <div class="form-group" id="${fieldId}">
                        <label for="field-name-${fieldCount}">Field Name:</label>
                        <input type="text" class="form-control" id="field-name-${fieldCount}" value="${key}">
                        <label for="field-value-${fieldCount}" class="mt-2">Field Value:</label>
                        <input type="text" class="form-control" id="field-value-${fieldCount}" value="${value}">
                        <button type="button" class="btn btn-danger mt-2" onclick="removeField('${fieldId}')">Remove</button>
                    </div>
                `;
                document.getElementById('additional-fields').insertAdjacentHTML('beforeend', fieldHTML);
            }
        }
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}