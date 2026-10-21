export const DELIVERY_FEE = 300; // keep in sync with place_order() in the database

export const STATUS_STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

export const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  mpesa: "M-Pesa",
  card: "Card",
};

export function formatKsh(amount) {
  return `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Accepts 07xx / 01xx / +2547xx / 2547xx (spaces and dashes allowed)
export function isValidKenyanPhone(value) {
  const cleaned = String(value).replace(/[\s-]/g, "");
  return /^(?:\+254|254|0)[17]\d{8}$/.test(cleaned);
}
