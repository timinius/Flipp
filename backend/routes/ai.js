const express = require('express');
const { getDB } = require('../db/init');

const router = express.Router();

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' ₽';
}

// Маппинг намерений/целей → что искать
const INTENTS = [
  // Музыка и пение
  { triggers: ['петь', 'пение', 'вокал', 'певец', 'певица', 'научиться петь', 'заниматься вокалом', 'музыкант', 'играть на гитаре', 'играть на пианино', 'музыка'],
    searchTerms: ['микрофон', 'гитара', 'наушники', 'колонка', 'пианино', 'синтезатор'],
    categories: ['electronics'],
    label: 'для занятий музыкой и пением' },

  // Ремонт
  { triggers: ['ремонт', 'ремонтировать', 'сделать ремонт', 'обустроить', 'отделка', 'покрасить стены', 'поклеить обои', 'перфоратор', 'шуруповерт'],
    searchTerms: ['инструмент', 'перфоратор', 'шуруповерт', 'краска', 'обои', 'плитка', 'уровень', 'лестница'],
    categories: ['business', 'home'],
    label: 'для ремонта и строительства' },

  // Спорт и похудение
  { triggers: ['похудеть', 'сбросить вес', 'заняться спортом', 'фитнес', 'тренировки', 'качалка', 'тренажерный зал', 'бегать', 'качать мышцы', 'накачаться'],
    searchTerms: ['гантели', 'коврик', 'штанга', 'велотренажер', 'скакалка', 'кроссовки'],
    categories: ['sport', 'clothing'],
    label: 'для занятий спортом и фитнесом' },

  // Фотография
  { triggers: ['фотографировать', 'фотография', 'фото', 'снимать', 'стать фотографом', 'научиться фотографировать', 'видеосъемка', 'блогер'],
    searchTerms: ['фотоаппарат', 'камера', 'объектив', 'штатив', 'фото', 'sony', 'canon'],
    categories: ['electronics'],
    label: 'для фотографии и видеосъёмки' },

  // Готовить / кулинария
  { triggers: ['готовить', 'кулинария', 'научиться готовить', 'готовка', 'выпечка', 'печь торты', 'шеф', 'кухня'],
    searchTerms: ['кофемашина', 'блендер', 'мультиварка', 'миксер', 'кастрюля', 'сковорода', 'нож'],
    categories: ['home'],
    label: 'для кулинарии и готовки' },

  // Путешествия
  { triggers: ['путешествовать', 'путешествие', 'поехать', 'поездка', 'командировка', 'туризм', 'поход', 'кемпинг', 'рюкзак'],
    searchTerms: ['рюкзак', 'чемодан', 'палатка', 'спальник', 'термос', 'навигатор'],
    categories: ['sport', 'kids'],
    label: 'для путешествий и туризма' },

  // Программирование / работа
  { triggers: ['программировать', 'кодить', 'работать за компьютером', 'удалённая работа', 'учиться программированию', 'разработчик', 'дизайнер', 'фрилансер'],
    searchTerms: ['ноутбук', 'монитор', 'клавиатура', 'мышь', 'наушники'],
    categories: ['electronics'],
    label: 'для работы и программирования' },

  // Дети и семья
  { triggers: ['ребенок', 'дети', 'малыш', 'для детей', 'беременна', 'родить', 'новорожденный', 'школа', 'первый класс', 'развитие ребенка'],
    searchTerms: ['коляска', 'кроватка', 'игрушка', 'рюкзак', 'конструктор'],
    categories: ['kids'],
    label: 'для детей и малышей' },

  // Игры / геймер
  { triggers: ['играть в игры', 'геймер', 'gaming', 'игровой', 'видеоигры', 'стримить', 'киберспорт'],
    searchTerms: ['playstation', 'xbox', 'джойстик', 'гарнитура', 'игровой монитор', 'клавиатура'],
    categories: ['electronics'],
    label: 'для игр и гейминга' },

  // Йога / медитация
  { triggers: ['йога', 'медитация', 'растяжка', 'пилатес', 'заниматься йогой'],
    searchTerms: ['коврик', 'блок', 'ремень', 'одежда', 'спортивные'],
    categories: ['sport', 'clothing'],
    label: 'для йоги и медитации' },

  // Сад / дача
  { triggers: ['дача', 'сад', 'огород', 'садоводство', 'посадить', 'посеять', 'грядки', 'газон', 'урожай'],
    searchTerms: ['лопата', 'грабли', 'лейка', 'теплица', 'семена', 'удобрение', 'газонокосилка'],
    categories: ['home'],
    label: 'для сада и огорода' },

  // Читать / книги
  { triggers: ['читать', 'чтение', 'книги', 'литература', 'библиотека', 'электронная книга'],
    searchTerms: ['книга', 'ридер', 'лампа'],
    categories: ['books'],
    label: 'для чтения' },

  // Автомобиль
  { triggers: ['машина', 'авто', 'автомобиль', 'купить машину', 'купить авто', 'водить'],
    searchTerms: ['автомобиль', 'машина', 'мотоцикл'],
    categories: ['transport'],
    label: 'из раздела транспорт' },

  // Красота и уход
  { triggers: ['уход за собой', 'красота', 'макияж', 'маникюр', 'прическа', 'похорошеть', 'выглядеть'],
    searchTerms: ['крем', 'парфюм', 'косметика', 'уход', 'шампунь'],
    categories: ['beauty'],
    label: 'для ухода и красоты' },

  // Учеба / школа
  { triggers: ['учиться', 'школа', 'университет', 'студент', 'подготовка к урокам', 'онлайн-курс', 'самообразование'],
    searchTerms: ['ноутбук', 'планшет', 'наушники', 'книга', 'рюкзак'],
    categories: ['electronics', 'kids', 'books'],
    label: 'для учёбы' },

  // Велоспорт
  { triggers: ['кататься на велосипеде', 'велопрогулки', 'велоспорт', 'велик'],
    searchTerms: ['велосипед', 'шлем', 'замок', 'насос', 'перчатки'],
    categories: ['sport', 'transport'],
    label: 'для велоспорта' },

  // Бизнес / офис
  { triggers: ['открыть бизнес', 'офис', 'для работы', 'оборудование для бизнеса', 'кофейня', 'магазин'],
    searchTerms: ['принтер', 'компьютер', 'кофемашина', 'оборудование', 'стол', 'кресло'],
    categories: ['business', 'electronics', 'home'],
    label: 'для бизнеса и офиса' },

  // Подарок
  { triggers: ['подарок', 'подарить', 'на день рождения', 'на новый год', 'на 8 марта', 'на 23 февраля'],
    searchTerms: ['смартфон', 'наушники', 'часы', 'парфюм', 'игрушка'],
    categories: ['electronics', 'beauty', 'kids'],
    label: 'в качестве подарка' },

  // Мотоцикл / скутер
  { triggers: ['мотоцикл', 'скутер', 'мопед', 'ездить на мотоцикле'],
    searchTerms: ['мотоцикл', 'скутер', 'шлем', 'перчатки мото'],
    categories: ['transport'],
    label: 'для мотоциклистов' },
];

