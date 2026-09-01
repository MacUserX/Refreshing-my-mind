 const icons = () => lucide.createIcons();
const modal = document.getElementById('modal');
const toast = document.getElementById('toast');
const showToast = (message) => {
  toast.querySelector('span').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
};

const workspaceSwitcher = document.getElementById('workspace-switcher');
const workspaceMenu = document.getElementById('workspace-menu');
let activeWorkspace = localStorage.getItem('ledgerly-active-workspace') || 'northstar';
document.querySelector('.app-shell').dataset.workspace = activeWorkspace;
const applyWorkspaceTheme = (option) => {
  const shell = document.querySelector('.app-shell');
  ['--mint', '--mint-dark', '--soft-mint', '--navy', '--line'].forEach((property) => shell.style.removeProperty(property));
  if (option.dataset.mint) {
    shell.style.setProperty('--mint', option.dataset.mint);
    shell.style.setProperty('--mint-dark', option.dataset.mintDark);
    shell.style.setProperty('--soft-mint', option.dataset.softMint);
    shell.style.setProperty('--navy', option.dataset.navy);
    shell.style.setProperty('--line', option.dataset.line);
  }
};
const customWorkspaces = JSON.parse(localStorage.getItem('ledgerly-workspaces') || '[]');
customWorkspaces.forEach((workspace) => {
  const option = document.createElement('button');
  option.className = 'workspace-option';
  option.dataset.workspace = workspace.id;
  option.dataset.name = workspace.name;
  option.dataset.initials = workspace.initials;
  option.dataset.mint = workspace.mint;
  option.dataset.mintDark = workspace.mintDark;
  option.dataset.softMint = workspace.softMint;
  option.dataset.navy = workspace.navy;
  option.dataset.line = workspace.line;
  option.innerHTML = `<span class="workspace-avatar">${workspace.initials}</span><span><strong>${workspace.name}</strong><small>Custom workspace</small></span><i data-lucide="check"></i>`;
  workspaceMenu.appendChild(option);
});
const activeWorkspaceOption = document.querySelector(`.workspace-option[data-workspace="${activeWorkspace}"]`);
if (activeWorkspaceOption) {
  applyWorkspaceTheme(activeWorkspaceOption);
  document.querySelector('.workspace-switcher .workspace-avatar').textContent = activeWorkspaceOption.dataset.initials;
  document.getElementById('workspace-name').textContent = activeWorkspaceOption.dataset.name;
  activeWorkspaceOption.classList.add('selected');
}
const selectWorkspace = (option) => {
    applyWorkspaceTheme(option);
    const shell = document.querySelector('.app-shell');
    shell.dataset.workspace = option.dataset.workspace;
    activeWorkspace = option.dataset.workspace;
    localStorage.setItem('ledgerly-active-workspace', activeWorkspace);
    if (typeof savedTransactions !== 'undefined') {
      savedTransactions.splice(0, savedTransactions.length, ...JSON.parse(localStorage.getItem(transactionStorageKey()) || '[]'));
      updateMetrics();
      renderRecentTransactions();
    }
    document.getElementById('workspace-name').textContent = localStorage.getItem(`ledgerly-${activeWorkspace}-workspace-name`) || option.dataset.name;
    document.querySelector('.workspace-switcher .workspace-avatar').textContent = option.dataset.initials;
    document.querySelectorAll('.workspace-option').forEach((item) => item.classList.remove('selected'));
    option.classList.add('selected');
    workspaceMenu.classList.remove('open');
    workspaceSwitcher.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.workspace-option').forEach((item) => item.classList.toggle('selected', item === option));
    if (moduleView?.classList.contains('module-visible')) renderModule(document.getElementById('breadcrumb-title').textContent);
    showToast(`${option.dataset.name} workspace selected`);
};
workspaceSwitcher.addEventListener('click', () => {
  const isOpen = workspaceMenu.classList.toggle('open');
  workspaceSwitcher.setAttribute('aria-expanded', String(isOpen));
});
workspaceMenu.addEventListener('click', (event) => {
  const option = event.target.closest('.workspace-option');
  if (option) selectWorkspace(option);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.workspace-area')) workspaceMenu.classList.remove('open');
});

