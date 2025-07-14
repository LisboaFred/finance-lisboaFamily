const form  = document.getElementById('transaction-form');
const list  = document.getElementById('transactions-list');

const apiUrl = '/api/transactions';
const token  = localStorage.getItem('token');

async function fetchFinances() {
  list.innerHTML = '';
  const res = await fetch(apiUrl, {
    headers: { token: 'Bearer ' + token }
  });
  const data = await res.json();
  renderTransactions(data);
}

function renderTransactions(transactions) {
  transactions.forEach(tx => {
    const li = document.createElement('li');
    li.dataset.id = tx._id;
    li.innerHTML = `
      <strong>${tx.title}</strong> – R$${tx.amount.toFixed(2)}<br>
      Tipo: ${tx.type} | Categoria: ${tx.category} | Data: ${new Date(tx.date).toLocaleDateString()}<br>
      ${tx.description}
      <button class="btn-delete">Excluir</button>
    `;
    list.appendChild(li);
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.closest('li').dataset.id;
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
        headers: { token: 'Bearer ' + token }
      });
      if (res.ok) btn.closest('li').remove();
    });
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(form);
  const body = Object.fromEntries(fd.entries());
  body.amount = parseFloat(body.amount);
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: 'Bearer ' + token
    },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    form.reset();
    fetchFinances();
  }
});

fetchFinances();
