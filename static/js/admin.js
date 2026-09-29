"use strict";
/* Painel administrativo (/admin) */

/* ---------- dados fictícios ---------- */
const MESES = ["out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set"];
const ANOS  = [2025, 2025, 2025, 2026, 2026, 2026, 2026, 2026, 2026, 2026, 2026, 2026];
const ENTRADAS = [412, 438, 521, 398, 405, 447, 469, 488, 502, 517, 536, 561];
const SAIDAS   = [371, 402, 468, 377, 384, 410, 431, 449, 460, 471, 498, 509];
const CARTEIRA = [
  ["Conta corrente", 38, "var(--cedula)"],
  ["Crédito", 27, "var(--ipe)"],
  ["Poupança", 21, "var(--apoio)"],
  ["Investimentos", 14, "var(--tinta-suave)"]
];

// Os dados sensíveis não moram mais aqui: vêm do servidor, só para admin.
let TRANSACOES = [];
let CLIENTES = [];

const estado = {
  logado: false,
  periodo: 12,
  filtroTransacao: "todas",
  buscaTransacao: "",
  buscaCliente: "",
  statusCliente: "todos",
  ordemCliente: "saldo",
  contexto: "site",
  telaLogin: "entrar"
};

const CONTAS = [];


/* ---------- ícones ---------- */
const ICONES = {
  grade:   '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></svg>',
  setas:   '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h13m0 0-3-3m3 3-3 3M20 16H7m0 0 3-3m-3 3 3 3"/></svg>',
  pessoas: '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M17 14c2.4 0 4 1.8 4 4.5"/></svg>',
  sair:    '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/></svg>',
  tema:    '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
};


/* ---------- gráficos em SVG ---------- */
function sparkline(dados) {
  const l = 96, a = 28, min = Math.min(...dados), max = Math.max(...dados);
  const pts = dados.map((v, i) => `${(i / (dados.length - 1) * l).toFixed(1)},${(a - 3 - ((v - min) / ((max - min) || 1)) * (a - 6)).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${l} ${a}" aria-hidden="true"><polyline points="${pts}"/></svg>`;
}

function dadosPeriodo() {
  const n = estado.periodo, ini = 12 - n;
  return { n, ini, meses: MESES.slice(ini), anos: ANOS.slice(ini), ent: ENTRADAS.slice(ini), sai: SAIDAS.slice(ini) };
}
function leituraFluxo(i) {
  const { meses, anos, ent, sai } = dadosPeriodo();
  const liq = ent[i] - sai[i];
  return `<b>${meses[i]}/${anos[i]}</b> · Entradas <b>R$ ${numero.format(ent[i])} mil</b> · Saídas <b>R$ ${numero.format(sai[i])} mil</b> · Saldo líquido <b class="${liq >= 0 ? "delta-pos" : "delta-neg"}">${liq >= 0 ? "+" : "−"}R$ ${numero.format(Math.abs(liq))} mil</b>`;
}
function svgFluxo() {
  const { n, meses, anos, ent, sai } = dadosPeriodo();
  const L = 720, A = 290, mE = 46, mD = 6, mT = 10, mB = 30, w = L - mE - mD, h = A - mT - mB;
  const max = Math.ceil(Math.max(...ent, ...sai) / 100) * 100;
  const y = v => mT + h - (v / max) * h;
  const gw = w / n, bw = Math.min(22, gw * 0.32);
  let grade = "";
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    grade += `<line class="grade-linha" x1="${mE}" x2="${L - mD}" y1="${y(v)}" y2="${y(v)}"/><text x="${mE - 8}" y="${y(v) + 4}" text-anchor="end">${numero.format(v)}</text>`;
  }
  let grupos = "";
  for (let i = 0; i < n; i++) {
    const cx = mE + gw * i + gw / 2;
    const rot = `${meses[i]}/${anos[i]}: entradas R$ ${ent[i]} mil, saídas R$ ${sai[i]} mil`;
    grupos += `<g class="grupo-mes${i === n - 1 ? " ativo" : ""}" data-i="${i}" tabindex="0" role="img" aria-label="${rot}">
      <rect class="zona" x="${mE + gw * i}" y="${mT}" width="${gw}" height="${h}" rx="4"/>
      <rect class="barra b-ent" x="${(cx - bw - 1).toFixed(1)}" y="${y(ent[i]).toFixed(1)}" width="${bw.toFixed(1)}" height="${(mT + h - y(ent[i])).toFixed(1)}" rx="2"/>
      <rect class="barra b-sai" x="${(cx + 1).toFixed(1)}" y="${y(sai[i]).toFixed(1)}" width="${bw.toFixed(1)}" height="${(mT + h - y(sai[i])).toFixed(1)}" rx="2"/>
      <text x="${cx.toFixed(1)}" y="${A - 9}" text-anchor="middle">${meses[i]}</text>
    </g>`;
  }
  return `<svg class="grafico" viewBox="0 0 ${L} ${A}" role="group" aria-label="Entradas e saídas por mês, em milhares de reais">${grade}${grupos}</svg>`;
}

