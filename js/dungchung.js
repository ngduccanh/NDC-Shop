var adminInfo = [{
    "username": "admin",
    "pass": "123"
}];

function getListAdmin() {
    return JSON.parse(window.localStorage.getItem('ListAdmin'));
}

function setListAdmin(l) {
    window.localStorage.setItem('ListAdmin', JSON.stringify(l));
}


// Hàm khởi tạo, tất cả các trang đều cần
function khoiTao() {
    // get data từ localstorage
    list_products = getListProducts() || list_products;
    adminInfo = getListAdmin() || adminInfo;

    setupEventTaiKhoan();
    capNhat_ThongTin_CurrentUser();
    addEventCloseAlertButton();
}

// ========= Các hàm liên quan tới danh sách sản phẩm =========
// Localstorage cho dssp: 'ListProducts
function setListProducts(newList) {
    window.localStorage.setItem('ListProducts', JSON.stringify(newList));
}

function getListProducts() {
    return JSON.parse(window.localStorage.getItem('ListProducts'));
}

function timKiemTheoTen(list, ten, soluong) {
    var tempList = copyObject(list);
    var result = [];
    ten = ten.split(' ');

    for (var sp of tempList) {
        var correct = true;
        for (var t of ten) {
            if (sp.name.toUpperCase().indexOf(t.toUpperCase()) < 0) {
                correct = false;
                break;
            }
        }
        if (correct) {
            result.push(sp);
        }
    }

    return result;
}

function timKiemTheoMa(list, ma) {
    for (var l of list) {
        if (l.masp == ma) return l;
    }
}

// copy 1 object, do trong js ko có tham biến , tham trị rõ ràng
// nên dùng bản copy để chắc chắn ko ảnh hưởng tới bản chính
function copyObject(o) {
    return JSON.parse(JSON.stringify(o));
}

// ============== ALert Box ===============
// div có id alert được tạo trong hàm addFooter
function addAlertBox(text, bgcolor, textcolor, time) {
    var al = document.getElementById('alert');
    al.childNodes[0].nodeValue = text;
    al.style.backgroundColor = bgcolor;
    al.style.opacity = 1;
    al.style.zIndex = 200;

    if (textcolor) al.style.color = textcolor;
    if (time)
        setTimeout(function () {
            al.style.opacity = 0;
            al.style.zIndex = 0;
        }, time);
}

function addEventCloseAlertButton() {
    document.getElementById('closebtn')
        .addEventListener('mouseover', (event) => {
            // event.target.parentElement.style.display = "none";
            event.target.parentElement.style.opacity = 0;
            event.target.parentElement.style.zIndex = 0;
        });
}

// ================ Cart Number + Thêm vào Giỏ hàng ======================
function animateCartNumber() {
    // Hiệu ứng cho icon giỏ hàng
    var cn = document.getElementsByClassName('cart-number')[0];
    cn.style.transform = 'scale(2)';
    cn.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    cn.style.color = 'white';
    setTimeout(function () {
        cn.style.transform = 'scale(1)';
        cn.style.backgroundColor = 'transparent';
        cn.style.color = 'red';
    }, 1200);
}

function themVaoGioHang(masp, tensp) {
    var user = getCurrentUser();
    if (!user) {
        alert('Bạn cần đăng nhập để mua hàng !');
        showTaiKhoan(true);
        return;
    }
    if (user.off) {
        alert('Tài khoản của bạn hiện đang bị khóa nên không thể mua hàng!');
        addAlertBox('Tài khoản của bạn đã bị khóa bởi Admin.', '#aa0000', '#fff', 10000);
        return;
    }
    var t = new Date();
    var daCoSanPham = false;;

    for (var i = 0; i < user.products.length; i++) { // check trùng sản phẩm
        if (user.products[i].ma == masp) {
            user.products[i].soluong++;
            daCoSanPham = true;
            break;
        }
    }

    if (!daCoSanPham) { // nếu không trùng thì mới thêm sản phẩm vào user.products
        user.products.push({
            "ma": masp,
            "soluong": 1,
            "date": t
        });
    }

    animateCartNumber();
    addAlertBox('Đã thêm ' + tensp + ' vào giỏ.', '#17c671', '#fff', 3500);

    setCurrentUser(user); // cập nhật giỏ hàng cho user hiện tại
    updateListUser(user); // cập nhật list user
    capNhat_ThongTin_CurrentUser(); // cập nhật giỏ hàng
}

