# CodePTIT Extension Backend API

Backend API dùng cho **CodePTIT Extension**, hỗ trợ gửi mã nguồn lên trình biên dịch trực tuyến và nhận kết quả chạy chương trình.

Endpoint chính:

```txt
POST /api/send-code
```

API này nhận mã nguồn, ngôn ngữ lập trình, dữ liệu đầu vào `stdin`, sau đó chuyển tiếp yêu cầu đến Online Compiler API.

---

## License

MIT

---

## Tính năng

* Chạy code đồng bộ thông qua Online Compiler API
* Hỗ trợ các ngôn ngữ: C, C++, Java, Python
* Cho phép truyền input chuẩn thông qua `stdin`
* Hỗ trợ CORS
* Có kiểm tra `recaptchaToken` trong môi trường production
* Có thể dùng `apiKey` từ request body hoặc biến môi trường server

---

## Endpoint

```http
POST /api/send-code
```

---

## CORS

API cho phép gọi từ mọi origin:

```http
Access-Control-Allow-Origin: *
```

Các phương thức được hỗ trợ:

```http
POST, OPTIONS
```

Các header được hỗ trợ:

```http
Content-Type, Authorization
```

---

## Request Body

Gửi request dạng JSON:

```json
{
  "language": "cpp",
  "code": "#include <iostream>\nusing namespace std;\nint main() { cout << \"Hello CodePTIT\"; return 0; }",
  "stdin": "",
  "apiKey": "YOUR_ONLINE_COMPILER_API_KEY" (Optional),
  "recaptchaToken": "YOUR_RECAPTCHA_TOKEN"
}
```

---

## Tham số

| Trường           | Kiểu dữ liệu |                               Bắt buộc | Mô tả                                   |
| ---------------- | -----------: | -------------------------------------: | --------------------------------------- |
| `language`       |     `string` |                                     Có | Ngôn ngữ lập trình cần chạy             |
| `code`           |     `string` |                                     Có | Mã nguồn cần biên dịch/chạy             |
| `stdin`          |     `string` |                                  Không | Dữ liệu đầu vào chuẩn cho chương trình  |
| `apiKey`         |     `string` |                                  Không  | API key dùng để gọi Online Compiler API |
| `recaptchaToken` |     `string` |                    Có trong production | Token reCAPTCHA từ client               |

---

## Ngôn ngữ được hỗ trợ