function svgCarteira() {
  let acc = 0;
  const arcos = CARTEIRA.map(([, p, cor]) => {
    const s = `<circle r="15.9155" cx="21" cy="21" fill="none" stroke="${cor}" stroke-width="6" stroke-dasharray="${p - 0.6} ${100 - p + 0.6}" stroke-dashoffset="${-acc}"/>`;
    acc += p;
    return s;
  }).join("");
  return `<svg class="donut" viewBox="0 0 42 42" role="img" aria-label="Carteira por produto: ${CARTEIRA.map(c => c[0] + " " + c[1] + "%").join(", ")}"><g transform="rotate(-90 21 21)">${arcos}</g><text x="21" y="21" text-anchor="middle" class="d-valor">R$ 184,6 mi</text><text x="21" y="26" text-anchor="middle" class="d-rot">sob custódia</text></svg>`;
}


/* ---------- regras de negócio ---------- */
const emRevisao = () => TRANSACOES.filter(t => t.status === "Pendente" || t.status === "Suspeita");
const classeStatus = s => ({ "Concluída": "p-ok", "Ativo": "p-ok", "Pendente": "p-aviso", "Em análise": "p-aviso", "Suspeita": "p-alerta", "Bloqueada": "p-alerta", "Bloqueado": "p-alerta" }[s] || "");
const pilula = s => `<span class="pilula ${classeStatus(s)}">${s}</span>`;
const valorFmt = v => `<span class="num ${v > 0 ? "pos" : ""}">${v > 0 ? "+ " : "− "}${moeda.format(Math.abs(v))}</span>`;
const contaDe = c => `0001 · ${10000 + c.id * 137}-${(c.id * 7) % 10}`;


/* ---------- login ---------- */
function renderizarLogin() {
  if (estado.telaLogin === "criar") return renderizarCriarConta();
  document.title = "Entrar — Painel Banco Ipê";
  app.innerHTML = `
  <div class="login">
    <div class="arte">${guilhoche({ animado: true, largura: 0.8 })}</div>
    <div class="caixa">
      <form id="form-login" novalidate>
        ${marca()}
        <h1>Painel administrativo</h1>
        <label class="campo">E-mail
          <input name="email" type="email" autocomplete="username">
        </label>
        <label class="campo">Senha
          <input name="senha" type="password" autocomplete="current-password">
          <span class="erro" data-erro="login"></span>
        </label>
        <button class="botao primario" type="submit">Entrar</button>
        <p class="troca-login">Não tem conta? <button type="button" class="link-login" data-acao="alternar-login" data-valor="criar">Criar conta</button></p>
      </form>
    </div>
  </div>`;
}

