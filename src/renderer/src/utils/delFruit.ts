export interface DelFruitFangameItem {
  id: string;
  name: string;
}

export interface DelFruitFangameDetail {
  id: string;
  name: string;
  downloadLink: string;
  auther: string;
  rating: string;
  difficulty: string;
}

export const delFruit = {
  async fetchFangameItems() {
    const res = await fetch('https://delicious-fruit.com/ratings/full.php?q=ALL');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tbody = doc.getElementsByTagName('tbody')[0];
    const links = tbody.getElementsByTagName('a');
    const items: DelFruitFangameItem[] = [];
    for (const a of links) {
      const id = a.getAttribute('href')!.split('=')[1];
      const name = a.innerText;
      items.push({ id, name });
    }
    return items;
  },
  async fetchFangameDetail(id: string) {
    const res = await fetch(`https://delicious-fruit.com/ratings/game_details.php?id=${id}`);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const auther = doc.getElementById('creator-label')!.getElementsByTagName('a')[0].innerText!;
    const name = doc.getElementById('content')!.getElementsByTagName('h1')[0].innerText!;
    const downloadLink = doc.getElementById('game-link')!.getAttribute('href')!;
    const rating = doc.getElementById('avgRating')!.innerText!;
    const difficulty = doc.getElementById('avgDifficulty')!.innerText!;
    return { auther, difficulty, downloadLink, id, name, rating } as DelFruitFangameDetail;
  }
};