const workspaceEditor = document.createElement('div');
workspaceEditor.className = 'modal-backdrop';
workspaceEditor.id = 'workspace-editor';
workspaceEditor.innerHTML = '<div class="modal"><div class="modal-heading"><div><span class="modal-kicker">Workspace setup</span><h2>New workspace</h2></div><button class="close-btn" id="close-workspace-editor"><i data-lucide="x"></i></button></div><form id="workspace-form"><label>Workspace name<input name="name" required placeholder="e.g. Summit Labs" /></label><label>Visual style<select name="theme"><option value="sage">Sage / calm</option><option value="coral">Coral / creative</option><option value="blue">Blue / commerce</option></select></label><div class="modal-actions"><button type="button" class="secondary-btn" id="cancel-workspace">Cancel</button><button class="primary-btn" type="submit"><i data-lucide="plus"></i> Create workspace</button></div></form></div>';
document.body.appendChild(workspaceEditor);
const workspaceForm = document.getElementById('workspace-form');
const workspaceThemes = { sage: ['#52c9ae', '#198a73', '#e7f7f2', '#203c47', '#e8eeec'], coral: ['#e98970', '#bf5c47', '#fff0eb', '#4a3030', '#eee6e2'], blue: ['#6097d7', '#3b6eab', '#eaf2fc', '#233b5b', '#e4ebf2'] };
const closeWorkspaceEditor = () => workspaceEditor.classList.remove('open');
document.getElementById('add-workspace').addEventListener('click', () => { workspaceMenu.classList.remove('open'); workspaceEditor.classList.add('open'); workspaceForm.reset(); });
document.getElementById('close-workspace-editor').addEventListener('click', closeWorkspaceEditor);
document.getElementById('cancel-workspace').addEventListener('click', closeWorkspaceEditor);
workspaceEditor.addEventListener('click', (event) => { if (event.target === workspaceEditor) closeWorkspaceEditor(); });
workspaceForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(workspaceForm);
  const name = form.get('name').trim();
  const theme = workspaceThemes[form.get('theme')];
  const workspace = { id: `workspace-${crypto.randomUUID()}`, name, initials: name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase(), mint: theme[0], mintDark: theme[1], softMint: theme[2], navy: theme[3], line: theme[4] };
  customWorkspaces.push(workspace);
  localStorage.setItem('ledgerly-workspaces', JSON.stringify(customWorkspaces));
  const option = document.createElement('button');
  option.className = 'workspace-option';
  Object.entries({ workspace: workspace.id, name: workspace.name, initials: workspace.initials, mint: workspace.mint, mintDark: workspace.mintDark, softMint: workspace.softMint, navy: workspace.navy, line: workspace.line }).forEach(([key, value]) => { option.dataset[key] = value; });
  option.innerHTML = `<span class="workspace-avatar">${workspace.initials}</span><span><strong>${workspace.name}</strong><small>Custom workspace</small></span><i data-lucide="check"></i>`;
  workspaceMenu.insertBefore(option, document.getElementById('add-workspace'));
  closeWorkspaceEditor();
  selectWorkspace(option);
  icons();
  showToast(`${name} workspace created`);
});

const settingsModal = document.getElementById('settings-modal');
const closeSettings = () => settingsModal.classList.remove('open');
document.getElementById('settings-btn').addEventListener('click', () => {
  settingsModal.classList.add('open');
  document.getElementById('settings-form').elements.workspaceName.value = document.getElementById('workspace-name').textContent;
});
document.getElementById('close-settings').addEventListener('click', closeSettings);
document.getElementById('cancel-settings').addEventListener('click', closeSettings);
settingsModal.addEventListener('click', (event) => { if (event.target === settingsModal) closeSettings(); });
document.getElementById('settings-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  const workspaceName = form.get('workspaceName');
  const currency = form.get('currency');
  document.getElementById('workspace-name').textContent = workspaceName;
  localStorage.setItem(`ledgerly-${activeWorkspace}-workspace-name`, workspaceName);
  localStorage.setItem(`ledgerly-${activeWorkspace}-currency`, currency);
  document.body.classList.toggle('compact-rows', form.get('compact') === 'on');
  closeSettings();
  showToast(`Settings saved · ${currency}`);
});
const savedWorkspaceName = localStorage.getItem(`ledgerly-${activeWorkspace}-workspace-name`);
if (savedWorkspaceName) document.getElementById('workspace-name').textContent = savedWorkspaceName;
const savedCurrency = localStorage.getItem(`ledgerly-${activeWorkspace}-currency`);
if (savedCurrency) document.querySelector('#settings-form select[name="currency"]').value = savedCurrency;

