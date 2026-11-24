"use strict";

// Source of truth for the guide, selector, FAQ and checkout destinations.
window.FLEXTECH_PRODUCT = Object.freeze({
  name: "Joelheira Flextech 3D com Fios de Cobre (1 Unidade)",
  price: 147.90,
  currency: "BRL",
  installments: Object.freeze({ count: 12, amount: 15.24, total: 182.88 }),
  quantity: null,
  sizingWarning:
    "Dica de escolha: A malha 3D tem alta elasticidade e se adapta ao joelho. Na dúvida entre dois tamanhos, escolha o maior para mais conforto.",
  sizes: Object.freeze([
    Object.freeze({ id: "P", range: "Até 55 kg", checkout: "https://pay.kaiross.com.br/COhsyLdnViMS" }),
    Object.freeze({ id: "M", range: "56 a 70 kg", checkout: "https://pay.kaiross.com.br/zpYnhqzxnGom" }),
    Object.freeze({ id: "G", range: "71 a 85 kg", checkout: "https://pay.kaiross.com.br/RzWVLV2mYqFU" }),
    Object.freeze({ id: "XG", range: "Acima de 85 kg", checkout: "https://pay.kaiross.com.br/7pQyavwDFKn9" })
  ])
});
