let dictionaryData = null;

async function loadDictionaryData() {
  try {
    const response = await fetch('br-utf8.txt');
    dictionaryData = await response.text();
    console.log('Dados do dicionário carregados com sucesso.');

    localStorage.setItem('dictionaryData', dictionaryData);
    console.log('Dados do dicionário salvos no localStorage.');
  } catch (error) {
    console.error('Erro ao carregar dados do dicionário:', error);
  }
}

const savedDictionaryData = localStorage.getItem('dictionaryData');
if (savedDictionaryData) {
  dictionaryData = savedDictionaryData;
  console.log('Dados do dicionário recuperados do localStorage.');
} else {
  loadDictionaryData();
}

document.getElementById('searchButton').addEventListener('click', async () => {
  const requiredLetter = document.getElementById('requiredLetter').value.toLowerCase();
  const allowedLetters = document.getElementById('allowedLetters').value.toLowerCase();
  const maxWordLength = parseInt(document.getElementById('maxWordLength').value);
  const definitionElement = document.getElementById('definition');
  const loadingElement = document.getElementById('loading');

  console.log('Required letter:', requiredLetter);
  console.log('Allowed letters:', allowedLetters);
  console.log('Maximum word length:', maxWordLength);

  if (requiredLetter.length !== 1 || !/^[a-zA-Zç]$/.test(requiredLetter)) {
    console.log('Invalid required letter');
    definitionElement.innerText = 'A letra fixa é obrigatória.';
    return;
  }

  if (allowedLetters.length < 6 || !/^[a-zA-Zç]+$/.test(allowedLetters)) {
    console.log('Invalid allowed letters');
    definitionElement.innerText = 'As letras variáveis são obrigatórias.';
    return;
  }

  loadingElement.style.display = 'block';
  definitionElement.innerHTML = '';

  console.log('Starting search...');

  const validWordsByLength = new Map();
  const wordsArray = dictionaryData.split('\n');
  wordsArray.forEach(word => {
    const len = word.length;
    if (len >= 4 && len <= maxWordLength && word.includes(requiredLetter)) {
      const isAllowed = [...word].every(char => allowedLetters.includes(char) || char === requiredLetter);
      console.log('Palavra:', word, 'Permitida:', isAllowed);
      if (isAllowed) {
        console.log('Pesquisando palavra:', word);
        if (!validWordsByLength.has(len)) {
          validWordsByLength.set(len, []);
        }
        validWordsByLength.get(len).push(word);
      }
    }
  });

  console.log('Pesquisa Finalizada. Palavras válidas:', validWordsByLength);
  loadingElement.style.display = 'none';
  if (validWordsByLength.size > 0) {
    let definitions = '';
    const sortedLengths = Array.from(validWordsByLength.keys()).sort((a, b) => a - b);
    sortedLengths.forEach(length => {
      const words = validWordsByLength.get(length);
      if (words.length > 0) {
        definitions += `<h1>Palavras com ${length} letras:</h1><ul>`;
        words.forEach(word => {
          definitions += `<li><h2><strong>${word}</strong></h2></li>`;
        });
        definitions += `</ul>`;
      }
    });
    definitionElement.innerHTML = definitions;
  } else {
    definitionElement.innerText = 'Não foram encontradas palavras válidas.';
  }

});
