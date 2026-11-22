// TicketFlow - main script
// Logic: form validation (feature/logic)

// ---------- Elements ----------
const form = document.getElementById('purchase-form');
const fields = {
  username: document.getElementById('username'),
  fullName: document.getElementById('fullName'),
  email: document.getElementById('email'),
  age: document.getElementById('age'),
  zipCode: document.getElementById('zipCode'),
  ticketType: document.getElementById('ticketType'),
  quantity: document.getElementById('quantity'),
  insurance: document.getElementById('insurance'),
};

// ---------- Error helpers ----------
function getErrorElement(input) {
  let el = document.getElementById(`${input.id}-error`);
  if (!el) {
    el = document.createElement('small');
    el.id = `${input.id}-error`;
    el.className = 'error-message';
    el.setAttribute('role', 'alert');
    input.insertAdjacentElement('afterend', el);
  }
  return el;
}

function setError(input, message) {
  getErrorElement(input).textContent = message;
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input) {
  getErrorElement(input).textContent = '';
  input.removeAttribute('aria-invalid');
}

// ---------- Validation ----------
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm() {
  let valid = true;

  const rules = [
    [fields.username, (v) => v.trim() !== '', 'Username is required.'],
    [fields.fullName, (v) => v.trim() !== '', 'Full name is required.'],
    [fields.email, (v) => EMAIL_REGEX.test(v.trim()), 'Enter a valid email address.'],
    [fields.age, (v) => v !== '' && Number.isFinite(Number(v)) && Number(v) > 0, 'Age must be a number greater than 0.'],
    [fields.zipCode, (v) => v.trim() !== '', 'Zip code is required.'],
    [fields.ticketType, (v) => v !== '', 'Select a ticket type.'],
    [fields.quantity, (v) => Number.isInteger(Number(v)) && Number(v) >= 1, 'Quantity must be at least 1.'],
  ];

  rules.forEach(([input, test, message]) => {
    if (test(input.value)) {
      clearError(input);
    } else {
      setError(input, message);
      valid = false;
    }
  });

  return valid;
}

// ---------- Pricing ----------
const TICKET_PRICES = { Economico: 500, general: 800, vip: 1500 }; // MXN
const IVA_RATE = 0.16;
const INSURANCE_FEE = 150; // flat fee per order

function calculateTotal(ticketType, quantity, hasInsurance) {
  const subtotal = TICKET_PRICES[ticketType] * quantity;
  const iva = subtotal * IVA_RATE;
  const insurance = hasInsurance ? INSURANCE_FEE : 0;
  return subtotal + iva + insurance;
}

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

// ---------- Orders table ----------
const ordersBody = document.getElementById('orders-body');

function addOrderRow(order) {
  const row = document.createElement('tr');
  const values = [
    order.username,
    order.fullName,
    order.ticketTypeLabel,
    order.quantity,
    currency.format(order.total),
  ];
  values.forEach((value) => {
    const cell = document.createElement('td');
    cell.textContent = value; // textContent avoids HTML injection
    row.appendChild(cell);
  });
  ordersBody.appendChild(row);
}

// ---------- Submit ----------
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const quantity = Number(fields.quantity.value);
  const ticketType = fields.ticketType.value;
  const ticketTypeLabel = fields.ticketType.options[fields.ticketType.selectedIndex].text;
  const total = calculateTotal(ticketType, quantity, fields.insurance.checked);

  addOrderRow({
    username: fields.username.value.trim(),
    fullName: fields.fullName.value.trim(),
    ticketTypeLabel,
    quantity,
    total,
  });

  form.reset();
});