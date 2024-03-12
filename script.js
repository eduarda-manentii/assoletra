document.getElementById('searchButton').addEventListener('click', async () => {
  const requiredLetter = document.getElementById('requiredLetter').value.toLowerCase();
  const allowedLetters = document.getElementById('allowedLetters').value.toLowerCase();
  const maxWordLength = parseInt(document.getElementById('maxWordLength').value);
  const definitionElement = document.getElementById('definition');
  const loadingElement = document.getElementById('loading');

  console.log('Required letter:', requiredLetter);
  console.log('Allowed letters:', allowedLetters);
  console.log('Maximum word length:', maxWordLength);

  if (requiredLetter.length !== 1 || !/^[a-zA-Z]$/.test(requiredLetter)) {
    console.log('Invalid required letter');
    definitionElement.innerText = 'A letra fixa é obrigatória.';
    return;
  }

  if (allowedLetters.length < 6 || !/^[a-zA-Z]+$/.test(allowedLetters)) {
    console.log('Invalid allowed letters');
    definitionElement.innerText = 'As letras variáveis são obrigatórias.';
    return;
  }

  loadingElement.style.display = 'block';
  definitionElement.innerHTML = '';

  console.log('Starting search...');


  const validWordsByLength = new Map();
  for (let len = 4; len <= maxWordLength; len++) {
    const wordSet = new Set();
    for (let i = 0; i < Math.pow(allowedLetters.length, len); i++) {
      const word = Array.from({ length: len }, (_, index) => {
        if (index === Math.floor(Math.random() * len)) {
          return requiredLetter;
        } else {
          return allowedLetters[Math.floor(Math.random() * allowedLetters.length)];
        }
      }).join('');
      if (word.includes(requiredLetter)) {
        if (!wordSet.has(word)) {
          wordSet.add(word);
          console.log('Pesquisando palavra:', word);
          try {
            const response = await fetch(`https://api.dicionario-aberto.net/word/${word}`);
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              console.log('Encontrada palavra valida:', word);
              if (!validWordsByLength.has(len)) {
                validWordsByLength.set(len, []);
              }
              validWordsByLength.get(len).push(word);
            } else {
              console.log('Palavra não encontra:', word);
            }
          } catch (error) {
            console.error('Error fetching definition:', error);
          }
        }
      }
    }
  }

  console.log('Pesquisa Finalizada. Palavras válidas:', validWordsByLength);
  loadingElement.style.display = 'none';
  if (validWordsByLength.size > 0) {
    let definitions = '';
    validWordsByLength.forEach((words, length) => {
      if (words.length > 0) {
        definitions += `<p>Palavras com ${length} letras:</p><ul>`;
        <hr/>
        words.forEach(word => {
          definitions += `<li><strong>${word}</strong></li>`;
        });
        definitions += `</ul>`;
      }
    });
    definitionElement.innerHTML = definitions;
  } else {
    definitionElement.innerText = 'Não foi encontrada palavras válidas.';
  }
});