* Tham khảo tại [https://onlinecompiler.io/docs#compilers](https://onlinecompiler.io/docs#compilers)
| `language` | Compiler được sử dụng |
| ---------- | --------------------- |
| `c`        | `gcc-15`              |
| `cpp`      | `g++-15`              |
| `java`     | `openjdk-25`          |
| `python`   | `python-3.14`         |

Ví dụ giá trị hợp lệ của `language`:

```txt
c
cpp
java
python
```

---

## Ví dụ request với cURL

### C++

```bash
curl -X POST "https://your-domain.com/api/send-code" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "cpp",
    "code": "#include <iostream>\nusing namespace std;\nint main() { int a, b; cin >> a >> b; cout << a + b; return 0; }",
    "stdin": "2 3",
    "apiKey": "YOUR_ONLINE_COMPILER_API_KEY",
    "recaptchaToken": "YOUR_RECAPTCHA_TOKEN"
  }'
```

### Python

```bash
curl -X POST "https://your-domain.com/api/send-code" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "a, b = map(int, input().split())\nprint(a + b)",
    "stdin": "2 3",
    "apiKey": "YOUR_ONLINE_COMPILER_API_KEY",
    "recaptchaToken": "YOUR_RECAPTCHA_TOKEN"
  }'
```

---

## Ví dụ request bằng JavaScript

```js
const response = await fetch("https://your-domain.com/api/send-code", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    language: "cpp",
    code: `
#include <iostream>
using namespace std;

int main() {
  int a, b;
  cin >> a >> b;
  cout << a + b;
  return 0;
}
    `,
    stdin: "2 3",
    apiKey: "YOUR_ONLINE_COMPILER_API_KEY",
    recaptchaToken: "YOUR_RECAPTCHA_TOKEN",
  }),
});

const data = await response.json();
console.log(data);
```

---

## Response

API sẽ trả về response từ Online Compiler API.

Ví dụ response thành công có thể có dạng:

```json
{
  "output": "5",
  "status": "success"
}
```

Tùy theo Online Compiler API, response thực tế có thể chứa thêm các trường khác như:

```json
{
  "output": "5",
  "errors": "",
  "executionTime": "0.02s",
  "memory": "1024kb"
}
```

---

## Error Response

### Thiếu `recaptchaToken`

Trong môi trường production, nếu không gửi `recaptchaToken`:

```json
{
  "error": "Missing recaptchaToken"
}
```

HTTP status:

```txt
400
```

---

### Server chưa cấu hình `RECAPTCHA_SECRET`

Nếu chạy production nhưng server chưa có biến môi trường `RECAPTCHA_SECRET`:

```json
{
  "error": "Internal server error"
}
```

HTTP status:

```txt
500
```

---

### Thiếu `apiKey`

Nếu request không có `apiKey` và server cũng chưa cấu hình `API_KEY`:

```json
{
  "error": "Thiếu apiKey"
}
```

HTTP status:

```txt
400
```

---

### Ngôn ngữ không hợp lệ

Nếu `language` không thuộc danh sách hỗ trợ:

```json
{
  "error": "Ngôn ngữ không hợp lệ hoặc không được hỗ trợ"
}
```

HTTP status:

```txt
400
```

---

### Thiếu mã nguồn

Nếu không gửi trường `code`:

```json
{
  "error": "Thiếu mã nguồn (code)"
}
```

HTTP status:

```txt
400
```

---

### Lỗi nội bộ server

Nếu server gặp lỗi trong quá trình xử lý:

```json
{
  "error": "Lỗi nội bộ server",
  "details": "Error message"
}
```

HTTP status:

```txt
500
```

---

## Biến môi trường

Tạo file `.env.local` trong project Next.js:

```env
API_KEY=YOUR_ONLINE_COMPILER_API_KEY
RECAPTCHA_SECRET=YOUR_RECAPTCHA_SECRET
```

Trong đó:

| Biến môi trường    | Mô tả                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `API_KEY`          | API key dùng để gọi Online Compiler API nếu client không gửi `apiKey` |
| `RECAPTCHA_SECRET` | Secret key dùng cho reCAPTCHA trong production                        |
| `NODE_ENV`         | Nếu khác `development`, API sẽ yêu cầu `recaptchaToken`               |

---

## Lưu ý bảo mật

Không nên public `API_KEY` ở phía client nếu API key có quyền quan trọng hoặc giới hạn quota.

Khuyến nghị sử dụng:

```json
{
  "language": "cpp",
  "code": "...",
  "stdin": "...",
  "recaptchaToken": "..."
}
```

Và cấu hình `API_KEY` trực tiếp trong biến môi trường của server:

```env
API_KEY=YOUR_ONLINE_COMPILER_API_KEY
```

Cách này giúp tránh việc lộ API key trong extension hoặc trình duyệt người dùng.

---

## Luồng xử lý

1. Client gửi request đến `/api/send-code`
2. Backend kiểm tra `recaptchaToken` trong production
3. Backend kiểm tra `apiKey`, `language`, `code`
4. Backend ánh xạ `language` sang compiler tương ứng
5. Backend gửi request đến:

```txt
https://api.onlinecompiler.io/api/run-code-sync/
```

6. Backend trả lại kết quả cho client

---

## Payload gửi đến Online Compiler API

Backend sẽ chuyển request thành payload như sau:

```json
{
  "compiler": "g++-15",
  "code": "#include <iostream>\nint main() { std::cout << \"Hello\"; }",
  "input": ""
}
```

Header gửi đi:

```http
Authorization: YOUR_ONLINE_COMPILER_API_KEY
Content-Type: application/json
```

---

## Ví dụ tích hợp trong CodePTIT Extension

```js
async function runCode({ language, code, stdin, recaptchaToken }) {
  const response = await fetch("https://your-domain.com/api/send-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language,
      code,
      stdin,
      recaptchaToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Không thể chạy code");
  }

  return response.json();
}
```

---

## Ví dụ dữ liệu đầu vào

### Input

```txt
2 3
```

### Code C++

```cpp
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b;
    return 0;
}
```

### Output mong đợi

```txt
5
```

---

## Cấu trúc API

```txt
app/
└── api/
    └── send-code/
        └── route.ts
```

---

## Development

Chạy project Next.js:

```bash
npm install
npm run dev
```

Gọi API local:

```txt
http://localhost:3000/api/send-code
```

Trong môi trường development, `recaptchaToken` không bắt buộc.

---

## Production

Khi deploy production, cần cấu hình biến môi trường:

```env
API_KEY=YOUR_ONLINE_COMPILER_API_KEY
RECAPTCHA_SECRET=YOUR_RECAPTCHA_SECRET
NODE_ENV=production
```

Trong production, client cần gửi thêm:

```json
{
  "recaptchaToken": "YOUR_RECAPTCHA_TOKEN"
}
```

---

## License

This project is licensed under the MIT License.

```txt
MIT License
```
