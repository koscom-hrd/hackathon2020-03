import React, { Component, Fragment } from 'react';
import axios from 'axios';
import {bb} from 'billboard.js';
import './Company.css';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import BillboardChart from "react-billboardjs";
import "react-billboardjs/lib/billboard.css";
import ScrollUpButton from "react-scroll-up-button";

var bar_chart = null;
var radar_chart = null;
var spline_chart = null;
var card_info_key = {
    "기업 규모": "",
    "현재가": 0,
    "임직원 수": 0,
    "종목 코드": '',
    "발행주식 수": 0,
    "시가총액": 0,
    "자본금": 0,
    "부채": 0,
};
var articles_list = null;
var sliced_naive_wordcloud = ''
var recomm_score = 0;
var param_recomm_score = '';

function valuetext(value) {
    return `$(value)`;
}

function buildSplineChart(sales_arr, assets_arr, profits_arr) {
    //  : 값을 못 받아오면 없다고 표시하기
    if (typeof sales_arr === "undefined" || typeof assets_arr === "undefined" || typeof profits_arr === "undefined") {
        return null;
    }
    if (sales_arr === null || assets_arr === null || profits_arr === null) {
        return null;
    } 
    if (sales_arr.length === 0 || assets_arr.length === 0 || profits_arr.length === 0) {
        return null;
    }
    var spline_chart = bb.generate({
        data: {
          x: "x",
          columns: [
          ["x", "2014", "2015", "2016", "2017", "2018"],
          ["매출액"].concat(sales_arr), //, 100, 30, 200, 100, 150], 
          ["자산"].concat(assets_arr), //70, 130, 300, 200, 30],
          ["영업이익"].concat(profits_arr),// 100, 10, 20, 30, 40, 200],
          ]
        },
        
        bindto: "#spline_chart1"
      });
    return spline_chart;
}

function buildBarChart(dept_ratio_value, profits_rate_value) {
    bar_chart = bb.generate({
        color:{
                        pattern: ["#7A82CC", "#F9A74E", "#6DCCC5", "#1A6EA7", "#575DA0","#DD7300","#0A7C7C","#FFCC80","#9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA"]
                    },
                    // size: { ////수정
                    //     height: 600,
                    //     width: 900,
                    //   },
                    zoom: {
                        enabled: {
                          type: "drag"
                        }
                    },
        data: {
            // x: "분기", error
            columns: [
                ["부채비율"].concat(dept_ratio_value),
                ["영업이익률"].concat(profits_rate_value),
            ],
            type: "bar"
        },
        bar: {
            padding: 3,
            width: {
                ratio: 0.5
            }
        },
        bindto: "#bar_chart1"
    });
    return bar_chart;
}



