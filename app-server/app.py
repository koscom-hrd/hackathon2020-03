#-*- coding: utf-8 -*-
from flask import Flask, request
from baseapi import BaseAPI
from finstat import FinState
from news import SearchNews

app = Flask(__name__)
default_port = 11000
base = BaseAPI()
fs = FinState()
news = SearchNews(n_results=10)

@app.route('/corp_list', methods=['POST'])
@base.get_req
def corp_list(json):
    """
    get corperation lists
    """
    result = fs.get_corp_list(json)
    return result

@app.route('/corp_perf', methods=['POST'])
@base.get_req
def corp_perf(json):
    """
    get performances of corp.
    """
    result = fs.get_corp_perf(json)
    return result

@app.route('/news', methods=['POST'])
@base.get_req
def search_news(json):
    """
    search news by using keyword
    """
    result = news.search_news(json)
    return result

if __name__ == '__main__':
    base.start(app, default_port)