// ============================== TÀI KHOẢN ======================================================

// Hàm get set cho người dùng hiện tại đã đăng nhập
function getCurrentUser() {
    return JSON.parse(window.localStorage.getItem('CurrentUser')); // Lấy dữ liệu từ localstorage
}

function setCurrentUser(u) {
    window.localStorage.setItem('CurrentUser', JSON.stringify(u));
}

// Hàm get set cho danh sách người dùng
function getListUser() {
    var data = JSON.parse(window.localStorage.getItem('ListUser')) || []
    var l = [];
    for (var d of data) {
        l.push(d);
    }
    return l;
}

function setListUser(l) {
    window.localStorage.setItem('ListUser', JSON.stringify(l));
}

// Sau khi chỉnh sửa 1 user 'u' thì cần hàm này để cập nhật lại vào ListUser
function updateListUser(u, newData) {
    var list = getListUser();
    for (var i = 0; i < list.length; i++) {
        if (equalUser(u, list[i])) {
            list[i] = (newData ? newData : u);
        }
    }
    setListUser(list);
}

function logIn(form) {
    // Lấy dữ liệu từ form
    var name = form.username.value;
    var pass = form.pass.value;
    var newUser = new User(name, pass);

    // Lấy dữ liệu từ danh sách người dùng localstorage
    var listUser = getListUser();

    // Kiểm tra xem dữ liệu form có khớp với người dùng nào trong danh sách ko
    for (var u of listUser) {
        if (equalUser(newUser, u)) {
            if(u.off) {
                alert('Tài khoản này đang bị khoá. Không thể đăng nhập.');
                return false;
            }

            setCurrentUser(u);

            // Reload lại trang -> sau khi reload sẽ cập nhật luôn giỏ hàng khi hàm setupEventTaiKhoan chạy
            location.reload();
            return false;
        }
    }

    // Đăng nhập vào admin
    for (var ad of adminInfo) {
        if (equalUser(newUser, ad)) {
            alert('Xin chào admin .. ');
            window.localStorage.setItem('admin', true);
            window.location.assign('admin.html');
            return false;
        }
    }

    // Trả về thông báo nếu không khớp
    alert('Nhập sai tên hoặc mật khẩu !!!');
    form.username.focus();
    return false;
}

function signUp(form) {
    var ho = form.ho.value;
    var ten = form.ten.value;
    var email = form.email.value;
    var username = form.newUser.value;
    var pass = form.newPass.value;
    var newUser = new User(username, pass, ho, ten, email);

    // Lấy dữ liệu các khách hàng hiện có
    var listUser = getListUser();

    // Kiểm tra trùng admin
    for (var ad of adminInfo) {
        if (newUser.username == ad.username) {
            alert('Tên đăng nhập đã có người sử dụng !!');
            return false;
        }
    }

    // Kiểm tra xem dữ liệu form có trùng với khách hàng đã có không
    for (var u of listUser) {
        if (newUser.username == u.username) {
            alert('Tên đăng nhập đã có người sử dụng !!');
            return false;
        }
    }

    // Lưu người mới vào localstorage
    listUser.push(newUser);
    window.localStorage.setItem('ListUser', JSON.stringify(listUser));

    // Đăng nhập vào tài khoản mới tạo
    window.localStorage.setItem('CurrentUser', JSON.stringify(newUser));
    alert('Đăng kí thành công, Bạn sẽ được tự động đăng nhập!');
    location.reload();

    return false;
}

function logOut() {
    window.localStorage.removeItem('CurrentUser');
    location.reload();
}

