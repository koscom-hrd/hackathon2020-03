import React, { Component, Fragment } from 'react';
import axios from 'axios';

class News extends Component {
    constructor(props) {
        super(props);
        this.state = {
            articles: null,
        };

        this.handleArticles = this.handleArticles.bind(this);
    }

    handleArticles(value) {
        this.setState({
            articles: value
        })
        console.log("============>", this.state.articles);
        console.log("HANDLE ARTICLES OVER");
    }

    async componentDidMount() {
        // const { match: { params } } = this.props;
        console.log("News====> this.props.keyword : ", this.props.news_target);
        const news_dump = (await axios({
            method: 'post',
            url: 'http://15.164.163.41:16000/news',
            data: {
                "keyword": this.props.news_target,
                "word_cloud": true,
            }
        })).data;
        this.handleArticles(news_dump);
        console.log("News====> news_dump", news_dump);
        console.log("COMPONENT DID MOUNT OVER");
    }


    
    render() {
        console.log("RENDER START");
        return (
            <table class="table table-hover">
                <thead></thead>
                <tbody>
                    <tr class="table-warning">
                         {/* {this.state.articles.map((value) => {
                            return (
                                <th scope="row">{value}</th>
                            )
                        })} */}
                    </tr>
                </tbody>
            </table>
        );
    }
}


export default News;