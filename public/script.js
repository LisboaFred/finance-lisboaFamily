document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();

  if (res.ok) {
    document.getElementById('result').style.color = "green";
    document.getElementById('result').innerText = "Login realizado com sucesso!\nToken: " + data.token;
  } else {
    document.getElementById('result').style.color = "#e74c3c";
    document.getElementById('result').innerText = data.error || "Erro ao fazer login";
  }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();

  if (res.ok) {
    document.getElementById('result').style.color = "green";
    document.getElementById('result').innerText = "Cadastro realizado com sucesso! Agora faça login.";
  } else {
    document.getElementById('result').style.color = "#e74c3c";
    document.getElementById('result').innerText = data.error || "Erro ao cadastrar";
  }
});
