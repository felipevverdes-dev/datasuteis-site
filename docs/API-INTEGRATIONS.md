# API Integrations

## Visão geral

O projeto usa integrações públicas e proxies server-side para evitar exposição desnecessária de segredo no client.

## Integrações ativas

## Open-Meteo

- Uso:
  - clima atual e previsão curta
  - geocoding e reverse geocoding
- Arquivos:
  - `client/src/lib/home-widgets.ts`
  - `server/external-data.ts`
- Observações:
  - usado sem chave
  - deve ter fallback elegante quando indisponível

## Yahoo Finance

- Uso:
  - cotações e fechamento de índices globais
- Arquivos:
  - `server/external-data.ts`
  - `shared/global-markets.ts`
  - `client/src/lib/world-clock-api.ts`
- Observações:
  - chamado apenas no backend
  - o front recebe snapshot já normalizado
  - se falhar, a agenda da bolsa continua visível com fallback local

## Exchangerate.host / Frankfurter / open.er-api

- Uso:
  - câmbio do conversor e header
- Arquivos:
  - `server/external-data.ts`
  - `client/src/lib/home-widgets.ts`
- Observações:
  - o navegador consome `/api/widgets/overview`
  - providers externos ficam encapsulados no backend
  - evita CORS direto no frontend
  - cache local e fallback entre providers

## ipwho.is / ipapi / ip-api / BigDataCloud / Nominatim

- Uso:
  - localização aproximada e reverse geocoding
- Arquivos:
  - `client/src/lib/home-widgets.ts`
  - `server/external-data.ts`
- Observações:
  - usar como dado auxiliar
  - nunca bloquear render principal da tela

## Google Analytics / Google tag

- Uso:
  - page view e eventos
- Arquivos:
  - `client/index.html`
  - `client/src/lib/analytics.ts`
- Observações:
  - page view já é controlado em `usePageSeo`
  - evitar duplicação manual

## Google AdSense

- Uso:
  - monetização
- Arquivos:
  - `client/index.html`
  - `client/src/components/AdSlot.tsx`
  - `client/public/ads.txt`
- Observações:
  - script assíncrono
  - espaço reservado para reduzir CLS
  - pedidos só devem seguir a política atual de consentimento

## Cache e fallback

- `server/external-data.ts` usa cache em memória por TTL
- `client/src/lib/home-widgets.ts` usa cache leve em `localStorage` para widgets públicos
- `client/src/lib/world-clock-api.ts` monta fallback local para Mercados Globais quando a API falha
- toda integração deve ter estado:
  - loading
  - success
  - empty/fallback
  - error

## Segurança

- Não expor API keys no client
- Preferir proxy server-side quando o provider exigir credencial
- Sanitizar query params de APIs públicas
- Revisar `Content-Security-Policy` em `server/index.ts` quando novas integrações forem adicionadas