function renderizarCriarConta() {
  document.title = "Criar conta — Painel Banco Ipê";
  app.innerHTML = `
  <div class="login">
    <div class="arte">${guilhoche({ animado: true, largura: 0.8 })}</div>
    <div class="caixa">
      <form id="form-criar-conta" novalidate>
        ${marca()}
        <h1>Criar conta</h1>
        <label class="campo">Nome completo
          <input name="nome" autocomplete="name">
          <span class="erro" data-erro="nome"></span>
        </label>
        <label class="campo">E-mail
          <input name="email" type="email" autocomplete="username">
          <span class="erro" data-erro="email"></span>
        </label>
        <label class="campo">Senha
          <input name="senha" type="password" autocomplete="new-password">
          <span class="erro" data-erro="senha"></span>
        </label>
        <label class="campo">Confirmar senha
          <input name="confirmar" type="password" autocomplete="new-password">
          <span class="erro" data-erro="confirmar"></span>
        </label>
        <button class="botao primario" type="submit">Criar conta</button>
        <p class="troca-login">Já tem conta? <button type="button" class="link-login" data-acao="alternar-login" data-valor="entrar">Entrar</button></p>
      </form>
    </div>
  </div>`;
}

async function enviarCriarConta(f) {
  const nome = f.nome.value.trim(), email = f.email.value.trim().toLowerCase(), senha = f.senha.value, confirmar = f.confirmar.value;
  let ok = true;
  $$("[data-erro]", f).forEach(e => e.textContent = "");
  if (nome.length < 3) { $("[data-erro=nome]", f).textContent = "Digite o nome completo, com pelo menos 3 letras."; ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $("[data-erro=email]", f).textContent = "Digite um e-mail válido."; ok = false; }
  if (senha.length < 6) { $("[data-erro=senha]", f).textContent = "A senha precisa ter pelo menos 6 caracteres."; ok = false; }
  if (senha !== confirmar) { $("[data-erro=confirmar]", f).textContent = "As senhas não são iguais."; ok = false; }
  if (!ok) return;

  const resposta = await fetch("/cadastro", { method: "POST", body: new FormData(f) });
  if (!resposta.ok) { $("[data-erro=email]", f).textContent = "Não foi possível criar a conta."; return; }

  estado.telaLogin = "entrar";
  avisar("Conta criada. Faça login para entrar.");
  renderizarLogin();
}

async function enviarLogin(f) {
  const erro = $("[data-erro=login]", f);
  erro.textContent = "";
  if (!f.email.value.trim() || !f.senha.value.trim()) { erro.textContent = "Preencha e-mail e senha para entrar."; return; }

  const resposta = await fetch("/login", { method: "POST", body: new FormData(f) });
  if (!resposta.ok) { erro.textContent = "Não foi possível entrar. Tente de novo."; return; }

  const resultado = await resposta.json();
  if (!resultado.ok) { erro.textContent = "E-mail ou senha incorretos."; return; }

  // O servidor não diz o papel. Descobrimos se é admin tentando
  // carregar os dados protegidos: se o /api/painel responder, é admin.
  const ehAdmin = await carregarDados();
  if (!ehAdmin) { erro.textContent = "Esta conta não tem acesso de administrador."; return; }

  estado.logado = true;
  if (location.hash === "#/visao-geral") rotear(); else location.hash = "#/visao-geral";
}

async function carregarDados() {
  const resposta = await fetch("/api/painel");
  if (!resposta.ok) return false;   // 403 = sessão não é admin
  const dados = await resposta.json();
  TRANSACOES = dados.transacoes;
  CLIENTES = dados.clientes;
  return true;
}

/* ---------- admin ---------- */
const SECOES = {
  "visao-geral": ["Visão geral", "grade"],
  "transacoes":  ["Transações", "setas"],
  "clientes":    ["Clientes", "pessoas"]
};

