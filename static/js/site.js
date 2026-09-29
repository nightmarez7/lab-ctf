"use strict";
/* Site público (/) */

/* ---------- site público ---------- */
function renderizarSite() {
  document.title = "Banco Ipê — conta digital com extrato que você entende";
  app.innerHTML = `
  <header class="cabecalho"><div class="container">
    ${marca()}
    <nav class="nav-site" aria-label="Seções do site">
      <a href="#/" data-acao="rolar" data-alvo="tarifas">Tarifas</a>
      <a href="#/" data-acao="rolar" data-alvo="simulador">Simulador</a>
      <a href="#/" data-acao="rolar" data-alvo="seguranca">Segurança</a>
    </nav>
    <div class="cabecalho-acoes">
      <button class="botao primario" data-acao="abrir-cadastro" data-contexto="site">Abrir conta</button>
    </div>
  </div></header>

  <main>
    <section class="heroi"><div class="container">
      <div>
        <h1>Um banco que mostra para onde o dinheiro foi.</h1>
        <p class="texto">Conta, cartão e crédito com extrato em português claro e tarifa escrita antes da assinatura.</p>
        <div class="acoes">
          <button class="botao primario" data-acao="abrir-cadastro" data-contexto="site">Abrir conta</button>
          <a class="botao secundario" href="#/" data-acao="rolar" data-alvo="simulador">Simular empréstimo</a>
        </div>
      </div>
      <div class="vitrine">
        ${guilhoche({ animado: true, largura: 0.7 })}
        <div class="extrato-mini" aria-hidden="true">
          <p>Extrato de hoje</p>
          <ul>
            <li><span>Salário · Agro Campina</span><b class="num pos">+ R$ 6.800,00</b></li>
            <li><span>Mercado Bom Preço</span><b class="num">− R$ 214,36</b></li>
            <li><span>Pix para Marina</span><b class="num">− R$ 150,00</b></li>
            <li><span>Saldo</span><b class="num">R$ 8.906,72</b></li>
          </ul>
        </div>
      </div>
    </div></section>

    <section class="secao" id="tarifas"><div class="container tarifas">
      <div class="esq">
        <h2>Tarifa escrita antes da assinatura.</h2>
        <p class="apoio">Valores fictícios de demonstração.</p>
      </div>
      <div>
        <div class="tarifa"><h3>Conta Ipê</h3><span class="fio"></span><span class="preco">R$ 0,00 por mês</span><p class="detalhe">Pix, TED e boletos sem mensalidade.</p></div>
        <div class="tarifa"><h3>Cartão Ipê</h3><span class="fio"></span><span class="preco">R$ 0,00 no 1º ano</span><p class="detalhe">Limite ajustável pelo aplicativo, sem ligar para ninguém.</p></div>
        <div class="tarifa"><h3>Crédito pessoal</h3><span class="fio"></span><span class="preco">a partir de 1,89% ao mês</span><p class="detalhe">Parcelas fixas e sem seguro embutido.</p></div>
        <div class="tarifa"><h3>CDB Ipê</h3><span class="fio"></span><span class="preco">102% do CDI</span><p class="detalhe">Liquidez diária. Aplique a partir de R$ 50,00.</p></div>
        <div class="tarifa"><h3>Saque em caixa 24 h</h3><span class="fio"></span><span class="preco">R$ 6,90 após o 4º</span><p class="detalhe">Quatro saques por mês sem custo.</p></div>
      </div>
    </div></section>

    <section class="secao" id="simulador"><div class="container simulador">
      <div>
        <h2>Simule antes de decidir.</h2>
        <p class="apoio">Mova os controles. A parcela muda na hora e o total a pagar fica à vista.</p>
      </div>
      <div class="recibo">
        <label for="sim-valor"><span class="linha-controle"><span>Quanto você precisa</span><output id="saida-valor" for="sim-valor"></output></span></label>
        <input type="range" id="sim-valor" min="1000" max="50000" step="500" value="12000">
        <label for="sim-prazo" style="margin-top:22px"><span class="linha-controle"><span>Em quantos meses</span><output id="saida-prazo" for="sim-prazo"></output></span></label>
        <input type="range" id="sim-prazo" min="6" max="48" step="6" value="24">
        <dl aria-live="polite">
          <div class="destaque"><dt>Parcela mensal</dt><dd id="res-parcela"></dd></div>
          <div><dt>Total a pagar</dt><dd id="res-total"></dd></div>
          <div><dt>Juros no período</dt><dd id="res-juros"></dd></div>
          <div><dt>Taxa</dt><dd>1,89% ao mês</dd></div>
        </dl>
        <p class="nota">Simulação ilustrativa. Não representa oferta de crédito real.</p>
      </div>
    </div></section>

    <section class="secao" id="seguranca"><div class="container">
      <h2>Seu dinheiro passa por mais de um par de olhos.</h2>
      <div class="seguranca-grade">
        <div><h3>Aviso na hora</h3><p>Toda compra e todo Pix geram uma notificação no celular assim que acontecem.</p></div>
        <div><h3>Cartão liga e desliga</h3><p>Pause o cartão pelo aplicativo e volte a usar quando quiser.</p></div>
        <div><h3>Revisão humana</h3><p>Operações fora do seu padrão são analisadas por uma pessoa da equipe antes de serem concluídas.</p></div>
      </div>
    </div></section>
  </main>

  <footer class="rodape"><div class="container">
    <p>Banco Ipê é um projeto de demonstração. Nomes, taxas e valores são fictícios e não representam uma instituição financeira real.</p>
  </div></footer>`;
  simular();
}