// Нет смысла отвечать
const OFF_TOPIC = ['политика', 'война', 'погода', 'гороскоп', 'рецепт', 'анекдот', 'стихи', 'напиши', 'переведи', 'объясни почему', 'кто такой', 'что такое', 'история страны', 'президент', 'курс валют', 'биткоин'];

function detectIntent(text) {
  const lower = text.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.triggers.some(t => lower.includes(t))) return intent;
  }
  return null;
}

function isOffTopic(text) {
  const lower = text.toLowerCase();
  return OFF_TOPIC.some(p => lower.includes(p));
}

function parsePrice(text) {
  const lower = text.toLowerCase();
  let maxPrice = null, minPrice = null;
  const upTo = lower.match(/до\s*([\d\s]+)\s*[рр₽к]|не\s+дороже\s*([\d\s]+)|бюджет\s*([\d\s]+)/);
  if (upTo) {
    let num = (upTo[1] || upTo[2] || upTo[3]).replace(/\s/g, '');
    if (lower.includes('к') && !lower.includes('каталог')) num = String(parseInt(num) * 1000);
    maxPrice = parseInt(num);
  }
  const from = lower.match(/от\s*([\d\s]+)\s*[рр₽]/);
  if (from) minPrice = parseInt(from[1].replace(/\s/g, ''));
  return { maxPrice, minPrice };
}

