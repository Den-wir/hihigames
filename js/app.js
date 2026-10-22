(function () {
  const root = document.getElementById('app');
  const header = document.getElementById('site-header');
  const body = document.body;

  const ROLE_KEY = 'case1-role';

  function getRole() {
    return localStorage.getItem(ROLE_KEY) === 'child' ? 'child' : 'teacher';
  }

  function setRole(role) {
    localStorage.setItem(ROLE_KEY, role);
    body.classList.toggle('child-mode', role === 'child');
    renderRoleSwitch();
    route();
  }

  function renderRoleSwitch() {
    const box = document.getElementById('role-switch');
    if (!box) return;
    const role = getRole();
    box.querySelectorAll('.role-btn').forEach(function (b) {
      const on = b.dataset.role === role;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hashParts() {
    const raw = (location.hash || '#/').replace(/^#\/?/, '');
    return raw.split('/').filter(Boolean);
  }

  function go(path) {
    location.hash = path;
  }

  function prefersReduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function afterPaint(fn) {
    requestAnimationFrame(function () {
      requestAnimationFrame(fn);
    });
  }

  function fmtWhen(iso) {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return dd + '.' + mm + ', ' + hh + ':' + mi;
  }

  function getShapeName(shape) {
    if (shape === 'circle') return 'Круг';
    if (shape === 'square') return 'Квадрат';
    if (shape === 'triangle') return 'Треугольник';
    if (shape === 'rectangle') return 'Прямоугольник';
    return '';
  }

  function getClipPath(shape) {
    if (shape === 'circle') return 'circle(50% at 50% 50%)';
    if (shape === 'triangle') return 'polygon(50% 0%, 100% 100%, 0% 100%)';
    if (shape === 'square') return 'inset(0 0 0 0)';
    if (shape === 'rectangle') return 'inset(25% 0 25% 0)';
    return 'inset(0 0 0 0)';
  }

  function missedForSession(session, game) {
    const missed = [];
    game.items.forEach(function (item) {
      const wrongs = session.attempts.filter(function (a) { return a.itemId === item.id && !a.correct; });
      if (wrongs.length) {
        missed.push({ item: item, firstChoice: wrongs[0].chosen });
      }
    });
    return missed;
  }

  function discussion(game) {
    const sessions = Store.sessionsFor(game.id, true);
    return game.items.map(function (item) {
      const names = [];
      sessions.forEach(function (s) {
        const wrong = s.attempts.some(function (a) { return a.itemId === item.id && !a.correct; });
        if (wrong) names.push(s.childName || 'Без имени');
      });
      return { item: item, names: names, wrongCount: names.length };
    }).sort(function (a, b) { return b.wrongCount - a.wrongCount; });
  }

  function setChrome(playMode, game, active) {
    body.classList.toggle('play-body', playMode);
    body.classList.toggle('child-mode', getRole() === 'child');
    header.hidden = playMode;
    const nav = header.querySelector('#main-nav');
    if (playMode || !game || getRole() === 'child') {
      nav.innerHTML = '';
      return;
    }
    const steps = [
      ['home', '#/', '1', 'Начало'],
      ['preview', '#/preview/' + game.id, '2', 'Попробовать'],
      ['results', '#/results/' + game.id, '3', 'Обсудить']
    ];
    const existing = nav.querySelectorAll('.step');
    if (existing.length === steps.length) {
      steps.forEach(function (s, i) {
        existing[i].classList.toggle('active', s[0] === active);
        existing[i].setAttribute('href', s[1]);
      });
      return;
    }
    nav.innerHTML = steps.map(function (s) {
      return '<a class="step' + (s[0] === active ? ' active' : '') + '" href="' + s[1] + '"><span class="n">' + s[2] + '</span>' + s[3] + '</a>';
    }).join('');
  }

  function renderHome() {
    const game = Store.currentGame();
    setChrome(false, game, 'home');

    if (getRole() === 'child') {
      if (!game) {
        root.innerHTML = '<article class="panel"><p>Игры пока нет. Попросите учителя её собрать.</p></article>';
        return;
      }
      const last = Store.sessionsFor(game.id, true)[0];
      root.innerHTML =
        '<section class="hero child-hero">' +
          '<p class="start-art" aria-hidden="true">🎈</p>' +
          '<h1>' + esc(game.title) + '</h1>' +
          '<p class="lead">' + esc(game.question) + '</p>' +
          '<p class="actions">' +
            '<a class="btn orange big" href="#/child/' + game.id + '">Играть</a>' +
            (last ? '<a class="btn ghost" href="#/session/' + last.id + '">Мой результат</a>' : '') +
          '</p>' +
        '</section>';
      return;
    }

    if (!game) {
      root.innerHTML = '<article class="panel"><p>Игры ещё нет.</p><a class="btn primary" href="#/create">Создать игру</a></article>';
      return;
    }
    const discuss = discussion(game).filter(function (r) { return r.wrongCount; });
    const sessions = Store.sessionsFor(game.id, true).slice(0, 8);
    
    const allGames = Store.allGames();
    const gamesList = allGames.map(function(g) {
      const isActive = g.id === game.id;
      return '<div style="display:flex; gap:8px; margin-bottom:8px; align-items:stretch;">' +
        '<button class="btn ' + (isActive ? 'primary' : 'ghost') + '" type="button" data-switch-game="' + g.id + '" style="flex:1; justify-content:flex-start;">' + (isActive ? '' : '') + esc(g.title) + '</button>' +
        '<button class="btn ghost" type="button" data-delete-game="' + g.id + '" title="Удалить игру" style="color:#d65a12; border-color:#ffc38a; padding:12px;" aria-label="Удалить">🗑️</button>' +
      '</div>';
    }).join('');

    root.innerHTML =
      '<section class="hero">' +
        '<p class="eyebrow">Для воспитателя</p>' +
        '<h1>Сначала опыт — потом короткая игра</h1>' +
        '<p class="lead">Два шага: собрать картинки и попробовать самой. Игру с ребёнком запускайте из режима «Ребёнок».</p>' +
      '</section>' +
      '<div class="path">' +
        '<a class="path-card blue" href="#/create"><span class="n">1</span><strong>Создать игру</strong><p>Новый вопрос, корзины и предметы</p></a>' +
        '<a class="path-card green" href="#/preview/' + game.id + '"><span class="n">2</span><strong>Попробовать</strong><p>Пройти самой и послушать подсказку</p></a>' +
      '</div>' +
      '<article class="panel game-card">' +
        '<div>' +
          '<p class="eyebrow">Сейчас в кабинете</p>' +
          '<h2>' + esc(game.title) + '</h2>' +
          '<p>Спрашиваем: <strong>' + esc(game.question) + '</strong></p>' +
          '<p class="cats">' +
            '<span class="pill a">🎮 Игр: ' + game.items.length + '</span>' +
          '</p>' +
        '</div>' +
        '<div class="actions">' +
          '<a class="btn blue" href="#/editor/' + game.id + '">Редактировать</a>' +
          '<a class="btn ghost" href="#/results/' + game.id + '">Что обсудить</a>' +
          '<a class="btn ghost" href="#/cards/' + game.id + '">Карточки на бумаге</a>' +
          '<button class="btn ghost" type="button" id="copy-game">Сделать копию</button>' +
        '</div>' +
      '</article>' +
      '<section class="panel">' +
        '<h3>Мои игры <span class="muted">(нажмите, чтобы выбрать)</span></h3>' +
        '<div style="margin-top:12px">' + gamesList + '</div>' +
      '</section>' +
      (discuss.length
        ? '<section><h3>После последних игр стоит вернуться к</h3><ul class="discuss">' +
          discuss.map(function (row) {
            return '<li><strong>' + esc(row.item.name) + '</strong> — ' + esc(row.item.property_prompt) +
              ' <span class="muted">(' + esc(row.names.join(', ')) + ')</span></li>';
          }).join('') + '</ul></section>'
        : '') +
      (sessions.length
        ? '<section><h3>Недавние проведения</h3><ul class="sessions">' +
          sessions.map(function (s) {
            return '<li><a href="#/session/' + s.id + '">' + esc(s.childName) + '</a>' +
              '<span class="muted">' + esc(fmtWhen(s.startedAt)) + '</span>' +
              (s.finishedAt ? '<span class="ok">завершена</span>' : '<span class="warn">идёт</span>') +
              '</li>';
          }).join('') + '</ul></section>'
        : '');

    document.getElementById('copy-game').onclick = function () {
      const copy = Store.copyGame(game.id);
      go('/editor/' + copy.id);
    };
    
    document.querySelectorAll('[data-switch-game]').forEach(function(btn) {
      btn.onclick = function() {
        Store.setCurrent(btn.dataset.switchGame);
        route();
      };
    });

    document.querySelectorAll('[data-delete-game]').forEach(function(btn) {
      btn.onclick = function() {
        if (confirm('Точно удалить эту игру?')) {
          Store.deleteGame(btn.dataset.deleteGame);
          route();
        }
      };
    });
  }

  function renderCreate() {
    const game = Store.currentGame();
    setChrome(false, game, 'home');
    const templates = Store.getTemplates();

    root.innerHTML =
      '<section class="hero">' +
        '<p class="eyebrow">Новая игра</p>' +
        '<h1>Выберите, с чего начать</h1>' +
        '<p class="lead">Можно создать игру с нуля или взять готовый шаблон по теме.</p>' +
      '</section>' +
      '<div class="path" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">' +
        templates.map(function(t) {
          return '<a class="path-card ' + (t.id === 'empty' ? 'blue' : 'green') + '" href="#" data-template="' + t.id + '">' +
            '<strong>' + esc(t.title) + '</strong>' +
            '<p>' + esc(t.desc) + '</p>' +
          '</a>';
        }).join('') +
      '</div>' +
      '<p style="margin-top:24px"><a class="btn ghost" href="#/">← Вернуться на главную</a></p>';

    document.querySelectorAll('[data-template]').forEach(function(card) {
      card.onclick = function(e) {
        e.preventDefault();
        const tmplId = card.dataset.template;
        if (tmplId === 'empty') {
          go('/create-type');
        } else {
          const newGame = Store.createFromTemplate(tmplId);
          Store.saveGame(newGame);
          go('/editor/' + newGame.id);
        }
      };
    });
  }

  function renderCreateType() {
    const game = Store.currentGame();
    setChrome(false, game, 'home');
    root.innerHTML =
      '<section class="hero">' +
        '<p class="eyebrow">Шаг 1 · Создать с нуля</p>' +
        '<h1>Какой тип игры вы хотите создать?</h1>' +
        '<p class="lead">Выберите механику. Мы подготовим пустое поле для заполнения.</p>' +
      '</section>' +
      '<div class="path" style="grid-template-columns: 1fr 1fr; gap: 16px;">' +
        '<a class="path-card blue" href="#" data-type="baskets" style="align-items: flex-start; text-align: left; padding: 20px;">' +
          '<span class="n">📦</span><strong>Корзины</strong>' +
          '<p>Раскладываем предметы по двум корзинам.</p>' +
        '</a>' +
        '<a class="path-card green" href="#" data-type="sorter" style="align-items: flex-start; text-align: left; padding: 20px;">' +
          '<span class="n">🔷</span><strong>Домики с фигурами</strong>' +
          '<p>Подбираем домик по форме (сортер).</p>' +
        '</a>' +
        '<a class="path-card orange" href="#" data-type="memory" style="align-items: flex-start; text-align: left; padding: 20px;">' +
          '<span class="n">🃏</span><strong>Найди пару</strong>' +
          '<p>Мемори: ищем две одинаковые карточки.</p>' +
        '</a>' +
        '<a class="path-card orange" href="#" data-type="odd" style="align-items: flex-start; text-align: left; padding: 20px;">' +
          '<span class="n">❓</span><strong>Что лишнее?</strong>' +
          '<p>Находим предмет, который не подходит.</p>' +
        '</a>' +
        '<a class="path-card orange" href="#" data-type="sequence" style="align-items: flex-start; text-align: left; padding: 20px;">' +
          '<span class="n">🔗</span><strong>Собери цепочку</strong>' +
          '<p>Расставляем предметы по порядку.</p>' +
        '</a>' +
      '</div>' +
      '<p style="margin-top:24px"><a class="btn ghost" href="#/create">← Назад к шаблонам</a></p>';

    document.querySelectorAll('[data-type]').forEach(function(card) {
      card.onclick = function(e) {
        e.preventDefault();
        const type = card.dataset.type;
        const newGame = Store.createFromTemplate(type);
        Store.saveGame(newGame);
        go('/editor/' + newGame.id);
      };
    });
  }

  function iconOptions(selected) {
    return ICON_CHOICES.map(function (pair) {
      return '<option value="' + pair[0] + '"' + (pair[0] === selected ? ' selected' : '') + '>' + pair[1] + '</option>';
    }).join('');
  }

  function itemEditorHtml(item, i, layout) {
    item = item || { id: '', name: '', emoji: '', icon_key: 'box', image: '', category: 'a', shape: 'circle', color: '#ffd37a', property_prompt: '', explanation: '', odd: false, order: i+1, round: 1 };
    let isSorter = layout === 'sorter';
    let isOdd = layout === 'odd';
    let isSeq = layout === 'sequence';
    let isMemory = layout === 'memory';

    let thumbHtml = '';
    if (isSorter) {
      thumbHtml = '<div style="width:60px; height:60px; background:' + (item.color || '#ffd37a') + '; border: 3px solid #2d2a4a; clip-path: ' + getClipPath(item.shape) + '; margin: 0 auto;"></div>';
    } else {
      thumbHtml = item.image ? '<img src="' + item.image + '" alt="">' : pictureHtml(item);
    }

    return '<article class="panel item-row" data-item>' +
      '<div class="item-badge">Карточка ' + (i + 1) + '</div>' +
      '<input type="hidden" name="id" value="' + esc(item.id) + '">' +
      '<div class="item-head">' +
        '<label>Название <input type="text" name="name" value="' + esc(item.name) + '" required></label>' +
        (isSorter 
          ? '<label>Форма <select name="shape">' + shapeOptions(item.shape) + '</select></label><label>Цвет <input type="color" name="color" value="' + (item.color||'#ffd37a') + '"></label>'
          : '<label>Иконка (эмодзи) <input type="text" name="emoji" value="' + esc(item.emoji || '') + '" placeholder="🍎" style="width:80px; text-align:center; font-size:1.5rem;"></label>'
        ) +
        '<div class="thumb" data-thumb>' + thumbHtml + '</div>' +
      '</div>' +
      (isSorter || isMemory ? '' : '<label>Своё фото (необязательно) <input type="file" accept="image/*" name="image"></label>' + (item.image ? '<input type="hidden" name="image_keep" value="1">' : '')) +
      (!isSorter && !isMemory && !isOdd && !isSeq ? 
        '<fieldset class="cat-pick"><legend>Куда кладём?</legend>' +
        '<label class="cat-chip a"><input type="radio" name="cat-' + i + '" value="a"' + (item.category !== 'b' ? ' checked' : '') + '> ~ 1-е</label>' +
        '<label class="cat-chip b"><input type="radio" name="cat-' + i + '" value="b"' + (item.category === 'b' ? ' checked' : '') + '> ↓ 2-е</label>' +
        '</fieldset>'
      : '') +
      (isMemory ? '<label>Пара (одинаковый ID для двух карточек) <input type="text" name="pair" value="' + esc(item.pair||'') + '" required></label>' : '') +
      (isOdd ? '<div style="display:flex; gap:16px;"><label><input type="checkbox" name="is_odd" ' + (item.odd ? 'checked' : '') + '> Это лишний</label><label>Раунд <input type="number" name="round" value="' + (item.round||1) + '" required style="width:80px;"></label></div>' : '') +
      (isSeq ? '<label>Порядковый номер <input type="number" name="order" value="' + (item.order||i+1) + '" required></label>' : '') +
      (isMemory ? '<label>Текст подсказки <input type="text" name="property_prompt" value="' + esc(item.property_prompt||'') + '"></label>' : 
        '<label>Если ошиблись — на что смотреть <input type="text" name="property_prompt" value="' + esc(item.property_prompt) + '" required></label>') +
      '<label>Что сказать <input type="text" name="explanation" value="' + esc(item.explanation) + '" required></label>' +
      '<button type="button" class="delete" data-remove>Убрать карточку</button>' +
    '</article>';
  }

  function shapeOptions(selected) {
    const shapes = [['circle', 'Круг'], ['square', 'Квадрат'], ['triangle', 'Треугольник'], ['rectangle', 'Прямоугольник']];
    return shapes.map(function (s) {
      return '<option value="' + s[0] + '"' + (s[0] === selected ? ' selected' : '') + '>' + s[1] + '</option>';
    }).join('');
  }

  function bindItemRow(row, layout) {
    const inputEmoji = row.querySelector('[name=emoji]');
    const selectShape = row.querySelector('[name=shape]');
    const inputColor = row.querySelector('[name=color]');
    const thumb = row.querySelector('[data-thumb]');
    const file = row.querySelector('[name=image]');
    const isSorter = layout === 'sorter';

    function updateThumb() {
      if (isSorter) {
        const shape = selectShape.value;
        const color = inputColor.value;
        thumb.innerHTML = '<div style="width:60px; height:60px; background:' + color + '; border: 3px solid #2d2a4a; clip-path: ' + getClipPath(shape) + '; margin: 0 auto;"></div>';
      } else {
        if (!row.dataset.hasImage && inputEmoji) {
          thumb.innerHTML = '<span style="font-size: 48px; line-height: 1;">' + (inputEmoji.value || '📦') + '</span>';
        }
      }
    }

    if (inputEmoji) inputEmoji.oninput = updateThumb;
    if (selectShape) selectShape.onchange = updateThumb;
    if (inputColor) inputColor.oninput = updateThumb;

    if (file) {
      file.onchange = function () {
        const f = file.files && file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = function () {
          row.dataset.hasImage = '1';
          row.dataset.image = reader.result;
          thumb.innerHTML = '<img src="' + reader.result + '" alt="">';
        };
        reader.readAsDataURL(f);
      };
      if (row.querySelector('[name=image_keep]')) {
        const img = thumb.querySelector('img');
        if (img) {
          row.dataset.hasImage = '1';
          row.dataset.image = img.src;
        }
      }
    }
    
    row.querySelector('[data-remove]').onclick = function () {
      const list = document.getElementById('items');
      if (list.querySelectorAll('[data-item]').length <= 2) {
        alert('Должно быть не меньше 2 предметов.');
        return;
      }
      row.remove();
    };
  }

  function collectItems(layout) {
    const rows = Array.from(document.querySelectorAll('#items [data-item]'));
    return rows.map(function (row, i) {
      const cat = row.querySelector('input[type=radio]:checked');
      const isSorter = layout === 'sorter';
      const isOdd = layout === 'odd';
      const isSeq = layout === 'sequence';
      const isMemory = layout === 'memory';
      
      const shape = isSorter ? row.querySelector('[name=shape]').value : '';
      return {
        id: row.querySelector('[name=id]').value || Store.uid(),
        name: row.querySelector('[name=name]').value.trim(),
        emoji: isSorter ? '' : (row.querySelector('[name=emoji]') ? row.querySelector('[name=emoji]').value.trim() : ''),
        icon_key: 'box',
        shape: shape,
        color: isSorter ? row.querySelector('[name=color]').value : '',
        image: isSorter ? '' : (row.dataset.image || ''),
        category: isSorter ? shape : (cat ? cat.value : 'a'),
        pair: isMemory ? row.querySelector('[name=pair]').value.trim() : '',
        odd: isOdd ? row.querySelector('[name=is_odd]').checked : false,
        round: isOdd ? parseInt(row.querySelector('[name=round]').value, 10) : 1,
        order: isSeq ? parseInt(row.querySelector('[name=order]').value, 10) : i+1,
        property_prompt: row.querySelector('[name=property_prompt]') ? row.querySelector('[name=property_prompt]').value.trim() : '',
        explanation: row.querySelector('[name=explanation]').value.trim(),
      };
    });
  }

  function renderEditor(id) {
    const game = id ? Store.getGame(id) : null;
    setChrome(false, game || Store.currentGame(), 'editor');
    const layout = game ? game.layout : 'baskets';
    const items = game && game.items.length ? game.items : [{}, {}, {}, {}, {}, {}];
    const isSorter = layout === 'sorter';
    const isMemory = layout === 'memory';
    
    root.innerHTML =
      '<p class="eyebrow">' + (game ? 'Редактор' : 'Шаг 1 · Создать') + '</p>' +
      '<h1>' + (game ? 'Редактировать игру' : 'Новая игра') + '</h1>' +
      '<p class="lead">Настройте правила и карточки для игры. Для картинок используйте эмодзи (🍎, 🚗, 🐶).</p>' +
      '<div id="editor-msg"></div>' +
      '<form id="editor-form">' +
        '<section class="panel grid-2">' +
          '<div>' +
            '<label>Название игры <input type="text" name="title" value="' + esc(game ? game.title : '') + '" required></label>' +
            '<label>Вопрос детям крупно <input type="text" name="question" value="' + esc(game ? game.question : '') + '" required></label>' +
          '</div>' +
          (!isSorter && !isMemory && layout !== 'odd' && layout !== 'sequence' ? 
          '<div>' +
            '<label>1-я корзина <input type="text" name="category_a" value="' + esc(game ? game.category_a : '') + '" required></label>' +
            '<label>2-я корзина <input type="text" name="category_b" value="' + esc(game ? game.category_b : '') + '" required></label>' +
          '</div>' : '') +
        '</section>' +
        '<h2>Предметы <span class="muted">(карточки)</span></h2>' +
        '<div id="items">' + items.map(function(it, i){ return itemEditorHtml(it, i, layout); }).join('') + '</div>' +
        '<p class="actions">' +
          '<button type="button" class="btn ghost" id="add-item">+ Ещё</button>' +
          '<button type="submit" class="btn primary">Сохранить</button>' +
          (game ? '<a class="btn blue" href="#/preview/' + game.id + '">Дальше: попробовать</a>' : '') +
        '</p>' +
      '</form>';

    document.querySelectorAll('#items [data-item]').forEach(function(row){ bindItemRow(row, layout); });

    document.getElementById('add-item').onclick = function () {
      const list = document.getElementById('items');
      if (list.querySelectorAll('[data-item]').length >= 16) return;
      list.insertAdjacentHTML('beforeend', itemEditorHtml({}, list.querySelectorAll('[data-item]').length, layout));
      bindItemRow(list.lastElementChild, layout);
    };

    document.getElementById('editor-form').onsubmit = function (e) {
      e.preventDefault();
      const f = e.target;
      const packed = collectItems(layout).filter(function (it) { return it.name; });
      const msg = document.getElementById('editor-msg');
      if (packed.length < 2) {
        msg.innerHTML = '<p class="flash error">В игре должно быть хотя бы 2 предмета.</p>';
        return;
      }
      const saved = Store.saveGame({
        id: game ? game.id : Store.uid(),
        layout: layout,
        title: f.title.value.trim(),
        question: f.question.value.trim(),
        category_a: (!isSorter && !isMemory && layout !== 'odd' && layout !== 'sequence') ? f.category_a.value.trim() : '',
        category_b: (!isSorter && !isMemory && layout !== 'odd' && layout !== 'sequence') ? f.category_b.value.trim() : '',
        items: packed
      });
      msg.innerHTML = '<p class="flash">Игра сохранена.</p>';
      go('/editor/' + saved.id);
    };
  }

  function startSession(game, preview, childName) {
    const session = Store.addSession({
      id: Store.uid(), gameId: game.id, childName: preview ? 'Предпросмотр' : childName,
      isPreview: !!preview, startedAt: new Date().toISOString(), finishedAt: null, attempts: []
    });
    go('/play/' + session.id);
  }

  function renderStart(id, preview) {
    const game = Store.getGame(id) || Store.currentGame();
    setChrome(false, game, preview ? 'preview' : 'child');
    if (preview) {
      root.innerHTML =
        '<article class="panel narrow">' +
          '<p class="start-art" aria-hidden="true">👀</p>' +
          '<p class="eyebrow">Шаг 2 · Попробовать</p>' +
          '<h1>Пройдите игру как ребёнок</h1>' +
          '<p>Посмотрите, как работает поле, и проверьте подсказки.</p>' +
          '<div class="actions" style="margin-top:18px">' +
            '<button class="btn primary big" type="button" id="begin">Начать проверку</button>' +
            '<a class="btn ghost" href="#/editor/' + game.id + '">Назад к сборке</a>' +
          '</div>' +
        '</article>';
      document.getElementById('begin').onclick = function () { startSession(game, true); };
      return;
    }

    if (getRole() === 'child') {
      root.innerHTML =
        '<article class="panel narrow child-hero">' +
          '<p class="start-art" aria-hidden="true">🎲</p>' +
          '<p class="eyebrow">Игра</p>' +
          '<h1>' + esc(game.title) + '</h1>' +
          '<p class="muted">' + esc(game.question) + '</p>' +
          '<form id="child-form">' +
            '<label>Как тебя зовут? <input type="text" name="child" required placeholder="Маша"></label>' +
            '<button class="btn orange big" type="submit">Играть</button>' +
          '</form>' +
        '</article>';
      document.getElementById('child-form').onsubmit = function (e) {
        e.preventDefault();
        startSession(game, false, e.target.child.value.trim());
      };
      return;
    }
    go('/preview/' + game.id);
  }

  function remainingItems(session, game) {
    const placed = {};
    session.attempts.forEach(function (a) { if (a.correct) placed[a.itemId] = true; });
    return game.items.filter(function (it) { return !placed[it.id]; });
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderPlay(sessionId) {
    const session = Store.getSession(sessionId);
    if (!session) { go('/'); return; }
    const game = Store.getGame(session.gameId);
    setChrome(true, game);
    root.className = 'play-wrap';
    
    let playAreaHtml = '';
    const layout = game.layout || 'baskets';
    
    if (layout === 'sorter') {
      const houseColors = { circle: '#8ed0ff', square: '#8ee0b0', triangle: '#ffe566', rectangle: '#ff8fab' };
      // Перемешиваем домики и оставшиеся фигуры при каждом рендере, как в "Что лишнее?"
      const housesShuffled = shuffle(['circle', 'square', 'triangle', 'rectangle']);
      const left = remainingItems(session, game);
      const leftShuffled = shuffle(left.slice());
      playAreaHtml = 
        '<div class="sorter-board">' +
          housesShuffled.map(function(sh) {
            return '<div class="sorter-slot" data-category="' + sh + '" tabindex="0">' +
              '<div class="sorter-house" style="background: ' + houseColors[sh] + ';">' +
                '<div class="sorter-hole" style="clip-path: ' + getClipPath(sh) + ';"></div>' +
              '</div>' +
              '<span class="sorter-label">' + getShapeName(sh) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="tray sorter-tray">' +
          leftShuffled.map(function (item) {
            return '<button type="button" class="card sorter-item" draggable="true" data-item-id="' + item.id + '">' +
              '<div class="sorter-shape" style="background:' + (item.color || '#ffd37a') + '; clip-path: ' + getClipPath(item.shape) + ';"></div>' +
              '</button>';
          }).join('') +
        '</div>';
    } 
    else if (layout === 'memory') {
      if (!session._deck) {
        session._deck = shuffle(game.items.map(function(item) { return item.id; }));
        Store.updateSession(session);
      }
      const leftIds = session._deck.filter(function(id) {
        return !session.attempts.some(function(a) { return a.itemId === id && a.correct; });
      });
      playAreaHtml = 
        '<div class="memory-board">' +
          leftIds.map(function(id) {
            const item = game.items.find(function(it){ return it.id === id; });
            return '<div class="memory-card" data-item-id="' + id + '">' +
              '<div class="memory-inner">' +
                '<div class="memory-front">?</div>' +
                '<div class="memory-back">' + pictureHtml(item) + '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>';
    }
    else if (layout === 'odd') {
      const rounds = Array.from(new Set(game.items.map(function(i){ return i.round; }))).sort(function(a,b){ return a-b; });
      let currentRound = rounds[rounds.length - 1];
      for (let r of rounds) {
        const oddItem = game.items.find(function(i){ return i.round === r && i.odd; });
        if (!session.attempts.some(function(a){ return a.itemId === oddItem.id && a.correct; })) {
          currentRound = r;
          break;
        }
      }
      
      const roundItems = shuffle(game.items.filter(function(i){ return i.round === currentRound; }));
      
      playAreaHtml = 
        '<div class="odd-board">' +
          roundItems.map(function(item) {
            return '<button type="button" class="card odd-card" data-item-id="' + item.id + '">' +
              pictureHtml(item) + '<span class="card-name">' + esc(item.name) + '</span></button>';
          }).join('') +
        '</div>';
    }
    else if (layout === 'sequence') {
      const left = remainingItems(session, game);
      // Перемешиваем оставшиеся карточки при каждом рендере, как в "Что лишнее?"
      const leftShuffled = shuffle(left.slice());
      const sortedItems = game.items.slice().sort(function(a,b){ return a.order - b.order; });
      playAreaHtml = 
        '<div class="seq-board">' +
          sortedItems.map(function(item, idx) {
            const isPlaced = session.attempts.some(function(a) { return a.itemId === item.id && a.correct; });
            return '<div class="seq-slot" data-index="' + idx + '" data-category="' + item.id + '">' +
              (isPlaced ? pictureHtml(item) : '<span class="seq-num">' + (idx+1) + '</span>') +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="tray" id="tray">' +
          leftShuffled.map(function (item) {
            return '<button type="button" class="card" draggable="true" data-item-id="' + item.id + '">' +
              pictureHtml(item) + '<span class="card-name">' + esc(item.name) + '</span></button>';
          }).join('') +
        '</div>';
    }
    else {
      const left = remainingItems(session, game);
      playAreaHtml = 
        '<div class="baskets">' +
          '<div class="basket a" data-category="a" tabindex="0"><span class="basket-icon" aria-hidden="true">~</span><strong>' + esc(game.category_a) + '</strong></div>' +
          '<div class="basket b" data-category="b" tabindex="0"><span class="basket-icon" aria-hidden="true">↓</span><strong>' + esc(game.category_b) + '</strong></div>' +
        '</div>' +
        '<div class="tray" id="tray">' +
          left.map(function (item) {
            return '<button type="button" class="card" draggable="true" data-item-id="' + item.id + '">' +
              pictureHtml(item) + '<span class="card-name">' + esc(item.name) + '</span></button>';
          }).join('') +
        '</div>';
    }

    let total = game.items.length;
    let correctCount = session.attempts.filter(function(a){ return a.correct; }).length;
    
    if (layout === 'odd') {
      const rounds = Array.from(new Set(game.items.map(function(i){ return i.round; })));
      total = rounds.length;
      correctCount = rounds.filter(function(r) {
        const oddItem = game.items.find(function(i){ return i.round === r && i.odd; });
        return session.attempts.some(function(a){ return a.itemId === oddItem.id && a.correct; });
      }).length;
    }
    
    root.innerHTML =
      '<div class="play">' +
        '<header class="play-bar">' +
          '<a class="exit" href="#/">Выйти</a>' +
          '<p class="eyebrow">' + (session.isPreview ? 'Пробуем сами' : 'Играет ' + esc(session.childName)) + '</p>' +
          '<h1>' + esc(game.question) + '</h1>' +
          '<p class="play-count" id="play-count">Осталось: ' + (total - correctCount) + '</p>' +
        '</header>' +
        playAreaHtml +
      '</div>';
      
    bindPlay(session, game);
  }

  function bindPlay(session, game) {
    let selected = null;
    let busy = false;
    const layout = game.layout || 'baskets';
    let memFirst = null;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(type) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
      }
    }

    function finishGame() {
      session.finishedAt = new Date().toISOString();
      Store.updateSession(session);
      go('/session/' + session.id);
    }

    function send(itemId, category, card) {
      if (busy) return;
      const item = game.items.find(function (it) { return it.id === itemId; });
      if (!item) return;
      busy = true;
      
      let correct = false;
      if (layout === 'sorter') correct = category === item.category;
      else if (layout === 'odd') correct = item.odd === true;
      else if (layout === 'sequence') {
        const idx = parseInt(category, 10);
        const sortedItems = game.items.slice().sort(function(a,b){ return a.order - b.order; });
        correct = sortedItems[idx].id === item.id;
      }
      else correct = category === item.category;

      session.attempts.push({ itemId: item.id, chosen: category, correct: correct });
      Store.updateSession(session);
      
      if (correct) {
        playSound('correct');
        if (card) card.classList.add('success-pop');
        setTimeout(function(){ 
          if (layout === 'odd') {
            const rounds = Array.from(new Set(game.items.map(function(i){ return i.round; }))).sort(function(a,b){ return a-b; });
            let hasMore = false;
            for (let r of rounds) {
              const oddItem = game.items.find(function(i){ return i.round === r && i.odd; });
              if (!session.attempts.some(function(a){ return a.itemId === oddItem.id && a.correct; })) {
                hasMore = true;
                break;
              }
            }
            if (hasMore) renderPlay(session.id);
            else finishGame();
          } else {
            const left = remainingItems(session, game);
            const counter = document.getElementById('play-count');
            if (counter) counter.textContent = 'Осталось: ' + left.length;
            if (left.length === 0) finishGame();
            else if (layout !== 'baskets') renderPlay(session.id);
          }
          busy = false;
        }, 400);
      } else {
        playSound('wrong');
        if (card) {
          card.classList.add('shake');
          setTimeout(function(){ 
            card.classList.remove('shake'); 
            busy = false; 
          }, 500);
        } else {
          busy = false;
        }
      }
      selected = null;
      document.querySelectorAll('.card').forEach(function (c) { c.classList.remove('picked'); });
    }

    if (layout === 'memory') {
      document.querySelectorAll('.memory-card').forEach(function(card) {
        card.onclick = function() {
          if (busy || card.classList.contains('flipped') || card.classList.contains('matched')) return;
          card.classList.add('flipped');
          playSound('correct');
          
          if (!memFirst) {
            memFirst = card;
          } else {
            if (memFirst === card) return;
            const id1 = memFirst.dataset.itemId;
            const id2 = card.dataset.itemId;
            const item1 = game.items.find(function(i){ return i.id === id1; });
            const item2 = game.items.find(function(i){ return i.id === id2; });
            
            if (item1.pair === item2.pair) {
              session.attempts.push({ itemId: id1, chosen: 'pair', correct: true });
              session.attempts.push({ itemId: id2, chosen: 'pair', correct: true });
              Store.updateSession(session);
              setTimeout(function(){
                memFirst.classList.add('matched');
                card.classList.add('matched');
                memFirst = null;
                const left = remainingItems(session, game);
                if (left.length === 0) finishGame();
              }, 500);
            } else {
              playSound('wrong');
              busy = true;
              setTimeout(function(){
                memFirst.classList.remove('flipped');
                card.classList.remove('flipped');
                memFirst = null;
                busy = false;
              }, 800);
            }
          }
        };
      });
      return;
    }

    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('click', function () {
        if (layout === 'odd') {
          send(card.dataset.itemId, 'odd', card);
        } else {
          document.querySelectorAll('.card').forEach(function (c) { c.classList.remove('picked'); });
          card.classList.add('picked');
          selected = card;
        }
      });
      card.addEventListener('dragstart', function (e) {
        if (layout === 'odd') return;
        selected = card;
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.dataset.itemId);
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', function () { card.classList.remove('dragging'); });
    });

    document.querySelectorAll('[data-category]').forEach(function (basket) {
      basket.addEventListener('dragover', function (e) { e.preventDefault(); basket.classList.add('over'); });
      basket.addEventListener('dragleave', function () { basket.classList.remove('over'); });
      basket.addEventListener('drop', function (e) {
        e.preventDefault(); basket.classList.remove('over');
        const id = e.dataTransfer.getData('text/plain') || (selected && selected.dataset.itemId);
        const card = document.querySelector('.card[data-item-id="' + id + '"]');
        if (id) {
           if (layout === 'sequence') send(id, basket.dataset.index, card);
           else send(id, basket.dataset.category, card);
        }
      });
      basket.addEventListener('click', function () {
        if (!selected) return;
        if (layout === 'sequence') send(selected.dataset.itemId, basket.dataset.index, selected);
        else send(selected.dataset.itemId, basket.dataset.category, selected);
      });
    });
  }

  function renderSession(id) {
    const session = Store.getSession(id);
    if (!session) { go('/'); return; }
    const game = Store.getGame(session.gameId);
    setChrome(false, game, session.isPreview ? 'preview' : 'child');
    root.className = 'wrap';

    if (getRole() === 'child') {
      const isMemory = game.layout === 'memory';
      const mistakes = isMemory ? 0 : session.attempts.filter(function (a) { return !a.correct; }).length;

      let resultTitle = 'Отличная работа!';
      let resultSub = isMemory ? 'Ты нашёл все пары!' : 'Ты не допустил ни одной ошибки!';
      if (!isMemory && mistakes > 0) {
        resultTitle = 'Игра завершена!';
        resultSub = 'Ты допустил ' + mistakes + ' ' + (mistakes === 1 ? 'ошибку' : mistakes < 5 ? 'ошибки' : 'ошибок');
      }

      root.innerHTML =
        '<article class="panel kid-result">' +
          '<p class="start-art" aria-hidden="true">🎉</p>' +
          '<h1>' + esc(session.childName || 'Молодец') + '</h1>' +
          '<div style="font-size: 2rem; margin: 20px 0;">' + resultTitle + '</div>' +
          '<div style="font-size: 1.5rem; font-weight: 800; color: ' + (mistakes > 0 ? 'var(--orange-d)' : 'var(--green-d)') + ';">' + resultSub + '</div>' +
          '<p style="margin-top: 30px;"><a class="btn orange big" href="#/child/' + game.id + '">Играть ещё раз</a></p>' +
          '<p><a class="btn ghost" href="#/">На главную</a></p>' +
        '</article>';
      return;
    }

    const isMemory = game.layout === 'memory';
    const missed = isMemory ? [] : missedForSession(session, game);
    const mistakes = isMemory ? 0 : session.attempts.filter(function(a){ return !a.correct; }).length;
    
    root.innerHTML =
      '<p class="eyebrow">' + (session.isPreview ? 'После проверки' : 'После игры') + '</p>' +
      '<h1>' + esc(session.childName) + '</h1>' +
      '<p class="muted">' + esc(game.title) + ' · ' + esc(fmtWhen(session.startedAt)) + '</p>' +
      (isMemory
        ? '<section class="panel ok-card"><h2>Все пары найдены</h2><p>Игра завершена.</p></section>'
        : '<p>Допущено ошибок: <strong>' + mistakes + '</strong></p>' +
          (missed.length
            ? '<section class="panel"><h2>Над чем поработать</h2>' +
              '<p>Эти предметы вызвали затруднения.</p>' +
              '<div class="cards-list">' + missed.map(function (row) {
                return '<div class="need-card"><div>' +
                  '<strong>' + esc(row.item.name) + '</strong>' +
                  '<p>' + esc(row.item.property_prompt) + '</p>' +
                  '<p class="muted">' + esc(row.item.explanation) + '</p></div></div>';
              }).join('') + '</div>' +
              '<p style="margin-top:16px"><a class="btn orange" href="#/editor/' + game.id + '">Поправить карточку</a></p></section>'
            : '<section class="panel ok-card"><h2>Идеальный результат!</h2><p>Ребёнок справился без ошибок.</p></section>')) +
      '<p class="actions"><a class="btn ghost" href="#/results/' + game.id + '">Все итоги</a><a class="btn ghost" href="#/">На начало</a></p>';
  }

  function renderResults(id) {
    const game = Store.getGame(id) || Store.currentGame();
    setChrome(false, game, 'results');
    const rows = discussion(game);
    const sessions = Store.sessionsFor(game.id, true);
    root.innerHTML =
      '<p class="eyebrow">Шаг 3 · Обсудить</p>' +
      '<h1>Что взять на ковёр</h1>' +
      '<p>Играли с детьми: <strong>' + sessions.length + '</strong>. Жёлтые карточки — то, что стоит ещё раз потрогать.</p>' +
      '<table class="table"><thead><tr><th>Предмет</th><th>На что смотреть</th><th>Кто ошибся</th><th></th></tr></thead><tbody>' +
      rows.map(function (row) {
        return '<tr class="' + (row.wrongCount ? 'need' : '') + '">' +
          '<td><strong>' + esc(row.item.name) + '</strong></td>' +
          '<td>' + esc(row.item.property_prompt) + '</td>' +
          '<td>' + (row.wrongCount ? esc(row.names.join(', ')) : '<span class="muted">Пока без ошибок</span>') + '</td>' +
          '<td><a href="#/editor/' + game.id + '">Исправить</a></td></tr>';
      }).join('') +
      '</tbody></table>' +
      '<h2>Проведения</h2><ul class="sessions">' +
      (sessions.length ? sessions.map(function (s) {
        return '<li><a href="#/session/' + s.id + '">' + esc(s.childName) + '</a><span class="muted">' + esc(fmtWhen(s.startedAt)) + '</span></li>';
      }).join('') : '<li class="muted">Никто не играл.</li>') +
      '</ul>';
  }

  function renderCards(id) {
    const game = Store.getGame(id) || Store.currentGame();
    setChrome(false, game, 'home');
    root.innerHTML =
      '<div class="no-print actions"><h1>Карточки</h1><button class="btn primary" type="button" id="print-btn">Печать</button><a class="btn ghost" href="#/">Назад</a></div>' +
      '<h2>' + esc(game.title) + '</h2>' +
      '<div class="card-sheet">' +
        game.items.map(function (item) {
          let vis = pictureHtml(item);
          if (game.layout === 'sorter' && item.shape) {
            vis = '<div class="print-shape" style="background:' + item.color + ';clip-path:' + getClipPath(item.shape) + '"></div>';
          }
          return '<div class="print-card"><div class="print-pic">' + vis + '</div><strong>' + esc(item.name) + '</strong></div>';
        }).join('') +
      '</div>';
    document.getElementById('print-btn').onclick = function () { window.print(); };
  }

  var routeGen = 0;
  var firstRoute = true;
  var lastViewKey = '';

  function viewKey() {
    return (location.hash || '#/') + '|' + getRole();
  }

  function applyRoute() {
    const parts0 = hashParts();
    const page0 = parts0[0] || '';
    const role = getRole();

    if (role === 'child') {
      if (['', 'child', 'play', 'session'].indexOf(page0) === -1) {
        history.replaceState(null, '', '#/');
      }
    } else if (page0 === 'child') {
      history.replaceState(null, '', '#/preview/' + (parts0[1] || ''));
    }

    root.className = 'wrap';
    const parts = hashParts();
    const page = parts[0] || '';

    if (!page) renderHome();
    else if (page === 'create') renderCreate();
    else if (page === 'create-type') renderCreateType();
    else if (page === 'editor') renderEditor(parts[1]);
    else if (page === 'preview') renderStart(parts[1], true);
    else if (page === 'child') renderStart(parts[1], false);
    else if (page === 'play') renderPlay(parts[1]);
    else if (page === 'session') renderSession(parts[1]);
    else if (page === 'results') renderResults(parts[1]);
    else if (page === 'cards') renderCards(parts[1]);
    else renderHome();
  }

  function showPage(gen) {
    if (gen !== routeGen) return;
    if (prefersReduceMotion()) {
      root.classList.remove('page-leave', 'page-enter');
      root.classList.add('page-show');
      return;
    }
    root.classList.remove('page-leave', 'page-show');
    root.classList.add('page-enter');
    afterPaint(function () {
      if (gen !== routeGen) return;
      root.classList.remove('page-enter');
      root.classList.add('page-show');
    });
  }

  function route() {
    const gen = ++routeGen;
    const sameView = !firstRoute && lastViewKey === viewKey();
    const skipOut = firstRoute || sameView || prefersReduceMotion();
    firstRoute = false;

    function swap() {
      if (gen !== routeGen) return;
      applyRoute();
      lastViewKey = viewKey();
      if (sameView) {
        root.classList.remove('page-leave', 'page-enter');
        root.classList.add('page-show');
        return;
      }
      showPage(gen);
    }

    if (skipOut) {
      swap();
      return;
    }

    root.classList.remove('page-show', 'page-in');
    root.classList.add('page-leave');

    let done = false;
    function finish() {
      if (done || gen !== routeGen) return;
      done = true;
      root.removeEventListener('transitionend', onEnd);
      swap();
    }
    function onEnd(e) {
      if (e.target !== root) return;
      if (e.propertyName && e.propertyName !== 'opacity' && e.propertyName !== 'transform') return;
      finish();
    }
    root.addEventListener('transitionend', onEnd);
    setTimeout(finish, 340);
  }

  document.getElementById('role-switch').addEventListener('click', function (e) {
    const btn = e.target.closest('.role-btn');
    if (btn) setRole(btn.dataset.role);
  });
  renderRoleSwitch();

  window.addEventListener('hashchange', route);
  route();
})();
