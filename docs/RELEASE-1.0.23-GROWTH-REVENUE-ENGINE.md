# G3Soft Growth OS v1.0.23 — Growth Revenue Engine

## Objetivo
Transformar site + landing pages + campanhas + canais de aquisição em um fluxo único de atribuição e CRM.

## Fluxo
`Google / Meta / Instagram / LinkedIn / YouTube / WhatsApp / indicação`
→ `tracking link / UTM`
→ `landing page`
→ `touchpoints`
→ `formulário público`
→ `CRM Lead`
→ `MQL → SQL → Demo → Won`
→ `WhatsApp automation`
→ `campanha / receita atribuída`

## O que entrou
- Endpoint público de captura de leads sem autenticação.
- Captura de UTM, GCLID, FBCLID, MSCLKID, TTCLID, referrer, landing, visitor e session.
- First touch + last touch no lead.
- Touchpoints de page view, CTA e form submit.
- Tracking links curtos em `/r/:code`.
- Gerador individual e em lote de links para todas as LPs.
- Campanha associada ao lead e ao link.
- Aba Growth & Marketing dentro do CRM.
- Overview por canal, landing page e campanha.
- Fila de mensagens WhatsApp.
- Templates e automações de boas-vindas, MQL, demo e nutrição.
- Adapter para WhatsApp Cloud API quando as credenciais e templates aprovados forem configurados.
- Fallback de click-to-WhatsApp após captura.

## Canais
A classificação automática usa UTM/referrer para separar Google Ads, Google Orgânico, Meta Ads, Instagram, Facebook, LinkedIn, YouTube, WhatsApp, indicação e site.

## Segurança
- Endpoint público não expõe dados de CRM.
- Rate limit global de API permanece ativo.
- IP não é armazenado em claro; é armazenado como hash com salt.
- Dados públicos passam por validação e normalização.
- Nada exige reset de banco; migration 021 é incremental.

## WhatsApp
O código prepara a integração, mas o envio pela Meta exige:
- `WHATSAPP_CLOUD_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- templates aprovados na Meta com os mesmos nomes cadastrados no CRM.
