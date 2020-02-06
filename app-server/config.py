# For API requests
API_URL = "https://sandbox-apigw.koscom.co.kr/v1/bookkeeper"
GAAP_FINSTA = "fs/gaap"
API_KEY = "l7xxd31f2fece5964f6aac01ebc34d8e371d"
FABOT_URL = "https://sandbox-apigw.koscom.co.kr/v1/fabotdw"
FABOT_LIST = ["sector/001", "sector/301"]
STOCK_URL = "https://sandbox-apigw.koscom.co.kr/v2/market/stocks"
STOCK_CLOSEPRICE = ["kospi", "closeprice?apikey={}".format(API_KEY)] # 종가 조회라서 장 중에는 동작 안 함.
STOCK_PRICE = ["kospi", "price?apikey={}".format(API_KEY)]
NICE_URL = "https://sandbox-apigw.koscom.co.kr/v1/nice"
NICE_OUTLINE = "companyOutlineIfo/companyShortOutline?apikey={}&kiscode=".format(API_KEY)
NICE_KISCODE = "companyOutlineIfo/kiscode?apikey={}&stockcd=".format(API_KEY)
NEWS_URL = "https://openapi.naver.com/v1/search/news.json"
NEWS_HEADER = {'X-Naver-Client-Id':"s6CXZer1rIBYc2nez6OJ", 'X-Naver-Client-Secret':"br6DTnQsUv"}

# For request option
OPT_CONSOLIDATED = 1
OPT_DEBUG = 0
OPT_MAX_DEPTH = 1
OPT_FROM = "2014-01-01"
OPT_TO = "2018-12-31"

# For extracting value
FISCAL_YEARS = ["2014-12-31", "2015-12-31", "2016-12-31", "2017-12-31", "2018-12-31"]

# For word cloud
FONT_PATH = "./NanumGothicBold.ttf"
BG_IMAGE = "./koscom.png"
STOPWORDS = {'은', '입니다', '있다', 'Corp.', '있다.', '것으로', '밝혔다.'}