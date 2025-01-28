const url = new URL('https://api.coingecko.com/api/v3/simple/token_price/solana');
url.searchParams.set('contract_addresses', 'So11111111111111111111111111111111111111112');
url.searchParams.set('vs_currencies', 'usd,eur,btc');

fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': '*/*'
    
  }
})
  .then(response => response)
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));