const workspaceTransactionDefaults = {
  northstar: [
    ['Stripe payout', 'Sales income', 'Aug 22, 2025', 'completed', '+$8,420.00', 'credit-card', 'teal', 'Stripe •••• 4821'],
    ['WeWork office rent', 'Rent & utilities', 'Aug 21, 2025', 'completed', '-$2,400.00', 'building-2', 'purple', 'WeWork Inc.'],
    ['LinkedIn Ads', 'Marketing', 'Aug 20, 2025', 'pending', '-$680.25', 'megaphone', 'yellow-icon', 'Marketing card •••• 1092'],
    ['Acme Corp. invoice #1048', 'Consulting revenue', 'Aug 18, 2025', 'overdue', '+$4,800.00', 'briefcase-business', 'blue', 'Accounts receivable']
  ],
  atlas: [
    ['Figma subscription', 'Software', 'Aug 22, 2025', 'completed', '-$145.00', 'layers', 'purple', 'Design tools'],
    ['Studio retainer', 'Sales income', 'Aug 21, 2025', 'completed', '+$6,800.00', 'briefcase-business', 'teal', 'Atlas client payment'],
    ['Print vendor deposit', 'Production', 'Aug 19, 2025', 'pending', '-$920.00', 'receipt-text', 'yellow-icon', 'Production card •••• 3140'],
    ['Morrow & Co. invoice #228', 'Creative services', 'Aug 17, 2025', 'overdue', '+$3,200.00', 'file-text', 'blue', 'Accounts receivable']
  ],
  ember: [
    ['Shopify payout', 'Online sales', 'Aug 22, 2025', 'completed', '+$12,480.00', 'shopping-bag', 'teal', 'Shopify •••• 7762'],
    ['Warehouse lease', 'Rent & utilities', 'Aug 21, 2025', 'completed', '-$4,100.00', 'building-2', 'purple', 'Ember warehouse'],
    ['Meta Ads', 'Marketing', 'Aug 20, 2025', 'pending', '-$1,240.50', 'megaphone', 'yellow-icon', 'Marketing card •••• 6018'],
    ['Kite Supply invoice #805', 'Inventory', 'Aug 18, 2025', 'overdue', '-$2,860.00', 'package', 'blue', 'Accounts payable']
  ]
};
const createTransactionRow = (transaction) => {
  const [description, category, date, status, amount, icon, color, detail] = transaction;
  const row = document.createElement('tr');
  row.innerHTML = `<td><div class="transaction-name"><span class="transaction-icon ${color}"><i data-lucide="${icon}"></i></span><span><strong>${description}</strong><small>${detail}</small></span></div></td><td>${category}</td><td>${date}</td><td><span class="status ${status}"><i></i> ${status.charAt(0).toUpperCase() + status.slice(1)}</span></td><td class="amount ${amount.startsWith('+') ? 'positive-amount' : ''}">${amount}</td>`;
  return row;
};
const renderRecentTransactions = () => {
  const list = document.getElementById('transaction-list');
  if (!list) return;
  list.innerHTML = '';
  const defaults = workspaceTransactionDefaults[activeWorkspace] || [];
  defaults.forEach((transaction) => list.appendChild(createTransactionRow(transaction)));
  savedTransactions.forEach((transaction) => {
    const row = document.createElement('tr');
    row.dataset.transactionId = transaction.id;
    row.dataset.amount = transaction.amount;
    row.dataset.type = transaction.type;
    row.innerHTML = `<td><div class="transaction-name"><span class="transaction-icon teal"><i data-lucide="circle-plus"></i></span><span><strong>${transaction.description}</strong><small>Saved transaction</small></span></div></td><td>${transaction.category}</td><td>Aug 22, 2025</td><td><span class="status completed"><i></i> Completed</span></td><td class="amount ${transaction.type === 'income' ? 'positive-amount' : ''}">${formatTransactionAmount(transaction.amount, transaction.type)}</td><td class="row-actions"><button type="button" class="row-action edit-transaction" title="Edit transaction"><i data-lucide="pencil"></i></button><button type="button" class="row-action delete-transaction" title="Delete transaction"><i data-lucide="trash-2"></i></button></td>`;
    list.appendChild(row);
  });
  icons();
};

