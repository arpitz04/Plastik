// products.js — Dynamically loads products from /api/products
// Used by: products.html  and  index.html (featured section)

document.addEventListener('DOMContentLoaded', () => {
    const listingsEl  = document.getElementById('product-listings');   // products.html
    const featuredEl  = document.getElementById('featured-products');  // index.html

    if (listingsEl) loadAllProducts(listingsEl);
    if (featuredEl) loadFeaturedProducts(featuredEl);
});

/* ── All products page ─────────────────────────────────────── */
async function loadAllProducts(container) {
    container.innerHTML = '<p class="text-center py-5">Loading products...</p>';

    try {
        const res      = await fetch('/api/products');
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const products = await res.json();

        if (!products.length) {
            container.innerHTML = '<p class="text-center py-5 text-muted">No products available yet.</p>';
            return;
        }

        container.innerHTML = `
            <div class="col-12"><h2 class="mb-5">All Products</h2></div>
            ${products.map(p => productCard(p)).join('')}
        `;
    } catch (err) {
        container.innerHTML = `<p class="text-danger text-center py-4">Failed to load products. ${err.message}</p>`;
        console.error(err);
    }
}

/* ── Featured section on homepage ─────────────────────────── */
async function loadFeaturedProducts(container) {
    try {
        const res      = await fetch('/api/products?limit=3');
        if (!res.ok) throw new Error();
        const products = await res.json();
        const slice    = products.slice(0, 3);

        container.innerHTML = slice.map(p => `
            <div class="col-lg-4 col-12 mb-3">
                ${productCard(p)}
            </div>
        `).join('');
    } catch (err) {
        console.error('Featured products failed to load:', err);
        // Leave existing static markup if fetch fails
    }
}

/* ── Reusable product card HTML ───────────────────────────── */
function productCard(p) {
    const img = p.imageUrl || './images/product/bagprod.png';
    return `
        <div class="col-lg-4 col-12 mb-3">
            <div class="product-thumb">
                <a href="product-detail.html?id=${p._id}">
                    <img src="${img}" class="img-fluid product-image" alt="${escHtml(p.name)}">
                </a>
                <div class="product-top d-flex">
                    ${p.badge ? `<span class="product-alert me-auto">${escHtml(p.badge)}</span>` : ''}
                    <a href="#" class="bi-heart-fill product-icon ms-auto"></a>
                </div>
                <div class="product-info d-flex">
                    <div>
                        <h5 class="product-title mb-0">
                            <a href="product-detail.html?id=${p._id}" class="product-title-link">${escHtml(p.name)}</a>
                        </h5>
                        <p class="product-p">${escHtml(p.description || '')}</p>
                    </div>
                    <small class="product-price text-muted ms-auto mt-auto mb-5">${p.pricePoints} points</small>
                </div>
            </div>
        </div>
    `;
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
