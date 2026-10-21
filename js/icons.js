window.ICONS = {
  stone: '<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="40" cy="48" rx="26" ry="18" fill="#8B7355"/><ellipse cx="40" cy="44" rx="22" ry="16" fill="#A89070"/><ellipse cx="32" cy="40" rx="6" ry="4" fill="#C4B08A" opacity=".7"/></svg>',
  feather: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M22 58 C28 20 62 18 58 22 C70 36 40 62 22 58 Z" fill="#F4E4B8" stroke="#C9A227" stroke-width="2"/><path d="M24 56 L56 24" stroke="#8B6914" stroke-width="2"/><path d="M32 48 L44 40 M36 52 L50 42 M40 56 L54 48" stroke="#D4B86A" stroke-width="1.5"/></svg>',
  coin: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="22" fill="#E2B007"/><circle cx="40" cy="40" r="16" fill="#F5D76E" stroke="#C9A227" stroke-width="2"/><text x="40" y="46" text-anchor="middle" font-size="18" font-family="Georgia" fill="#8B6914">₽</text></svg>',
  cork: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="28" y="18" width="24" height="44" rx="8" fill="#D4A574"/><rect x="30" y="22" width="20" height="8" rx="3" fill="#E8C9A0"/><line x1="32" y1="36" x2="48" y2="36" stroke="#B8865B" stroke-width="2"/><line x1="32" y1="46" x2="48" y2="46" stroke="#B8865B" stroke-width="2"/></svg>',
  sponge: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="16" y="26" width="48" height="30" rx="10" fill="#F4C430"/><circle cx="30" cy="38" r="4" fill="#E09B00" opacity=".7"/><circle cx="44" cy="42" r="5" fill="#E09B00" opacity=".55"/><circle cx="52" cy="34" r="3.5" fill="#E09B00" opacity=".6"/><circle cx="36" cy="48" r="3" fill="#E09B00" opacity=".5"/></svg>',
  spoon: '<svg viewBox="0 0 80 80" aria-hidden="true"><ellipse cx="28" cy="28" rx="14" ry="18" fill="#C0C6CE"/><rect x="36" y="36" width="8" height="28" rx="4" fill="#A8B0B8" transform="rotate(-35 40 50)"/><ellipse cx="28" cy="28" rx="9" ry="12" fill="#E8ECF0"/></svg>',
  leaf: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M20 50 C22 20 58 18 62 22 C58 58 28 64 20 50 Z" fill="#5BA85A"/><path d="M24 48 C28 28 50 26 56 28" fill="#7EC87C"/><path d="M22 50 L58 26" stroke="#2F6B32" stroke-width="2"/></svg>',
  foam: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="18" y="22" width="44" height="36" rx="6" fill="#F7E27A"/><rect x="22" y="26" width="36" height="10" fill="#FFF4B0"/><path d="M18 40 H62 M18 48 H62" stroke="#E6C84A" stroke-width="2"/></svg>',
  wood: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="14" y="30" width="52" height="20" rx="4" fill="#C68642"/><rect x="16" y="32" width="48" height="6" fill="#E0A96D" opacity=".7"/><ellipse cx="24" cy="40" rx="4" ry="6" fill="#A86B32" opacity=".5"/></svg>',
  key: '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="28" cy="32" r="12" fill="none" stroke="#C9A227" stroke-width="6"/><rect x="36" y="29" width="28" height="8" rx="3" fill="#E2B007"/><rect x="54" y="37" width="6" height="10" fill="#E2B007"/><rect x="46" y="37" width="6" height="8" fill="#E2B007"/></svg>',
  apple: '<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 24 C36 12 50 12 48 22 C62 24 66 52 40 62 C14 52 18 24 32 22 C34 14 44 14 40 24 Z" fill="#E24A3B"/><path d="M40 24 C42 16 50 16 50 22" stroke="#3D7A32" stroke-width="3" fill="none"/></svg>',
  box: '<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="18" y="28" width="44" height="32" rx="4" fill="#D9A066"/><polygon points="18,28 40,16 62,28" fill="#E8B87A"/></svg>'
};

window.ICON_CHOICES = [
  ['stone', 'Камень'],
  ['feather', 'Пёрышко'],
  ['coin', 'Монета'],
  ['cork', 'Пробка'],
  ['sponge', 'Губка'],
  ['spoon', 'Ложка'],
  ['leaf', 'Листок'],
  ['foam', 'Пенопласт'],
  ['wood', 'Брусок'],
  ['key', 'Ключ'],
  ['apple', 'Яблоко'],
  ['box', 'Коробка']
];

window.pictureHtml = function (item) {
  if (item.image) return '<img src="' + item.image + '" alt="">';
  if (item.emoji) return '<span style="font-size: 48px; line-height: 1;">' + item.emoji + '</span>';
  return '<span class="icon">' + (window.ICONS[item.icon_key] || window.ICONS.box) + '</span>';
};