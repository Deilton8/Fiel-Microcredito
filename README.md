# Fiel Microcrédito, EI — Website Institucional

Website estático (HTML + CSS + JavaScript puro, sem frameworks) para a Fiel Microcrédito, EI.

## Estrutura de pastas

```
fiel-microcredito-website/
├── index.html                  Página única, todas as secções por âncora
├── css/
│   └── styles.css              Todo o CSS: variáveis, @font-face, layout, componentes, animações
├── js/
│   └── main.js                 Todo o JS: menu, scroll, contadores, gráficos, formulário
├── assets/
│   ├── fonts/                  Cormorant + Manrope autoalojadas (.woff2, subset latin)
│   ├── icons/
│   │   ├── logo-mark.svg       Símbolo "F" da marca (header e rodapé)
│   │   ├── favicon.svg         Ícone do separador (SVG, navegadores modernos)
│   │   ├── favicon-32.png      Fallback PNG do favicon (navegadores/crawlers antigos)
│   │   ├── apple-touch-icon.png  Ícone para ecrã principal iOS (180×180)
│   │   ├── icon-192.png / icon-512.png  Ícones extra (Android/PWA-like)
│   │   └── seal-bm.png         Logótipo oficial do Banco de Moçambique
│   └── images/
│       ├── illustration-credito-empresarial.svg   Ilustração original (substitui foto de dólares)
│       ├── illustration-credito-consumo.svg       Ilustração original (substitui foto de francos CFA)
│       ├── photo-tailor-fabric.jpg / .webp        Costureira — foto real
│       ├── photo-mechanic-engine.jpg / .webp      Mecânico — foto real
│       ├── photo-market-vendors.jpg / .webp       Mercado — foto real
│       ├── portrait-erica.svg      Monograma ilustrativo da Directora Geral
│       ├── og-cover.png            Imagem de partilha em redes sociais (PNG, 1200×630)
│       └── og-cover.svg            Fonte editável do og-cover.png (vector, não usada em runtime)
└── README.md                   Este ficheiro
```

## Como abrir localmente

Não precisa de instalação, mas **use sempre um servidor local**, não duplo-clique no ficheiro:
```bash
cd fiel-microcredito-website
python3 -m http.server 8000
```
depois visite `http://localhost:8000`. As fontes autoalojadas (ver secção 2) só carregam corretamente por `http(s)://` — abrir `index.html` directamente (`file://`) bloqueia-as por política de CORS do próprio browser. Isto é uma particularidade do `file://`; qualquer alojamento real (Netlify, servidor próprio, etc.) serve por `https://` e não tem este problema.

## O que foi revisto e corrigido nesta ronda

### 1. Fotografias — 3 das 6 mostravam o contexto errado
Auditoria visual encontrou:
- `photo-money-counting.jpg` (Crédito Empresarial): notas de **dólar americano**, não Metical.
- `photo-consumer-handshake.jpg` (Crédito ao Consumo): notas de **franco CFA/BCEAO**, também não Metical.
- `photo-shop-interior.jpg` (Hero, imagem grande): interior de uma **loja de conveniência holandesa** (logótipo "AH"/Albert Heijn visível nos sacos) — não uma mercearia moçambicana.

As 3 fotos foram **removidas**. Sem acesso a fotografia real de Metical nem a bancos de imagem (ambiente sem esse acesso de rede, e usar stock photo aleatória levantaria questões de direitos de autor), a solução aplicada foi:
- **Hero**: reduzido de 3 para 2 fotos (costureira + mecânico, ambas correctas e mantidas), grid ajustado.
- **Produtos**: as 2 fotos de dinheiro foram substituídas por **duas ilustrações originais em SVG** (`illustration-credito-empresarial.svg`, `illustration-credito-consumo.svg`) — notas e moedas abstractas, sem tentar imitar nenhuma moeda real, no dourado/azul-marinho da marca. Ficam mais coerentes com uma instituição licenciada do que fotos de stock genéricas, e pesam ~3KB cada (as fotos removidas pesavam 65–72KB).

**Se/quando existir fotografia real da Fiel** (notas de Metical, atendimento em loja própria), o mais simples é substituir directamente os `<img>` das 2 ilustrações em `index.html` — a caixa `.product-card__media` aceita qualquer imagem com rácio 16:10.

As 3 fotos reais mantidas (`photo-tailor-fabric`, `photo-mechanic-engine`, `photo-market-vendors`) ganharam versão `.webp` (25–30% mais leve) servida via `<picture>` com fallback `.jpg` automático — nenhuma acção necessária, funciona em qualquer browser.

