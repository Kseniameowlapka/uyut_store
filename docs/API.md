## API Документация

### Авторизация
Метод | Эндпоинт | Описание 
POST | `/api/auth/register` | Регистрация 
POST | `/api/auth/login` | Вход

### Товары
Метод | Эндпоинт | Описание | Доступ 
GET | `/api/products` | Получить все товары 
GET | `/api/products/:id` | Получить товар по ID
POST | `/api/products` | Создать товар
PUT | `/api/products/:id` | Обновить товар
DELETE | `/api/products/:id` | Удалить товар

### Пример запроса (логин)
POST /api/auth/login
{
    "email": "admin@uyut.ru",
    "password": "admin123"
}
### пример ответа
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "email": "admin@uyut.ru", "role": "admin" }
}