// Hiển thị form tài khoản, giá trị truyền vào là true hoặc false
function showTaiKhoan(show) {
    var value = (show ? "scale(1)" : "scale(0)");
    var div = document.getElementsByClassName('containTaikhoan')[0];
    div.style.transform = value;
}

// Check xem có ai đăng nhập hay chưa (CurrentUser có hay chưa)
// Hàm này chạy khi ấn vào nút tài khoản trên header
function checkTaiKhoan() {
    if (!getCurrentUser()) {
        showTaiKhoan(true);
    }
}

// Tạo event, hiệu ứng cho form tài khoản
function setupEventTaiKhoan() {
    var taikhoan = document.getElementsByClassName('taikhoan')[0];
    var list = taikhoan.getElementsByTagName('input');

    // Tạo eventlistener cho input để tạo hiệu ứng label
    // Gồm 2 event onblur, onfocus được áp dụng cho từng input trong list bên trên
    ['blur', 'focus'].forEach(function (evt) {
        for (var i = 0; i < list.length; i++) {
            list[i].addEventListener(evt, function (e) {
                var label = this.previousElementSibling; // lấy element ĐỨNG TRƯỚC this, this ở đây là input
                if (e.type === 'blur') { // khi ấn chuột ra ngoài
                    if (this.value === '') { // không có value trong input thì đưa label lại như cũ
                        label.classList.remove('active');
                        label.classList.remove('highlight');
                    } else { // nếu có chữ thì chỉ tắt hightlight chứ không tắt active, active là dịch chuyển lên trên
                        label.classList.remove('highlight');
                    }
                } else if (e.type === 'focus') { // khi focus thì label active + hightlight
                    label.classList.add('active');
                    label.classList.add('highlight');
                }
            });
        }
    })

    // Event chuyển tab login-signup
    var tab = document.getElementsByClassName('tab');
    for (var i = 0; i < tab.length; i++) {
        var a = tab[i].getElementsByTagName('a')[0];
        a.addEventListener('click', function (e) {
            e.preventDefault(); // tắt event mặc định

            // Thêm active(màu xanh lá) cho li chứa tag a này => ấn login thì login xanh, signup thì signup sẽ xanh
            this.parentElement.classList.add('active');

            // Sau khi active login thì phải tắt active sigup và ngược lại
            // Trường hợp a này thuộc login => <li>Login</li> sẽ có nextElement là <li>SignUp</li>
            if (this.parentElement.nextElementSibling) {
                this.parentElement.nextElementSibling.classList.remove('active');
            }
            // Trường hợp a này thuộc signup => <li>SignUp</li> sẽ có .previousElement là <li>Login</li>
            if (this.parentElement.previousElementSibling) {
                this.parentElement.previousElementSibling.classList.remove('active');
            }

            // Ẩn phần nhập của login nếu ấn signup và ngược lại
            // href của 2 tab signup và login là #signup và #login -> tiện cho việc getElement dưới đây
            var target = this.href.split('#')[1];
            document.getElementById(target).style.display = 'block';

            var hide = (target == 'login' ? 'signup' : 'login');
            document.getElementById(hide).style.display = 'none';
        })
    }

    // Đoạn code tạo event trên được chuyển về js thuần từ code jquery
    // Code jquery cho phần tài khoản được lưu ở cuối file này
}

// Cập nhật số lượng hàng trong giỏ hàng + Tên current user
function capNhat_ThongTin_CurrentUser() {
    var u = getCurrentUser();
    if (u) {
        // Cập nhật số lượng hàng vào header
        var cartNumber = document.getElementsByClassName('cart-number')[0];
        if (cartNumber) {
            cartNumber.innerHTML = getTongSoLuongSanPhamTrongGioHang(u);
        }
        
        // Cập nhật tên người dùng
        var userNameSpan = document.querySelector('.member .user-name');
        if (userNameSpan) {
            // Hiển thị tên người dùng hoặc họ tên nếu có
            var displayName = u.ho ? (u.ho + ' ' + u.ten) : u.username;
            userNameSpan.innerHTML = displayName;
        }
        
        // Bỏ class hide của menu người dùng (để menu có thể hiện khi hover)
        var menuMember = document.getElementsByClassName('menuMember')[0];
        if (menuMember) {
            menuMember.classList.remove('hide');
        }
    } else {
        // Nếu chưa đăng nhập, hiển thị "Tài khoản"
        var userNameSpan = document.querySelector('.member .user-name');
        if (userNameSpan) {
            userNameSpan.innerHTML = 'Tài khoản';
        }
    }
}

