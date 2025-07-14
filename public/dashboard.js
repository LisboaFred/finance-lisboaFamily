// Supondo que você salvou o token JWT após login localStorage.setItem('token', token)
const token = localStorage.getItem('token');
const apiUrl = '/api/transactions';

const form = document.getElementById('financeForm');
const financeList = document.getElementById('financeList');

async function fetchFinances() {
  const res = await fetch(apiUrl, { headers: { token: 'Bearer ' + token } });
  const finances = await res.json();
  financeList.innerHTML = '';
  if (Array.isArray(finances)) {
    finances.forEach(finance => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${finance.title}</strong> - R$${finance.amount.toFixed(2)} <br>
        Tipo: ${finance.type} | Categoria: ${finance.category} | Data: ${finance.date ? new Date(finance.date).toLocaleDateString() : ''} <br>
        ${finance.description || ''}
        <button onclick="deleteFinance('${finance._id}')">Excluir</button>
      `;
      financeList.appendChild(li);
    });
  } else {
    financeList.innerHTML = '<li>Nenhum lançamento encontrado</li>';
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: 'Bearer ' + token
    },
    body: JSON.stringify({ title, amount, description, type, category, date })
  });
  form.reset();
  fetchFinances();
};

async function deleteFinance(id) {
  await fetch(`${apiUrl}/${id}`, {
    method: 'DELETE',
    headers: { token: 'Bearer ' + token }
  });
  fetchFinances();
}

// Inicialização
fetchFinances();
