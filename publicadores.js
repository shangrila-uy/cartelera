// main.js

async function loadData() {
  const json = 'https://sheets.googleapis.com/v4/spreadsheets/1TXTFt4uPkygz9MOxeogkfWy4p4WTqDWLDUYqluEQhXg/values/publicadores?key=AIzaSyD37ddBLRxw48pq0CLXYd2LIjUrneaKk5s';
  const response = await fetch(json);
  const data = await response.json();

  const headers = data.values[0];
  const publishers = data.values.slice(1).map(row => {
    const publisher = {};
    headers.forEach((header, index) => {
      publisher[header] = row[index];
    });
    return publisher;
  });

  const groupedPublishers = groupPublishersByGrupo(publishers);
  displayGroups(groupedPublishers);
}

function groupPublishersByGrupo(publishers) {
  const grouped = {};
  publishers.forEach(publisher => {
    const grupo = publisher['Grupo'];
    // Skip if no group, or no baptized, and not a publisher
    if (grupo === '' || (publisher['Bautizado'] === 'FALSE' && publisher['Publicador'] === 'FALSE')) return;
    if (!grouped[grupo]) {
      grouped[grupo] = [];
    }
    grouped[grupo].push(publisher);
  });
  return grouped;
}

function displayGroups(groupedPublishers) {
  const container = document.getElementById('container');
  container.innerHTML = ''; // Clear existing content

  Object.entries(groupedPublishers).forEach(([grupo, publishers]) => {
    const card = document.createElement('div');
    card.classList.add('card');

    const title = document.createElement('h2');
    title.textContent = `Grupo ${grupo}`;
    card.appendChild(title);

    publishers.forEach(publisher => {
      const name = document.createElement('p');
      name.textContent = publisher['Nombre Abreviado'];
      if (publisher['Superintendente'] === 'TRUE') {
        name.classList.add('overseer');
      }
      if (publisher['Auxiliar'] === 'TRUE') {
        name.classList.add('auxiliar');
      }
      card.appendChild(name);
    });

    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', loadData);