const moduleView = document.createElement('section');
moduleView.id = 'module-view';
moduleView.className = 'module-view';
document.querySelector('.page-heading').after(moduleView);
const moduleEditor = document.createElement('div');
moduleEditor.className = 'modal-backdrop';
moduleEditor.id = 'module-editor';
moduleEditor.innerHTML = '<div class="modal"><div class="modal-heading"><div><span class="modal-kicker">Record editor</span><h2 id="module-editor-title">Add record</h2></div><button class="close-btn" id="close-module-editor"><i data-lucide="x"></i></button></div><form id="module-editor-form"><label>Record name<input name="name" required placeholder="e.g. Acme Corp." /></label><label>Details<input name="details" required placeholder="e.g. Primary contact" /></label><div class="form-row"><label>Value<input name="value" required placeholder="e.g. $4,800.00" /></label><label>Status<input name="status" required placeholder="e.g. Active" /></label></div><div class="modal-actions"><button type="button" class="secondary-btn" id="cancel-module-editor">Cancel</button><button class="primary-btn" type="submit"><i data-lucide="save"></i> Save record</button></div></form></div>';
document.body.appendChild(moduleEditor);
const moduleEditorForm = document.getElementById('module-editor-form');
let editingModuleRecord = null;
let activeModuleView = null;
const moduleStorageKey = (view, suffix = '') => `ledgerly-${activeWorkspace}-${view.toLowerCase().replace(/[^a-z]+/g, '-')}${suffix}`;
const getModuleItems = (view) => {
  const storedItems = JSON.parse(localStorage.getItem(moduleStorageKey(view)) || 'null');
  return storedItems || moduleData[view].items.map((item) => [...item]);
};
const saveModuleItems = (view, items) => localStorage.setItem(moduleStorageKey(view), JSON.stringify(items));
const addModuleChange = (view, change) => {
  const key = moduleStorageKey(view, '-changes');
  const changes = JSON.parse(localStorage.getItem(key) || 'null') || [];
  changes.unshift(`${change}`);
  localStorage.setItem(key, JSON.stringify(changes.slice(0, 5)));
};
const openModuleEditor = (view, record = null) => {
  activeModuleView = view;
  editingModuleRecord = record;
  document.getElementById('module-editor-title').textContent = record ? `Edit ${view.slice(0, -1)}` : `Add ${view.slice(0, -1)}`;
  moduleEditorForm.elements.name.value = record?.[0] || '';
  moduleEditorForm.elements.details.value = record?.[1] || '';
  moduleEditorForm.elements.value.value = record?.[2] || '';
  moduleEditorForm.elements.status.value = record?.[3] || 'Active';
  moduleEditor.classList.add('open');
};
document.getElementById('close-module-editor').addEventListener('click', () => moduleEditor.classList.remove('open'));
document.getElementById('cancel-module-editor').addEventListener('click', () => moduleEditor.classList.remove('open'));
moduleEditor.addEventListener('click', (event) => { if (event.target === moduleEditor) moduleEditor.classList.remove('open'); });
moduleEditorForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(moduleEditorForm);
  const record = [form.get('name'), form.get('details'), form.get('value'), form.get('status')];
  const items = getModuleItems(activeModuleView);
  if (editingModuleRecord) {
    const index = items.findIndex((item) => item[0] === editingModuleRecord[0]);
    items[index] = record;
    addModuleChange(activeModuleView, `${record[0]} updated: ${record[2]} · ${record[3]}`);
  } else {
    items.unshift(record);
    addModuleChange(activeModuleView, `${record[0]} added: ${record[2]} · ${record[3]}`);
  }
  saveModuleItems(activeModuleView, items);
  moduleEditor.classList.remove('open');
  renderModule(activeModuleView);
  showToast(`${record[0]} saved successfully`);
});
const moduleData = {
  Invoices: {
    icon: 'file-text', summary: [['Outstanding', '$26,480.00'], ['Overdue', '3 invoices'], ['Collected this month', '$18,240.00']],
    items: [['INV-1048', 'Acme Corp.', '$4,800.00', 'Overdue'], ['INV-1047', 'Brightline Ltd.', '$8,420.00', 'Paid'], ['INV-1046', 'Cedar Labs', '$6,300.00', 'Sent']],
    changes: ['INV-1048 payment terms changed from 15 to 30 days', 'INV-1047 marked as paid', 'INV-1045 due date moved to Aug 28']
  },
  Bills: {
    icon: 'receipt-text', summary: [['Due this week', '$6,280.00'], ['Open bills', '12 bills'], ['Paid this month', '$14,920.00']],
    items: [['BILL-228', 'WeWork Inc.', '$2,400.00', 'Due soon'], ['BILL-227', 'AWS Cloud', '$1,280.00', 'Scheduled'], ['BILL-226', 'LinkedIn Ads', '$680.25', 'Pending']],
    changes: ['BILL-228 amount changed from $2,200 to $2,400', 'BILL-227 payment scheduled for Aug 25', 'BILL-224 category changed to Software']
  },
  Contacts: {
    icon: 'contact-round', summary: [['Active contacts', '48 contacts'], ['New this month', '6 contacts'], ['Needs attention', '3 contacts']],
    items: [['Acme Corp.', 'Maya Chen · Finance', 'maya@acme.co', 'Customer'], ['Cedar Labs', 'Jon Bell · Operations', 'jon@cedarlabs.io', 'Customer'], ['WeWork Inc.', 'Sam Rivera · Accounts', 'sam@wework.com', 'Vendor']],
    changes: ['Maya Chen email changed to maya@acme.co', 'Cedar Labs contact owner changed to Alex Rivera', 'WeWork Inc. marked as a vendor']
  },
  Transactions: {
    summary: [['This month', '$104,620.00'], ['Income', '$72,840.00'], ['Expenses', '$31,780.00']],
    items: [['Stripe payout', 'Sales income', '+$8,420.00', 'Completed'], ['WeWork office rent', 'Rent & utilities', '-$2,400.00', 'Completed'], ['LinkedIn Ads', 'Marketing', '-$680.25', 'Pending']],
    changes: ['Stripe payout reconciled with bank feed', 'LinkedIn Ads marked as pending review', 'WeWork office rent categorized as Rent & utilities']
  },
  'Profit & Loss': {
    action: 'Export report', summary: [['Revenue', '$112,840.00'], ['Operating expenses', '$74,679.75'], ['Net profit', '$38,160.25']],
    items: [['Revenue', 'Sales and consulting income', '$112,840.00', 'Updated'], ['Operating expenses', 'Rent, marketing and software', '$74,679.75', 'Updated'], ['Net profit', 'Revenue less expenses', '$38,160.25', 'Current']],
    changes: ['Net profit recalculated after latest transaction', 'Marketing expense updated to $680.25', 'Revenue report refreshed for August']
  },
  'Balance Sheet': {
    action: 'Export report', summary: [['Total assets', '$138,420.40'], ['Total liabilities', '$46,610.75'], ['Owner equity', '$91,809.65']],
    items: [['Cash and equivalents', 'Operating cash accounts', '$84,290.40', 'Current'], ['Receivables', 'Open customer invoices', '$26,480.00', 'Current'], ['Payables', 'Outstanding vendor bills', '$12,610.75', 'Current']],
    changes: ['Cash balance updated from latest ledger entries', 'Receivables reconciled with invoice INV-1048', 'Payables refreshed after BILL-228 update']
  },
  'Tax Summary': {
    action: 'Export report', summary: [['Taxable revenue', '$96,420.00'], ['Estimated tax', '$14,463.00'], ['Filing status', 'On track']],
    items: [['Sales tax collected', 'August 2025', '$9,240.00', 'Ready'], ['Deductible expenses', 'August 2025', '$32,610.75', 'Reviewed'], ['Estimated tax due', 'Q3 filing', '$14,463.00', 'Upcoming']],
    changes: ['Taxable revenue updated after Acme invoice', 'Deductible marketing expense added', 'Q3 estimate reviewed by Alex Rivera']
  }
};
const renderModule = (view) => {
  const data = moduleData[view];
  const isTransactions = view === 'Transactions';
  const transactionItems = savedTransactions.length ? savedTransactions.map((transaction) => [transaction.id, transaction.description, formatTransactionAmount(transaction.amount, transaction.type), 'Completed']) : data.items;
  const items = isTransactions ? transactionItems : getModuleItems(view);
  const invoiceSummary = view === 'Invoices' ? [
    ['Outstanding', formatMetric(items.filter((item) => item[3].toLowerCase() !== 'paid').reduce((total, item) => total + Number(item[2].replace(/[^0-9.-]+/g, '')), 0))],
    ['Overdue', `${items.filter((item) => item[3].toLowerCase() === 'overdue').length} invoices`],
    ['Collected this month', formatMetric(items.filter((item) => item[3].toLowerCase() === 'paid').reduce((total, item) => total + Number(item[2].replace(/[^0-9.-]+/g, '')), 0))]
  ] : data.summary;
  const billSummary = view === 'Bills' ? [
    ['Due this week', formatMetric(items.filter((item) => item[3].toLowerCase() === 'due soon').reduce((total, item) => total + Number(item[2].replace(/[^0-9.-]+/g, '')), 0))],
    ['Open bills', `${items.filter((item) => item[3].toLowerCase() !== 'paid').length} bills`],
    ['Paid this month', formatMetric(items.filter((item) => item[3].toLowerCase() === 'paid').reduce((total, item) => total + Number(item[2].replace(/[^0-9.-]+/g, '')), 0))]
  ] : data.summary;
  const contactSummary = view === 'Contacts' ? (() => {
    const addedContacts = Math.max(0, items.length - data.items.length);
    const attentionContacts = items.filter((item) => item[3].toLowerCase().includes('attention')).length;
    return [
      ['Active contacts', `${48 + addedContacts} contacts`],
      ['New this month', `${6 + addedContacts} contacts`],
      ['Needs attention', `${3 + attentionContacts} contacts`]
    ];
  })() : data.summary;
  const moduleSummary = view === 'Invoices' ? invoiceSummary : view === 'Bills' ? billSummary : contactSummary;
  const storedChanges = JSON.parse(localStorage.getItem(moduleStorageKey(view, '-changes')) || 'null') || [];
  const action = data.action || `Add ${view.slice(0, -1)}`;
  moduleView.innerHTML = `<div class="module-summary">${moduleSummary.map(([label, value]) => `<div class="module-stat"><span>${label}</span><strong>${value}</strong></div>`).join('')}</div><div class="module-columns"><article class="panel module-panel"><div class="panel-header"><div><h2>${view}</h2><p>Review and update your ${view.toLowerCase()} records.</p></div><button class="primary-btn module-add"><i data-lucide="${data.action ? 'download' : 'plus'}"></i> ${action}</button></div><div class="module-table">${items.map(([id, name, amount, status]) => `<div class="module-row"><div><strong>${id}</strong><span>${name}</span></div><strong>${amount}</strong><span class="module-status">${status}</span><button class="row-action module-edit" data-edit="${id}" title="Edit ${view.slice(0, -1).toLowerCase()}"><i data-lucide="pencil"></i></button></div>`).join('')}</div></article><article class="panel changes-panel"><div class="panel-header"><div><h2>Recent changes</h2><p>Latest edits in this module</p></div><i data-lucide="history"></i></div><div class="change-list" id="module-changes">${[...storedChanges, ...data.changes].slice(0, 5).map((change) => `<div class="change-item"><span></span><p>${change}<small>${storedChanges.includes(change) ? 'Just now' : 'Earlier today'}</small></p></div>`).join('')}</div></article></div>`;
  moduleView.querySelector('.module-add').addEventListener('click', () => {
    if (data.action) showToast(`${view} report exported`);
    else if (isTransactions) document.getElementById('new-transaction-btn').click();
    else openModuleEditor(view);
  });
  moduleView.querySelectorAll('.module-edit').forEach((button) => button.addEventListener('click', () => {
    if (isTransactions) {
      const transaction = savedTransactions.find((item) => item.id === button.dataset.edit);
      if (!transaction) return showToast('Sample transaction cannot be edited');
      editingTransactionId = transaction.id;
      transactionForm.elements.description.value = transaction.description;
      transactionForm.elements.amount.value = transaction.amount;
      transactionForm.elements.type.value = transaction.type;
      transactionForm.elements.category.value = transaction.category;
      transactionForm.closest('.modal').querySelector('h2').textContent = 'Edit transaction';
      modal.classList.add('open');
      return;
    }
    const record = getModuleItems(view).find((item) => item[0] === button.dataset.edit);
    if (record) openModuleEditor(view, record);
  }));
  icons();
};

