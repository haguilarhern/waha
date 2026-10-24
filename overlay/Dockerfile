# Overlay build: official WAHA image + our compiled changes + the GOWS binary with SendButtons.
# Avoids rebuilding WAHA's heavy git dependencies; keep the base pinned to the revision our dist was built against.
ARG BASE=devlikeapro/waha:noweb
FROM ${BASE}
COPY dist/core/engines/noweb/noweb.buttons.js /app/dist/core/engines/noweb/noweb.buttons.js
COPY dist/core/engines/gows/session.gows.core.js /app/dist/core/engines/gows/session.gows.core.js
COPY dist/core/engines/gows/grpc/ /app/dist/core/engines/gows/grpc/
COPY overlay/gows /app/gows
RUN chmod +x /app/gows && /app/gows --help >/dev/null 2>&1 || true