### 2. Tipografia — Cormorant e Manrope agora autoalojadas
Antes, o CSS referenciava as fontes "Cormorant"/"Manrope" sem as carregar em lado nenhum, pelo que o browser usava sempre a fonte de sistema (Georgia/sans-serif por defeito), nunca as fontes desenhadas para a marca.

Corrigido: os ficheiros `.woff2` (subset latin, pesos 400–800 conforme o uso real no CSS) foram obtidos via pacotes oficiais `@fontsource/cormorant` e `@fontsource/manrope` (npm) e ficam em `assets/fonts/`, com `@font-face` + `font-display: swap` no topo de `styles.css`, e `<link rel="preload">` no `<head>` para os 2 pesos usados acima da dobra. Não depende de fonts.googleapis.com nem de nenhum pedido externo.

### 3. Formulário de contacto — continua só com validação (decisão do cliente)
Sem alteração: o formulário valida os campos no browser mas **não envia dados para nenhum servidor** — não existe backend neste projecto. Para ligar a um envio real, edite `handleContactSubmit()` em `js/main.js` (comentário indica onde) e chame o endpoint escolhido, por exemplo:
```js
fetch('https://SEU-ENDPOINT/contacto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(new FormData(form)))
});
```
Alternativas simples sem backend próprio: [Formspree](https://formspree.io) ou [Web3Forms](https://web3forms.com). Isto não foi feito nesta ronda porque implica criar conta e obter credenciais próprias da Fiel — não é algo que se possa decidir/inventar por fora.

### 4. Mapa corrigido para coordenadas exactas · Redes sociais continuam por preencher
O `<iframe>` do mapa usava uma pesquisa de texto genérica ("Av. Emília Dausse, Maputo"). Foi confirmada a morada exacta incluindo o número de porta e substituída por coordenadas precisas (-25.9652888, 32.5838003), pelo que o pin fica exactamente no local certo, não numa zona aproximada da avenida.

Os links de Facebook/Instagram/LinkedIn continuam a apontar para `#` — isto exige os URLs reais das páginas da Fiel, que não posso saber nem inventar. Enquanto isso, corrigi um efeito secundário: clicar nesses ícones fazia a página saltar bruscamente para o topo (comportamento por omissão de `href="#"`); agora o clique não faz nada, sem esse salto, até lá existirem links reais.

### 5. Acessibilidade — 2 problemas de contraste (WCAG AA) corrigidos
Medição de contraste a todas as combinações de cor do site encontrou:
- `.section-kicker` (rótulos dourados pequenos, ex. "Sobre Nós", "A Nossa Missão"): 3.05–3.36:1 sobre branco/paper — abaixo do mínimo 4.5:1 para texto pequeno. Corrigido trocando `--gold-600` por `--gold-700` (já existia no sistema de cor).
- 3 rótulos pequenos (`Montante/Prazo/Pagamento` nos produtos, `Telefone/Morada` no contacto, anotações "(condicionado)" nos documentos): mesmo problema com `--ink-slate-light`. Criada variável nova `--ink-slate-muted` (4.57–5.21:1, cumpre AA) para estes casos específicos; os usos não-textuais de `--ink-slate-light` (ícones, contornos) mantiveram-se, pois aí o mínimo exigido é só 3:1.

Também corrigido: a topbar (telefone + morada no topo) cortava o 2º telefone e a morada a meio da palavra, sem reticências, em ecrãs ≤ ~768px. Abaixo desse ponto mostra-se só o telefone principal + redes sociais; a morada e o 2º telefone continuam visíveis no rodapé e na secção de Contacto.

### 6. Partilha em redes sociais (Open Graph / WhatsApp / Twitter)
A imagem de partilha (`og:image`) estava em SVG — a generalidade dos leitores de link (WhatsApp, Facebook, LinkedIn, X) não renderiza SVG nesta tag, pelo que qualquer link partilhado aparecia sem imagem de pré-visualização. Corrigido: `og-cover.svg` foi renderizado para `og-cover.png` (1200×630, com as fontes reais já aplicadas) e o `<head>` passou a incluir `og:image:width/height/type` e tags Twitter Card (`summary_large_image`). Foi também adicionado JSON-LD (`schema.org/FinancialService`) com nome, morada e coordenadas, para resultados mais ricos no Google.

Nota para quando o site tiver domínio definitivo: `og:image`/`twitter:image` estão em caminho relativo (não há domínio real a apontar ainda); o ideal é trocar para URL absoluto (`https://dominio/assets/...`) nessa altura, pois alguns leitores de link resolvem melhor URLs absolutos.

### 7. Ícones e favicons
Adicionados `favicon-32.png`, `apple-touch-icon.png` (180×180) e `icon-192.png`/`icon-512.png`, gerados a partir do `favicon.svg` já existente — cobre browsers/crawlers que não leem favicon SVG e permite adicionar o site ao ecrã principal no iOS/Android com o ícone correcto. Todos os PNGs (incluindo o selo do Banco de Moçambique) foram comprimidos com `pngquant`; o selo, por exemplo, caiu de 31KB para 8,5KB sem perda visível de qualidade.

### 8. Símbolo "F" da marca e logótipo do Banco de Moçambique
Sem alterações — mantêm-se as notas já validadas anteriormente: `logo-mark.svg`/`og-cover.svg` usam o traçado vectorial exacto do logótipo oficial; `favicon.svg` usa deliberadamente uma versão mais sólida (sem vazados finos) por ser ilegível a 16–32px; `seal-bm.png` é o logótipo oficial do Banco de Moçambique fornecido pelo cliente, mantido como PNG por ser emblema oficial de terceiros.

## Segunda ronda de alterações

### 9. Email de contacto adicionado
`comercial@fielmicrocredito.com` foi adicionado em 3 sítios: cartão próprio na secção de Contacto (entre Telefone e Morada, com link `mailto:`), lista de contacto do rodapé, e dados estruturados JSON-LD (campo `email`).

### 10. Responsividade — 3 bugs reais de overflow horizontal corrigidos
Testado sistematicamente de 240px a 3440px de largura (telemóveis antigos a monitores ultra-wide). Encontrados e corrigidos 3 problemas reais, todos pela mesma causa raiz: um elemento não conseguia encolher abaixo da largura do seu conteúdo, empurrando a página inteira para scroll horizontal lateral.

- **Grelhas de produtos e ODS** (`products-grid`, `sdg-grid`, e outras): entre 640-899px, o texto dos cartões impedia-os de encolher para caber nas colunas. Corrigido com `min-width: 0` nos itens de grelha — regra CSS nova e centralizada (secção 1.6 do `styles.css`) aplicada a todas as grelhas do site (`about__grid`, `audience-grid`, `contact__grid`, `docs-grid`, `form-row`, `hero__grid`, `impact__grid`, `leader`, `mission-grid`, `product-card__specs`, `products-grid`, `sdg-grid`, `stats`, `timeline__track`), para prevenir o mesmo problema em qualquer grelha futura.
- **Campo `<select>` do formulário**: a opção mais longa ("Ainda não sei — quero esclarecer dúvidas") impedia o campo de encolher abaixo de ~345px. Corrigido com `width: 100%` explícito nos campos do formulário.
- **Email nos cartões de contacto**: `comercial@fielmicrocredito.com` é uma string sem espaços; sem poder quebrar linha, forçava a página a alargar em ecrãs muito estreitos. Corrigido com `overflow-wrap: anywhere` nos valores dos cartões de contacto e nos links do rodapé.

Confirmado sem overflow horizontal a partir de 320px (o mínimo convencional da indústria — cobre desde os telemóveis mais antigos ainda em uso até monitores 4K/ultra-wide), em retrato e paisagem, e sem erros de consola em nenhuma largura testada.

## Terceira ronda — scroll lateral em dispositivos móveis reais

Reportado em iPhone e Android reais: a página deixava arrastar para os lados. Isto **não aparecia** nos meus testes automatizados (varridos de 240px a 3440px, incluindo perfis de iPhone SE/12/14 Pro Max, Pixel 5, Galaxy S9+, iPad) porque a causa não é um elemento a ultrapassar a largura do ecrã (isso já tinha sido verificado e corrigido na ronda anterior) — é uma inconsistência conhecida de alguns browsers móveis reais (Safari iOS em particular) na forma como propagam `overflow-x: hidden` do `<body>` para a viewport. O `<body>` já tinha `overflow-x: hidden`; o `<html>` não tinha nada definido, e por especificação CSS a propagação para a viewport depende dessa combinação — nem todos os browsers a aplicam da mesma forma.

Corrigido adicionando `overflow-x: hidden` + `max-width: 100%` explicitamente também ao `<html>`, não só ao `<body>` (o padrão mais robusto e mais recomendado para este problema específico). Verifiquei que não havia outras causas comuns do mesmo sintoma (`box-sizing` não estava a ser aplicado globalmente, margens negativas mal contidas, o ticker de marquee sem `overflow:hidden`) — nenhuma dessas se aplicava; o `<html>` sem `overflow-x` era o único ponto em falta.

**Nota de transparência**: o meu ambiente de testes não tem acesso a um iPhone/Android reais nem ao motor Safari (WebKit) — só Chromium. Não consigo reproduzir aqui o exact comportamento de arrastar que reportaram, por isso não posso confirmar ao certo que esta era a única causa. É, no entanto, a explicação mais provável e o padrão de correcção standard para este sintoma exacto (scroll lateral em mobile apesar de `overflow-x:hidden` no body), sem qualquer efeito colateral visual. Se persistir depois desta correcção, o próximo passo é experimentar ver exactamente qual elemento fica visível ao arrastar (indica onde procurar a seguir).

## Quarta ronda — cabeçalho fixo, email na topbar, menu em tablets

### Regressão: o cabeçalho deixou de ficar fixo ao fazer scroll
Causada pela minha própria correcção da ronda anterior. `overflow-x: hidden` no `<html>`/`<body>` resolve o scroll lateral, mas é uma causa clássica conhecida de quebrar `position: sticky` em descendentes — um ancestral com overflow diferente de `visible` pode impedir o elemento sticky de se colar à viewport, fazendo-o comportar-se como `position: relative` normal (rola com o conteúdo em vez de ficar fixo). Confirmado empiricamente: com `overflow-x:hidden` no html, o cabeçalho ficava a `top: -554px` (fora do ecrã) depois de 1500px de scroll; sem essa regra, ficava correctamente a `top: 0`.

**Correcção**: `overflow-x: clip` em vez de `hidden` no `html` e `body` (com `hidden` mantido antes como fallback para browsers muito antigos que não reconheçam `clip` — a cascata CSS ignora a linha que não percebe e fica com a válida). `clip` não cria um mecanismo de scroll (nem programático nem invisível), por isso não é tratado como "contentor de scroll" pelos browsers e não interfere com elementos `sticky` descendentes — testado e confirmado: cabeçalho fixo A funcionar E sem scroll lateral, em simultâneo, de 320px a 2560px.

### Email adicionado à topbar
`comercial@fielmicrocredito.com` juntou-se aos 2 telefones e à morada na barra superior (desktop), com ícone de envelope e link `mailto:`.

### Topbar removida por completo em mobile
Anteriormente só o 2º telefone e a morada ficavam escondidos em mobile (ficava o 1º telefone + redes sociais). Agora a topbar inteira (contactos + redes sociais) desaparece em ecrãs mobile — telefone, email e morada continuam acessíveis no rodapé e na secção de Contacto.

### Bug encontrado de raspão: menu horizontal quebrava linha entre 900-1049px
Ao verificar a topbar com o email novo, reparei que o menu principal ("Sobre Nós", "Como Funciona") quebrava para 2 linhas de forma feia entre 900-1049px de largura — inclui tablets em modo paisagem (ex.: iPad a 1024px). Não fazia parte do pedido, mas é um bug de responsividade real e visível, por isso corrigi: o painel de navegação mobile (que já cobria até 899px) passou a cobrir até 1060px — testado e confirmado sem quebra de linha em nenhuma largura a partir daí. As restantes secções do site (grelhas de produtos, ODS, etc.) mantêm o breakpoint original de 899px, que já estava correcto.

## Quinta ronda — envio do formulário passou a ter um destino real

*(Superseded pela oitava ronda, mais abaixo: o destino passou de email/Web3Forms para WhatsApp, sem nenhuma conta ou chave a configurar. Descrição mantida só por registo histórico.)*

## Sexta ronda — ícones substituídos pelo F fornecido pela Fiel

O favicon, apple-touch-icon e ícones extra (192/512) deixaram de usar o "F" plano genérico e passaram a usar o F dourado 3D fornecido pela Fiel (extraído da imagem de apresentação da marca, recortado e colocado em canvas quadrado com fundo branco). `favicon.svg` foi removido (deixou de ser referenciado e deixou de existir no projecto).

**Aviso honesto sobre o tamanho mais pequeno**: a imagem fornecida é uma renderização fotorealista em 3D, com traços duplos finos e reflexos de metal — isso lê-se muito bem a 180px (apple-touch-icon) e acima, mas a 32px (favicon, o ícone do separador do browser) os traços finos ficam esbatidos; a 16px deixa de ser claramente reconhecível como um "F", ficando mais um traço dourado abstracto. Apliquei um ligeiro reforço de nitidez/contraste só na versão de 32px para ajudar, mas é uma limitação real de usar uma imagem fotográfica/3D num espaço tão pequeno — um logótipo vectorial simplificado seria sempre mais nítido nesse tamanho específico. Optei por seguir a instrução tal como dada (usar este F em todos os ícones, incluindo o favicon); se decidirem que o favicon do separador deve antes usar uma versão mais simplificada só para esse tamanho, é uma alteração pequena e digam que eu faço.

O logótipo principal do cabeçalho e rodapé (`logo-mark.svg`) e a imagem de partilha em redes sociais (`og-cover.png`) não foram alterados — o pedido foi especificamente sobre os ícones (favicon/apple-touch/etc.), não sobre o logótipo visível no corpo do site.

## Sétima ronda — foto real de Érica na secção de Liderança

`portrait-erica.svg` (monograma ilustrativo, placeholder) foi substituído pela fotografia real da Directora Geral, fornecida pela Fiel. A foto original era um selfie de corpo inteiro tirado dentro de um carro; recortei para um enquadramento de cabeça e ombros (proporção 220:260, igual à do placeholder anterior, para não alterar o layout da secção), gerada em `.jpg` + `.webp` com fallback automático via `<picture>`, e com cantos arredondados e sombra subtil para se integrar no cartão escuro da secção. `alt` actualizado para deixar de dizer "ilustrativo" — é uma fotografia real.

## Oitava ronda — formulário e contactos passaram de email para WhatsApp

Toda a referência a email foi removida do site (topbar, secção de Contacto, rodapé, dados estruturados) e substituída por WhatsApp, usando o número principal já apresentado no site (+258 82 723 3067). Não depende de nenhuma conta, chave ou serviço externo — ao contrário do Web3Forms (ronda 5), não há nada para configurar nem nada que possa ficar "por activar".

**Como funciona agora**: ao submeter o formulário de contacto, o browser abre o WhatsApp (aplicação no telemóvel, ou WhatsApp Web no computador) numa nova aba, já com uma mensagem escrita com todos os dados do formulário (nome, telefone, tipo de crédito, mensagem) prontos a enviar — a pessoa só precisa de confirmar o envio dentro do próprio WhatsApp. Caso o browser bloqueie a abertura automática (alguns bloqueiam pop-ups), a mensagem de confirmação no site inclui sempre um link directo de recurso ("Toque aqui") com a mesma mensagem pré-preenchida.

Testado de ponta a ponta: confirmei que o link gerado (`https://wa.me/258827233067?text=...`) contém exactamente os dados submetidos, correctamente formatados e codificados — ao contrário da integração com o Web3Forms, aqui não há nenhum passo que dependa de um serviço externo que eu não consiga verificar; todo o processo acontece no próprio browser.

O estado de erro do formulário (mostrado antes quando a chave do Web3Forms não estava configurada) deixou de existir — já não há nada que possa falhar a meio, por isso não faz sentido mantê-lo.

## Notas técnicas

- **Sem frameworks nem bibliotecas externas.** Todo o CSS e JS é escrito de raiz.
- **Ícones**: SVGs inline no HTML (estilo outline, consistente).
- **Animações**: `IntersectionObserver` para fade-in/slide-up ao scroll, com respeito por `prefers-reduced-motion`. Gráficos da secção "Impacto" são barras SVG desenhadas e animadas via JS nativo, sem bibliotecas de gráficos.
- **Acessibilidade**: navegação por teclado, `focus-visible`, `aria-label`/`aria-expanded` no menu mobile, estrutura semântica (`<nav>`, `<main>`, `<section>`), contraste WCAG AA em todo o texto (ver secção 5).
- **Performance**: fontes autoalojadas com `preload` nos pesos críticos, imagens fotográficas em `.webp` com fallback `.jpg`, `loading="lazy"` fora do primeiro ecrã, sem pedidos a domínios externos (Google Fonts, CDNs, etc.), scroll e resize com `requestAnimationFrame`.
- **SEO**: dados estruturados `schema.org/FinancialService`, Open Graph + Twitter Card completos com imagem PNG real.
