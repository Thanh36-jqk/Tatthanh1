
document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    // const usernameInput = document.getElementById('register-username'); // Tạm thời chưa dùng username
    const errorMessageDiv = document.getElementById('register-error');
    const successMessageDiv = document.getElementById('register-success');

    // Kiểm tra xem các phần tử có tồn tại không
    if (!registerForm || !emailInput || !passwordInput || !errorMessageDiv || !successMessageDiv) {
        console.error('Lỗi: Không tìm thấy một hoặc nhiều phần tử form cần thiết.');
        return; // Dừng thực thi nếu thiếu phần tử
    }

    // Thêm bộ lắng nghe sự kiện 'submit' cho form
    registerForm.addEventListener('submit', async (event) => {
        // Ngăn chặn hành vi gửi form mặc định của trình duyệt
        event.preventDefault();

        // Xóa các thông báo lỗi hoặc thành công cũ
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
        successMessageDiv.textContent = '';
        successMessageDiv.style.display = 'none';

        // Lấy giá trị từ các ô input
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        // const username = usernameInput.value.trim(); // Tạm thời chưa dùng

        // Kiểm tra cơ bản phía client (có thể thêm kiểm tra phức tạp hơn)
        if (!email || !password) {
            errorMessageDiv.textContent = 'Vui lòng nhập cả email và mật khẩu.';
            errorMessageDiv.style.display = 'block';
            return;
        }

        // Chuẩn bị dữ liệu để gửi lên server
        const dataToSend = {
            email: email,
            password: password
            // username: username // Sẽ thêm vào sau nếu cập nhật backend
        };

        console.log('Đang gửi dữ liệu đăng ký:', dataToSend);

        // Gửi yêu cầu POST đến API backend bằng fetch API
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST', // Phương thức là POST
                headers: {
                    'Content-Type': 'application/json' // Báo cho server biết ta gửi JSON
                },
                body: JSON.stringify(dataToSend) // Chuyển đổi object JS thành chuỗi JSON
            });

            // Phân tích phản hồi JSON từ server
            const result = await response.json();
            console.log('Phản hồi từ server:', result);

            // Kiểm tra xem yêu cầu có thành công không (status code 2xx)
            if (response.ok && response.status === 201) {
                // Đăng ký thành công
                successMessageDiv.textContent = result.message + ' Bạn có thể đăng nhập ngay.'; // Hiển thị thông báo thành công
                successMessageDiv.style.display = 'block';
                registerForm.reset(); // Xóa nội dung form sau khi thành công
                // Tùy chọn: Tự động chuyển hướng đến trang đăng nhập sau vài giây
                // setTimeout(() => {
                //    window.location.href = 'login.html';
                // }, 2000);
            } else {
                // Đăng ký thất bại (ví dụ: email tồn tại, lỗi server)
                errorMessageDiv.textContent = result.message || 'Đăng ký thất bại. Vui lòng thử lại.'; // Hiển thị lỗi từ server
                errorMessageDiv.style.display = 'block';
            }

        } catch (error) {
            // Xử lý lỗi mạng hoặc lỗi không thể kết nối đến server
            console.error('Lỗi khi gửi yêu cầu đăng ký:', error);
            errorMessageDiv.textContent = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.';
            errorMessageDiv.style.display = 'block';
        }
    });
});