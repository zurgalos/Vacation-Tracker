import * as React from "react";
import { Route, Redirect } from "react-router-dom";
import { AppState } from "../../Redux/store/store";
import { Auth } from "../../Redux/types/auth/auth-type";
import { connect } from "react-redux";

interface IProps {
    exact?: boolean;
    path: string;
    component: React.ComponentType<any>;
}

type Props = IProps & LinkStateProps;

const LoggedInRoute = ({
    component: Component,
    auth, exact
}: Props) =>
    (
        <>
            <Route
                render={(props) =>
                    auth.isAuthenticated !== true && !auth.loading ? (
                        <Redirect to={{
                            pathname: "/login",
                            state: { from: props.location }
                        }} exact />
                    ) : (
                            <Component {...props} exact />
                        )
                }
            />
        </>
    );


interface LinkStateProps {
    auth: Auth
}

const mapStateToProps = (
    state: AppState,
): LinkStateProps => ({
    auth: state.auth
});

export default connect(
    mapStateToProps
)(LoggedInRoute);