class Company extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: null,
            recommendation: null,
            info_on: false,

            _sales: null,
            _sales_growth: 0,
            _assets: null,
            _assets_growth: 0,
            _profits: null,
            _profits_growth: 0,
            _costs: 0,
            _costs_rate: 0.0,
            _profits_rate:0,
            _dept: 0,
            _dept_ratio: 0,
            _capital: 0,
            _n_stock: 0, // 발행 주식 수
            _corp_name: '',
            _corp_code: '', // 종목 코드
            _stock_price: 0, // 전일 종가
            _market_cap: 0,
            _n_emp: 0, // 임직원 수
            _corp_scale: '', // 기업규모
            _perf_factors: null, // 기업 성향

            user_stability: 5,
            user_benefit: 5,
            user_growth: 5,
            user_stock_price:5,
            user_personnel:5,
            user_recomm_score:0,
            
        };
        this.buildRadarChart = this.buildRadarChart.bind(this);

        this.handleStability = this.handleStability.bind(this);
        this.handleBenefit = this.handleBenefit.bind(this);
        this.handleGrowth = this.handleGrowth.bind(this);
        this.handleStockPrice = this.handleStockPrice.bind(this);
        this.handlePersonnel = this.handlePersonnel.bind(this);

        this.updateStates = this.updateStates.bind(this);
        this.updateChart = this.updateChart.bind(this);
        this.updateCardInfo = this.updateCardInfo.bind(this);
        this.updateArticles = this.updateArticles.bind(this);
    }

    buildRadarChart(user, company_name) {
        var user_parameters;
        var company_parameters = []
        console.log("====> this.state._perf_factors : ", this.state._perf_factors);
        Object.entries(this.state._perf_factors).map(([key, value]) =>
            company_parameters.push(value*20)
        );
        console.log("====> company_parameters : ", company_parameters);
        if (!user) {
            user_parameters = [100, 100, 100, 100, 100];
        }
        else {
            user_parameters = [
                this.state.user_stability*20,
                this.state.user_benefit*20,
                this.state.user_growth*20,
                this.state.user_stock_price*20,
                this.state.user_personnel*20,
            ]
        }
        recomm_score = Math.abs(user_parameters[0] - company_parameters[0]) / 5
                        + Math.abs(user_parameters[1] - company_parameters[1]) / 5
                        + Math.abs(user_parameters[2] - company_parameters[2]) / 5
                        + Math.abs(user_parameters[3] - company_parameters[3]) / 5
                        + Math.abs(user_parameters[4] - company_parameters[4]) / 5;
        recomm_score = 100 - recomm_score;
        console.log("====> recomm-score", recomm_score);
        this.setState({
            user_recomm_score: recomm_score,
        })
        param_recomm_score = this.state.user_recomm_score + ', 100';
        console.log("==> param_recomm_score : ", param_recomm_score);
        radar_chart = bb.generate({
            size: {
                height: 400,
                width: 600,
              },
            data: {
                x: "x",
                columns: [
                    ["x", "안정성", "수익성", "성장성", "주식 단가", "기업 규모"],
                    ["사용자"].concat(user_parameters),
                    [company_name].concat(company_parameters),
                ],
                type: "radar"
            },
            radar: {
                level: {
                    depth: 4,
                    show: true,
                    text: {
                        format: function (x) { return x + "%"; }
                    }
                },
                axis: {
                    max: 100,
                }
            },
            color: {
                pattern: ["#7A82CC", "#F9A74E", "#6DCCC5", "#1A6EA7", "#575DA0","#DD7300","#0A7C7C","#FFCC80","#9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA","98D6CB","9FA8DA"],
                onover: function(d) {
                var pttr = ["red", "yellow", "cyan"];
                return pttr[(Math.floor(Math.random() * pttr.length))];
                }
            },
            bindto: "#radar_chart1"
        });
        return radar_chart;
    }

    handleStability(value) {
        this.setState({
            user_stability: value,
        });
    }
    handleBenefit(value) {
        this.setState({
            user_benefit: value
        });
    }
    handleGrowth(value) {
        this.setState({
            user_growth: value
        });
    }
    handleStockPrice(value) {
        this.setState({
            user_stock_price: value
        });
    }
    handlePersonnel(value) {
        this.setState({
            user_personnel: value
        });
    }

    updateStates(obj) {
        this.setState({
            name: obj.corp_name,

            _sales: obj.sales,
            _sales_growth: obj.sales_growth,
            _assets: obj.assets,
            _assets_growth: obj.assets_growth,
            _profits: obj.profits,
            _profits_growth: obj.profits_growth,
            _costs: obj.costs,
            _costs_rate: obj.costs_rate,
            _profits_rate: obj.profits_rate,
            _dept: obj.dept,
            _dept_ratio: obj.dept_ratio,
            _capital: obj.capital,
            _n_stock: obj.n_stock,
            _corp_name: obj.corp_name,
            _corp_code: obj.corp_code,
            _stock_price: obj.stock_price,
            _market_cap: obj.market_cap,
            _n_emp: obj.n_emp,
            _corp_scale: obj.corp_scale,
            _perf_factors: obj.perf_factors,
        });
        // console.log("====state=====", this.state);
    }
    updateChart(val) {
        radar_chart.destroy()
        radar_chart = this.buildRadarChart(true, this.props.match.params.companyName)
    }
    updateCardInfo() {
        card_info_key["기업 규모"] = this.state._corp_scale;
        card_info_key["발행주식 수"] = this.state._n_stock;
        card_info_key["임직원 수"] = this.state._n_emp;
        card_info_key["현재가"] = this.state._stock_price;
        card_info_key["종목 코드"] = this.state._corp_code;
        card_info_key["시가총액"] = this.state._market_cap;
        card_info_key["자본금"] = this.state._capital;
        card_info_key["부채"] = this.state._dept;
        this.setState({
            info_on: true,
        })
    }
    updateArticles(value) {
        var tmp = Object.entries(value)
        articles_list = tmp[0][1];
        var naive_wordcloud = tmp[1][1];
        var nw_size = naive_wordcloud.length;
        sliced_naive_wordcloud = naive_wordcloud.slice(1, nw_size-1);
        this.setState({
            info_on: false,
        })
    }
    
    async componentDidMount() {
        const { match : { params} } = this.props;
        const corp_perf = (await axios({
            method: 'post',
            url: 'http://15.164.163.41:16000/corp_perf',
            data: {
                "corp_name": this.props.match.params.companyName,
            }
        })).data;
        console.log("=====corp_perf=====", corp_perf);
        // console.log("=====corp_perf.data=====", corp_perf.data);
        // console.log("=====corp_perf=====", corp_perf);
        const news_dump = (await axios({
            method: 'post',
            url: 'http://15.164.163.41:16000/news',
            data: {
                "keyword": this.props.match.params.companyName,
                "word_cloud": true,
            }
        })).data;
        console.log("===> news_dump : ", news_dump);

        this.updateStates(corp_perf);
        this.updateCardInfo();
        this.updateArticles(news_dump);
        const sales_param = this.state._sales;
        const assets_param = this.state._assets;
        const profits_param = this.state._profits;
        const dept_param = this.state._dept_ratio;
        const profits_rate_param = this.state._profits_rate;

        buildBarChart(dept_param, profits_rate_param);
        this.buildRadarChart(false, this.props.match.params.companyName);
        buildSplineChart(sales_param, assets_param, profits_param);
        // setTimeout(function() {
        //     const hundred = 100;
        //     const abc = buildBarChart();
        //     abc.load({
        //         columns: [
        //             ["영업실적", "1", "2", "3", "4"],
        //             ["부채비율", "20", "10", "5", "2"],
        //             ["성장률", hundred, 20, 30, 40]
        //         ]
        //     });
        // }, 1000);
        // 외않됄까
        // setTimeout(function() {
        //     radar_chart.load({
        //         columns: [
        //             ["x", "안정성", "수익성", "성장성"],
        //             ["나요", 50, 85, 75],
        //             ["이회사요", 10, 100, 50]
        //         ]
        //     });
        // }, 500);
    }
    

    render() {
        return (
            <Fragment>
                <div className="container">
                    <p className="nextline">
                    <h2>
                        {this.props.match.params.companyName}
                    </h2>
                    </p>
                    <div className="company-info">
                    <div className="row">
                        
                    {Object.entries(card_info_key).map(([key, value]) => {
                            return (
                                <div className="col-sm-12 col-md-4 col-lg-3">
                                    <div className="card text-white bg-success mb-3">
                                        <div className="/card-body">
                                            <h4 className="/card-title">{key}</h4>
                                            <h5 className="card-color">{value}</h5>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                        </div>
                    <div className="wrapper">
                    <div class="one"><div class="deco">성장성 주요 지표</div>
                    <div id="spline_chart1"></div></div>
                    <div class="two"><div class="deco">성장률</div>
                    <div id="bar_chart1"></div></div>
                    <div class="three"><div class="deco">&nbsp;&nbsp;사용자의 성향 선택</div><br/><br/>
                    <div><Typography id="discrete-slider" gutterBottom>
                            안정성
                        </Typography>
                        <Slider
                            defaultValue={5}
                            getAriaValueText={valuetext}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="on"
                            step={1}
                            marks={true}
                            min={1}
                            max={5}
                            onChange={(e, value) => this.handleStability(value)}
                        />
                        <Typography id="discrete-slider" gutterBottom>
                            수익성
                        </Typography>
                        <Slider
                            defaultValue={5}
                            getAriaValueText={valuetext}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="on"
                            step={1}
                            marks={true}
                            min={1}
                            max={5}
                            onChange={(e, value) => this.handleBenefit(value)}
                        />
                        <Typography id="discrete-slider" gutterBottom>
                            성장성
                        </Typography>
                        <Slider
                            defaultValue={5}
                            getAriaValueText={valuetext}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="on"
                            step={1}
                            marks={true}
                            min={1}
                            max={5}
                            onChange={(e, value) => this.handleGrowth(value)}
                        />
                        <Typography id="discrete-slider" gutterBottom>
                            주식 단가
                        </Typography>
                        <Slider
                            defaultValue={5}
                            getAriaValueText={valuetext}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="on"
                            step={1}
                            marks={true}
                            min={1}
                            max={5}
                            onChange={(e, value) => this.handleStockPrice(value)}
                        />
                        <Typography id="discrete-slider" gutterBottom>
                            기업 규모
                        </Typography>
                        <Slider
                            defaultValue={5}
                            getAriaValueText={valuetext}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="on"
                            step={1}
                            marks={true}
                            min={1}
                            max={5}
                            onChange={(e, value) => this.handlePersonnel(value)}
                        /></div>
                    </div>
                    <div class="four"><div class="deco"><br/><br/><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;사용자와 {this.props.match.params.companyName}의 기준 척도</div><br/><br/><br/>
                    <div id="radar_chart1"></div></div>
                    <div class="five">
                    <br/> <br/> <br/> <br/> <div class="deco">
                    당신과 '<div className="line">{this.props.match.params.companyName}</div>'와의 적합도는 {this.state.user_recomm_score}점입니다
                    </div><br/> <br/> 
                    <div className="circle">
                    <div class="flex-wrapper">
                    <div class="single-chart">
                        <svg viewBox="0 0 36 36" class="circular-chart orange">
                        <path class="circle-bg"
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path class="circle"
                            stroke-dasharray='30, 100'
                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" class="percentage">{this.state.user_recomm_score}점</text>
                        </svg>
                    </div>
                    </div>

                    </div>

                    </div>
                    <div class="six">
                    <br/> <br/> <br/> <br/> <br/> <br/></div>
                    <div class="seven">
                    <table class="table table-hover">
                            <thead className="deco">{this.props.match.params.companyName}에 관한 뉴스</thead>
                            <br/><br/>
                            <tbody>
                                <tr class="/table-warning">
                                    {articles_list ? articles_list.map(value => {
                                        return (
                                            <div>
                                                <th scope="row" >
                                                    <a href={value.link} target="_blank">
                                                        {value.title}
                                                    </a>
                                                </th>
                                            </div>
                                        )
                                    }) : null}
                                </tr>
                            </tbody>
                        </table></div>
                    <div class="eight"><div class="deco">{sliced_naive_wordcloud ? <img className = "size-reduce" src={`data:image/png;base64,${sliced_naive_wordcloud}`}/>: ''}</div></div>

                </div> 

                    <br/><br/><br/><br/><br/><br/><br/>
                
                <div className="floating">
                <div className="text-highlight">당신의 성향은 <br/><br/></div>
                안정성은 <div className="color-highlight">{this.state.user_stability}</div>
                <br />
                수익성은 <div className="color-highlight">{this.state.user_benefit}</div>
                <br />
                성장성은 <div className="color-highlight">{this.state.user_growth}</div>
                <br />
                주식 단가는 <div className="color-highlight">{this.state.user_stock_price}</div>
                <br />
                기업 규모는 <div className="color-highlight">{this.state.user_personnel}</div>
                <button 
                        onClick={() => { this.updateChart() }}
                        className="btn btn-outline-primary my-2 my-sm-0"  ///수정
                        type="submit"
                    >
                    업데이트
                    </button>
                </div>
                </div>
                <div>
                <ScrollUpButton />
                </div>
                

                
            </Fragment>
        );
    }
}

export default Company;