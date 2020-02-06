import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import CompanyIcon from '../company_icon.png';
import axios from 'axios';
import { Button } from '@material-ui/core';
import './Search.css'; ///수정


class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            word: null,
            companyResults: null,
            companyPrint: null,
        };

        this.handleCompanyPrint = this.handleCompanyPrint.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleCompanyPrint(value) {
        this.setState({
            companyPrint: value,
        })
        console.log("===this.state.companyPrint====", this.state.companyPrint);
        console.log("===this.state.companyPrint Typeof====", typeof this.state.companyPrint);
    }

    handleKeyPress(value) {
        window.location = '/nav/' + value;
    }

    async componentDidMount() {
        const { match : { params } } = this.props;
        const matchedCompanies = (await axios({
            method: 'post',
            url: 'http://15.164.163.41:16000/corp_list',
            data: {
                "corp_name": this.props.match.params.searchTarget,
            }
        }))
        
        console.log("===matchedCompanies.data====", matchedCompanies.data);
        console.log("======Type=====", matchedCompanies.data.corp_list);
        this.setState({
            companyPrint: matchedCompanies.data.corp_list,
        })
        this.handleCompanyPrint(matchedCompanies.data.corp_list);
    }
    
    render() {
        if (this.state.companyPrint === null || this.state.companyPrint.length === 0) {
            return (
                <Fragment>
                    <p className="br" />
                    <h2 className="ml-3 mt-3">
                        <span className="underline">
                            {this.props.match.params.searchTarget}
                        </span>
                        에 대한 검색 결과가 없습니다.
                    </h2>
                </Fragment>
                // TODO : 돌아가기? 회사가 파산한건 아닐까요?
            );
        }
        else {
            return (
                <Fragment>
                    <p className="br" />
                    <h2 className="ml-3 mt-3">
                        <span className="underline">{this.props.match.params.searchTarget}</span>
                        <span>에 대한 검색결과 </span>
                    </h2>
                    <div className="/test1">
                        {this.state.companyPrint.map((item) => {
                            return (
                                <div className='test'
                                    onClick={() => this.handleKeyPress(item)}>
                                        <img className='/company_icon mt-3' src={CompanyIcon} alt='기업' />
                                        <div class="/card-body">
                                            <h4 class="/card-title">{item}</h4>
                                        </div>
                                </div>
                            )
                        })}
                    </div>
                    <p />
                </Fragment>
            );
        }
    }
 
}

export default Search;