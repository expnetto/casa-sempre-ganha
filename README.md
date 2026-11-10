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
- **Interação:** simulador de roleta, calculadora de gasto e plano de limites.

## Páginas

| Capítulo | Página | O que tem |
|---|---|---|
| 1. Abertura | `index.html` | Roleta interativa com R$ 100 de mentira |
| 2. Por que prende | `html/mecanismos.html` | Os três mecanismos, com revelação ao rolar |
| | `html/mecanismo-quase-ganhou.html` | Áudio do quase acerto e a cena animada com GSAP |
| | `html/mecanismo-reforco-variavel.html` | Vídeo gravado do próprio simulador |
| | `html/mecanismo-ilusao-controle.html` | Mitos e fatos, e a conta da vantagem da casa |
| 3. Experimente | `html/simulador.html` | Simulador com três estratégias e tabela de rodadas |
| 4. Quanto custa | `html/numeros.html` | Números oficiais do Brasil e calculadora de gasto |
| 5. E agora | `html/ajuda.html` | Plano de limites e canais de apoio |
| Consulta | `html/glossario.html` | Termos das apostas, em `details` e `summary` |
| | `html/fontes.html` | Referências com data de consulta |
| | `html/sobre.html` | Decisões técnicas e tags usadas em cada página |

## Destaque da mudança de páginas

1. **Menu lateral em todas as páginas**, com a página atual marcada. Em telas pequenas, ele vira um botão Menu.
2. **Trilha de capítulos** no topo, mostrando onde a pessoa está na jornada.
3. **Transição entre páginas** em CSS e JavaScript puro (`js/nav.js`): o conteúdo sai deslizando e a
   próxima página entra pelo lado oposto. Avançar desliza para a esquerda, voltar desliza para a direita.
   Com "reduzir movimento" ligado no sistema, a transição vira um esmaecimento. Sem JavaScript, os
   links funcionam normalmente.

## Tecnologias

- HTML semântico (`header`, `nav`, `main`, `section`, `article`, `aside`, `footer`) em todas as páginas,
  com as meta tags `charset`, `content-language`, `author`, `keywords`, `description` e `viewport`.
- CSS externo em três arquivos (`css/base.css`, `css/layout.css`, `css/componentes.css`), com variáveis
  no `:root` e Google Fonts (Big Shoulders Display e Schibsted Grotesk).
- JavaScript puro, sem framework e sem build. O GSAP com ScrollTrigger aparece só numa cena, na página
  do quase ganhou, e o site funciona completo sem ele.
- `localStorage` numa única chave (`csg`), acessada só pelo `js/estado.js`.

## Estrutura

```
index.html
html/      as outras 10 páginas
css/       base.css, layout.css, componentes.css
js/        estado.js, nav.js, roleta.js, abertura.js, revelar.js,
           simulador.js, calculadora.js, limites.js, cena-gsap.js
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
