import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import './Page404.css'
import { Result } from 'antd';


class PageNotFound extends Component {
    render() {
        return (
            <div className="container-fluid page-not-found">
                <h5>
            <Result status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<NavLink to="/vacations">Back home</NavLink>}></Result>
            </h5> 
            </div>
        );
    }
} 

export default PageNotFound;