// tính tổng số lượng các sản phẩm của user u truyền vào
function getTongSoLuongSanPhamTrongGioHang(u) {
    var soluong = 0;
    for (var p of u.products) {
        soluong += p.soluong;
    }
    return soluong;
}

// lấy số lương của sản phẩm NÀO ĐÓ của user NÀO ĐÓ được truyền vào
function getSoLuongSanPhamTrongUser(tenSanPham, user) {
    for (var p of user.products) {
        if (p.name == tenSanPham)
            return p.soluong;
    }
    return 0;
}

// ==================== Những hàm khác ===================== 
function numToString(num, char) {
    return num.toLocaleString().split(',').join(char || '.');
}

function stringToNum(str, char) {
    return Number(str.split(char || '.').join(''));
}

// ĐÃ XÓA: function autocomplete() - tính năng gợi ý dropdown khi gõ đã bị loại bỏ theo yêu cầu

// Hàm thêm tags (từ khóa tìm kiếm)
// nameTag: tên tag, link: đường dẫn (optional - nếu không có sẽ dùng performSearch)
function addTags(nameTag, link) {
    var new_tag = document.createElement('a');
    
    if (link) {
        // Nếu có link thì dùng link (cho trang khác như nguoidung.html)
        new_tag.href = link;
        new_tag.textContent = nameTag;
    } else {
        // Nếu không có link thì dùng performSearch (cho trang index.html)
        new_tag.href = 'javascript:void(0)';
        new_tag.textContent = nameTag;
        new_tag.onclick = function(e) {
            e.preventDefault();
            // Điền từ khóa vào ô tìm kiếm
            var searchBox = document.getElementById('search-box');
            if (searchBox) {
                searchBox.value = nameTag;
            }
            // Gọi hàm tìm kiếm
            performSearch(nameTag);
        };
    }
    
    var khung_tags = document.getElementsByClassName('tags')[0];
    if (khung_tags) {
        khung_tags.appendChild(new_tag);
    }
}

// Thêm sản phẩm vào trang
function addProduct(p, ele, returnString) {
	promo = new Promo(p.promo.name, p.promo.value); // class Promo
	product = new Product(p.masp, p.name, p.img, p.price, p.star, p.rateCount, promo); // Class product

	return addToWeb(product, ele, returnString);
}


// Hàm thêm top navigation (nếu cần)
function addTopNav() {
    // Navigation menu đã được tích hợp vào header
    // Giữ hàm này để tránh lỗi ở các trang khác
}

