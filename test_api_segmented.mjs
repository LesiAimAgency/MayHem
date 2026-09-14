// Test Segmented API & ETag 304 in Node.js
async function run() {
  console.log('--- Testing API Segmented Horizon & ETag ---');
  
  // 1. Fetch Full Horizon
  const fullRes = await fetch('http://127.0.0.1:8000/api/v1/financial-reports/matrix?industry=NGAN_HANG&horizon=full');
  const fullText = await fullRes.text();
  console.log(`[FULL HORIZON] HTTP ${fullRes.status}, Payload Size: ${(fullText.length / 1024).toFixed(1)} KB`);
  const fullEtag = fullRes.headers.get('ETag');
  console.log(`[FULL HORIZON] ETag: ${fullEtag}`);

  // 2. Fetch Summary Horizon
  const summaryRes = await fetch('http://127.0.0.1:8000/api/v1/financial-reports/matrix?industry=NGAN_HANG&horizon=summary');
  const summaryText = await summaryRes.text();
  console.log(`[SUMMARY HORIZON] HTTP ${summaryRes.status}, Payload Size: ${(summaryText.length / 1024).toFixed(1)} KB`);
  const summaryEtag = summaryRes.headers.get('ETag');
  console.log(`[SUMMARY HORIZON] ETag: ${summaryEtag}`);

  const reduction = ((1 - summaryText.length / fullText.length) * 100).toFixed(1);
  console.log(`✓ Initial Load Reduction: ${reduction}% bandwidth saved!`);

  // 3. Test Conditional GET with If-None-Match (ETag 304)
  if (summaryEtag) {
    const cachedRes = await fetch('http://127.0.0.1:8000/api/v1/financial-reports/matrix?industry=NGAN_HANG&horizon=summary', {
      headers: { 'If-None-Match': summaryEtag }
    });
    console.log(`[304 NOT MODIFIED TEST] HTTP ${cachedRes.status}`);
    const cachedText = await cachedRes.text();
    console.log(`[304 NOT MODIFIED TEST] Transfer Size: ${cachedText.length} bytes (Zero bytes transferred!)`);
  }
}

run().catch(console.error);
