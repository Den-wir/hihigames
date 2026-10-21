(function () {
  const KEY = 'case1-game-store';

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function waterDemo() {
    return {
      id: 'water', layout: 'baskets',
      title: 'Тонет или плавает?',
      question: 'Куда положим этот предмет?',
      category_a: 'Плавает', category_b: 'Тонет',
      items: [
        { id: 'i1', name: 'Камень', emoji: '', icon_key: 'stone', category: 'b', property_prompt: 'Он тяжёлый?', explanation: 'Тонет.' },
        { id: 'i2', name: 'Пёрышко', emoji: '', icon_key: 'feather', category: 'a', property_prompt: 'Оно лёгкое?', explanation: 'Плавает.' },
        { id: 'i3', name: 'Монета', emoji: '', icon_key: 'coin', category: 'b', property_prompt: 'Она металлическая?', explanation: 'Тонет.' },
        { id: 'i4', name: 'Пробка', emoji: '', icon_key: 'cork', category: 'a', property_prompt: 'Она лёгкая?', explanation: 'Плавает.' },
        { id: 'i5', name: 'Яблоко', emoji: '', icon_key: 'apple', category: 'a', property_prompt: 'Оно лёгкое?', explanation: 'Плавает.' }
      ]
    };
  }

  function shapesDemo() {
    return {
      id: 'shapes', layout: 'sorter',
      title: 'Разложи фигурки по домикам',
      question: 'Найди домик для этой фигурки',
      category_a: 'Домики', category_b: '',
      items: [
        { id: 's1', name: 'Круг', shape: 'circle', color: '#8ed0ff', category: 'circle', property_prompt: 'У него есть углы?', explanation: 'Это круг.' },
        { id: 's2', name: 'Квадрат', shape: 'square', color: '#ff8fab', category: 'square', property_prompt: 'Сколько у него сторон?', explanation: 'Это квадрат.' },
        { id: 's3', name: 'Треугольник', shape: 'triangle', color: '#ffe566', category: 'triangle', property_prompt: 'Сколько углов?', explanation: 'Это треугольник.' },
        { id: 's4', name: 'Прямоугольник', shape: 'rectangle', color: '#8ee0b0', category: 'rectangle', property_prompt: 'Он вытянутый?', explanation: 'Это прямоугольник.' }
      ]
    };
  }

  function memoryDemo() {
    return {
      id: 'memory', layout: 'memory',
      title: 'Найди пару',
      question: 'Найди две одинаковые картинки',
      items: [
        { id: 'm1', name: 'Яблоко', emoji: '🍎', pair: 'apple', explanation: 'Это яблоко.' },
        { id: 'm2', name: 'Яблоко', emoji: '🍎', pair: 'apple', explanation: 'Это тоже яблоко.' },
        { id: 'm3', name: 'Собака', emoji: '🐶', pair: 'dog', explanation: 'Это собака.' },
        { id: 'm4', name: 'Собака', emoji: '🐶', pair: 'dog', explanation: 'Это тоже собака.' },
        { id: 'm5', name: 'Листок', emoji: '🍃', pair: 'leaf', explanation: 'Это листок.' },
        { id: 'm6', name: 'Листок', emoji: '🍃', pair: 'leaf', explanation: 'Это тоже листок.' },
        { id: 'm7', name: 'Машина', emoji: '🚗', pair: 'car', explanation: 'Это машина.' },
        { id: 'm8', name: 'Машина', emoji: '🚗', pair: 'car', explanation: 'Это тоже машина.' },
        { id: 'm9', name: 'Мяч', emoji: '⚽', pair: 'ball', explanation: 'Это мяч.' },
        { id: 'm10', name: 'Мяч', emoji: '⚽', pair: 'ball', explanation: 'Это тоже мяч.' },
        { id: 'm11', name: 'Цветок', emoji: '🌸', pair: 'flower', explanation: 'Это цветок.' },
        { id: 'm12', name: 'Цветок', emoji: '🌸', pair: 'flower', explanation: 'Это тоже цветок.' }
      ]
    };
  }

  function oddDemo() {
    return {
      id: 'odd', layout: 'odd',
      title: 'Что лишнее?',
      question: 'Найди лишний предмет',
      items: [
        // Раунд 1 (Животные + яблоко)
        { id: 'o1', name: 'Собака', emoji: '🐶', odd: false, round: 1, explanation: 'Собака — животное.' },
        { id: 'o2', name: 'Кошка', emoji: '🐱', odd: false, round: 1, explanation: 'Кошка — животное.' },
        { id: 'o3', name: 'Яблоко', emoji: '🍎', odd: true, round: 1, explanation: 'Яблоко — это фрукт, а не животное.' },
        { id: 'o4', name: 'Корова', emoji: '🐮', odd: false, round: 1, explanation: 'Корова — животное.' },
        
        // Раунд 2 (Транспорт + банан)
        { id: 'o5', name: 'Машина', emoji: '🚗', odd: false, round: 2, explanation: 'Машина — это транспорт.' },
        { id: 'o6', name: 'Автобус', emoji: '🚌', odd: false, round: 2, explanation: 'Автобус — это транспорт.' },
        { id: 'o7', name: 'Банан', emoji: '🍌', odd: true, round: 2, explanation: 'Банан — это еда, а не транспорт.' },
        { id: 'o8', name: 'Велосипед', emoji: '🚲', odd: false, round: 2, explanation: 'Велосипед — это транспорт.' },
        
        // Раунд 3 (Посуда + мяч)
        { id: 'o9', name: 'Ложка', emoji: '🥄', odd: false, round: 3, explanation: 'Ложка — это посуда.' },
        { id: 'o10', name: 'Тарелка', emoji: '🍽️', odd: false, round: 3, explanation: 'Тарелка — это посуда.' },
        { id: 'o11', name: 'Мяч', emoji: '⚽', odd: true, round: 3, explanation: 'Мяч — это игрушка, а не посуда.' },
        { id: 'o12', name: 'Чашка', emoji: '☕', odd: false, round: 3, explanation: 'Чашка — это посуда.' }
      ]
    };
  }

  function seqDemo() {
    return {
      id: 'seq', layout: 'sequence',
      title: 'Собери цепочку',
      question: 'Расставь по порядку: от семечка до цветка',
      items: [
        { id: 'q1', name: 'Семечко', emoji: '🌰', order: 1, explanation: 'Сначала семечко.' },
        { id: 'q2', name: 'Росток', emoji: '🌱', order: 2, explanation: 'Потом росток.' },
        { id: 'q3', name: 'Листик', emoji: '🍃', order: 3, explanation: 'Затем появляются листья.' },
        { id: 'q4', name: 'Бутон', emoji: '🌷', order: 4, explanation: 'После бутон.' },
        { id: 'q5', name: 'Цветок', emoji: '🌸', order: 5, explanation: 'И наконец цветок.' }
      ]
    };
  }

  function empty() {
    return { games: [waterDemo(), shapesDemo(), memoryDemo(), oddDemo(), seqDemo()], sessions: [], currentId: 'water' };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      const data = JSON.parse(raw);
      if (!data.games || !data.games.length) return empty();
      data.sessions = data.sessions || [];
      if (!data.currentId || !data.games.find(function(g){ return g.id === data.currentId; })) {
        data.currentId = data.games[0].id;
      }
      return data;
    } catch (e) {
      return empty();
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  window.Store = {
    uid: uid, load: load, save: save,
    currentGame: function () {
      const data = load();
      return data.games.find(function (g) { return g.id === data.currentId; }) || data.games[0];
    },
    setCurrent: function (id) {
      const data = load();
      if (data.games.find(function(g){ return g.id === id; })) {
        data.currentId = id;
        save(data);
      }
    },
    getGame: function (id) {
      return load().games.find(function (g) { return g.id === id; });
    },
    allGames: function() {
      return load().games;
    },
    saveGame: function (game) {
      const data = load();
      const i = data.games.findIndex(function (g) { return g.id === game.id; });
      if (i >= 0) data.games[i] = game;
      else data.games.unshift(game);
      data.currentId = game.id;
      save(data);
      return game;
    },
    copyGame: function (id) {
      const src = this.getGame(id);
      if (!src) return null;
      const copy = JSON.parse(JSON.stringify(src));
      copy.id = uid();
      copy.title = src.title + ' (копия)';
      copy.items.forEach(function (item) { item.id = uid(); });
      const data = load();
      data.games.unshift(copy);
      data.currentId = copy.id;
      save(data);
      return copy;
    },
    deleteGame: function (id) {
      const data = load();
      data.games = data.games.filter(function(g) { return g.id !== id; });
      if (data.games.length === 0) data.games = empty().games;
      if (!data.games.find(function(g) { return g.id === data.currentId; })) data.currentId = data.games[0].id;
      save(data);
    },
    addSession: function (session) {
      const data = load();
      data.sessions.unshift(session);
      save(data);
      return session;
    },
    getSession: function (id) {
      return load().sessions.find(function (s) { return s.id === id; });
    },
    updateSession: function (session) {
      const data = load();
      const i = data.sessions.findIndex(function (s) { return s.id === session.id; });
      if (i >= 0) data.sessions[i] = session;
      save(data);
    },
    sessionsFor: function (gameId, onlyChildren) {
      return load().sessions.filter(function (s) {
        if (s.gameId !== gameId) return false;
        if (onlyChildren && s.isPreview) return false;
        return true;
      });
    },
    getTemplates: function() {
      return [
        { id: 'empty', title: 'С нуля', desc: 'Создать новую игру с нуля' },
        { id: 'water', title: 'Тонет или плавает', desc: 'Вода, опыт с тяжелыми и легкими предметами' },
        { id: 'shapes', title: 'Разложи фигурки', desc: 'Вкладыши: подобрать фигуру по форме' },
        { id: 'memory', title: 'Найди пару', desc: 'Мемори: найти две одинаковые картинки' },
        { id: 'odd', title: 'Что лишнее?', desc: 'Найти предмет, который не подходит к остальным' },
        { id: 'seq', title: 'Собери цепочку', desc: 'Выстроить предметы в правильном порядке' }
      ];
    },
    createFromTemplate: function(tmplId) {
      let game;
      if (tmplId === 'water') game = waterDemo();
      else if (tmplId === 'shapes') game = shapesDemo();
      else if (tmplId === 'memory') game = memoryDemo();
      else if (tmplId === 'odd') game = oddDemo();
      else if (tmplId === 'seq') game = seqDemo();
      else {
        game = {
          title: 'Новая игра', layout: 'baskets', experiment: '', question: 'Куда положим этот предмет?',
          category_a: 'Синяя корзина', category_b: 'Оранжевая корзина', items: []
        };
      }
      game.id = uid();
      game.items.forEach(function(it){ it.id = uid(); });
      return game;
    }
  };
})();