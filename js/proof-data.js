"use strict";

/*
 * No review, rating or creator is published until genuine, authorised material exists.
 * Populate only after approval against the original evidence, without exposing orders
 * or private documents. Reference fields are opaque evidence IDs, never personal data.
 *
 * Each record requires:
 * id, type ("review" | "creator"), approved: true, published: true,
 * author, text, sourceRef, permissionReference, context ("fit" | "use" | "delivery").
 * Optional fields: size (an exact product size ID), use, rating (original number 1–5),
 * buyerVerified, orderVerified, orderReference.
 * The verified badge requires all three buyer/order verification fields.
 * Creators additionally require a truthful disclosure; they never enter the rating.
 *
 * media is an optional array with type ("image" | "video"), src and descriptive alt.
 * Only local assets/ paths are accepted. Videos also require a local poster and can
 * carry a local captionsSrc (.vtt); their alt text serves as a visible description.
 * Never synthesize a quote, note, order, rating, permission or creator relationship.
 */
window.FLEXTECH_PROOF = Object.freeze([]);
