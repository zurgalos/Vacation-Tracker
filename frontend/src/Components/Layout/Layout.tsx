import { Component } from "react";
import "./Layout.css"
import store from "../../Redux/store/store"
import setAuthToken from "../../utills/setAuthToken";
import { Provider } from 'react-redux' 
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { loadUser } from '../../Redux/actions/auth-actions-types';
import landingPage from "../LandingPage/landingPage";
import Register from "../Register/Register"
import LoginPage from "../Login/Login"
import Page404 from "../Page404/Page404"
import Navbar from "../Navbar/Navbar";
import Alert from "../Alert/Alert";
import LoggedUser from "../Private-Routing/LoggedUser";
import VacationPage from "../Vacations/Vacations"
import AdminRoute from "../Private-Routing/AdminRoute";
import adminVacationsPage from "../Admins-Vacation-Page/AdminVacationPage";
import AddVacation from "../AddVacation/Add-Vacation"
import vacationTracker from "../VacationTacker/vacationTracker";


if (localStorage.token) {
    setAuthToken(localStorage.token);
}

class Layout extends Component {
    componentDidMount() {
        if (localStorage.token) {
            store.dispatch(loadUser());
        }
     }

    render() {
        return (
            <Provider store={store}>
                <BrowserRouter>
                <Navbar></Navbar>
                <Alert/>
                <Switch>
                    <Route path="/landing-page" component={landingPage} exact></Route>
                    <Route path="/login" component={LoginPage} exact></Route>
                    <Route path="/register" component={Register} exact></Route>
                    <LoggedUser path="/vacations" component={VacationPage} exact></LoggedUser>
                    <AdminRoute path="/add-vacation" component={AddVacation} exact></AdminRoute>
                    <AdminRoute path="/admin-vacations" component={adminVacationsPage} exact></AdminRoute>
                    <AdminRoute path="/admin-vacations-tracker" component={vacationTracker} exact></AdminRoute>
                    <Redirect from="/" to ="landing-page" exact/>
                    <Route component={Page404}/>
                </Switch>
                </BrowserRouter>
            </Provider>
        );
    } 
}
    


export default Layout;