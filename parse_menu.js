const fs = require('fs');

const rawText = `
Breakfast
Traditional Breakfast
Description: Traditional breakfast served with paratha, eggs, and lemon butter chicken.
Price: 390


American Breakfast
Description: Classic American breakfast with eggs, sausages, baked beans, mushrooms, toast, and peanut butter.
Price: 370
Brunch Delight
Description: Brunch platter with bread, eggs, baked beans, sausages, chicken, butter, and jelly.
Price: 430
Sandwich
Chicken Sandwich
Description: Smoky, tender chicken in a fresh sandwich
Price: 385
Mushroom Sandwich
Description: Savory chicken and mushrooms, perfectly seasoned and generously filled
Price: 490
Classic Club Sandwich
Description: A classic favorite crafted for a satisfying crunch in every bite
Price: 580
Appetizers
French Fries
Description: Simple and Classic
Price: 210
Japanese Fried Chicken
Description: Crispy bite-sized chicken juicy inside, golden and crunchy outside
Price: 365
Chicken Nanban
Description: Crispy Chicken coated in creamy, sweet spicy sauce bold flavour, perfect crunch, unforgettable taste
Price: 345
Chicken Gyoza
Description: Delicate chickens are lightly coated in a crisp, airy tempura batter and fried to golden perfection.
Price: 340
Steamed Wonton
Description: Delicate steamed wontons, tender and flavorful with a light, savory filling.
Price: 290
Fried Sesame Dory
Description: Crispy fried dory, coated in aromatic sesame for a rich, nutty finish.
Price: 520
Fish and Chips
Description: Crispy fried dory fillets coated with toasted sesame seeds, served hot with tangy sauce.
Price: 570
High Tea (1:4)
Description: (Wonton, Chicken Wings, Chicken Satay, Fish Fingers, Fries) x 4
Price: 745
Soup
Thai Clear Soup
Description: A light and aromatic Thai clear soup with tender chicken, fresh herbs, and a hint of citrus.
Price: 260
Thai Thick Soup
Description: Classic Thai thick soup with prawns & chicken, fresh ginger, lime juice, chilli paste
Price: 310
Cream of Mushroom Soup
Description: Herbed roasted mushroom with garlic bread, onion, celery, bread, cream and parsley.
Price: 380
Pasta
Creamy Fettuccine Alfredo Pasta
Description: A generous mix of tender meats, grilled to perfection
Price: 490
Beef Bolognese Pasta
Description: Classic beef Bolognese pasta, slow cooked in a rich, hearty tomato sauce.
Price: 580
Pasta De La Casa
Description: Juicy prawns and chickens sautéed in garlic tossed with Alfredo, chili, and herbs.
Price: 895
Noodles
Stir Fried Chicken Noodles
Description: A delicious noodle of chicken, onion and sauce, spicy herbs.
Price: 380
Stir Fried Beef Noodles
Description: Soft spicy beef noodles and adding herbs and spices.
Price: 460
Salad
Cashew Nut Salad
Description: Crisp chickens, veggies and roasted cashewnuts tossed in a light, tangy.
Price: 465
Spanish Grilled Chicken Salad
Description: Grilled chicken salad and seasonal vegetable topped with balsamic dressing.
Price: 380
Pizza
BBQ Chicken Pizza
Description: Tender grilled chicken and cheddar cheese and blended melted mozzarella cheese and a drizzle of extra BBQ sauce
Price: 9" - 595 / 12" - 980
Beef Bolognese Pizza
Description: Ground beef finished and a drizzle of extra virgin olive oil, cheesy, and aromatic goodness in every bite.
Price: 9" - 845 / 12" - 1330
CC Special Four Seasons
Description: House Special Pizza topped with beef, chicken, squids and Dory with overloaded cheese
Price: 12" - 1495
Main Course
Chicken Schnitzel
Description: Lightly breaded chicken breast fried to perfection juicy, crisp, and flavorful served with rice
Price: 395
Turkish Savory
Description: Fluffy rice served with tender chicken cooked in special spices, paired with fresh sautéed vegetables.
Price: 460
Basil Leaf Beef (Spicy)
Description: Flavorful basil chicken or beef cooked in our special sauce spicy, aromatic, and satisfying served with rice
Price: 450
Herbed Dory with Salsa
Description: Grilled dory topped with spicy salsa and rice.
Price:580
King Prawn
Description: Juicy king prawns served with rice and sautéed vegetables
Price: 690
Peri Peri Chicken
Description: Tender peri peri chicken paired with fragrant rice and seasonal sautéed vegetables.
Price: 410
Crown Coffee Special Rice (Spicy)
Description: Mixed rice of chicken, beef, prawn and calamari
Price: 760
Health Plus
Price: 390
Desert
Chawanmushi
Description: Silky Japanese steamed egg custard, delicately savory and smooth.
Price: 195
Crêpe 
Description: Soft, thin crepe, light and delicately filled or topped as desired.
Price: 260
Sweet Madness
Description: A decadent dessert with two scoops of ice cream, Swiss cake, and fresh fruits.
Price: 340
Chocolate Lava
Description: A decadent dessert with two scoops of ice cream, Swiss cake, and fresh fruits.
Price: 220
`;

let currentCategory = '';
let currentItem = null;
const items = [];
const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const categoryNames = [
  'Breakfast', 'Sandwich', 'Appetizers', 'Soup', 'Pasta', 'Noodles', 'Salad', 'Pizza', 'Main Course', 'Health Plus', 'Desert'
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (categoryNames.includes(line)) {
    currentCategory = line === 'Health Plus' ? 'Main Course' : line; 
    
    // Health plus is just an item but the user's text formatted it like a category name, 
    // Wait, the user text says "Health Plus \n Price: 390". Let's treat it as an item.
    if (line === 'Health Plus') {
        currentItem = { name: line, description: '', price: 0, category: 'Main Course', id: 'health_plus' };
    } else {
        currentItem = null;
    }
  } else if (line.startsWith('Description:')) {
    if (currentItem) currentItem.description = line.replace('Description:', '').trim();
  } else if (line.startsWith('Price:')) {
    if (currentItem) {
      const priceStr = line.replace('Price:', '').trim();
      if (/^\d+$/.test(priceStr)) {
        currentItem.price = parseInt(priceStr, 10);
      } else {
        currentItem.price = priceStr;
      }
      items.push(currentItem);
      currentItem = null;
    }
  } else {
    // It's a name
    if (!categoryNames.includes(line)) {
      currentItem = { name: line, description: '', price: 0, category: currentCategory, id: line.toLowerCase().replace(/[^a-z0-9]/g, '_') };
    }
  }
}

const existingMenu = JSON.parse(fs.readFileSync('data/menu.json', 'utf8'));

// Combine categories, keep existing ones at the end (drinks)
const allCategories = new Set([...categoryNames.filter(c => c !== 'Health Plus'), ...existingMenu.categories]);

// Overwrite the existing file
const newMenu = {
  categories: Array.from(allCategories),
  items: [...items, ...existingMenu.items] // new food first, then drinks
};

// Reorder so that items match the category order visually
newMenu.items.forEach((item, idx) => item.order = idx);

fs.writeFileSync('data/menu.json', JSON.stringify(newMenu, null, 2));
console.log('Successfully updated data/menu.json');
