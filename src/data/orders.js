// Mock order data — shape mirrors the future Orders/OrderItems tables.

const orders = [
  {
    id: 1001,
    date: "2026-09-20",
    status: "Processing",
    paymentMethod: "M-Pesa",
    deliveryAddress: { county: "Nairobi", town: "Westlands", address: "12 Waiyaki Way" },
    items: [
      { productId: 2, name: "Samsung Galaxy A15", quantity: 1, price: 18999 },
      { productId: 14, name: "Aviator Sunglasses", quantity: 1, price: 1500 },
    ],
  },
  {
    id: 1000,
    date: "2026-09-12",
    status: "Delivered",
    paymentMethod: "Cash on Delivery",
    deliveryAddress: { county: "Kiambu", town: "Ruiru", address: "Kamakis Rd" },
    items: [{ productId: 1, name: "Nike Air Max 90", quantity: 1, price: 8500 }],
  },
  {
    id: 999,
    date: "2026-08-30",
    status: "Shipped",
    paymentMethod: "Card",
    deliveryAddress: { county: "Nairobi", town: "CBD", address: "Moi Avenue" },
    items: [
      { productId: 10, name: "Wireless Mouse & Keyboard Combo", quantity: 2, price: 2100 },
      { productId: 11, name: "Smart LED Bulb (4-Pack)", quantity: 1, price: 3400 },
    ],
  },
];

export const STATUS_STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

export function getOrderTotal(order) {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return subtotal + 300; // flat delivery fee, matches Cart
}

export default orders;
