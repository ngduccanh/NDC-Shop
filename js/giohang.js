var currentuser; // user hiện tại, biến toàn cục
window.onload = function () {
    khoiTao();

	// thêm tags (từ khóa) vào khung tìm kiếm
	var tags = ["Samsung", "iPhone", "Huawei", "Oppo"];
	for (var t of tags) addTags(t, "index.html?search=" + t)

	currentuser = getCurrentUser();
	addProductToTable(currentuser);
}

function addProductToTable(user) {
	var container = document.getElementsByClassName('cart-items-container')[0];
	var subtotalElement = document.getElementsByClassName('subtotal-value')[0];
	var discountElement = document.getElementsByClassName('discount-value')[0];
	var totalElement = document.getElementsByClassName('total-value')[0];

	// Check if user is not logged in
	if (!user) {
		container.innerHTML = `
			<div class="not-logged-in">
				<div class="not-logged-in-icon">
					<i class="fa fa-user-times"></i>
				</div>
				<h3>Bạn chưa đăng nhập</h3>
				<p>Vui lòng đăng nhập để xem giỏ hàng của bạn</p>
				<a href="javascript:void(0)" onclick="showTaiKhoan(true)" class="login-btn">
					<i class="fa fa-sign-in"></i> Đăng nhập ngay
				</a>
			</div>
		`;
		updateSummary(0, 0);
		return;
	}

	// Check if cart is empty
	if (user.products.length == 0) {
		container.innerHTML = `
			<div class="empty-cart">
				<div class="empty-cart-icon">
					<i class="fa fa-shopping-cart"></i>
				</div>
				<h3>Giỏ hàng trống</h3>
				<p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
				<a href="index.html" class="empty-cart-btn">
					<i class="fa fa-shopping-bag"></i> Mua sắm ngay
				</a>
			</div>
		`;
		updateSummary(0, 0);
		return;
	}

	// Generate cart items
	var s = '';
	var totalPrice = 0;

	for (var i = 0; i < user.products.length; i++) {
		var masp = user.products[i].ma;
		var soluongSp = user.products[i].soluong;
		var p = timKiemTheoMa(list_products, masp);
		var price = (p.promo.name == 'giareonline' ? p.promo.value : p.price);
		var thoigian = new Date(user.products[i].date).toLocaleString();
		var thanhtien = stringToNum(price) * soluongSp;

		s += `
			<div class="cart-item">
				<div class="item-image">
					<a href="chitietsanpham.html?` + p.name.split(' ').join('-') + `" title="Xem chi tiết">
						<img src="` + p.img + `" alt="` + p.name + `">
					</a>
				</div>
				<div class="item-details">
					<h3 class="item-name">
						<a href="chitietsanpham.html?` + p.name.split(' ').join('-') + `">` + p.name + `</a>
					</h3>
					<div class="item-price">` + price + ` ₫</div>
					<div class="item-date">
						<i class="fa fa-clock-o"></i> ` + thoigian + `
					</div>
					<div class="item-quantity">
						<div class="quantity-controls">
							<button class="quantity-btn" onclick="giamSoLuong('` + masp + `')">
								<i class="fa fa-minus"></i>
							</button>
							<input type="number" class="quantity-input" value="` + soluongSp + `" 
								onchange="capNhatSoLuongFromInput(this, '` + masp + `')" min="1">
							<button class="quantity-btn" onclick="tangSoLuong('` + masp + `')">
								<i class="fa fa-plus"></i>
							</button>
						</div>
					</div>
				</div>
				<div class="item-actions">
					<div class="item-subtotal">` + numToString(thanhtien) + ` ₫</div>
					<button class="remove-item-btn" onclick="xoaSanPhamTrongGioHang(` + i + `)" title="Xóa sản phẩm">
						<i class="fa fa-trash"></i>
					</button>
				</div>
			</div>
		`;

		totalPrice += thanhtien;
	}

	container.innerHTML = s;
	updateSummary(totalPrice, 0);
}

function updateSummary(subtotal, discount) {
	var subtotalElement = document.getElementsByClassName('subtotal-value')[0];
	var discountElement = document.getElementsByClassName('discount-value')[0];
	var totalElement = document.getElementsByClassName('total-value')[0];

	if (subtotalElement) subtotalElement.textContent = numToString(subtotal) + ' ₫';
	if (discountElement) discountElement.textContent = numToString(discount) + ' ₫';
	if (totalElement) totalElement.textContent = numToString(subtotal - discount) + ' ₫';
}

function xoaSanPhamTrongGioHang(i) {
	if (window.confirm('Xác nhận hủy mua')) {
		currentuser.products.splice(i, 1);
		capNhatMoiThu();
	}
}

function thanhToan() {
	var c_user = getCurrentUser();
	if(c_user.off) {
        alert('Tài khoản của bạn hiện đang bị khóa nên không thể mua hàng!');
        addAlertBox('Tài khoản của bạn đã bị khóa bởi Admin.', '#aa0000', '#fff', 10000);
        return;
	}
	
	if (!currentuser.products.length) {
		addAlertBox('Không có mặt hàng nào cần thanh toán !!', '#ffb400', '#fff', 2000);
		return;
	}
	if (window.confirm('Thanh toán giỏ hàng ?')) {
		currentuser.donhang.push({
			"sp": currentuser.products,
			"ngaymua": new Date(),
			"tinhTrang": 'Đang chờ xử lý'
		});
		currentuser.products = [];
		capNhatMoiThu();
		addAlertBox('Các sản phẩm đã được gửi vào đơn hàng và chờ xử lý.', '#17c671', '#fff', 4000);
	}
}

function xoaHet() {
	if (currentuser.products.length) {
		if (window.confirm('Bạn có chắc chắn muốn xóa hết sản phẩm trong giỏ !!')) {
			currentuser.products = [];
			capNhatMoiThu();
		}
	}
}

// Cập nhật số lượng lúc nhập số lượng vào input
function capNhatSoLuongFromInput(inp, masp) {
	var soLuongMoi = Number(inp.value);
	if (!soLuongMoi || soLuongMoi <= 0) soLuongMoi = 1;

	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong = soLuongMoi;
		}
	}

	capNhatMoiThu();
}

function tangSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			p.soluong++;
		}
	}

	capNhatMoiThu();
}

function giamSoLuong(masp) {
	for (var p of currentuser.products) {
		if (p.ma == masp) {
			if (p.soluong > 1) {
				p.soluong--;
			} else {
				return;
			}
		}
	}

	capNhatMoiThu();
}

function capNhatMoiThu() { // Mọi thứ
	animateCartNumber();

	// cập nhật danh sách sản phẩm trong localstorage
	setCurrentUser(currentuser);
	updateListUser(currentuser);

	// cập nhật danh sách sản phẩm ở table
	addProductToTable(currentuser);

	// Cập nhật trên header
	capNhat_ThongTin_CurrentUser();
}
