// --- Lấy tham số từ URL ---
function getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// --- Dữ liệu mẫu (bạn có thể thay bằng danh sách thật trong project) ---
const allProducts = [
    { name: "iPhone 15 Pro", price: "33.990.000₫", image: "images/iphone15pro.jpg" },
    { name: "Samsung Galaxy S24 Ultra", price: "29.990.000₫", image: "images/s24ultra.jpg" },
    { name: "Xiaomi 14", price: "19.990.000₫", image: "images/xiaomi14.jpg" },
    { name: "OPPO Find X7", price: "22.990.000₫", image: "images/oppo_findx7.jpg" }
];

// --- Hiển thị kết quả ---
document.addEventListener('DOMContentLoaded', function() {
    const keyword = getParameterByName('key');
    const title = document.getElementById('search-title');
    const list = document.getElementById('product-list');

    if (!keyword) {
        title.textContent = "Không có từ khóa tìm kiếm.";
        return;
    }

    title.textContent = `Kết quả tìm kiếm cho: "${keyword}"`;

    const results = allProducts.filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
    );

    if (results.length === 0) {
        list.innerHTML = `<p>Không tìm thấy sản phẩm phù hợp.</p>`;
    } else {
        list.innerHTML = results.map(p => `
            <div class="product-item">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p class="price">${p.price}</p>
            </div>
        `).join('');
    }
});
