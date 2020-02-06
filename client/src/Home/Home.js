import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo.png';
import searchIcon from '../search_icon.svg';
//import '../Flatly.css';
import './Home.css'; ///수정

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleChange(event) {
        this.setState({
            value: event.target.value
        });
    }

    handleSearch(event) {
        if (this.state.value === '') {
            alert("검색어를 입력하세요.");
            return;
        }
        window.location = '/nav/search/' + this.state.value;
    }

    handleKeyPress(event) {
        if(event.keyCode === 13 && this.state.value != '') {
            window.location = '/nav/search/' + this.state.value;
        }
    }

    render() {
        return (
            <div>
                <img className='Logo' src={Logo} alt='로고' />

                <div className="outer">
                <div className="/inline">
                    <input
                        type="search"
                        onKeyDown={this.handleKeyPress}
                        className="/test /form-control /mr-sm-2 search"
                        placeholder=""
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
                    <button
                        onClick={() => { this.handleSearch() }}
                        className="btn /btn-outline-success /my-2 /my-sm-0 cursor button"   ///수정
                        type="submit"
                    >
                        <img className="search-icon" src={searchIcon} />
                    </button>
                </div>
                </div>
            </div>
        )
    } 
}

export default Home;