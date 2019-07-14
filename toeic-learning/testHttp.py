from BeautifulSoup import BeautifulSoup as Soup
from soupselect import select
import urllib
soup = Soup(urllib.urlopen('http://slashdot.org/'))
select(soup, 'div.title h3')