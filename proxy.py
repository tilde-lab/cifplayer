import os, sys
import re
import BaseHTTPServer
import urllib2

MAX_SIZE = 500 * 1024
try: port = int(sys.argv[1])
except: port = 8000
SERVER_NAME = 'http://localhost:%s' % port
cur_dir = os.getcwd()

# https://github.com/django/django/blob/master/django/core/validators.py
ul = '\u00a1-\uffff' # unicode letters range (must be a unicode string, not a raw string)
# IP patterns
ipv4_re = r'(?:25[0-5]|2[0-4]\d|[0-1]?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}'
ipv6_re = r'\[[0-9a-f:\.]+\]' # (simple regex, validated later)
# Host patterns
hostname_re = r'[a-z' + ul + r'0-9](?:[a-z' + ul + r'0-9-]*[a-z' + ul + r'0-9])?'
domain_re = r'(?:\.[a-z' + ul + r'0-9]+(?:[a-z' + ul + r'0-9-]*[a-z' + ul + r'0-9]+)*)*'
tld_re = r'\.[a-z' + ul + r']{2,}\.?'
host_re = '(' + hostname_re + domain_re + tld_re + '|localhost)'
urlregex = re.compile(
    r'^(?:[a-z0-9\.\-]*)://' # scheme is validated separately
    r'(?:\S+(?::\S*)?@)?' # user:pass authentication
    r'(?:' + ipv4_re + '|' + ipv6_re + '|' + host_re + ')'
    r'(?::\d{2,5})?' # port
    r'(?:[/?#][^\s]*)?' # resource path
    r'$', re.IGNORECASE)

class UrlHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def answer(self, msg, code):
        self.send_response(code)
        self.end_headers()
        self.wfile.write(msg)

    def do_GET(self):
        if self.path.startswith("/?url="):
            ref = self.headers.get('Referer')
            if not ref or not ref.startswith(SERVER_NAME): return self.answer("Forbidden", 403)
            url = self.path[6:]
            if not urlregex.match(url): return self.answer("Invalid URL", 400)
            try: u = urllib2.urlopen(url)
            except urllib2.HTTPError: return self.answer("Not found", 404)
            out, size = "", 0
            while True:
                buf = u.read(50000)
                if not buf: break
                size += len(buf)
                if size > MAX_SIZE: return self.answer("File too large", 400)
                out += buf
            if not out: return self.answer("Not found", 404)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(out)
        else:
            path = self.path[1:]
            if not os.path.exists(os.path.join(cur_dir, path)): return self.answer("Not found", 404)
            try: f = open(os.path.join(cur_dir, path), 'rb')
            except: return self.answer("Not found", 404)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(f.read())
            f.close()

if __name__ == '__main__':
    httpd = BaseHTTPServer.HTTPServer(('0.0.0.0', port), UrlHandler)
    print "Serving HTTP on port", port
    try: httpd.serve_forever()
    except KeyboardInterrupt: httpd.server_close()
