
import React, { Component } from 'react';
import './landingPage.css'
import { NavLink, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { AppState } from '../../Redux/store/store';
import { Auth } from '../../Redux/types/auth/auth-type';

type Props = LinkStateProps;


class LandingPage extends Component<Props> {
    render() {
        if (this.props.auth.isAuthenticated && this.props.auth.user.isAdmin !== 1) {
            return <Redirect to="/vacations"></Redirect>
        }
        if (this.props.auth.isAuthenticated && this.props.auth.user.isAdmin === 1) {
            return <Redirect to="/admin-vacations"></Redirect>
        }
        return (
            <div className="container-fluid">
                <header >
                    <div className="overlay" />
                    <div className="container h-100">
                        <div className="d-flex h-100 text-center align-items-center">
                            <div className="w-100 h-50 text-white">
                                <h1 className="display-4">Vacation Tracker</h1>
                                <br />
                                <div className="links-container">
                                    <button className="btn btn-lg btn-primary text-uppercase landing-buttons" type="submit"><NavLink className="landing-links" to="/login">Sign In</NavLink></button>
                                    <br /> <br />
                                    <button className="btn btn-lg btn-primary text-uppercase landing-buttons" type="submit"><NavLink className="landing-links" to="/register">Register</NavLink></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            </div>
        );
    }
}
interface LinkStateProps {
    auth: Auth
}

const mapStateToProps = (
    state: AppState,
): LinkStateProps => ({
    auth: state.auth
});
export default connect(mapStateToProps)(LandingPage);