function addHeader() {
    document.write(`
    <!-- Thanh trên cùng -->
    <div class="top-bar">
        <marquee behavior="scroll" direction="left">
            🎉 Ưu đãi cực sốc - Giảm giá 20% cho tất cả sản phẩm trong tuần này! 🎉
        </marquee>
        <div class="contact-info">
            <span><i class="fa fa-phone"></i> Hotline: <a href="tel:0973521509">0973 521 509</a></span>
            <span>
            <i class="fa fa-map-marker"></i>
            <a href="https://www.google.com/maps/place/70+Ngõ+176+Trương+Định,+Tương+Mai,+Hai+Bà+Trưng,+Hà+Nội" 
               target="_blank">
               70 ngõ 176 Trương Định - Hai Bà Trưng - Hà Nội
            </a>
        </span>
        </div>
    </div>

    <!-- Header chính -->
    <header class="header">
        <div class="container">
            <!-- Logo -->
            <div class="logo">
                <a href="index.html">
                    <img src="img/logo.png" alt="NDC Shop" />
                </a>
            </div>

            <!-- Thanh tìm kiếm -->
            <div class="search-area">
                <form class="input-search" id="search-form" onsubmit="return false;">
                    <div class="autocomplete search-bar">
                        <input id="search-box" name="search" autocomplete="off" type="text" placeholder="Nhập từ khóa tìm kiếm...">
                        <button type="button" id="searchBtn"><i class="fa fa-search"></i></button>
                    </div>
                </form>
                <!-- Tags gợi ý nhanh (tùy chọn) -->
                <div class="tags"></div>
                <!-- Dropdown gợi ý -->
                <div class="suggestions-dropdown" id="suggestionsDropdown"></div>
            </div>

            <!-- Khu vực tài khoản & giỏ hàng -->
            <div class="header-actions">
                <div class="member">
                    <a href="javascript:void(0)" onclick="checkTaiKhoan();">
                        <i class="fa fa-user"></i> <span class="user-name">Tài khoản</span>
                    </a>
                    <div class="menuMember hide">
                        <a href="nguoidung.html"><i class="fa fa-user"></i> Thông tin</a>
                        <a href="javascript:void(0)" onclick="logOut();"><i class="fa fa-sign-out"></i> Thoát</a>
                    </div>
                </div>
                <a href="giohang.html" class="cart">
                    <i class="fa fa-shopping-cart"></i>
                    <span class="cart-number">0</span>
                </a>
                <div class="menu-dropdown">
                    <a href="javascript:void(0)">
                        <i class="fa fa-bars"></i> Menu
                    </a>
                    <div class="menuContent">
                        <a href="gioithieu.html"><i class="fa fa-info-circle"></i> Giới thiệu</a>
                        <a href="lienhe.html"><i class="fa fa-envelope"></i> Liên hệ</a>
                        <a href="tintuc.html"><i class="fa fa-newspaper-o"></i> Tin tức</a>
                    </div>
                </div>
            </div>

            <!-- Nút menu mobile -->
            <button class="menu-toggle">
                <i class="fa fa-bars"></i>
            </button>
        </div>
    </header>
    `);
}



