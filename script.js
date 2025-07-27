let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderExpenses() {
  const list = document.getElementById("expenseList");
  const totalsDiv = document.getElementById("totals");
  const monthFilter = document.getElementById("monthFilter");
  const selectedMonth = monthFilter.value;
  list.innerHTML = "";

  let filtered = expenses;

  // Populate month filter
  const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))];
  monthFilter.innerHTML = `<option value="all">All</option>`;
  months.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    if (selectedMonth === month) option.selected = true;
    monthFilter.appendChild(option);
  });

  if (selectedMonth !== "all") {
    filtered = expenses.filter(e => e.date.slice(0, 7) === selectedMonth);
  }

  let weekly = 0, monthly = 0;
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const currentWeek = now.getDate() - now.getDay(); // Sun = start of week

  let categorySums = {};

  filtered.forEach((expense, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${expense.name} - ₹${expense.amount} (${expense.date})
      <span onclick="deleteExpense(${index})" style="cursor:pointer;">❌</span>`;
    list.appendChild(li);

    const date = new Date(expense.date);
    if (expense.date.slice(0, 7) === currentMonth) {
      monthly += +expense.amount;
    }
    if (date.getMonth() === now.getMonth() && date.getDate() >= currentWeek) {
      weekly += +expense.amount;
    }

    // Category pie data
    categorySums[expense.name] = (categorySums[expense.name] || 0) + +expense.amount;
  });

  totalsDiv.innerHTML = `
    <p><strong>Weekly Total:</strong> ₹${weekly}</p>
    <p><strong>Monthly Total:</strong> ₹${monthly}</p>
  `;

  renderPieChart(categorySums);
}

function addExpense() {
  const name = document.getElementById("expenseName").value;
  const amount = document.getElementById("expenseAmount").value;
  const date = new Date().toISOString().split("T")[0];
  if (!name || !amount) return alert("Enter all details");

  expenses.push({ name, amount, date });
  saveExpenses();
  renderExpenses();
  document.getElementById("expenseName").value = "";
  document.getElementById("expenseAmount").value = "";
}

function deleteExpense(index) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses.splice(index, 1);
    saveExpenses();
    renderExpenses();
  }
}

function filterByMonth() {
  renderExpenses();
}

// --- Theme Functions ---
function setTheme(mode) {
  document.body.className = "";
  if (mode !== "light") document.body.classList.add(mode);
  localStorage.setItem("theme", mode);
}

window.onload = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
  checkLogin();
};

// --- Pie Chart ---
let pie;
function renderPieChart(data) {
  const ctx = document.getElementById("pieChart").getContext("2d");
  if (pie) pie.destroy();

  pie = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: [
          "#ff6384", "#36a2eb", "#ffce56", "#66bb6a", "#ba68c8", "#ffa726"
        ]
      }]
    }
  });
}

// --- Login System ---
function login() {
  const name = document.getElementById("username").value;
  if (!name) return alert("Enter a name");
  localStorage.setItem("user", name);
  checkLogin();
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

function checkLogin() {
  const user = localStorage.getItem("user");
  if (user) {
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("userDisplay").textContent = user;
    renderExpenses();
  } else {
    document.getElementById("mainApp").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
  }
}
