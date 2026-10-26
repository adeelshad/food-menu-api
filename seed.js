// Adds 10 sample dishes to the running Food Menu API.
// Usage: start the server (npm start), then in a second terminal run:  node seed.js
const BASE = process.env.BASE_URL || 'http://localhost:3001/api/food-items';

const dishes = [
  { name: 'Chicken Karahi', category: 'Main Course', price: 1450.5, preparationTime: 35, isAvailable: true },
  { name: 'Mango Lassi', category: 'Beverage', price: 250, preparationTime: 10, isAvailable: true },
  { name: 'Chicken Biryani', category: 'Main Course', price: 450, preparationTime: 30, isAvailable: true },
  { name: 'Seekh Kebab', category: 'Starter', price: 380, preparationTime: 20, isAvailable: true },
  { name: 'Samosa Chaat', category: 'Starter', price: 220, preparationTime: 10, isAvailable: true },
  { name: 'Gulab Jamun', category: 'Dessert', price: 180, preparationTime: 5, isAvailable: true },
  { name: 'Kheer', category: 'Dessert', price: 200, preparationTime: 5, isAvailable: true },
  { name: 'Zinger Burger', category: 'Fast Food', price: 520, preparationTime: 15, isAvailable: true },
  { name: 'Chicken Shawarma', category: 'Fast Food', price: 350, preparationTime: 12, isAvailable: true },
  { name: 'Fresh Lime Soda', category: 'Beverage', price: 150, preparationTime: 5, isAvailable: true },
];

async function main() {
  for (const dish of dishes) {
    try {
      const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dish),
      });
      const body = await res.json();
      if (res.status === 201) console.log(`Added:   ${body.name} (id ${body.id})`);
      else if (res.status === 409) console.log(`Skipped: ${dish.name} already exists`);
      else console.log(`Failed:  ${dish.name} -> ${res.status} ${JSON.stringify(body)}`);
    } catch (e) {
      console.log('Could not reach the server. Is it running? (npm start)');
      process.exit(1);
    }
  }
  console.log('Done. Open http://localhost:3001/api/food-items to see all dishes.');
}
main();