// Hàm tìm kiếm sản phẩm trên trang hiện tại
function performSearch(keyword) {
    if (!keyword) return;
    
    console.log('🔍 Tìm kiếm:', keyword); // Debug
    
    // Lấy danh sách sản phẩm
    var list = getListProducts() || list_products;
    console.log('📦 Danh sách sản phẩm:', list); // Debug
    
    // Tìm kiếm theo tên
    var ketQua = timKiemTheoTen(list, keyword, 0);
    console.log('✅ Kết quả:', ketQua.length, 'sản phẩm'); // Debug
    
    // Hiển thị kết quả
    if (ketQua.length === 0) {
        alert('Không tìm thấy sản phẩm nào với từ khóa: "' + keyword + '"');
    } else {
        // Ẩn banner
        var banner = document.getElementsByClassName('banner')[0];
        if (banner) {
            banner.style.display = 'none';
        }
        
        // Ẩn menu công ty (nếu có)
        var companyMenu = document.getElementsByClassName('companyMenu')[0];
        if (companyMenu) {
            companyMenu.style.display = 'none';
        }
        
        // Ẩn filter bar (nếu có)
        var filterBar = document.getElementsByClassName('filter-bar')[0];
        if (filterBar) {
            filterBar.style.display = 'none';
        }
        
        // Ẩn các khung sản phẩm ban đầu (HOT, TRẢ GÓP, etc.)
        var containKhung = document.getElementsByClassName('contain-khungSanPham')[0];
        if (containKhung) {
            containKhung.style.display = 'none';
        }
        
        // Hiển thị kết quả tìm kiếm
        var containProducts = document.getElementsByClassName('contain-products')[0];
        if (containProducts) {
            containProducts.style.display = 'block';
            
            // Tìm ul#products (đúng theo HTML)
            var listDiv = document.getElementById('products');
            console.log('📋 List div:', listDiv); // Debug
            
            if (listDiv) {
                // Xóa tiêu đề tìm kiếm cũ (nếu có)
                var oldTitle = document.getElementById('search-result-title');
                if (oldTitle) {
                    oldTitle.remove();
                }
                
                // Xóa nút quay lại cũ (nếu có)
                var oldBackBtn = document.getElementById('back-to-home-btn');
                if (oldBackBtn) {
                    oldBackBtn.remove();
                }
                
                listDiv.innerHTML = ''; // Xóa sản phẩm cũ
                
                // Thêm nút quay lại trang chủ TRƯỚC ul#products
                var backBtn = document.createElement('div');
                backBtn.id = 'back-to-home-btn';
                backBtn.style.cssText = 'text-align: center; margin: 20px 0;';
                backBtn.innerHTML = '<button onclick="window.location.reload();" style="background-color: #d70018; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; transition: all 0.3s;" onmouseover="this.style.backgroundColor=\'#b50014\'; this.style.transform=\'scale(1.05)\';" onmouseout="this.style.backgroundColor=\'#d70018\'; this.style.transform=\'scale(1)\';"><i class="fa fa-home"></i> Quay lại trang chủ</button>';
                listDiv.parentElement.insertBefore(backBtn, listDiv);
                
                // Thêm tiêu đề kết quả tìm kiếm
                var searchTitle = document.createElement('h2');
                searchTitle.id = 'search-result-title';
                searchTitle.style.cssText = 'text-align: center; color: #333; margin: 20px 0; font-size: 24px;';
                searchTitle.innerHTML = 'Kết quả tìm kiếm cho: <span style="color: #d70018;">"' + keyword + '"</span> (' + ketQua.length + ' sản phẩm)';
                listDiv.parentElement.insertBefore(searchTitle, listDiv);
                
                // Hiển thị các sản phẩm tìm được
                for (var sp of ketQua) {
                    addProduct(sp, listDiv);
                }
                
                console.log('✅ Đã thêm', ketQua.length, 'sản phẩm vào trang'); // Debug
                
                // Cuộn xuống phần kết quả
                containProducts.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                console.error('❌ Không tìm thấy #products'); // Debug
            }
        } else {
            console.error('❌ Không tìm thấy .contain-products'); // Debug
        }
    }
}