function simular() {
  const v = $("#sim-valor"), p = $("#sim-prazo");
  if (!v || !p) return;
  const valor = +v.value, prazo = +p.value, i = 0.0189;
  const parcela = valor * i / (1 - Math.pow(1 + i, -prazo));
  const total = parcela * prazo;
  $("#saida-valor").textContent = moeda.format(valor);
  $("#saida-prazo").textContent = prazo + " meses";
  $("#res-parcela").textContent = moeda.format(parcela);
  $("#res-total").textContent = moeda.format(total);
  $("#res-juros").textContent = moeda.format(total - valor);
}


/* ---------- cadastro ---------- */
function abrirCadastro() {
  const d = $("#dialogo");
  $("#dialogo-titulo").textContent = "Abrir conta";
  $("#dialogo-texto").textContent = "Leva menos de um minuto. Sua conta passa por uma análise rápida.";
  $("#dialogo-enviar").textContent = "Abrir conta";
  $("#form-cadastro").reset();
  $$("[data-erro]", d).forEach(e => e.textContent = "");
  d.showModal();
  $("input[name=nome]", d).focus();
}
function enviarCadastro() {
  const f = $("#form-cadastro");
  const nome = f.nome.value.trim(), bruto = f.deposito.value.trim();
  let ok = true;
  $$("[data-erro]", f).forEach(e => e.textContent = "");
  if (nome.length < 3) { $("[data-erro=nome]", f).textContent = "Digite o nome completo, com pelo menos 3 letras."; ok = false; }
  if (bruto) {
    const valor = parseFloat(bruto.replace(/\./g, "").replace(",", "."));
    if (isNaN(valor) || valor < 0) { $("[data-erro=deposito]", f).textContent = "Digite um valor como 1.500,00."; ok = false; }
  }
  if (!ok) return;
  $("#dialogo").close();
  avisar("Pedido enviado. Sua conta passa por uma análise rápida.");
}

/* ---------- eventos ---------- */
document.addEventListener("click", e => {
  const alvo = e.target.closest("[data-acao]");
  if (!alvo) return;
  switch (alvo.dataset.acao) {
    case "rolar": {
      e.preventDefault();
      const el = document.getElementById(alvo.dataset.alvo);
      if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      break;
    }
    case "abrir-cadastro": abrirCadastro(); break;
    case "fechar-dialogo": $("#dialogo").close(); break;
  }
});
document.addEventListener("input", e => {
  if (e.target.id === "sim-valor" || e.target.id === "sim-prazo") simular();
});
document.addEventListener("submit", e => {
  if (e.target.id === "form-cadastro") { e.preventDefault(); enviarCadastro(); }
});

renderizarSite();