function renderizarAdmin(secao) {
  if (!SECOES[secao]) secao = "visao-geral";
  estado.contexto = "admin";
  document.title = SECOES[secao][0] + " — Painel Banco Ipê";
  const nav = Object.entries(SECOES).map(([id, [nome, ic]]) =>
    `<a href="#/${id}"${id === secao ? ' aria-current="page"' : ""}>${ICONES[ic]}<span>${nome}</span></a>`).join("");
  const telas = { "visao-geral": telaVisaoGeral, "transacoes": telaTransacoes, "clientes": telaClientes };
  app.innerHTML = `
  <div class="admin">
    <aside class="lateral">
      ${marca()}
      <nav class="nav-admin" aria-label="Painel administrativo">${nav}</nav>
      <div class="lateral-rodape">
        <button class="botao-texto" data-acao="tema">${ICONES.tema}<span>Alternar tema</span></button>
        <button class="botao-texto" data-acao="sair">${ICONES.sair}<span>Sair</span></button>
      </div>
    </aside>
    <div class="coluna">
      <div class="barra-topo">
        ${marca()}
        <div class="acoes">
          <button data-acao="tema" aria-label="Alternar tema">${ICONES.tema}</button>
          <button data-acao="sair" aria-label="Sair do painel">${ICONES.sair}</button>
        </div>
      </div>
      <main class="principal">${telas[secao]()}</main>
    </div>
    <nav class="abas" aria-label="Painel administrativo (mobile)">${nav}</nav>
  </div>`;
  if (secao === "transacoes") pintarTransacoes();
  if (secao === "clientes") pintarClientes();
}

function cabPagina(titulo, extra = "") {
  const data = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  return `<div class="cab-pagina"><div><h1>${titulo}</h1><p>${data}</p></div>${extra}</div>`;
}

function telaVisaoGeral() {
  const rev = emRevisao();
  const novos = CLIENTES.filter(c => c.novo).length;
  const suspeitas = rev.filter(t => t.status === "Suspeita").length;
  const ultimas = TRANSACOES.slice(0, 6).map(t => `
    <tr>
      <td data-rotulo="Descrição">${escapar(t.nome)}<span class="sub-nome">${t.tipo} · ${t.quando}</span></td>
      <td class="dir" data-rotulo="Valor">${valorFmt(t.valor)}</td>
      <td data-rotulo="Situação">${pilula(t.status)}</td>
    </tr>`).join("");
  const legendaCarteira = CARTEIRA.map(([nome, p, cor]) =>
    `<li><i style="background:${cor}"></i><span>${nome}</span><span>R$ ${(p * 1.846).toFixed(1).replace(".", ",")} mi</span></li>`).join("");
  return `
  ${cabPagina("Visão geral")}
  <section class="faixa" aria-label="Indicadores do dia">
    <div>
      <p class="rotulo">Saldo sob custódia</p>
      <p class="valor">R$ 184,6 mi</p>
      <div class="rodape-kpi"><span class="delta-pos">+4,7% em 30 dias</span>${sparkline([168, 171, 170, 174, 176, 179, 181, 184.6])}</div>
    </div>
    <div>
      <p class="rotulo">Movimentado hoje</p>
      <p class="valor">R$ 12,4 mi</p>
      <div class="rodape-kpi"><span>1.842 operações</span>${sparkline([2, 5, 4, 7, 9, 8, 12.4])}</div>
    </div>
    <div>
      <p class="rotulo">Novos clientes no mês</p>
      <p class="valor">${numero.format(1284 + novos)}</p>
      <div class="rodape-kpi"><span class="delta-pos">+9,2% sobre agosto</span>${sparkline([610, 720, 800, 910, 1020, 1150, 1284 + novos])}</div>
    </div>
    <div class="${rev.length ? "alerta" : ""}">
      <p class="rotulo">Revisões em aberto</p>
      <p class="valor">${rev.length}</p>
      <div class="rodape-kpi"><span class="${suspeitas ? "delta-neg" : ""}">${suspeitas} ${suspeitas === 1 ? "suspeita" : "suspeitas"}</span>${sparkline([9, 12, 7, 10, 8, 11, rev.length])}</div>
    </div>
  </section>

  <div class="grade g1">
    <section class="painel" aria-labelledby="t-fluxo">
      <div class="topo-grafico">
        <div><h2 id="t-fluxo">Fluxo de caixa</h2><p class="sub">Entradas e saídas por mês, em R$ mil.</p></div>
        <div class="seletor" role="group" aria-label="Período">
          <button data-acao="periodo" data-valor="6" aria-pressed="${estado.periodo === 6}">6 meses</button>
          <button data-acao="periodo" data-valor="12" aria-pressed="${estado.periodo === 12}">12 meses</button>
        </div>
      </div>
      <p class="leitura" id="leitura-fluxo">${leituraFluxo(estado.periodo - 1)}</p>
      ${svgFluxo()}
      <div class="legenda"><span><i style="background:var(--cedula)"></i>Entradas</span><span><i style="background:var(--ipe)"></i>Saídas</span></div>
    </section>

    <section class="painel" aria-labelledby="t-fila">
      <h2 id="t-fila">Fila de revisão</h2>
      <p class="sub">Operações que esperam uma decisão da equipe.</p>
      ${filaRevisao(rev)}
    </section>
  </div>

  <div class="grade g2">
    <section class="painel" aria-labelledby="t-carteira">
      <h2 id="t-carteira">Carteira por produto</h2>
      <p class="sub">Distribuição do saldo sob custódia.</p>
      ${svgCarteira()}
      <ul class="lista-carteira">${legendaCarteira}</ul>
    </section>
    <section class="painel" aria-labelledby="t-ultimas">
      <h2 id="t-ultimas">Últimas movimentações</h2>
      <p class="sub">Seis operações mais recentes.</p>
      <div class="envolve-tabela"><table class="tabela"><thead><tr><th>Descrição</th><th class="dir">Valor</th><th>Situação</th></tr></thead><tbody>${ultimas}</tbody></table></div>
    </section>
  </div>`;
}

