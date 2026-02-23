const res = await fetch('http://localhost:3000/api/ai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Test Title', abstract: 'Test abstract', authors: [] })
});
console.log(await res.json());
