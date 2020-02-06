import React from 'react';
import searchIcon from '../search_icon.svg';
import './NavBar.css';

class NameSearch extends React.Component {
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
            <span className="form-inline">
                <input 
                    type="search"
                    onKeyDown={this.handleKeyPress}
                    className="form-control mr-sm-2"
                    placeholder="검색"
                    value={this.state.value}
                    onChange={this.handleChange}
                />
                <button 
                    onClick={() => {this.handleSearch()}}
                    className="btn btn-outline-success my-2 my-sm-0"
                    type="submit"
                >
                    <img className="search-icon" src={searchIcon} />
                </button>
            </span>
        );
    }
}

export default NameSearch;