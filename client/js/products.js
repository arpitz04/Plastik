// frontend/js/products.js

document.addEventListener('DOMContentLoaded', async () => {
    const productListings = document.getElementById('product-listings');

    if (!productListings) {
        console.error('Product listings container not found. Make sure an element with id="product-listings" exists in products.html');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/products');
        const products = await response.json();

        if (response.ok) {
            products.forEach(product => {
                const productCard = `
                    <div class="col-lg-4 col-md-6 col-12">
                        <div class="product-thumb">
                            <a href="product-detail.html?id=${product._id}" class="product-thumb-link">
                                <img src="http://localhost:5000/${product.imageUrl}" class="img-fluid product-thumb-image" alt="${product.name}">
                            </a>
                            <div class="product-top d-flex">
                                <span class="product-alert me-auto">Points: ${product.pricePoints}</span>
                            </div>
                            <div class="product-info d-flex">
                                <div>
                                    <h5 class="product-title mb-0"><a href="product-detail.html?id=${product._id}" class="product-title-link">${product.name}</a></h5>
                                    <p class="product-p">${product.category || 'General'}</p>
                                </div>
                                <small class="product-price text-muted ms-auto">Stock: ${product.stock}</small>
                            </div>
                        </div>
                    </div>
                `;
                productListings.innerHTML += productCard;
            });
        } else {
            productListings.innerHTML = `<p>Error loading products: ${products.message || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        productListings.innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
});