function searchByTerms(terms, categories, maxPrice, minPrice, db) {
  const where = ["p.status = 'active'"];
  const params = [];

  if (maxPrice) { where.push('p.price <= ?'); params.push(maxPrice); }
  if (minPrice) { where.push('p.price >= ?'); params.push(minPrice); }

  const termClauses = terms.map(() => '(p.title LIKE ? OR p.description LIKE ?)').join(' OR ');
  if (termClauses) {
    where.push(`(${termClauses})`);
    terms.forEach(t => { params.push(`%${t}%`); params.push(`%${t}%`); });
  }

  let results = db.prepare(`
    SELECT p.id, p.title, p.price, p.city, p.condition, p.description,
           c.name as category_name, c.slug,
           u.name as seller_name, u.rating as seller_rating,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN users u ON p.seller_id = u.id
    WHERE ${where.join(' AND ')}
    ORDER BY p.views DESC, p.likes_count DESC
    LIMIT 8
  `).all(...params);

  // Если совсем мало — добавляем по категориям
  if (results.length < 3 && categories.length > 0) {
    const catWhere = ["p.status = 'active'", `c.slug IN (${categories.map(() => '?').join(',')})`];
    const catParams = [...categories];
    if (maxPrice) { catWhere.push('p.price <= ?'); catParams.push(maxPrice); }
    const catResults = db.prepare(`
      SELECT p.id, p.title, p.price, p.city, p.condition, p.description,
             c.name as category_name, c.slug,
             u.name as seller_name, u.rating as seller_rating,
             (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE ${catWhere.join(' AND ')}
      ORDER BY p.views DESC LIMIT 6
    `).all(...catParams);
    const existingIds = new Set(results.map(r => r.id));
    results = [...results, ...catResults.filter(r => !existingIds.has(r.id))].slice(0, 8);
  }

  return results;
}

function buildReply(userText, products, intent, parsed) {
  if (products.length === 0) {
    if (intent) {
      return `🔍 К сожалению, сейчас нет товаров ${intent.label}. Попробуйте позже — продавцы добавляют новые объявления каждый день!\n\nМогу поискать что-то другое.`;
    }
    return `😔 По запросу «${userText}» ничего не нашлось.\n\nПопробуйте:\n• Изменить формулировку\n• Убрать ограничения по цене\n• Описать что хотите сделать или чем заняться`;
  }

  const priceMin = formatPrice(Math.min(...products.map(p => p.price)));
  const priceMax = formatPrice(Math.max(...products.map(p => p.price)));
  const priceStr = products.length > 1 && priceMin !== priceMax ? `${priceMin} — ${priceMax}` : priceMin;

  let reply = '';

  if (intent) {
    reply = `✅ Отлично! ${intent.label.charAt(0).toUpperCase() + intent.label.slice(1)} я подобрал ${products.length} вариант${products.length === 1 ? '' : products.length < 5 ? 'а' : 'ов'} (${priceStr}):\n\n`;
  } else {
    reply = `🔍 Нашёл ${products.length} товар${products.length === 1 ? '' : products.length < 5 ? 'а' : 'ов'} по вашему запросу (${priceStr}):\n\n`;
  }

  const top = products[0];
  reply += `⭐ Лучший вариант: **${top.title}** — ${formatPrice(top.price)}`;
  if (top.seller_rating > 0) reply += `, рейтинг продавца ${top.seller_rating}★`;
  reply += '.\n\n';

  if (parsed.maxPrice && products.some(p => p.price < parsed.maxPrice * 0.6)) {
    reply += `💡 Есть варианты значительно дешевле вашего бюджета!\n\n`;
  }

  reply += 'Нажмите на карточку для подробностей. Могу уточнить поиск — просто напишите.';
  return reply;
}

router.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Сообщение пустое' });

  if (isOffTopic(message)) {
    return res.json({
      reply: '🛍️ Я специализируюсь только на подборе товаров!\n\nРасскажите чем хотите заняться или что ищете — и я найду подходящее. Например:\n• «Хочу заняться спортом»\n• «Ищу подарок до 5000 ₽»\n• «Хочу научиться фотографировать»',
      products: [],
    });
  }

  try {
    const db = getDB();
    const intent = detectIntent(message);
    const { maxPrice, minPrice } = parsePrice(message);

    let searchTerms = [];
    let categories = [];

    if (intent) {
      searchTerms = intent.searchTerms;
      categories = intent.categories || [];
    } else {
      // Прямой поиск по словам из запроса
      const stop = new Set(['что', 'есть', 'ищу', 'хочу', 'найди', 'покажи', 'мне', 'для', 'по', 'на', 'до', 'от', 'за', 'как', 'нужен', 'нужна', 'купить', 'посоветуй', 'подбери', 'хороший', 'лучший', 'самый', 'дешевый']);
      searchTerms = message.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stop.has(w) && !/^\d+$/.test(w));
    }

    const products = searchByTerms(searchTerms, categories, maxPrice, minPrice, db);
    const reply = buildReply(message, products, intent, { maxPrice, minPrice });

    res.json({ reply, products: products.slice(0, 4) });
  } catch (e) {
    console.error('AI error:', e);
    res.status(500).json({ error: 'Ошибка поиска' });
  }
});

module.exports = router;
