#-*- coding: utf-8 -*-
import os
import logging
import argparse
import requests
import json
import functools
from flask import Response, request
from waitress import serve

# set logger
logfile = os.path.join(os.path.dirname(os.path.abspath('__file__')),'Foogle.log')
logger = logging.getLogger('Foogle')
formatter = logging.Formatter('[%(levelname)s|%(filename)s:%(lineno)s] %(asctime)s > %(message)s')
streamHandler = logging.StreamHandler()
streamHandler.setFormatter(formatter)
logger.addHandler(streamHandler)
logger.setLevel(logging.INFO)

class BaseAPI(object):
    def start(self, app, default_port, **kw):
        """
        start server
        """
        parser = argparse.ArgumentParser()
        parser.add_argument('--port', type=int, default=default_port, help='server port')
        parser.add_argument('--verbose', action='store_true', help='verbose and log file')
        args = parser.parse_args()

        self.verbose = args.verbose
        if self.verbose:
            fileHandler = logging.FileHandler(logfile, mode='w')
            fileHandler.setFormatter(formatter)
            logger.addHandler(fileHandler)
            logger.setLevel(logging.DEBUG)

        logger.info('start server : serving on port={}'.format(args.port))
        serve(app, host='0.0.0.0', port=args.port, _quiet=True, threads=1, channel_timeout=10, **kw)

    @staticmethod
    def error(e):
        if isinstance(e, Exception):
            return {'result':[], 'error':'{} : {}'.format(type(e).__name__,str(e))}
        elif isinstance(e, str):
            return {'result':[], 'error':e}

    @staticmethod
    def response(resp):
        r = Response(json.dumps(resp, ensure_ascii=False), content_type='application/json; charset=utf-8')
        r.headers['Access-Control-Allow-Origin'] = '*'
        return r

    @staticmethod
    def get_req(func):
        @functools.wraps(func)
        def wrap(*args, **kw):
            logger.info('start processing')
            try:
                js = request.get_json(force=True)
                ret = func(js)
                if not ret:
                    resp = BaseAPI.error('json error')
                else:
                    # put results on resp dictionary
                    resp = ret
            except Exception as e:
                logger.error('{} : {}'.format(type(e).__name__,str(e)), exc_info=True)
                resp = BaseAPI.error(e)
            return BaseAPI.response(resp)
        return wrap

       