// Khởi tạo tìm kiếm với dropdown gợi ý
(function () {
    function initSearchWithSuggestions() {
        const input = document.getElementById('search-box');
        const searchBtn = document.getElementById('searchBtn');
        const searchForm = document.getElementById('search-form');
        const dropdown = document.getElementById('suggestionsDropdown');

        if (!input) return;

        // Hàm render gợi ý
        function renderSuggestions(items) {
            if (!dropdown) return;
            
            if (!items || !items.length) {
                dropdown.classList.remove('show');
                dropdown.innerHTML = '';
                return;
            }

            const htmlItems = items.slice(0, 8).map(p => {
                const price = p.promo && p.promo.name === 'giareonline' ? p.promo.value : p.price;
                return `
                    <a href="chitietsanpham.html?${p.name.split(' ').join('-')}" class="suggestion-item">
                        <img src="${p.img}" alt="${p.name}" class="suggestion-thumb">
                        <div class="suggestion-info">
                            <div class="suggestion-name">${p.name}</div>
                            <div class="suggestion-brand">${p.company || ''}</div>
                        </div>
                        <div class="suggestion-price">${price}₫</div>
                    </a>
                `;
            }).join('');

            dropdown.innerHTML = htmlItems;
            dropdown.classList.add('show');
        }

        // Lọc sản phẩm khi gõ
        input.addEventListener('input', function() {
            const keyword = this.value.trim().toLowerCase();
            
            if (!keyword) {
                renderSuggestions([]);
                return;
            }

            const list = getListProducts() || list_products;
            const matched = list.filter(p => 
                p.name.toLowerCase().includes(keyword) ||
                (p.company && p.company.toLowerCase().includes(keyword))
            );

            renderSuggestions(matched);
        });

        // Enter để tìm kiếm
        input.addEventListener('keydown', function(e){
            if (e.key === 'Enter') {
                e.preventDefault();
                const keyword = input.value.trim();
                if (dropdown) dropdown.classList.remove('show');
                performSearch(keyword);
            }
        });

        // Nút tìm kiếm
        if (searchBtn) {
            searchBtn.addEventListener('click', function(e){
                e.preventDefault();
                const keyword = input.value.trim();
                if (dropdown) dropdown.classList.remove('show');
                performSearch(keyword);
            });
        }

        // Ngăn form submit
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                return false;
            });
        }

        // Ẩn dropdown khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!dropdown) return;
            const isClickInside = input.contains(e.target) || dropdown.contains(e.target);
            if (!isClickInside) {
                dropdown.classList.remove('show');
            }
        });
    }

    // Chạy sau khi DOM ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initSearchWithSuggestions, 0);
    } else {
        document.addEventListener('DOMContentLoaded', initSearchWithSuggestions);
    }
})();

    // Xử lý toggle menu trên mobile
    document.addEventListener('DOMContentLoaded', function() {
        const menuBtn = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.nav');
        if (menuBtn && nav) {
            menuBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    });


function addFooter() {
    document.write(`
    <!-- ============== Alert Box ============= -->
    <div id="alert">
        <span id="closebtn">&otimes;</span>
    </div>

    <!-- ============== Footer ============= -->
    <div class="copy-right">
        <p><a href="index.html">NDC Shop</a> - Welcome to NDC Shop - Designed by 
            <span style="color: #eee; font-weight: bold">NDC</span></p>
    </div>`);
}

// Thêm contain Taikhoan
function addContainTaiKhoan() {
    document.write(`
	<div class="containTaikhoan">
        <span class="close" onclick="showTaiKhoan(false);">&times;</span>
        <div class="taikhoan">

            <ul class="tab-group">
                <li class="tab active"><a href="#login">Đăng nhập</a></li>
                <li class="tab"><a href="#signup">Đăng kí</a></li>
            </ul> <!-- /tab group -->

            <div class="tab-content">
                <div id="login">
                    <h1>Chào mừng bạn trở lại!</h1>

                    <form onsubmit="return logIn(this);">

                        <div class="field-wrap">
                            <label>
                                Tên đăng nhập<span class="req">*</span>
                            </label>
                            <input name='username' type="text" required autocomplete="off" />
                        </div> <!-- /user name -->

                        <div class="field-wrap">
                            <label>
                                Mật khẩu<span class="req">*</span>
                            </label>
                            <input name="pass" type="password" required autocomplete="off" />
                        </div> <!-- pass -->

                        <p class="forgot"><a href="#">Quên mật khẩu?</a></p>

                        <button type="submit" class="button button-block" />Tiếp tục</button>

                    </form> <!-- /form -->

                </div> <!-- /log in -->

                <div id="signup">
                    <h1>Đăng kí miễn phí</h1>

                    <form onsubmit="return signUp(this);">

                        <div class="top-row">
                            <div class="field-wrap">
                                <label>
                                    Họ<span class="req">*</span>
                                </label>
                                <input name="ho" type="text" required autocomplete="off" />
                            </div>

                            <div class="field-wrap">
                                <label>
                                    Tên<span class="req">*</span>
                                </label>
                                <input name="ten" type="text" required autocomplete="off" />
                            </div>
                        </div> <!-- / ho ten -->

                        <div class="field-wrap">
                            <label>
                                Địa chỉ Email<span class="req">*</span>
                            </label>
                            <input name="email" type="email" required autocomplete="off" />
                        </div> <!-- /email -->

                        <div class="field-wrap">
                            <label>
                                Tên đăng nhập<span class="req">*</span>
                            </label>
                            <input name="newUser" type="text" required autocomplete="off" />
                        </div> <!-- /user name -->

                        <div class="field-wrap">
                            <label>
                                Mật khẩu<span class="req">*</span>
                            </label>
                            <input name="newPass" type="password" required autocomplete="off" />
                        </div> <!-- /pass -->

                        <button type="submit" class="button button-block" />Tạo tài khoản</button>

                    </form> <!-- /form -->

                </div> <!-- /sign up -->
            </div><!-- tab-content -->

        </div> <!-- /taikhoan -->
    </div>`);
}
// Thêm plc (phần giới thiệu trước footer)
function addPlc() {
    document.write(`
    <div class="plc">
        <section>
            <ul class="flexContain">
                <li>Giao hàng hỏa tốc trong 1 giờ</li>
                <li>Thanh toán linh hoạt: tiền mặt, visa / master, trả góp</li>
                <li>Trải nghiệm sản phẩm tại nhà</li>
                <li>Lỗi đổi tại nhà trong 1 ngày</li>
                <li>Hỗ trợ suốt thời gian sử dụng. Hotline: <a href="tel:0973521509">0973 521 509</a></li>
            </ul>
        </section>
    </div>`);
}

// https://stackoverflow.com/a/2450976/11898496
function shuffleArray(array) {
    let currentIndex = array.length,  randomIndex;

    // Khi còn lại các phần tử trong mảng
    while (currentIndex != 0) {

      
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

 
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

function checkLocalStorage() {
    if (typeof (Storage) == "undefined") {
        alert('Máy tính không hỗ trợ LocalStorage. Không thể lưu thông tin sản phẩm, khách hàng!!');
    } else {
        console.log('LocaStorage OKE!');
    }
}

// Di chuyển lên đầu trang
function gotoTop() {
    if (window.jQuery) {
        jQuery('html,body').animate({
            scrollTop: 0
        }, 100);
    } else {
        document.getElementsByClassName('top-nav')[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        document.body.scrollTop = 0; 
        document.documentElement.scrollTop = 0; 
    }
}

// Lấy màu ngẫu nhiên
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function auto_Get_Database() {
    var ul = document.getElementsByClassName('homeproduct')[0];
    var li = ul.getElementsByTagName('li');
    for (var l of li) {
        var a = l.getElementsByTagName('a')[0];
        // name
        var name = a.getElementsByTagName('h3')[0].innerHTML;

        // price
        var price = a.getElementsByClassName('price')[0]
        price = price.getElementsByTagName('strong')[0].innerHTML;

        // img
        var img = a.getElementsByTagName('img')[0].src;
        console.log(img);

      
    }
}

function getThongTinSanPhamFrom_TheGioiDiDong() {
    javascript: (function () {
        var s = document.createElement('script');
        s.innerHTML = `
			(function () {
				var ul = document.getElementsByClassName('parameter')[0];
				var li_s = ul.getElementsByTagName('li');
				var result = {};
				result.detail = {};
	
				for (var li of li_s) {
					var loai = li.getElementsByTagName('span')[0].innerText;
					var giatri = li.getElementsByTagName('div')[0].innerText;
	
					switch (loai) {
						case "Màn hình:":
							result.detail.screen = giatri.replace('"', "'");
							break;
						case "Hệ điều hành:":
							result.detail.os = giatri;
							break;
						case "Camera sau:":
							result.detail.camara = giatri;
							break;
						case "Camera trước:":
							result.detail.camaraFront = giatri;
							break;
						case "CPU:":
							result.detail.cpu = giatri;
							break;
						case "RAM:":
							result.detail.ram = giatri;
							break;
						case "Bộ nhớ trong:":
							result.detail.rom = giatri;
							break;
						case "Thẻ nhớ:":
							result.detail.microUSB = giatri;
							break;
						case "Dung lượng pin:":
							result.detail.battery = giatri;
							break;
					}
				}
	
				console.log(JSON.stringify(result, null, "\t"));
			})();`;
        document.body.appendChild(s);
    })();
}


