"use strict";

// Source of truth for the guide, selector, FAQ and checkout destinations.
// The supplier must resolve the missing interval and shared boundaries before deploy.
// Do not infer centimetres, recommend a size by weight or change these URLs.
window.FLEXTECH_PRODUCT = Object.freeze({
  name: "Joelheira Ortopédica de Fibra de Cobre Flextech",
  price: 147.90,
  currency: "BRL",
  installments: Object.freeze({ count: 12, amount: 15.24, total: 182.88 }),
  quantity: null,
  sizingWarning:
    "A tabela não define um tamanho para pesos maiores que 85 até 100 kg e repete os limites de 55 e 70 kg. Se esse é o seu caso, o tamanho precisa ser confirmado antes da compra.",
  sizes: Object.freeze([
    Object.freeze({ id: "P", range: "Até 55 kg", checkout: "https://pay.kaiross.com.br/COhsyLdnViMS" }),
    Object.freeze({ id: "M", range: "De 55 a 70 kg", checkout: "https://pay.kaiross.com.br/zpYnhqzxnGom" }),
    Object.freeze({ id: "G", range: "De 70 a 85 kg", checkout: "https://pay.kaiross.com.br/RzWVLV2mYqFU" }),
    Object.freeze({ id: "XG", range: "Acima de 100 kg", checkout: "https://pay.kaiross.com.br/7pQyavwDFKn9" })
  ])
});
