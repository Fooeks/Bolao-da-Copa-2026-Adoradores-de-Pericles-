# Bolão da Copa 2026 — Adoradores de Périccles

Site para acompanhar o bolão da Copa do Mundo FIFA 2026 entre um grupo de amigos: **Acordeh**, **Icaro**, **Guizão** e **Bruno**.

🔗 **Acesse:** [bolao-da-copa-2026-adoradores-de-pe.vercel.app](https://bolao-da-copa-2026-adoradores-de-pe.vercel.app/)

## Sobre o projeto

O site reúne os palpites de cada participante para todos os jogos da Copa (fase de grupos e mata-mata) e calcula automaticamente a pontuação e o ranking, com critérios de desempate.

### Funcionalidades

- **Ranking**: classificação dos participantes por pontos, com destaque visual para o pódio (ouro, prata e bronze) e tratamento de empates — quando os critérios de desempate são idênticos, os participantes compartilham a mesma colocação.
- **Home**: visão rápida dos próximos jogos e dos últimos resultados, com os palpites de todos os participantes lado a lado.
- **Agenda**: lista completa das partidas (pendentes e finalizadas), com confronto, placar/palpites e indicação de pontuação por jogo.
- **Página do participante**: estatísticas individuais (pontos, aproveitamento, acertos exatos, de resultado e erros), resumo dos próximos jogos/últimos resultados e todos os palpites organizados por grupo e por fase do mata-mata.

### Critérios de pontuação

- **+3 pontos**: placar exato
- **+1 ponto**: acerto do resultado (vencedor ou empate), sem acertar o placar
- **+0 pontos**: erro

No mata-mata, a pontuação considera o acerto da seleção avançando para a fase seguinte.

## Tecnologias

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/)
- Deploy via [Vercel](https://vercel.com/)

## Rodando localmente

```bash
npm install
npm run dev
```

O projeto abrirá em `http://localhost:5173`.

Para gerar a build de produção:

```bash
npm run build
```

## Estrutura dos dados

Os palpites e resultados das partidas ficam em `src/data/`. Conforme os jogos da Copa acontecem, os arquivos `partidas.js` e `partidasMataMata.js` são atualizados com os placares reais, e o site recalcula pontuação e ranking automaticamente.

---

Projeto de uso pessoal, feito para acompanhar o bolão entre amigos durante a Copa do Mundo 2026.