import os
import subprocess
import requests
import json
import logging
from bs4 import BeautifulSoup
from collections import Counter
from krwordrank.word import KRWordRank
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
import numpy as np
import base64

from config import *

logger = logging.getLogger('Foogle')

class SearchNews(object):
    '''
    search news by using Naver API
    '''
    def __init__(self, n_results=10):
        self.http_mode = "post"
        self.n_results = n_results
        self.n_requests = 100

    def search_news(self, query_json):
        '''
        request news list according to the keyword
        '''
        result_json = {}
        result_list = []
        raw_text = []
        word_rank = {}
        if "keyword" not in query_json.keys():
            logger.error('There is no keyword')
            return result_json
        req_opt = "?query={}&display={}&start=1&sort=sim".format(
            query_json["keyword"],self.n_requests)
        json_data = requests.get(NEWS_URL+req_opt, headers=NEWS_HEADER).json()

        if int(json_data['display']) > 0:
            for i, item in enumerate(json_data['items']):
                title = item['title'].replace("<b>","").replace("</b>","")
                desc = item['description'].replace("<b>","").replace("</b>","")
                if i < self.n_results:
                    result_list.append(
                        {"title":title,
                        "link":item['link']})
                raw_text.append(desc)
        result_json["news_list"] = result_list
        if "word_cloud" in query_json.keys() and query_json['word_cloud']:
            wordrank_extractor = KRWordRank(min_count = 8, max_length = 10,verbose = False)
            keywords, rank, _ = wordrank_extractor.extract(raw_text, 0.85, 10)
            for word, r in sorted(keywords.items(), key=lambda x:x[1], reverse=True)[:100]:
                if word not in STOPWORDS and word != query_json["keyword"]:
                    word = word.replace("(","").replace(")","").replace(",","").replace(".","").replace("'","").replace("했다","")
                    word_rank[word] = r
            #result_json["word_cloud"] = word_rank
            result_json["word_cloud"] = self.generate_wordcloud(word_rank)
        return result_json

    def get_contents(self, link):
        '''
        UNUSED FUNCTION
        get news contents by using url link
        '''
        news_raw = requests.get(link)
        try:
            bsoup = BeautifulSoup(news_raw.content, 'html.parser')
            raw_text = bsoup.select('#articleBodyContents')[0].get_text()#.replace('\n', " ")
            news_contents = raw_text.replace("// flash 오류를 우회하기 위한 함수 추가 function _flash_removeCallback() {}", "")
        except Exception as e:
            logger.error(e)
            return ""
        return news_contents.strip()

    def generate_wordcloud(self, keyword):
        #mask = np.array(Image.open(BG_IMAGE))
        wordcloud = WordCloud(font_path=FONT_PATH,
                        width=800, height=500,
                        background_color="white",
                        max_words=50)
        # Remove Stopword
        for word in STOPWORDS:
            if word in keyword.keys():
                keyword.pop(word)
        wordcloud = wordcloud.generate_from_frequencies(keyword)
        array = wordcloud.to_array()
        fig = plt.figure(figsize=(10, 10))
        plt.imshow(array, interpolation="bilinear")
        plt.axis("off")
        fig.savefig('./wordcloud.png')
        with open('./wordcloud.png', mode='rb') as file:
            img = file.read()
        return json.dumps(base64.encodebytes(img).decode("utf-8").replace("\n","").replace("\"",""))