function filaRevisao(rev) {
  if (!rev.length) return `<p class="vazio">Nada para revisar. Novas pendências aparecem aqui.</p>`;
  return `<ul class="fila">${rev.slice(0, 4).map(t => `
    <li>
      <div class="linha1"><span class="quem">${escapar(t.nome)}</span><span>${valorFmt(t.valor)}</span></div>
      <p class="motivo">${t.tipo} · ${escapar(t.motivo || "")}</p>
      <div class="botoes">
        <button class="botao primario pequeno" data-acao="aprovar-transacao" data-id="${t.id}">Aprovar</button>
        <button class="botao perigo pequeno" data-acao="bloquear-transacao" data-id="${t.id}">Bloquear</button>
      </div>
    </li>`).join("")}</ul>${rev.length > 4 ? `<p class="motivo" style="margin-top:8px">+ ${rev.length - 4} na aba Transações.</p>` : ""}`;
}

/* transações */
function telaTransacoes() {
  const contagem = f => f === "todas" ? TRANSACOES.length : TRANSACOES.filter(t => t.status === f).length;
  const chips = [["todas", "Todas"], ["Pendente", "Pendentes"], ["Suspeita", "Suspeitas"], ["Concluída", "Concluídas"], ["Bloqueada", "Bloqueadas"]]
    .map(([v, r]) => `<button data-acao="filtro-transacao" data-valor="${v}" aria-pressed="${estado.filtroTransacao === v}">${r}<span class="cont">${contagem(v)}</span></button>`).join("");
  return `
  ${cabPagina("Transações")}
  <section class="painel">
    <div class="chips" role="group" aria-label="Filtrar por situação">${chips}</div>
    <div class="filtros"><label class="busca"><span class="sr">Buscar transação</span><input type="search" placeholder="Buscar por nome ou tipo" data-campo="buscaTransacao" value="${escapar(estado.buscaTransacao)}"></label></div>
    <div class="envolve-tabela"><table class="tabela">
      <thead><tr><th>Quando</th><th>Cliente</th><th>Tipo</th><th class="dir">Valor</th><th>Situação</th><th class="dir">Ação</th></tr></thead>
      <tbody id="corpo-transacoes"></tbody>
    </table></div>
  </section>`;
}
function pintarTransacoes() {
  const q = estado.buscaTransacao.trim().toLowerCase();
  const lista = TRANSACOES.filter(t =>
    (estado.filtroTransacao === "todas" || t.status === estado.filtroTransacao) &&
    (!q || (t.nome + " " + t.tipo).toLowerCase().includes(q)));
  const corpo = $("#corpo-transacoes");
  if (!corpo) return;
  corpo.innerHTML = lista.length ? lista.map(t => `
    <tr>
      <td data-rotulo="Quando">${t.quando}</td>
      <td data-rotulo="Cliente">${escapar(t.nome)}${t.motivo && (t.status === "Pendente" || t.status === "Suspeita") ? `<span class="sub-nome">${escapar(t.motivo)}</span>` : ""}</td>
      <td data-rotulo="Tipo">${t.tipo}</td>
      <td class="dir" data-rotulo="Valor">${valorFmt(t.valor)}</td>
      <td data-rotulo="Situação">${pilula(t.status)}</td>
      <td class="dir sem-rotulo">${t.status === "Pendente" || t.status === "Suspeita"
        ? `<div class="acoes-linha"><button class="botao primario pequeno" data-acao="aprovar-transacao" data-id="${t.id}">Aprovar</button><button class="botao perigo pequeno" data-acao="bloquear-transacao" data-id="${t.id}">Bloquear</button></div>`
        : ""}</td>
    </tr>`).join("") : `<tr><td class="vazio sem-rotulo" colspan="6">Nenhuma transação encontrada. Limpe a busca ou troque o filtro.</td></tr>`;
}

