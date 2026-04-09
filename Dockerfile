FROM heroiclabs/nakama:3.0

COPY ./backend/nakama/build /nakama/data/modules

CMD ["/bin/sh", "-ecx", "\
    until /nakama/nakama migrate up --database.address $DATABASE_ADDRESS; do \
    echo 'Waiting for Postgres...'; \
    sleep 2; \
    done; \
    exec /nakama/nakama \
    --name nakama1 \
    --database.address $DATABASE_ADDRESS \
    --logger.level DEBUG \
    --session.token_expiry_sec 7200 \
    --runtime.path /nakama/data/modules \
    --runtime.js_entrypoint index.js \
    "]