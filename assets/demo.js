(() => {
  'use strict';
  document.documentElement.classList.add('demo-enter');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const press = (buttons, key, value) => buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset[key] === value)));
  const saveText = (filename, content, status) => {
    try {
      const url = URL.createObjectURL(new Blob(['\uFEFF' + content], {type:'text/plain;charset=utf-8'}));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      // Give the browser time to consume the object URL without leaving it allocated.
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      if (status) status.textContent = 'Файл подготовлен. Проверьте загрузки браузера.';
    } catch {
      if (status) status.textContent = 'Не удалось сохранить файл. Вы можете скопировать выбранный список со страницы.';
    }
  };

  // The sequence is a real accessible tab control, independent of motion preference.
  const route = $('[data-visit-route]');
  if (route) {
    const tabs = $$('[data-visit-tab]', route);
    const panels = $$('[data-visit-panel]', route);
    const selectStep = (index, focus = false) => {
      tabs.forEach((tab, tabIndex) => {
        tab.setAttribute('aria-selected', String(tabIndex === index));
        tab.tabIndex = tabIndex === index ? 0 : -1;
      });
      panels.forEach((panel, panelIndex) => {
        panel.hidden = panelIndex !== index;
        panel.classList.toggle('route-enter', panelIndex === index);
      });
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectStep(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          selectStep(next, true);
        }
      });
    });
    $$('[data-visit-next]', route).forEach(button => button.addEventListener('click', () => {
      const active = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
      selectStep(Math.min(active + 1, tabs.length - 1), true);
    }));
  }

  const questionSets = {
    questions: {title:'Перед консультацией', goal:'Мой вопрос', list:['С чего начнётся знакомство?','Сколько времени выделить на разговор?','Что нужно взять с собой?','Как формируется стоимость консультации?']},
    routine: {title:'Перед плановым визитом', goal:'Плановый визит', list:['Как проходит плановое посещение?','Сколько времени оно займёт?','Что входит в стоимость?','Какие организационные детали нужно уточнить заранее?']},
    plan: {title:'При обсуждении плана', goal:'План лечения', list:['Какие варианты предлагаются?','В каком порядке идут этапы?','Из чего складывается стоимость?','Какие расходы могут возникнуть дополнительно?','Какие решения нужно принять сейчас?']}
  };
  let currentGoal = 'questions';
  const goalButtons = $$('[data-goal]');
  const chooseGoal = goal => {
    const data = questionSets[goal];
    if (!data) return;
    currentGoal = goal;
    press(goalButtons, 'goal', goal);
    const title = $('[data-question-title]');
    const list = $('[data-question-list]');
    if (title) title.textContent = data.title;
    if (list) list.replaceChildren(...data.list.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    const status = $('[data-question-status]');
    if (status) status.textContent = '';
  };
  goalButtons.forEach(button => button.addEventListener('click', () => chooseGoal(button.dataset.goal)));
  $$('[data-goal-link]').forEach(link => link.addEventListener('click', () => chooseGoal(link.dataset.goalLink)));
  $('[data-save-questions]')?.addEventListener('click', () => {
    const data = questionSets[currentGoal];
    saveText('voprosy-pered-vizitom.txt', `${data.title}\n\n${data.list.map((text, index) => `${index + 1}. ${text}`).join('\n')}\n\nМои дополнительные вопросы:\n\n\nПодготовлено в демонстрационном проекте «Тихо» / StanislavWeb.\nЭто список организационных вопросов, не медицинская рекомендация и не запись на приём.`, $('[data-question-status]'));
  });

  const products = {
    wood: {name:'Линия', image:'/assets/chair.jpg', width:1000, height:563, alt:'Стул из светлого дерева', heading:'Линия, которая держит форму.', description:'Округлая спинка, тонкие опоры и свободное пространство между ними. Выберите деталь, чтобы рассмотреть её ближе.', details:{whole:'Полный силуэт: как соотносятся спинка, сиденье и опоры.', back:'Плавный изгиб спинки. Свет подчёркивает линию края и рисунок дерева.', joint:'Место встречи опоры и сиденья. Несколько простых линий собираются в устойчивый силуэт.'}},
    shell: {name:'Объём', image:'/assets/interior.jpg', width:1400, height:667, alt:'Кресло со светлым цельным сиденьем', heading:'Объём, очерченный светом.', description:'Цельное сиденье и открытая конструкция основания. Мягкий контур становится заметнее рядом с тонкими линиями опор.', details:{whole:'Цельный объём сиденья и лёгкая графика основания.', back:'Плавный верхний контур и мягкий переход к подлокотникам.', joint:'Основание крупным планом: деревянные опоры и пересекающиеся линии креплений.'}}
  };
  const palettes = {
    light:{name:'Светлая', color:'#E7E5DE', description:'Светлая стена, мягкий белый и тёплое дерево. Спокойное сочетание с небольшим контрастом.'},
    stone:{name:'Каменная', color:'#AAA69D', description:'Сдержанный серый, мягкий белый и тёплое дерево. Предмет объединяет спокойные природные оттенки.'},
    dark:{name:'Тёмная', color:'#4A4740', description:'Тёмный фон, мягкий белый и тёплое дерево. Более выразительный контраст светлой поверхности и окружения.'}
  };
  const viewNames = {whole:'целиком', back:'спинка', joint:'соединение'};
  let currentProduct = 'wood';
  let currentView = 'whole';
  let currentPalette = 'light';
  const productButtons = $$('[data-product]');
  const viewButtons = $$('button[data-view]');
  const resetSelectionStatus = () => {
    const status = $('[data-selection-status]');
    if (status) status.textContent = '';
  };
  const showView = view => {
    if (!viewNames[view]) return;
    currentView = view;
    const product = products[currentProduct];
    press(viewButtons, 'view', view);
    const frame = $('[data-inspection-frame]');
    if (frame) frame.dataset.view = view;
    const label = $('[data-inspection-label]');
    if (label) label.textContent = `${product.name} / ${viewNames[view]}`;
    const description = $('[data-detail-description]');
    if (description) description.textContent = product.details[view];
    const image = $('[data-inspection-image]');
    if (image) image.alt = `${product.alt} — ${viewNames[view]}`;
  };
  const chooseProduct = name => {
    const data = products[name];
    if (!data) return;
    currentProduct = name;
    press(productButtons, 'product', name);
    const frame = $('[data-inspection-frame]');
    if (frame) frame.dataset.product = name;
    const image = $('[data-inspection-image]');
    if (image) {
      image.src = data.image;
      image.width = data.width;
      image.height = data.height;
    }
    const heading = $('[data-object-heading]');
    if (heading) heading.textContent = data.heading;
    const description = $('[data-object-description]');
    if (description) description.textContent = data.description;
    const selected = $('[data-selected-product]');
    if (selected) selected.textContent = data.name;
    showView('whole');
    resetSelectionStatus();
  };
  productButtons.forEach(button => button.addEventListener('click', () => chooseProduct(button.dataset.product)));
  $$('[data-product-link]').forEach(link => link.addEventListener('click', () => chooseProduct(link.dataset.productLink)));
  viewButtons.forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
  const paletteButtons = $$('button[data-palette]');
  paletteButtons.forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.palette;
    const data = palettes[name];
    if (!data) return;
    currentPalette = name;
    press(paletteButtons, 'palette', name);
    $('[data-palette-board]').dataset.paletteBoard = name;
    $('[data-wall-code]').textContent = data.color;
    $('[data-palette-description]').textContent = data.description;
    $('[data-selected-palette]').textContent = data.name;
    resetSelectionStatus();
  }));
  $('[data-save-selection]')?.addEventListener('click', () => {
    const product = products[currentProduct];
    const palette = palettes[currentPalette];
    saveText('forma-predmetny-etud.txt', `Предметный этюд / Форма\n\nПредмет: ${product.name}\nПалитра окружения: ${palette.name}\nЦвет стены: ${palette.color}\n\n${palette.description}\n\nМои заметки:\n\n\nДемонстрационный проект StanislavWeb.\nФотографии иллюстрируют дизайн сайта. Предметы не продаются, заказ не создан.\nПалитра описывает окружение и не меняет материал изделия.`, $('[data-selection-status]'));
  });
})();