/* clientes */
function telaClientes() {
  return `
  ${cabPagina("Clientes", `<button class="botao primario" data-acao="abrir-cadastro" data-contexto="admin">Novo cliente</button>`)}
  <section class="painel">
    <div class="filtros">
      <label class="busca"><span class="sr">Buscar cliente</span><input type="search" placeholder="Buscar por nome ou cidade" data-campo="buscaCliente" value="${escapar(estado.buscaCliente)}"></label>
      <label><span class="sr">Situação</span><select data-campo="statusCliente">
        ${[["todos", "Todas as situações"], ["Ativo", "Ativos"], ["Em análise", "Em análise"], ["Bloqueado", "Bloqueados"]].map(([v, r]) => `<option value="${v}"${estado.statusCliente === v ? " selected" : ""}>${r}</option>`).join("")}
      </select></label>
      <label><span class="sr">Ordenar por</span><select data-campo="ordemCliente">
        ${[["saldo", "Maior saldo"], ["nome", "Nome (A–Z)"], ["recentes", "Mais recentes"]].map(([v, r]) => `<option value="${v}"${estado.ordemCliente === v ? " selected" : ""}>${r}</option>`).join("")}
      </select></label>
    </div>
    <div class="envolve-tabela"><table class="tabela">
      <thead><tr><th>Cliente</th><th>Conta</th><th class="dir">Saldo</th><th>Situação</th><th>Desde</th><th class="dir">Ação</th></tr></thead>
      <tbody id="corpo-clientes"></tbody>
    </table></div>
  </section>`;
}
function pintarClientes() {
  const q = estado.buscaCliente.trim().toLowerCase();
  let lista = CLIENTES.filter(c =>
    (estado.statusCliente === "todos" || c.status === estado.statusCliente) &&
    (!q || (c.nome + " " + c.cidade).toLowerCase().includes(q)));
  const ordens = {
    saldo: (a, b) => b.saldo - a.saldo,
    nome: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
    recentes: (a, b) => b.id - a.id
  };
  lista.sort(ordens[estado.ordemCliente]);
  const corpo = $("#corpo-clientes");
  if (!corpo) return;
  const acaoDe = c => c.status === "Ativo" ? ["Bloquear", "perigo"] : c.status === "Bloqueado" ? ["Desbloquear", "secundario"] : ["Aprovar", "primario"];
  corpo.innerHTML = lista.length ? lista.map(c => {
    const [txt, cls] = acaoDe(c);
    return `<tr>
      <td data-rotulo="Cliente">${escapar(c.nome)}<span class="sub-nome">${escapar(c.cidade)}</span></td>
      <td data-rotulo="Conta" class="num">${contaDe(c)}</td>
      <td class="dir" data-rotulo="Saldo"><span class="num">${moeda.format(c.saldo)}</span></td>
      <td data-rotulo="Situação">${pilula(c.status)}</td>
      <td data-rotulo="Cliente desde" class="num">${c.desde}</td>
      <td class="dir sem-rotulo"><div class="acoes-linha"><button class="botao ${cls} pequeno" data-acao="alternar-cliente" data-id="${c.id}">${txt}</button></div></td>
    </tr>`;
  }).join("") : `<tr><td class="vazio sem-rotulo" colspan="6">Nenhum cliente encontrado. Limpe a busca ou troque a situação.</td></tr>`;
}


