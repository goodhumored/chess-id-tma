# 🚀 Deploy Tutorial

### Инструкция по деплою проекта через Docker.

1. Скопируйте файл с примером:
```shell
cp .env.example .env.production
```

2. Откройте .env.production и удалите всё лишнее.
```shell
NEXT_PUBLIC_API_URL=https://api.chess-id.goodhumored.ru
NEXT_PUBLIC_API_SECRET=your_secret_here
DOCKER_IMAGE_NAME=goodhumored/chess-id-tma:latest
```

3. Обратитесь к мейнтейнерам проекта и возьмите актуальные значения переменных

4. Запустить скрипт деплоя

```shell
sh ./scripts/deploy.sh
```

5. Готово ✅

### После выполнения:

Docker-образ соберётся
Образ запушится в registry


### Возможные проблемы
❌ Переменная не задана

Проверьте .env.production — все переменные должны быть заполнены.


❌ Нет доступа к registry

Проверьте, что вы залогинены и есть доступ пушить в docker hub