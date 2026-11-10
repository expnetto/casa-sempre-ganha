# A casa sempre ganha

Projeto final da disciplina **Desenvolvimento Front-End para Web** (UNIPÊ, prof. Israel Cunha).
Autor: Eraldo Xavier Pimentel Netto.

**Site publicado:** https://expnetto.github.io/casa-sempre-ganha/

## O que é

Um site que mostra, na prática, **por que as apostas online prendem**. Em vez de sermão, a pessoa
experimenta os mecanismos numa roleta com dinheiro de mentira, faz a conta com os próprios números
e sai com um plano de limites salvo no navegador.

- **Problema:** as bets cresceram muito rápido no Brasil, e o material de conscientização costuma ser
  técnico demais ou só proibir.
- **Público-alvo:** jovens e adultos que apostam ou convivem com alguém que aposta.
- **Interação:** roleta, caça-níquel e multiplicador jogáveis, simulador, calculadora de gasto e,
  no fim, um extrato de tudo o que foi jogado mais um autoteste (PGSI).
- **Linguagem visual:** cada página é um jogo diferente das bets, com cores, fontes, fundo animado e cursor
  próprios. Na página de ajuda o cassino desliga de propósito.

## Páginas

| Capítulo | Página | Jogo | O que tem |
|---|---|---|---|
| 1. Abertura | `index.html` | Lobby | Roleta jogável, holofotes e lâmpadas |
| 2. Por que prende | `html/mecanismos.html` | Pôquer | Os três mecanismos como cartas que correm de lado |
| | `html/mecanismo-quase-ganhou.html` | Caça-níquel | Caça-níquel jogável e viciada em quases, com o som sincronizado ao último rolo |
| | `html/mecanismo-reforco-variavel.html` | Multiplicador | Jogo de crash em canvas |
| | `html/mecanismo-ilusao-controle.html` | Apostas esportivas | Placar de odds ao vivo e gráfico de saldos desenhado |
| 3. Experimente | `html/simulador.html` | Roleta | Simulador em três passos, vídeo tutorial e lâmpadas que apagam com o saldo |
| 4. Quanto custa | `html/numeros.html` | Loteria | Contadores em bolas; calculadora com data de início e jogo preferido, total revelado numa raspadinha |
| 5. E agora | `html/ajuda.html` | Fora do jogo | Comprovante com tudo o que foi jogado no site, autoteste PGSI e canais de apoio, sem efeitos |
| Consulta | `html/glossario.html` | Bingo | Termos como bolas de bingo |
| | `html/fontes.html` | Dados | Referências com data de consulta |
| | `html/sobre.html` | Bastidores | Decisões técnicas e tags usadas em cada página |

## Destaque da mudança de páginas

1. **Menu lateral em todas as páginas**, com a página atual marcada. Em telas pequenas, ele vira um botão Menu.
2. **Trilha de capítulos** no topo, mostrando onde a pessoa está na jornada.
3. **Tela de carregamento entre os jogos**: listras nas cores do próximo jogo cobrem a tela com o aviso
   "Carregando" e o nome do jogo; na página nova, elas se abrem. A saída é feita em `js/nav.js` e
   `js/efeitos.js`; a chegada começa em `js/inicio.js`, carregado no `head` para a cortina já estar
   fechada antes da primeira pintura. Sem a biblioteca, a troca vira um deslizamento em CSS; com
   "reduzir movimento", um esmaecimento; sem JavaScript, os links funcionam normalmente.

## Tecnologias

- HTML semântico (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`) em todas as páginas,
  com as meta tags `charset`, `content-language`, `author`, `keywords`, `description` e `viewport`.
- CSS externo em quatro arquivos (`css/base.css`, `css/layout.css`, `css/componentes.css`,
  `css/temas.css`), com variáveis no `:root` redefinidas por tema (`body data-tema="..."`) e Google Fonts.
- JavaScript próprio, sem framework e sem build, com duas bibliotecas por CDN (o GSAP, com três plugins, e o Lenis):
  - **GSAP**: anima posição, rotação e opacidade (cortinas, preloader, fichas caindo, botões magnéticos);
  - **ScrollTrigger**: liga animações à rolagem (caça-níquel, cartas, linhas de saldo);
  - **SplitText**: separa títulos em linhas e palavras;
  - **DrawSVG**: desenha as linhas do gráfico de saldos;
  - **Lenis**: rolagem suave.
- O site funciona sem as bibliotecas: os efeitos conferem se elas existem antes de rodar.
- `localStorage` numa única chave (`csg`), acessada só pelo `js/estado.js`.

## Estrutura

```
index.html
html/      as outras 10 páginas
css/       base.css, layout.css, componentes.css, temas.css
js/        inicio.js, estado.js, nav.js, efeitos.js, cenas.js, roleta.js,
           abertura.js, simulador.js, calculadora.js, extrato.js
img/       imagens e pôster do vídeo
audio/     som do quase acerto (mp3 e ogg)
video/     gravação do simulador (mp4 e webm)
```

Nomes de arquivo em minúsculas, sem acento, com hífen entre as palavras.

## Como abrir

Basta abrir o `index.html` no navegador. Não precisa instalar nada.
A reportagem incorporada do YouTube só carrega quando o site está publicado (pelo link acima), porque
o YouTube não exibe vídeos incorporados em páginas abertas direto do arquivo.

## Mídia

As imagens, o som do quase acerto e o vídeo do simulador foram produzidos para este projeto.
A única mídia de terceiros é a reportagem da Rádio CBN, exibida por incorporação do YouTube.
As fontes dos dados estão na página `html/fontes.html`.