/* ---------- aviso e diálogo ---------- */
function abrirCadastro(contexto) {
  const d = $("#dialogo"), admin = contexto === "admin";
  $("#dialogo-titulo").textContent = admin ? "Novo cliente" : "Abrir conta";
  $("#dialogo-texto").textContent = admin ? "O cadastro entra como “Em análise” até você aprovar." : "Leva menos de um minuto. Sua conta passa por uma análise rápida.";
  $("#dialogo-enviar").textContent = admin ? "Cadastrar cliente" : "Abrir conta";
  $("#form-cadastro").reset();
  $$("[data-erro]", d).forEach(e => e.textContent = "");
  d.showModal();
  $("input[name=nome]", d).focus();
}
function enviarCadastro() {
  const f = $("#form-cadastro"), admin = estado.contexto === "admin";
  const nome = f.nome.value.trim(), cidade = f.cidade.value.trim(), bruto = f.deposito.value.trim();
  let ok = true, saldo = 0;
  $$("[data-erro]", f).forEach(e => e.textContent = "");
  if (nome.length < 3) { $("[data-erro=nome]", f).textContent = "Digite o nome completo, com pelo menos 3 letras."; ok = false; }
  if (bruto) {
    saldo = parseFloat(bruto.replace(/\./g, "").replace(",", "."));
    if (isNaN(saldo) || saldo < 0) { $("[data-erro=deposito]", f).textContent = "Digite um valor como 1.500,00."; ok = false; }
  }
  if (!ok) return;
  CLIENTES.unshift({ id: Math.max(...CLIENTES.map(c => c.id)) + 1, nome, cidade: cidade || "Não informada", saldo, status: "Em análise", desde: new Date().getFullYear(), novo: true });
  $("#dialogo").close();
  avisar(admin ? "Cliente cadastrado." : "Pedido enviado. Ele já aparece no painel para análise.");
  if (admin) rotear({ manterRolagem: true });
}


/* ---------- tema ---------- */
function alternarTema() {
  const raiz = document.documentElement;
  const escuro = raiz.dataset.theme ? raiz.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  raiz.dataset.theme = escuro ? "light" : "dark";
  try { localStorage.setItem("ipe-tema", raiz.dataset.theme); } catch (e) { /* armazenamento indisponível */ }
}
try {
  const salvo = localStorage.getItem("ipe-tema");
  if (salvo === "light" || salvo === "dark") document.documentElement.dataset.theme = salvo;
} catch (e) { /* segue com o tema do sistema */ }


