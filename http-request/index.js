app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'http-server', 'registration.html'));
  });
  const port = process.argv[process.argv.indexOf('--port') + 1] || 3000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
