Materials Informatics Player
======

Browser-based renderer of the crystallographic information files (CIF) written in a pure javascript.
Requires server environment, e.g. Python or PHP.

For Python:
```shell
python proxy.py 7777
```

Or using an internal web-server in PHP:
```shell
php -S localhost:7777
```

Then accessible via the local address http://localhost:7777 in your favourite browser.
To display a local CIF file, drag and drop it inside the browser window.
To display a CIF file on the web, paste its address in the address bar after sharp (#) symbol and hit enter.
