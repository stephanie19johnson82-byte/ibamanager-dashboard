(async ()=>{
  const url = 'http://127.0.0.1:8080/v1/projects/demo-no-project/databases/(default)/documents/teams?documentId=0';
  const body = {
    fields: {
      tid: { integerValue: '0' },
      abbrev: { stringValue: 'TST' },
      region: { stringValue: 'Test' },
      name: { stringValue: 'Team' },
      wins: { integerValue: '10' },
      losses: { integerValue: '5' },
      value: { integerValue: '88' },
      owner: { stringValue: 'Owner Name' }
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.text();
    console.log('status', res.status);
    console.log(data);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
