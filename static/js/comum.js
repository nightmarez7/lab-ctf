"use strict";
/* Código compartilhado pelo site e pelo painel */

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR");
const escapar = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const app = $("#app");


/* ---------- guilhochê (padrão de segurança das cédulas) ---------- */
const cacheCaminhos = new Map();
function mdc(a, b) { return b ? mdc(b, a % b) : a; }
function caminhoHipotrocoide(R, r, d, passo = 0.05) {
  const chave = [R, r, d].join("-");
  if (cacheCaminhos.has(chave)) return cacheCaminhos.get(chave);
  const k = (R - r) / r;
  const fim = Math.PI * 2 * (r / mdc(R, r));
  let p = "";
  for (let t = 0; t <= fim + passo; t += passo) {
    const x = (R - r) * Math.cos(t) + d * Math.cos(k * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(k * t);
    p += (p ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  p += "Z";
  cacheCaminhos.set(chave, p);
  return p;
}
const CAMADAS = [
  [96, 40, 24, "var(--cedula)", 0.55],
  [96, 40, 38, "var(--cedula)", 0.55],
  [96, 28, 22, "var(--cedula)", 0.45],
  [96, 60, 30, "var(--ipe)", 0.95],
  [96, 60, 44, "var(--ipe)", 0.75]
];
function guilhoche({ animado = false, largura = 0.7, camadas = 5 } = {}) {
  const caminhos = CAMADAS.slice(0, camadas).map(([R, r, d, cor, op], i) =>
    `<path pathLength="1" style="--i:${i};stroke:${cor};opacity:${op}" d="${caminhoHipotrocoide(R, r, d)}"/>`
  ).join("");
  return `<svg class="guilhoche${animado ? " animado" : ""}" style="--largura:${largura}" viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">${caminhos}</svg>`;
}
const marca = (href = "./") => `<a class="marca" href="${href}" aria-label="Banco Ipê, página inicial">${guilhoche({ largura: 5, camadas: 5 })}<span>Banco Ipê</span></a>`;


/* ---------- aviso ---------- */
let tempoAviso;
function avisar(msg) {
  const el = $("#aviso");
  el.textContent = msg;
  el.classList.add("visivel");
  clearTimeout(tempoAviso);
  tempoAviso = setTimeout(() => el.classList.remove("visivel"), 3400);
}
