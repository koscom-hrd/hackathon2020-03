import os
import subprocess
import requests
import json
import logging

from config import *

logger = logging.getLogger('Foogle')

class FinState(object):
    '''
    Get financial statement of given corporation
    '''
    def __init__(self):
        self.http_mode = "post" # unused option
        self.corp_list = self.get_fabot_list()

    def get_gaap_fista(self, corp_code):
        '''
        request financial statement by using API
        '''
        req_url = os.path.join(API_URL, GAAP_FINSTA, corp_code)
        req_opt = "?apikey={}&consolidated={}&debug={}&max_depth={}&from={}&to={}".format(
            API_KEY, OPT_CONSOLIDATED, OPT_DEBUG, OPT_MAX_DEPTH, OPT_FROM, OPT_TO)
        json_data = requests.get(req_url+req_opt).json()
        return json_data

    def get_corp_perf(self, req_json):
        '''
        return 6 business performance factors
        '''
        req_result = {}
        if 'corp_name' not in req_json.keys():
            logger.error('invalid corporation name')
        else:
            logger.info('get corp perf for name: {}'.format(req_json['corp_name']))
            if req_json['corp_name'] in self.corp_list.keys():
                gaap_result = self.get_gaap_fista(self.corp_list[req_json['corp_name']])
                if len(gaap_result['data']) > 0:
                    logger.info('results: {}'.format(gaap_result['data'][0]['fiscal_year']))
                    # process results
                    corp_info = CorpInfo()
                    corp_info.set_values(gaap_result)
                    req_result = corp_info.get_info_json()
                    req_result = self.get_basic_info(req_json['corp_name'], self.corp_list[req_json['corp_name']], req_result)
                    req_result = self.get_perf_factors(req_result)
        return req_result

    def get_basic_info(self, corp_name, corp_code, result_json):
        '''
        # get basic info of given corp.
        '''
        n_emp = 0
        corp_scale = None
        # get current value of stock
        req_url = os.path.join(STOCK_URL, STOCK_PRICE[0], corp_code, STOCK_PRICE[1])
        json_data = requests.get(req_url).json()
        stock_price = json_data['result']['trdPrc'] if 'result' in json_data.keys() else 0
        # get number of stock
        n_stock = result_json['n_stock']
        # get market capitalization
        market_cap = int(stock_price) * int(n_stock)
        # get number of employee and enterprise scale
        req_url = os.path.join(NICE_URL, NICE_KISCODE+corp_code)
        logger.info(req_url)
        json_data = requests.get(req_url).json()
        if 'item' in json_data['items'].keys():
            kiscode = json_data['items']['item'][0]['kiscode']
            req_url = os.path.join(NICE_URL, NICE_OUTLINE+kiscode)
            json_data = requests.get(req_url).json()
            n_emp = json_data['items']['item'][0]['empnum']
            corp_scale = json_data['items']['item'][0]['scl']
        # make result dictionary
        result_json["corp_name"] = corp_name
        result_json["corp_code"]= corp_code
        result_json["stock_price"]= int(stock_price)
        result_json["market_cap"]= int(market_cap)
        result_json["n_emp"]= n_emp
        result_json["corp_scale"]= corp_scale
        return result_json

    def get_perf_factors(self, result_json):
        perf_factors = {
            "stability":0,
            "profitability":0,
            "growth":0,
            "unit_price":0,
            "scale":0}
        # get stability
        dept_ratio = float(result_json['dept_ratio'])
        if dept_ratio < 180:
            perf_factors["stability"] = 5
        elif dept_ratio < 360:
            perf_factors["stability"] = 4
        elif dept_ratio < 540:
            perf_factors["stability"] = 3
        elif dept_ratio < 720:
            perf_factors["stability"] = 2
        else:
            perf_factors["stability"] = 1

        # get growth
        sales_growth = float(result_json['sales_growth'])
        if sales_growth > 20:
            perf_factors['growth'] = 5
        elif sales_growth > 12:
            perf_factors['growth'] = 4
        elif sales_growth > 4:
            perf_factors['growth'] = 3
        elif sales_growth > -10:
            perf_factors['growth'] = 2
        else:
            perf_factors['growth'] = 1

        # get profitability
        profits_rate = float(result_json['profits_rate'])
        if profits_rate > 20:
            perf_factors['profitability'] = 5
        elif profits_rate > 9:
            perf_factors['profitability'] = 4
        elif profits_rate > 5:
            perf_factors['profitability'] = 3
        elif profits_rate > 1:
            perf_factors['profitability'] = 2
        else:
            perf_factors['profitability'] = 1 

        # get unit price of stock
        stock_price = int(result_json['stock_price'])
        if stock_price < 50000:
            perf_factors['unit_price'] = 5
        elif stock_price < 200000:
            perf_factors['unit_price'] = 4
        elif stock_price < 500000:
            perf_factors['unit_price'] = 3
        elif stock_price < 2000000:
            perf_factors['unit_price'] = 2
        else:
            perf_factors['unit_price'] = 1

        # get enterprise scale by using number of employee
        n_emp = int(result_json['n_emp'])
        if n_emp > 5000:
            perf_factors['scale'] = 5
        elif n_emp > 1000:
            perf_factors['scale'] = 4
        elif n_emp > 200:
            perf_factors['scale'] = 3
        elif n_emp > 50:
            perf_factors['scale'] = 2
        else:
            perf_factors['scale'] = 1

        result_json["perf_factors"] = perf_factors
        return result_json


    def get_fabot_list(self):
        '''
        return the list of corporations
        '''
        result_dict = {}
        for upcode in FABOT_LIST:
            req_url = os.path.join(FABOT_URL, upcode)
            req_opt = "?apikey={}".format(API_KEY)
            cmd = "curl -s -XGET {}{}".format(req_url, req_opt)
            logger.info('cmd: {}'.format(cmd))
            results = subprocess.check_output(cmd, shell=True)
            json_data = json.loads(results)
            for data in json_data['result']['data']:
                result_dict[data["stockname"]] = data["stockcode"]
        return result_dict

    def get_corp_list(self, req_json):
        '''
        search corporation by name
        '''
        if "corp_name" not in req_json.keys():
            logger.error('invalid corporation name')
            return {}
        corp_name = req_json['corp_name']
        if not self.corp_list:
            self.corp_list = self.get_fabot_list()
        corp_list = self.corp_list.keys()
        result_list = [corp for corp in corp_list if corp_name in corp]
        return {"corp_list": result_list}

    def get_avg_value(self):
        '''
        UNUSED FUNCTION
        used for calculating average value of results
        '''
        logger.info("get avg value")
        min_list = [1e+30] * 6
        max_list = [0] * 6
        sum_list = [0] * 6
        n_corp = 0
        for corp_name, corp_code in self.corp_list.items():
            res = self.get_corp_perf({"corp_name":corp_name})
            if res['sales_growth'] < min_list[0]:
                min_list[0] = res['sales_growth']
            elif res['sales_growth'] > max_list[0]:
                max_list[0] = res['sales_growth']
            sum_list[0] += res['sales_growth']

            if res['assets_growth'] < min_list[1]:
                min_list[1] = res['assets_growth']
            elif res['assets_growth'] > max_list[1]:
                max_list[1] = res['assets_growth']
            sum_list[1] += res['assets_growth']

            if res['profits_growth'] < min_list[2]:
                min_list[2] = res['profits_growth']
            elif res['profits_growth'] > max_list[2]:
                max_list[2] = res['profits_growth']
            sum_list[2] += res['profits_growth']

            if res['costs_rate'] < min_list[3]:
                min_list[3] = res['costs_rate']
            elif res['costs_rate'] > max_list[3]:
                max_list[3] = res['costs_rate']
            sum_list[3] += res['costs_rate']

            if res['profits_rate'] < min_list[4]:
                min_list[4] = res['profits_rate']
            elif res['profits_rate'] > max_list[4]:
                max_list[4] = res['profits_rate']
            sum_list[4] += res['profits_rate']

            if res['dept_ratio'] < min_list[5]:
                min_list[5] = res['dept_ratio']
            elif res['dept_ratio'] > max_list[5]:
                max_list[5] = res['dept_ratio']
            sum_list[5] += res['dept_ratio']

            n_corp += 1

        logger.log(min_list, max_list, sum_list, n_corp, sum_list/n_corp)
                    

        
