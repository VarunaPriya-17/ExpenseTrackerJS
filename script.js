let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

const form = document.getElementById('expense-form');
const nameInput = document.getElementById('expense-name');
const amountInput = document.getElementById('expense-amount');
const list = document.getElementById('expense-list');

const todayTotal = document.getElementById('today-total');
const weekTotal = document.getElementById('week-total');
const monthTotal = document.getElementById('month-total');

const monthFilter = document.getElementById('month-filter');
const pieCanvas = document.getElementById('pie-chart');
let pieChart;

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB');
}

function getMonthName(monthNum) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[parseInt(monthNum) - 1];
}

function populateMonthFilter() {
  const uniqueMonths = new Set();

  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    uniqueMonths.add(monthKey);
  });

  const sorted = Array.from(uniqueMonths).sort().reverse();

  monthFilter.innerHTML = `<option value="">-- All Months --</option>`;
  sorted.forEach(month => {
    const [year, mon] = month.split('-');
    const label = `${getMonthName(mon)} ${year}`;
    monthFilter.innerHTML += `<option value="${month}">${label}</option>`;
  });
}

function renderExpenses() {
  const selectedMonth = monthFilter.value;
  let filtered = expenses;

  if (selectedMonth) {
    filtered = expenses.filter(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  }

  list.innerHTML = '';
  filtered.forEach((exp, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${exp.name} - ₹${exp.amount} <small>(${formatDate(exp.date)})</small>
      <button class="delete-btn" onclick="deleteExpense(${index})">X</button>
    `;
    list.appendChild(li);
  });

  updateDashboard();
  renderPieChart(filtered);
}

function deleteExpense(index) {
  const confirmDelete = confirm("Are you sure you want to delete this expense?");
  if (confirmDelete) {
    expenses.splice(index, 1);
    saveExpenses();
    renderExpenses();
    populateMonthFilter();
  }
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const date = new Date().toISOString();

  if (!name || !amount || amount <= 0) return;

  expenses.push({ name, amount, date });
  saveExpenses();
  renderExpenses();
  populateMonthFilter();
  form.reset();
});

function updateDashboard() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  let todaySum = 0, weekSum = 0, monthSum = 0;

  expenses.forEach(exp => {
    const expDate = new Date(exp.date);
    const expISO = expDate.toISOString().split('T')[0];

    if (expISO === today) todaySum += exp.amount;

    const daysDiff = (now - expDate) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 7) weekSum += exp.amount;

    if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
      monthSum += exp.amount;
    }
  });

  todayTotal.textContent = todaySum;
  weekTotal.textContent = weekSum;
  monthTotal.textContent = monthSum;
}

function renderPieChart(filteredExpenses) {
  const categoryTotals = {};

  filteredExpenses.forEach(exp => {
    categoryTotals[exp.name] = (categoryTotals[exp.name] || 0) + exp.amount;
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieCanvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
          '#6610f2', '#6f42c1', '#e83e8c', '#20c997', '#fd7e14'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Expense Breakdown' }
      }
    }
  });
}

// Init
monthFilter.addEventListener('change', renderExpenses);
populateMonthFilter();
renderExpenses();