document.querySelectorAll('.nav-item[data-view]').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item[data-view]').forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
    const view = item.dataset.view;
    document.getElementById('breadcrumb-title').textContent = view;
    document.getElementById('page-title').innerHTML = view === 'Overview' ? 'Good morning, Alex <span>✦</span>' : view;
    const moduleView = document.getElementById('module-view');
    const dashboardSections = document.querySelectorAll('.metric-grid, .main-grid, .transactions-panel');
    if (['Transactions', 'Invoices', 'Bills', 'Contacts', 'Profit & Loss', 'Balance Sheet', 'Tax Summary'].includes(view)) {
      dashboardSections.forEach((section) => section.classList.add('module-hidden'));
      moduleView.classList.add('module-visible');
      renderModule(view);
    } else {
      dashboardSections.forEach((section) => section.classList.remove('module-hidden'));
      moduleView.classList.remove('module-visible');
    }
    showToast(`${view} view selected`);
  });
});

document.querySelectorAll('.period').forEach((period) => {
  period.addEventListener('click', () => {
    document.querySelectorAll('.period').forEach((button) => button.classList.remove('active'));
    period.classList.add('active');
    showToast(`Showing ${period.textContent} of cash flow`);
  });
});

document.getElementById('export-btn').addEventListener('click', () => {
  const prefix = `ledgerly-${activeWorkspace}-`;
  const data = {};
  Object.keys(localStorage).filter((key) => key.startsWith(prefix)).forEach((key) => { data[key.slice(prefix.length)] = JSON.parse(localStorage.getItem(key)); });
  data.transactions = savedTransactions;
  const backup = { type: 'ledgerly-workspace-backup', version: 1, exportedAt: new Date().toISOString(), workspace: { id: activeWorkspace, name: document.getElementById('workspace-name').textContent, theme: document.querySelector('.app-shell').dataset.workspace }, data };
  const downloadUrl = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' }));
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = `ledgerly-${activeWorkspace}-backup-${new Date().toISOString().slice(0, 10)}.json`;
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadUrl);
  showToast('Workspace backup downloaded');
});
document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    if (file.name.toLowerCase().endsWith('.csv')) {
      const lines = text.trim().split(/\r?\n/).slice(1);
      const imported = lines.map((line) => line.split(',').map((cell) => cell.replace(/^"|"$/g, '').replace(/""/g, '"'))).filter((cells) => cells.length >= 5).map((cells) => ({ id: crypto.randomUUID(), description: cells[0], category: cells[1], amount: cells[4].replace(/[^0-9.-]+/g, ''), type: cells[4].trim().startsWith('+') ? 'income' : 'expense' }));
      savedTransactions.splice(0, savedTransactions.length, ...imported);
      localStorage.setItem(transactionStorageKey(), JSON.stringify(savedTransactions));
      updateMetrics();
      renderRecentTransactions();
    } else {
      const backup = JSON.parse(text);
      if (backup.type !== 'ledgerly-workspace-backup' || !backup.data) throw new Error('Invalid Ledgerly backup');
      const prefix = `ledgerly-${activeWorkspace}-`;
      Object.keys(localStorage).filter((key) => key.startsWith(prefix)).forEach((key) => localStorage.removeItem(key));
      Object.entries(backup.data).forEach(([key, value]) => localStorage.setItem(`${prefix}${key}`, JSON.stringify(value)));
      savedTransactions.splice(0, savedTransactions.length, ...(backup.data.transactions || []));
      document.getElementById('workspace-name').textContent = backup.workspace?.name || document.getElementById('workspace-name').textContent;
      if (backup.data.currency) document.querySelector('#settings-form select[name="currency"]').value = backup.data.currency;
      updateMetrics();
      renderRecentTransactions();
    }
    if (moduleView?.classList.contains('module-visible')) renderModule(document.getElementById('breadcrumb-title').textContent);
    event.target.value = '';
    showToast('Workspace data imported successfully');
  } catch (error) {
    event.target.value = '';
    showToast('Import failed: choose a Ledgerly JSON or CSV file');
  }
});
document.getElementById('view-all-btn').addEventListener('click', () => showToast('Opening full transaction history'));
document.querySelector('.help-button').addEventListener('click', () => showToast('Support center opened'));
document.querySelector('.icon-btn').addEventListener('click', () => showToast('You are all caught up'));
document.querySelector('.avatar-button').addEventListener('click', () => showToast('Profile menu opened'));
document.querySelector('.account-panel .text-btn').addEventListener('click', () => showToast('Account details opened'));
document.querySelectorAll('.more-btn').forEach((button) => {
  button.addEventListener('click', () => showToast('More options opened'));
});
document.querySelector('.sidebar-footer .nav-item:nth-child(2)').addEventListener('click', () => showToast('Help center opened'));
document.querySelector('.user-profile').addEventListener('click', () => showToast('Profile settings opened'));
const filterButton = document.querySelector('.filter-btn');
const filterWrap = document.createElement('div');
filterWrap.className = 'filter-wrap';
filterButton.parentNode.insertBefore(filterWrap, filterButton);
filterWrap.appendChild(filterButton);
const filterPopover = document.createElement('div');
filterPopover.className = 'filter-popover';
filterPopover.innerHTML = '<label>Status<select id="status-filter"><option value="all">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="overdue">Overdue</option></select></label><label>Category<select id="category-filter"><option value="all">All categories</option><option value="Sales income">Sales income</option><option value="Rent & utilities">Rent & utilities</option><option value="Marketing">Marketing</option><option value="Consulting revenue">Consulting revenue</option></select></label><div class="filter-popover-actions"><button type="button" class="text-btn" id="clear-filter">Clear</button><button type="button" class="primary-btn" id="apply-filter">Apply filters</button></div>';
filterWrap.appendChild(filterPopover);
filterButton.id = 'filter-btn';
filterButton.setAttribute('aria-expanded', 'false');
const applyFilters = () => {
  const status = document.getElementById('status-filter').value;
  const category = document.getElementById('category-filter').value;
  document.querySelectorAll('#transaction-list tr').forEach((row) => {
    const matchesStatus = status === 'all' || row.querySelector('.status')?.classList.contains(status);
    const matchesCategory = category === 'all' || row.cells[1]?.textContent.trim() === category;
    row.hidden = !(matchesStatus && matchesCategory);
  });
  filterPopover.classList.remove('open');
  filterButton.setAttribute('aria-expanded', 'false');
  showToast('Transaction filters applied');
};
filterButton.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = filterPopover.classList.toggle('open');
  filterButton.setAttribute('aria-expanded', String(isOpen));
});
document.getElementById('apply-filter').addEventListener('click', applyFilters);
document.getElementById('clear-filter').addEventListener('click', () => {
  document.getElementById('status-filter').value = 'all';
  document.getElementById('category-filter').value = 'all';
  document.querySelectorAll('#transaction-list tr').forEach((row) => { row.hidden = false; });
  filterPopover.classList.remove('open');
  filterButton.setAttribute('aria-expanded', 'false');
  showToast('Transaction filters cleared');
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.filter-wrap')) filterPopover.classList.remove('open');
});