class CorpInfo(object):
    '''
    process financial statements to generate report
    '''
    def __init__(self):
        self.sales = []
        self.sales_growth = 0
        self.assets = []
        self.assets_growth = 0
        self.profits = []
        self.profits_growth = 0
        self.costs = 0
        self.costs_rate = 0
        self.profits_rate = 0
        self.dept = 0
        self.dept_ratio = 0
        self.capital = 0
        self.n_stock = 0

    def set_values(self, result_json):
        '''
        store value to member variable
        '''
        for data in result_json['data']:
            if data['fiscal_year'] in FISCAL_YEARS:
                for content in (data['income'] + data['balance_sheet']):
                    if content['code'] == "210000":
                        self.sales.append(int(content['value']))
                    elif content['code'] == "110000":
                        self.assets.append(int(content['value']))
                    elif content['code'] == "230000":
                        self.profits.append(int(content['value']))

            if data['fiscal_year'] == FISCAL_YEARS[4]:
                for content in (data['income'] + data['balance_sheet']):
                    if content['code'] == "220000":
                        self.costs = int(content['value'])
                    elif content['code'] == "140000":
                        self.dept = int(content['value'])
                    elif content['code'] == "160000":
                        self.capital = int(content['value'])
                    elif content['code'] == "170300":
                        self.n_stock = int(content['value'])

        self.sales_growth = ((self.sales[-1] / self.sales[0]) ** (1.0/4.0) - 1) * 100.0
        self.assets_growth = ((self.assets[-1] / self.assets[0]) ** (1.0/4.0) - 1) * 100.0
        self.profits_growth = ((self.profits[-1] / self.profits[0]) ** (1.0/4.0) - 1) * 100.0

        self.costs_rate = (self.costs / self.sales[-1]) * 100.0
        self.profits_rate = (self.profits[-1] / self.sales[-1]) * 100.0
        self.dept_ratio = (self.dept / self.capital) * 100.0

    def get_info_json(self):
        '''
        generate result dictionary
        '''
        results = {
            "sales": self.sales,
            "sales_growth": self.sales_growth,
            "assets": self.assets,
            "assets_growth": self.assets_growth,
            "profits": self.profits,
            "profits_growth": self.profits_growth,
            "costs": self.costs,
            "costs_rate":self.costs_rate,
            "profits_rate":self.profits_rate,
            "dept": self.dept,
            "dept_ratio":self.dept_ratio,
            "capital":self.capital,
            "n_stock":self.n_stock}
        return results