/* ---------- eventos ---------- */
function ativarMes(g) {
  const svg = g.closest("svg");
  $$(".grupo-mes", svg).forEach(x => x.classList.toggle("ativo", x === g));
  $("#leitura-fluxo").innerHTML = leituraFluxo(+g.dataset.i);
}
document.addEventListener("mouseover", e => { const g = e.target.closest(".grupo-mes"); if (g) ativarMes(g); });
document.addEventListener("focusin", e => { const g = e.target.closest && e.target.closest(".grupo-mes"); if (g) ativarMes(g); });

document.addEventListener("click", e => {
  const g = e.target.closest(".grupo-mes");
  if (g) ativarMes(g);
  const alvo = e.target.closest("[data-acao]");
  if (!alvo) return;
  const { acao, id, valor, contexto } = alvo.dataset;
  switch (acao) {
    case "abrir-cadastro": estado.contexto = contexto; abrirCadastro(contexto); break;
    case "fechar-dialogo": $("#dialogo").close(); break;
    case "tema": alternarTema(); break;
    case "alternar-login": estado.telaLogin = valor; renderizarLogin(); break;
    case "sair": fetch("/logout", { method: "POST" }).finally(() => { estado.logado = false; location.hash = "#/"; rotear(); }); break;
    case "periodo": estado.periodo = +valor; rotear({ manterRolagem: true }); break;
    case "filtro-transacao": estado.filtroTransacao = valor; rotear({ manterRolagem: true }); break;
    case "aprovar-transacao": {
      const t = TRANSACOES.find(x => x.id === +id);
      if (t) { t.status = "Concluída"; avisar("Transação aprovada."); rotear({ manterRolagem: true }); }
      break;
    }
    case "bloquear-transacao": {
      const t = TRANSACOES.find(x => x.id === +id);
      if (t) { t.status = "Bloqueada"; avisar("Transação bloqueada."); rotear({ manterRolagem: true }); }
      break;
    }
    case "alternar-cliente": {
      const c = CLIENTES.find(x => x.id === +id);
      if (!c) break;
      if (c.status === "Ativo") { c.status = "Bloqueado"; avisar("Cliente bloqueado."); }
      else if (c.status === "Bloqueado") { c.status = "Ativo"; avisar("Cliente desbloqueado."); }
      else { c.status = "Ativo"; avisar("Cliente aprovado."); }
      pintarClientes();
      break;
    }
  }
});

document.addEventListener("input", e => {
  const campo = e.target.dataset && e.target.dataset.campo;
  if (campo) {
    estado[campo] = e.target.value;
    if (campo === "buscaTransacao") pintarTransacoes(); else pintarClientes();
  }
});

document.addEventListener("submit", e => {
  if (e.target.id === "form-cadastro") { e.preventDefault(); enviarCadastro(); }
  if (e.target.id === "form-criar-conta") { e.preventDefault(); enviarCriarConta(e.target); }
  if (e.target.id === "form-login") { e.preventDefault(); enviarLogin(e.target); }
});


/* ---------- rotas ---------- */
function rotear({ manterRolagem = false } = {}) {
  const y = window.scrollY;
  const partes = (location.hash.replace(/^#\/?/, "") || "").split("/");
  if (!estado.logado) renderizarLogin(); else renderizarAdmin(partes[0]);
  window.scrollTo(0, manterRolagem ? y : 0);
}
async function iniciar() {
  try {
    const sessao = await (await fetch("/sessao")).json();
    // só é admin quem consegue carregar os dados protegidos
    if (sessao.logado) estado.logado = await carregarDados();
  } catch (e) { /* servidor fora do ar; segue deslogado */ }
  rotear();
}
window.addEventListener("hashchange", () => rotear());
iniciar();