document.getElementById('transaction-search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  document.querySelectorAll('#transaction-list tr').forEach((row) => {
    row.hidden = !row.textContent.toLowerCase().includes(query);
  });
});

const closeModal = () => modal.classList.remove('open');
const transactionForm = document.getElementById('transaction-form');
let editingTransactionId = null;
const transactionStorageKey = () => `ledgerly-${activeWorkspace}-transactions`;
const savedTransactions = JSON.parse(localStorage.getItem(transactionStorageKey()) || '[]');
const formatTransactionAmount = (value, type) => {
  const amount = Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return `${type === 'income' ? '+' : '-'}${amount}`;
};
const formatMetric = (value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const updateDashboardVisuals = (income, expenses) => {
  const movement = 104620 + income + expenses;
  const movementLabel = document.querySelector('.chart-legend strong');
  if (movementLabel) movementLabel.firstChild.textContent = `${formatMetric(movement)} `;
  const health = Math.max(0, Math.min(99, Math.round(84 + (income - expenses) / 1000)));
  const ring = document.querySelector('.ring');
  if (ring) {
    ring.style.background = `conic-gradient(var(--mint) 0 ${health}%, #eaf1ef ${health}% 100%)`;
    const healthValue = ring.querySelector('strong');
    healthValue.firstChild.textContent = `${health}`;
    const accountPanel = document.querySelector('.account-panel');
    accountPanel.classList.remove('health-updated');
    void accountPanel.offsetWidth;
    accountPanel.classList.add('health-updated');
  }
  const healthStatus = document.querySelectorAll('.health-list strong');
  if (healthStatus.length >= 3) {
    healthStatus[0].textContent = health >= 84 ? 'Strong' : 'Watch';
    healthStatus[1].textContent = income > 0 ? 'Growing' : 'On track';
    healthStatus[2].textContent = expenses > 0 ? 'Review soon' : 'Due soon';
  }
  const incomePath = document.querySelector('.income-line');
  const expensePath = document.querySelector('.expense-line');
  if (incomePath && expensePath) {
    const incomeLift = Math.min(40, income / 500);
    const expenseLift = Math.min(40, expenses / 500);
    incomePath.setAttribute('d', `M0,155 C42,${141 - incomeLift / 2} 66,${159 - incomeLift / 2} 105,${119 - incomeLift} S161,${91 - incomeLift} 200,${119 - incomeLift} S257,${107 - incomeLift} 298,${78 - incomeLift} S355,${98 - incomeLift} 396,${70 - incomeLift} S452,${87 - incomeLift} 496,${49 - incomeLift} S555,${61 - incomeLift} 602,${29 - incomeLift} S657,${45 - incomeLift} 700,${18 - incomeLift}`);
    expensePath.setAttribute('d', `M0,190 C39,${178 - expenseLift / 2} 73,${185 - expenseLift / 2} 105,${173 - expenseLift} S162,${190 - expenseLift} 200,${164 - expenseLift} S258,${183 - expenseLift} 298,${148 - expenseLift} S359,${161 - expenseLift} 396,${143 - expenseLift} S457,${160 - expenseLift} 496,${119 - expenseLift} S554,${145 - expenseLift} 602,${105 - expenseLift} S662,${115 - expenseLift} 700,${86 - expenseLift}`);
    const cashflowPanel = document.querySelector('.cashflow-panel');
    cashflowPanel.classList.remove('cashflow-updated');
    void cashflowPanel.offsetWidth;
    cashflowPanel.classList.add('cashflow-updated');
  }
};
const updateMetrics = () => {
  const income = savedTransactions.reduce((total, transaction) => transaction.type === 'income' ? total + Number(transaction.amount) : total, 0);
  const expenses = savedTransactions.reduce((total, transaction) => transaction.type === 'expense' ? total + Number(transaction.amount) : total, 0);
  document.getElementById('cash-balance').textContent = formatMetric(84290.40 + income - expenses);
  document.getElementById('accounts-receivable').textContent = formatMetric(26480 + income);
  document.getElementById('accounts-payable').textContent = formatMetric(12610.75 + expenses);
  document.getElementById('net-profit').textContent = formatMetric(38160.25 + income - expenses);
  updateDashboardVisuals(income, expenses);
};
const persistTransactions = () => {
  const transactions = [...document.querySelectorAll('#transaction-list tr[data-transaction-id]')].map((row) => ({
    id: row.dataset.transactionId,
    description: row.querySelector('.transaction-name strong').textContent,
    category: row.cells[1].textContent,
    amount: row.dataset.amount,
    type: row.dataset.type
  }));
  localStorage.setItem(transactionStorageKey(), JSON.stringify(transactions));
  savedTransactions.splice(0, savedTransactions.length, ...transactions);
  updateMetrics();
  renderRecentTransactions();
};
const renderSavedTransaction = (transaction) => {
  const row = document.createElement('tr');
  row.dataset.transactionId = transaction.id;
  row.dataset.amount = transaction.amount;
  row.dataset.type = transaction.type;
  row.innerHTML = `<td><div class="transaction-name"><span class="transaction-icon teal"><i data-lucide="circle-plus"></i></span><span><strong>${transaction.description}</strong><small>Saved transaction</small></span></div></td><td>${transaction.category}</td><td>Aug 22, 2025</td><td><span class="status completed"><i></i> Completed</span></td><td class="amount ${transaction.type === 'income' ? 'positive-amount' : ''}">${formatTransactionAmount(transaction.amount, transaction.type)}</td><td class="row-actions"><button type="button" class="row-action edit-transaction" title="Edit transaction"><i data-lucide="pencil"></i></button><button type="button" class="row-action delete-transaction" title="Delete transaction"><i data-lucide="trash-2"></i></button></td>`;
  document.getElementById('transaction-list').prepend(row);
};
savedTransactions.forEach(renderSavedTransaction);
updateMetrics();
renderRecentTransactions();
icons();
document.getElementById('new-transaction-btn').addEventListener('click', () => {
  editingTransactionId = null;
  transactionForm.reset();
  transactionForm.closest('.modal').querySelector('h2').textContent = 'New transaction';
  modal.classList.add('open');
});
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-modal').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  const oldIncome = savedTransactions.reduce((total, item) => item.type === 'income' ? total + Number(item.amount) : total, 0);
  const oldExpenses = savedTransactions.reduce((total, item) => item.type === 'expense' ? total + Number(item.amount) : total, 0);
  const transaction = { id: editingTransactionId || crypto.randomUUID(), description: form.get('description'), amount: form.get('amount'), type: form.get('type'), category: form.get('category') };
  const existingRow = editingTransactionId && document.querySelector(`tr[data-transaction-id="${editingTransactionId}"]`);
  const changeType = editingTransactionId ? 'updated' : 'added';
  const previousDescription = existingRow?.querySelector('.transaction-name strong')?.textContent;
  const previousAmount = existingRow?.dataset.amount;
  if (existingRow) {
    existingRow.remove();
  }
  renderSavedTransaction(transaction);
  persistTransactions();
  const change = changeType === 'updated'
    ? `${transaction.description} updated from $${Number(previousAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} to $${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : `${transaction.description} added at $${Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  addModuleChange('Transactions', previousDescription && previousDescription !== transaction.description ? `${previousDescription} renamed to ${transaction.description}` : change);
  event.target.reset();
  closeModal();
  icons();
  if (moduleView?.classList.contains('module-visible') && document.getElementById('breadcrumb-title').textContent === 'Transactions') renderModule('Transactions');
  const newIncome = savedTransactions.reduce((total, item) => item.type === 'income' ? total + Number(item.amount) : total, 0);
  const newExpenses = savedTransactions.reduce((total, item) => item.type === 'expense' ? total + Number(item.amount) : total, 0);
  const incomeChange = newIncome - oldIncome;
  const expenseChange = newExpenses - oldExpenses;
  const cashChange = incomeChange - expenseChange;
  const changeLabel = cashChange >= 0 ? `Cash +${formatMetric(cashChange)}` : `Cash -${formatMetric(Math.abs(cashChange))}`;
  const profitLabel = cashChange >= 0 ? `Profit +${formatMetric(cashChange)}` : `Profit -${formatMetric(Math.abs(cashChange))}`;
  showToast(editingTransactionId ? `Updated · ${changeLabel} · ${profitLabel}` : `Saved · ${changeLabel} · ${profitLabel}`);
  editingTransactionId = null;
});
document.getElementById('transaction-list').addEventListener('click', (event) => {
  const row = event.target.closest('tr[data-transaction-id]');
  if (!row) return;
  if (event.target.closest('.delete-transaction')) {
    const deletedName = row.querySelector('.transaction-name strong').textContent;
    row.remove();
    persistTransactions();
    addModuleChange('Transactions', `${deletedName} deleted`);
    showToast('Transaction deleted');
  }
  if (event.target.closest('.edit-transaction')) {
    editingTransactionId = row.dataset.transactionId;
    transactionForm.elements.description.value = row.querySelector('.transaction-name strong').textContent;
    transactionForm.elements.amount.value = row.dataset.amount;
    transactionForm.elements.type.value = row.dataset.type;
    transactionForm.elements.category.value = row.cells[1].textContent;
    transactionForm.closest('.modal').querySelector('h2').textContent = 'Edit transaction';
    modal.classList.add('open');
  }
});
icons();
